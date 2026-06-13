import Link from 'next/link';
import Card from '@/src/components/ui/Card';

interface Company {
  id: string;
  name: string;
  industry: string;
  logo: string;
  open_roles: number;
  hiring_status: boolean;
}

interface Props {
  companies: Company[];
}

export default function SimilarCompanies({ companies }: Props) {
  if (!companies || companies.length === 0) return null;
  return (
    <Card overflow>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-extrabold text-heading">Similar companies hiring</h3>
      </div>
      <div className="flex flex-col gap-1">
        {companies.map(c => (
          <Link
            key={c.id}
            href={`/candidate/jobs?company=${encodeURIComponent(c.name)}`}
            className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-alt transition-colors"
          >
            <img
              src={c.logo}
              alt={c.name}
              className="w-8 h-8 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-heading group-hover:text-primary transition-colors">{c.name}</p>
              <p className="text-micro text-subtle">{c.industry}</p>
            </div>
            <span className="text-micro font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5 shrink-0">
              {c.open_roles} jobs
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
