# Multi-Seat Teams — Design Plan

> **Status: AWAITING APPROVAL — no code has been written.**
> All implementation work stops here until this document is approved.

---

## Context: what exists today

| Concern | Current location |
|---|---|
| Company identity (name, logo, industry, tagline, about, size, website, etc.) | Columns on `recruiters` table |
| `is_verified` (employer badge) | Column on `recruiters` table |
| Job ownership | `jobs.recruiter_id` (FK → recruiters) |
| Public "company page" URL | `/company/company_<recruiter_id>` — `company_id` is secretly a recruiter ID |
| All applicant/interview/dashboard auth | `WHERE jobs.recruiter_id = me` (12+ call sites) |
| Per-recruiter activity, interviews, views | `recruiter_id` columns on those tables — per-member attribution |

Because company == recruiter (1:1 today), everything is simple. The goal is to make it M:1 without breaking anything that already works.

---

## 1. Data Model

### 1.1 New `companies` table

Carries the employer identity that currently lives on the `recruiters` row.

```sql
CREATE TABLE companies (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  logo            TEXT,
  cover_image     TEXT,
  color_class     TEXT,
  tagline         TEXT,
  about           TEXT,
  industry        TEXT,
  company_type    TEXT,
  size            TEXT,
  founded         INTEGER,
  website         TEXT,
  headquarters    TEXT,
  linkedin        TEXT,
  twitter         TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The matching Objection model lives at `src/models/recruiter/Company.js`.

### 1.2 New `company_members` table

Maps recruiters into companies with a role. A recruiter can belong to at most one company (add a partial unique index on `recruiter_id` WHERE `status = 'active'` to enforce this without blocking historical records).

```sql
CREATE TABLE company_members (
  id           SERIAL PRIMARY KEY,
  company_id   INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  recruiter_id INTEGER NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('owner', 'admin', 'member')),
  status       TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'invited', 'suspended')),
  invited_by   INTEGER REFERENCES recruiters(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, recruiter_id)
);

CREATE UNIQUE INDEX company_members_one_active_company_per_recruiter
  ON company_members (recruiter_id)
  WHERE status = 'active';
```

**Role semantics:**

| Action | owner | admin | member |
|---|:---:|:---:|:---:|
| Post / edit jobs | ✓ | ✓ | ✓ |
| Submit job for review | ✓ | ✓ | ✓ |
| Delete draft jobs | ✓ | ✓ | ✗ |
| View all applicants | ✓ | ✓ | ✓ |
| Shortlist / interview / hire / reject | ✓ | ✓ | ✓ |
| Edit company profile | ✓ | ✓ | ✗ |
| Invite new members | ✓ | ✓ | ✗ |
| Change member roles | ✓ | ✗ | ✗ |
| Remove members | ✓ | ✗ | ✗ |
| Transfer ownership | ✓ | ✗ | ✗ |

### 1.3 New `company_invitations` table

```sql
CREATE TABLE company_invitations (
  id           SERIAL PRIMARY KEY,
  company_id   INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invited_by   INTEGER NOT NULL REFERENCES recruiters(id),
  email        TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('admin', 'member')),
  token        TEXT NOT NULL UNIQUE,       -- 64-char hex, crypto.randomBytes(32)
  expires_at   TIMESTAMPTZ NOT NULL,       -- NOW() + 7 days
  accepted_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, email)               -- one live invite per email per company
);
```

### 1.4 Changes to `jobs` table

> 🔴 **Riskiest schema change — see Section 6.**

Add two columns:

```sql
ALTER TABLE jobs ADD COLUMN company_id INTEGER REFERENCES companies(id);
ALTER TABLE jobs ADD COLUMN posted_by  INTEGER REFERENCES recruiters(id);
```

- `company_id` — the owning company (all auth checks move here)
- `posted_by` — which member created this job (attribution only, never used for auth)

Both start nullable so the backfill migration can run before the NOT NULL constraint is added.

After the backfill (Phase 1, §5):

```sql
ALTER TABLE jobs ALTER COLUMN company_id SET NOT NULL;
```

`jobs.recruiter_id` is **kept unchanged** throughout Phases 0–3 as a safety net. It is only dropped in Phase 4 after all code is verified.

### 1.5 Changes to `recruiters` table

The company-level columns (logo, cover_image, color_class, tagline, about, industry, company_type, size, founded, website, headquarters, linkedin, twitter, is_verified) are **not dropped immediately**. They are read-only shadows until Phase 3 is complete and the company profile update endpoint has been migrated. Dropping them is Phase 4 work.

`company_name` is kept on `recruiters` as a denormalized display string. It appears in activity feed messages, notification copy, and interview records — contexts where we need a name without querying the companies table. It is kept in sync with `companies.name` on company profile updates.

### 1.6 Tables that do NOT change ownership semantics

These tables all carry `recruiter_id` for **per-member attribution** — they are correct as-is and must not be changed to `company_id`:

| Table | recruiter_id meaning |
|---|---|
| `interviews` | which member scheduled the interview |
| `activity` | which member took the action |
| `profile_views` | which member viewed the candidate |
| `saved_candidates` | which member saved to their pool |
| `conversations` | which member initiated the chat |
| `notifications` (recruiter-side) | which member the notification is for |

A new optional column `company_id` may be added to `activity` in Phase 3 to enable a company-wide activity feed endpoint — but is not required for MVP.

---

## 2. Invitations: owner invites teammates

### Flow

```
Owner/admin calls POST /recruiter/team/invitations
  → validate role in company (owner OR admin)
  → check: no live unaccepted invite already exists for that email+company
  → generate token = crypto.randomBytes(32).toString('hex')
  → insert company_invitations row (expires_at = NOW() + 7d)
  → send invitation email: "You've been invited to join <Company Name>..."
     Link: /recruiter/team/accept?token=<token>
  → return { invitation_id, email, role, expires_at }
