import { Model } from 'objection';

class Certification extends Model {
  static get tableName() {
    return 'certifications';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'issuer', 'issue_date'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 200 },
        issuer: { type: 'string', minLength: 1, maxLength: 150 },
        issue_date: { type: 'string', minLength: 1, maxLength: 20 },
        expiry_date: { type: ['string', 'null'] },
        credential_id: { type: ['string', 'null'] },
        credential_url: { type: ['string', 'null'] },
        certificate_file_name: { type: ['string', 'null'] },
        certificate_file_url: { type: ['string', 'null'] },
        certificate_uploaded_at: { type: ['string', 'null'] }
      }
    };
  }
}

export default Certification;
