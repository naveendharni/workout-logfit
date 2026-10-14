import { useState } from 'react';
import type { Unit } from '../types';
import { formatWeight, toKg } from '../lib/units';

type Props = { valueKg: number; unit: Unit; onChange: (kg: number) => void; label: string };

// Shows the weight in the user's unit and reports kg. While typing, it keeps the raw text
// so values like "22." aren't reformatted mid-keystroke; outside of typing it shows the stored value.
export default function WeightInput({ valueKg, unit, onChange, label }: Props) {
  const [text, setText] = useState<string | null>(null);

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={label}
      value={text ?? formatWeight(valueKg, unit)}
      onFocus={(e) => {
        setText(formatWeight(valueKg, unit));
        e.target.select();
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(',', '.');
        if (!/^\d*\.?\d*$/.test(raw)) return;
        setText(raw);
        const parsed = Number(raw);
        if (raw !== '' && Number.isFinite(parsed)) onChange(toKg(Math.min(parsed, 5000), unit));
      }}
      onBlur={() => {
        if (text === '') onChange(0);
        setText(null);
      }}
      className="flex-1 min-w-0 max-w-24 input-number"
    />
  );
}