```

### Accept flow — existing recruiter

```
Recruiter (logged in) hits GET /recruiter/team/accept?token=<token>
  → look up invitation: not expired, not accepted
  → check recruiter has no other active company membership
  → INSERT into company_members (status='active')
  → UPDATE company_invitations SET accepted_at = NOW()
  → redirect to /recruiter/dashboard with welcome toast
```

### Accept flow — new recruiter (no account yet)

```
Unauthenticated user hits GET /recruiter/team/accept?token=<token>  (or /auth/register?invite=<token>)
  → validate token, store in session/cookie
  → redirect to registration form (email pre-filled, locked)
  → after registration succeeds → INSERT into company_members
  → UPDATE company_invitations SET accepted_at = NOW()
  → log in and redirect to /recruiter/dashboard
```

### Team management endpoints (all requireRecruiter)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /recruiter/team | any member | List members + pending invitations |
| POST | /recruiter/team/invitations | owner \| admin | Send invitation |
| DELETE | /recruiter/team/invitations/:id | owner \| admin | Revoke pending invite |
| PATCH | /recruiter/team/members/:recruiterId/role | owner | Change member role |
| DELETE | /recruiter/team/members/:recruiterId | owner | Remove member |
| GET | /recruiter/team/accept | public | Accept invitation by token |

---

## 3. Backfill Migration

Safe to run **once**, on a live database, in a transaction. Must be tested against a production data snapshot first.

### Script: `scripts/database/migrate_to_companies.js`

```
STEP 1 — Add new columns (non-destructive)
  ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id);
  ALTER TABLE jobs ADD COLUMN IF NOT EXISTS posted_by  INT REFERENCES recruiters(id);

STEP 2 — Add temp tracking column
  ALTER TABLE companies ADD COLUMN IF NOT EXISTS _migrated_from_recruiter_id INT;

STEP 3 — Create one company per recruiter
  For each recruiter (ordered by id):
    INSERT INTO companies (name, logo, cover_image, color_class, tagline, about,
                           industry, company_type, size, founded, website, headquarters,
                           linkedin, twitter, is_verified, created_at, _migrated_from_recruiter_id)
    SELECT company_name, logo, cover_image, color_class, tagline, about,
           industry, company_type, size, founded, website, headquarters,
           linkedin, twitter, is_verified, created_at, id
    FROM recruiters
    ON CONFLICT DO NOTHING;   -- idempotent

