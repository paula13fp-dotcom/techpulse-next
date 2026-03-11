'use client'

interface SelectFilterProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  className?: string
}

export function SelectFilter({ label, value, onChange, options, className = '' }: SelectFilterProps) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-orange"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
