"use client"

interface CheckboxFieldProps {
  label: string
  name: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function CheckboxField({
  label,
  name,
  checked,
  onChange,
}: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
      />
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
    </div>
  )
}