STEP 4 — Create company_members (owner) for each recruiter
  INSERT INTO company_members (company_id, recruiter_id, role, status, created_at)
  SELECT c.id, c._migrated_from_recruiter_id, 'owner', 'active', NOW()
  FROM companies c
  WHERE c._migrated_from_recruiter_id IS NOT NULL
  ON CONFLICT (company_id, recruiter_id) DO NOTHING;

STEP 5 — Backfill jobs.company_id and jobs.posted_by
  UPDATE jobs j
  SET company_id = cm.company_id,
      posted_by  = j.recruiter_id
  FROM company_members cm
  WHERE cm.recruiter_id = j.recruiter_id
    AND cm.role = 'owner'
    AND j.company_id IS NULL;   -- idempotent

STEP 6 — Verify (assert before proceeding)
  SELECT COUNT(*) FROM jobs WHERE company_id IS NULL  →  must equal 0
  SELECT COUNT(*) FROM company_members WHERE role='owner'  →  must equal COUNT(*) FROM recruiters
  Abort with error if either check fails.

STEP 7 — Add NOT NULL constraint
  ALTER TABLE jobs ALTER COLUMN company_id SET NOT NULL;

STEP 8 — Drop temp column
  ALTER TABLE companies DROP COLUMN _migrated_from_recruiter_id;

STEP 9 — Add indexes
  CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs (company_id);
  CREATE INDEX IF NOT EXISTS idx_company_members_recruiter_id ON company_members (recruiter_id);
  CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members (company_id);
  CREATE INDEX IF NOT EXISTS idx_company_invitations_token ON company_invitations (token);
```

### Rollback script

```
-- jobs.company_id is safe to keep (nullable during rollback)
ALTER TABLE jobs DROP COLUMN IF EXISTS company_id;
ALTER TABLE jobs DROP COLUMN IF EXISTS posted_by;
DROP TABLE IF EXISTS company_invitations;
DROP TABLE IF EXISTS company_members;
DROP TABLE IF EXISTS companies;
-- recruiters table is entirely unchanged — no rollback needed there
```

---

## 4. Authorization

### 4.1 New helper: `resolveCompanyMember(request)`

Location: `src/utils/companyAuth.js`

```js
// Returns { companyId, role } for the authenticated recruiter.
// Throws 403 if not an active company member.
export async function resolveCompanyMember(request) {
  const recruiterId = request.user.id;
  const membership = await CompanyMember.query()
    .where('recruiter_id', recruiterId)
    .where('status', 'active')
    .select('company_id', 'role')
    .first();
  if (!membership) {
    throw Object.assign(new Error('No active company membership'), { statusCode: 403 });
  }
  return { companyId: membership.company_id, role: membership.role };
}

