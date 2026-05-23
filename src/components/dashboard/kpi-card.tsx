import { type LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon?: LucideIcon;
  variant?: "default" | "highlight" | "success" | "warning";
};

export default function KpiCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  variant = "default",
}: KpiCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "highlight":
        return "border-l-2 border-l-orange-500 dark:border-l-orange-500";
      case "success":
        return "border-l-2 border-l-emerald-500 dark:border-l-emerald-500";
      case "warning":
        return "border-l-2 border-l-rose-500 dark:border-l-rose-500";
      default:
        return "border-l-2 border-l-slate-400 dark:border-l-slate-600";
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-none shadow-sm flex flex-col justify-between hover:scale-[1.01] hover:shadow-md transition-all duration-200 ${getVariantStyles()}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {title}
          </span>
          <h3 className="text-2xl font-bold font-mono mt-1 text-slate-800 dark:text-slate-100 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className="p-2 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 rounded-none shrink-0">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`font-bold font-mono px-1.5 py-0.5 rounded-none border text-[10px] ${
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                }`}
              >
                {trend.isPositive ? "▲" : "▼"} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {trend.label}
              </span>
            </div>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
