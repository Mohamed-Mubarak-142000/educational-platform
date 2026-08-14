/**
 * MultiSelectDropdown Component
 *
 * A dropdown button that opens a checkbox list, for filters where more than
 * one option can be selected at once (e.g. subjects).
 */
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export type MultiSelectOption = {
  id: string;
  label: string;
  icon?: string;
};

export interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  selectedCountLabel: (count: number) => string;
  emptyMessage?: string;
}

export function MultiSelectDropdown({
  options,
  selectedIds,
  onChange,
  placeholder,
  selectedCountLabel,
  emptyMessage,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleOption = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  };

  const summary =
    selectedIds.length === 0
      ? placeholder
      : selectedIds.length === 1
        ? (options.find((o) => o.id === selectedIds[0])?.label ?? placeholder)
        : selectedCountLabel(selectedIds.length);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full h-10 px-3 flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
      >
        <span className="truncate">{summary}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-1">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">{emptyMessage}</p>
          ) : (
            options.map((option) => {
              const active = selectedIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-start hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-violet-600 border-violet-600' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-white" />}
                  </span>
                  {option.icon && <span>{option.icon}</span>}
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