// Role guard helper: throws 403 if caller's role is not in allowedRoles
export function requireRole(role, allowedRoles, action) {
  if (!allowedRoles.includes(role)) {
    throw Object.assign(
      new Error(`Action '${action}' requires role: ${allowedRoles.join(' or ')}`),
      { statusCode: 403 }
    );
  }
}
```

This helper is called at the top of every controller function that needs company-scoped authorization. It replaces the pattern `const recruiterId = request.user.id` + `where('recruiter_id', recruiterId)`.

### 4.2 Complete list of call sites that change

Every line below currently uses `recruiter_id` for auth and must change to `company_id`. The column `jobs.recruiter_id` in these queries becomes `jobs.company_id`.

**`src/controllers/recruiter/recruiterJobController.js`**

| Function | Current | New |
|---|---|---|
| `getJobs` | `Job.query().where('recruiter_id', recruiterId)` | `Job.query().where('company_id', companyId)` |
| `getJobById` | `Job.query().findOne({ id, recruiter_id: recruiterId })` | `findOne({ id, company_id: companyId })` |
| `postJob` | `recruiter_id: recruiterId` in insert | `company_id: companyId, posted_by: recruiterId` |
| `postJob` (company name) | `Recruiter.query().findById(recruiterId).select('company_name')` | `Company.query().findById(companyId).select('name')` |
| `updateJob` | `findOne({ id, recruiter_id: recruiterId })` | `findOne({ id, company_id: companyId })` |
| `deleteJob` | `findOne({ id, recruiter_id: recruiterId })` | `findOne({ id, company_id: companyId })` + role ≥ admin |
| `getRecruiterStats` | two `where('recruiter_id', recruiterId)` + `where('jobs.recruiter_id', ...)` | company_id equivalents |
| `submitJob` | `findOne({ id, recruiter_id: recruiterId })` | `findOne({ id, company_id: companyId })` |
| `submitJob` (company name for email) | `Recruiter.query().findById(recruiterId)` | `Company.query().findById(companyId)` |
| `getJobAnalytics` | `findOne({ id, recruiter_id: recruiterId })` | `findOne({ id, company_id: companyId })` |
| `getJobs` (response) | `companyId: company_${job.recruiter_id}` | `companyId: company_${job.company_id}` |
| `getJobById` (response) | `companyId: company_${job.recruiter_id}` | `companyId: company_${job.company_id}` |
| `postJob` (response) | `companyId: company_${recruiterId}` | `companyId: company_${companyId}` |
| `updateJob` (response) | `companyId: company_${recruiterId}` | `companyId: company_${companyId}` |

**`src/controllers/recruiter/recruiterApplicantController.js`**

| Function | Current | New |
|---|---|---|
| `getApplicants` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |
| `getApplicantById` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |
| `updateStatus` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |
| `bulkRejectApplicants` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |
| `bulkRejectByScore` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |
| `applyTransition` (activity) | `Activity.insert({ recruiter_id: recruiterId })` | `Activity.insert({ recruiter_id: recruiterId, company_id: companyId })` (new column optional in Phase 3) |

**`src/controllers/recruiter/recruiterDashboardController.js`**

| Function | Current | New |
|---|---|---|
| `getDashboardStats` | all `where('recruiter_id', recruiterId)` and `where('jobs.recruiter_id', ...)` | company_id equivalents |
| `getPostedJobs` | `Job.query().where('recruiter_id', recruiterId)` | `.where('company_id', companyId)` |
| `getRecentApplicants` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |
| `getPipeline` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |
| `getTopCandidates` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |
| `getActivityFeed` | `.where('recruiter_id', recruiterId)` | **no change** — per-member, correct as-is |

**`src/controllers/recruiter/recruiterInterviewController.js`**

| Function | Current | New |
|---|---|---|
| `getInterviews` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |
| `scheduleInterview` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |
| `cancelInterview` | `.where('jobs.recruiter_id', recruiterId)` | `.where('jobs.company_id', companyId)` |

**`src/controllers/recruiter/companyController.js`** (public-facing company page)

| Function | Current | New |
|---|---|---|
| `getCompanyProfile` | `Recruiter.query().findById(companyId)` | `Company.query().findById(companyId)` |
| `getCompanyJobs` | `Job.query().where('recruiter_id', companyId)` | `Job.query().where('company_id', companyId)` |

**`src/controllers/recruiter/candidateSearchController.js`**
- `buildBaseQuery` — no change (no company ownership filter needed here)
- `getCandidateProfile` — `ProfileView` records `recruiter_id` — no change (per-member attribution)
- `talentPoolController` — `saved_candidates.recruiter_id` — no change (per-member pool)

**Admin controllers (secondary — Phase 4)**
- `adminController.js`: `getAdminJobs` currently returns `poster_name`, `poster_email` from the recruiters table. After migration, add a JOIN to `companies` and `company_members` to show company name alongside the poster.
- `adminExportController.js`: job CSV includes company info from `companies` table instead of recruiter row.

### 4.3 Activity attribution in `applyTransition`

`applyTransition` calls `notifyRecruiter(recruiterId, ...)` — this is correct (notify the individual who took the action, not the whole team). No change needed here for MVP.

Email sending in `applyTransition` (status transition emails to candidates) currently fetches `recruiter.company_name` from the `recruiters` table. After Phase 3, this should fetch `company.name` from `companies`.

---

## 5. Activity, Notifications, Audit

### Per-action attribution (stays per-member)
Every action a team member takes is attributed to their `recruiter_id`:
- `activity.recruiter_id = actingMember.id` — individual activity feed
- `interviews.recruiter_id = actingMember.id` — who scheduled
- `profile_views.recruiter_id = actingMember.id` — who viewed

### Company-wide activity feed (Phase 3 addition)
A new endpoint `GET /recruiter/team/activity` returns all team members' activity for the company:

```js
Activity.query()
  .join('company_members cm', 'cm.recruiter_id', 'activity.recruiter_id')
  .where('cm.company_id', companyId)
  .where('cm.status', 'active')
  .orderBy('activity.created_at', 'desc')
  .limit(50)
