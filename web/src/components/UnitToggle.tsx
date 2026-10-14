import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import type { Unit } from '../types';

export default function UnitToggle() {
  const { user, setUnit } = useAuth();
  const [saving, setSaving] = useState(false);
  if (!user) return null;

  const choose = async (unit: Unit) => {
    if (unit === user.unit || saving) return;
    setSaving(true);
    try {
      await setUnit(unit);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div role="radiogroup" aria-label="Weight unit" className="flex rounded-lg bg-surface-elevated border border-border p-0.5">
      {(['KG', 'LB'] as const).map((unit) => (
        <button
          key={unit}
          role="radio"
          aria-checked={user.unit === unit}
          onClick={() => choose(unit)}
          disabled={saving}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
            user.unit === unit ? 'bg-accent text-black' : 'text-muted hover:text-foreground'
          }`}
        >
          {unit === 'KG' ? 'KG' : 'LB'}
        </button>
      ))}
    </div>
  );
}
