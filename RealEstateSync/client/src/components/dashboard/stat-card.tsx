import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  loading?: boolean;
}

export function StatCard({ title, value, icon, loading = false }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
        <div className="flex items-center">
          <div className="bg-primary-50 p-3 rounded-full mr-4">
            {icon}
          </div>
          <div>
            <div className="h-4 bg-neutral-200 rounded animate-pulse w-24 mb-2" />
            <div className="h-7 bg-neutral-200 rounded animate-pulse w-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
      <div className="flex items-center">
        <div className="bg-primary-50 p-3 rounded-full mr-4">
          {icon}
        </div>
        <div>
          <p className="text-neutral-600 text-sm">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}
