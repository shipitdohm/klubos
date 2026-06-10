import { useState, type ReactNode } from "react";
import { Plus, Trash2, X } from "lucide-react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground teal-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground hairline"
    >
      {children}
    </button>
  );
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  onDelete,
  empty,
}: {
  rows: T[];
  columns: { key: keyof T | string; label: string; render?: (row: T) => ReactNode }[];
  onDelete?: (row: T) => void;
  empty?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="surface-card flex h-48 items-center justify-center text-sm text-muted-foreground">
        {empty ?? "Noch keine Einträge"}
      </div>
    );
  }
  return (
    <div className="surface-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="hairline-b text-left text-xs text-muted-foreground">
            {columns.map((c) => (
              <th key={String(c.key)} className="px-5 py-3 font-medium">
                {c.label}
              </th>
            ))}
            {onDelete && <th className="w-10" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="transition-colors hairline-b last:border-b-0 hover:bg-secondary/30"
            >
              {columns.map((c) => (
                <td key={String(c.key)} className="px-5 py-3">
                  {c.render
                    ? c.render(row)
                    : String((row as Record<string, unknown>)[c.key as string] ?? "")}
                </td>
              ))}
              {onDelete && (
                <td className="pr-3">
                  <button
                    onClick={() => onDelete(row)}
                    className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.5} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="surface-card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary/50"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="block h-10 w-full rounded-md bg-input/40 px-3 text-sm outline-none hairline focus:border-primary"
      />
    </label>
  );
}

export { Plus };
