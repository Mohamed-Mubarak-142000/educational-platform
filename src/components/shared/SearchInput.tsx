/**
 * SearchInput Component
 *
 * Small text search box with a leading icon, used above data tables to
 * filter rows by name/email/etc. Shared so every table's search box looks
 * and behaves the same way.
 */
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className = '' }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