```

No schema change needed if we use the JOIN; optionally add `activity.company_id` for performance.

### Invitation audit trail
`company_invitations.invited_by` records which member sent the invite. This is sufficient for audit without a separate audit table.

### Admin audit
The existing `admin_actions` table logs admin actions. No change needed. When admins view a recruiter, we show which company they belong to (via company_members join).

---

## 6. Backward Compatibility and Rollout

### Phase 0 — Schema additions only (non-breaking, ~10 min)
- Add `companies`, `company_members`, `company_invitations` tables
- Add `jobs.company_id` (nullable), `jobs.posted_by` (nullable)
- No code changes; all existing code continues to work using `recruiter_id`
- **Can be deployed independently**

### Phase 1 — Backfill migration (run on production, ~5 min)
- Run `scripts/database/migrate_to_companies.js`
- Verify: 0 jobs with NULL company_id, company count = recruiter count
- Set `jobs.company_id NOT NULL`
- **Rollback**: drop the new columns (job.company_id, posted_by), drop new tables — recruiter table untouched
- At this point the data is ready but no code uses it yet

### Phase 2 — Authorization migration (~5–8 hrs of coding)
- Implement `resolveCompanyMember` helper
- Update all ~12 controller functions (see §4.2) to resolve companyId and filter by company_id
- Update job response formatters: `companyId: company_${job.company_id}` (was `company_${job.recruiter_id}`)
- Add team management endpoints (GET/POST/PATCH/DELETE /recruiter/team/*)
- **Test**: run full integration suite; verify solo recruiter sees exactly the same data as before the change (they're owner of a 1-member company)
- **Rollback**: revert code only, data is already migrated
- **⚠️ Frontend note**: The companyId string changes from `company_<recruiter_id>` to `company_<company_id>`. After backfill, `company_<company_id>` and `company_<recruiter_id>` are different numbers (companies.id is assigned sequentially during backfill, not equal to recruiters.id). The frontend must handle this; check all frontend places that cache or compare companyId strings.

### Phase 3 — Company profile migration (~3 hrs)
- `companyController.js`: read/write `companies` table instead of `recruiters`
- Company profile update endpoint: writes to `companies` table, syncs `company_name` denorm to `recruiters`
- Recruiter sign-up: wrap in transaction → create `recruiters` row + `companies` row + `company_members` row
- Invitation accept: transaction → create/link `recruiters` row + `company_members` row
- Add invitation email
- **Rollback**: revert code; `companies` table still has the data, `recruiters` table still has the original columns (not yet dropped)

### Phase 4 — Column cleanup (~1 hr)
- Drop company columns from `recruiters` (logo, cover_image, color_class, tagline, about, industry, company_type, size, founded, website, headquarters, linkedin, twitter, is_verified)
- Drop `jobs.recruiter_id` after verifying no remaining code references it for auth
- Grep the entire codebase for `recruiter_id` to confirm only per-member attribution uses remain
- **This is irreversible — take a DB snapshot before executing**

### Phase 5 — Admin and analytics updates (~2 hrs)
- Update admin job views to show company name (join companies table)
- Update CSV exports to include company info
- Add `company_id` column to `activity` table for company-wide feed endpoint

---

## 7. Riskiest Steps (explicitly flagged)

### 🔴 RISK 1: `jobs.company_id` backfill + NOT NULL constraint (Phase 1)

**Why risky:** If any job's `recruiter_id` does not have a matching `company_members` row (e.g. due to partial backfill, a recruiter deleted mid-run, or a job with an orphaned recruiter_id), the backfill leaves `company_id = NULL`, and the NOT NULL constraint will fail — blocking the migration.

**Mitigations:**
1. Run the backfill script on a production data dump first and verify `SELECT COUNT(*) FROM jobs WHERE company_id IS NULL = 0`
2. Wrap Steps 3–7 in a single transaction with an explicit rollback on assertion failure
3. The NOT NULL constraint is added only after the assertion passes — if it fails, the transaction is rolled back and data is unchanged
4. Keep `jobs.recruiter_id` intact as a fallback

### 🔴 RISK 2: Changing all ~12 ownership checks simultaneously (Phase 2)

**Why risky:** Missing even one `where('recruiter_id', recruiterId)` means a recruiter can see another company's jobs, applicants, or interview data — a data leak.

**Mitigations:**
1. After all changes: `grep -rn "recruiter_id" src/controllers/recruiter/` must show ONLY per-member attribution uses (activity, interviews, profile_views, saved_candidates, notifications)
2. Write integration tests that create two separate companies with separate recruiters and assert Company A cannot read Company B's data
3. Deploy to staging first; run the test suite against staging before production

### 🟡 RISK 3: `companyId` string changes in API responses (Phase 2)

**Why risky:** The frontend receives `company_${job.recruiter_id}` today. After migration it will receive `company_${job.company_id}` where `company_id` is a new SERIAL value, not equal to `recruiter_id`. Any frontend code that hardcodes, caches, or compares these strings (e.g. localStorage, URL params) will break.

**Mitigations:**
1. Audit the frontend for all uses of `companyId` before Phase 2 deploys
2. The company profile page URL changes from `/company/company_<recruiter_id>` to `/company/company_<company_id>` — old URLs 404. Add a redirect if needed (look up recruiter, find their company, redirect)

### 🟡 RISK 4: Recruiter sign-up and company profile update (Phase 3)

**Why risky:** The sign-up flow creates a `recruiters` row atomically today. After Phase 3, it must also create a `companies` row and a `company_members` row in the same transaction. If the transaction is not written correctly, a recruiter can be created without a company, leaving them permanently unable to post jobs.

**Mitigations:**
1. Wrap all three inserts in a Knex transaction
2. Test the sign-up flow end-to-end in staging before production deploy
3. Add a health-check query: `SELECT r.id FROM recruiters r LEFT JOIN company_members cm ON cm.recruiter_id = r.id WHERE cm.id IS NULL` — must return 0 rows

---

## 8. Test Plan

### Unit tests (new, in `src/controllers/recruiter/__tests__/`)

- `resolveCompanyMember`: active member → returns `{ companyId, role }`; suspended member → throws 403; member not found → throws 403
- `requireRole`: owner calling delete → passes; member calling delete → throws 403
- Backfill migration script: idempotent (running twice produces same result); correct assertion logic (job with NULL company_id causes rollback)
- Invitation token: 64-char hex; unique across calls; expiry is exactly 7 days from now

### Integration tests

**Access control (critical path)**
- Recruiter A (owner of Company A) can: list/create/update/submit their jobs; list/manage their applicants; schedule/cancel interviews
- Recruiter A cannot: read Company B's jobs, applicants, or interviews
- Recruiter B (member of Company A) can: list/create/update/submit jobs; list/manage applicants
- Recruiter B cannot: delete a job (member role)
- Recruiter B cannot: edit company profile (member role)
- Company A owner can remove Company B's member from Company A
- Expired invitation token → 410 Gone; valid token → 200 with membership created

**Data integrity**
- After backfill: `SELECT COUNT(*) FROM jobs WHERE company_id IS NULL` = 0
- After backfill: every recruiter is 'owner' of exactly one company
- Posting a job sets `company_id = actingMember.company_id` and `posted_by = actingMember.recruiter_id`
- Deleting a recruiter (CASCADE) does not delete the company or its other members

**Backward compatibility**
- Solo recruiter (no teammates) sees identical data before and after Phase 2 migration
- Company profile page URL `/company/company_<new_company_id>` resolves correctly

**Activity attribution**
- Member A shortlists applicant: `activity.recruiter_id = A.id` (not B.id)
- Company activity feed shows actions from all members of the company

---

## 9. Out of Scope for This Plan

- Per-job access control (restricting which team members can see which specific job) — overkill for MVP
- Company-level billing or seat limits
- SSO / SAML for company accounts
- Candidate-facing "company followers" or notifications when a company posts new jobs (separate feature)
