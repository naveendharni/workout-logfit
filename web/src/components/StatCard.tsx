interface StatCardProps {
  id?: string;
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  delay?: number;
}

export default function StatCard({ id, icon, value, label, color, delay = 0 }: StatCardProps) {
  return (
    <div
      id={id}
      className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/20 transition-all duration-200 animate-slide-up opacity-0"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <p className="font-display text-4xl text-foreground leading-none">{value}</p>
      <p className="text-[11px] text-muted tracking-widest mt-2 font-medium">{label}</p>
    </div>
  );
}
