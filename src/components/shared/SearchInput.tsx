'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder, 
  onKeyDown, 
  className = '', 
  ...props 
}: SearchInputProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{ paddingLeft: '2.5rem' }}
        className={`w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-shadow ${className}`}
        {...props}
      />
    </div>
  );
}
