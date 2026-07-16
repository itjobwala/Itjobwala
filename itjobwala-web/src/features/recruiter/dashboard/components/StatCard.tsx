import Card from '@/src/components/ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export default function StatCard({ label, value, trend, trendUp, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5" overflow>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            }`}
          >
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-4xl font-extrabold text-heading leading-none" style={{ letterSpacing: '-1px' }}>
        {value}
      </p>
      <p className="text-small-text text-muted mt-1.5 font-medium">{label}</p>
    </Card>
  );
}
