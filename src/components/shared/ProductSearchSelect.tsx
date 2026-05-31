'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface Product {
  id: string;
  code?: string;
  codigo?: string;
  description?: string;
  nombre?: string;
  unitPrice?: number;
  precio?: number;
}

interface ProductSearchSelectProps {
  value: string;
  onChange: (id: string) => void;
  initialProducts: Product[];
  disabled?: boolean;
}

export function ProductSearchSelect({
  value,
  onChange,
  initialProducts,
  disabled = false,
}: ProductSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedProduct = initialProducts.find((p) => p.id === value);

  const getProductDisplay = (p: Product) => {
    const code = p.code ?? p.codigo ?? '';
    const desc = p.description ?? p.nombre ?? '';
    const price = p.unitPrice ?? p.precio ?? 0;
    return `[${code}] ${desc} - S/ ${price.toFixed(2)}`;
  };

  // Sync display value when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setDisplayValue(getProductDisplay(selectedProduct));
    } else {
      setDisplayValue('');
    }
  }, [value, initialProducts, selectedProduct]);

  // Click outside listener to close dropdown and restore value
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Restore displaying the selected product text
        if (selectedProduct) {
          setDisplayValue(getProductDisplay(selectedProduct));
        } else {
          setDisplayValue('');
        }
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedProduct]);

  const handleSelect = (product: Product) => {
    onChange(product.id);
    setDisplayValue(getProductDisplay(product));
    setIsOpen(false);
    setQuery('');
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsOpen(true);
    // Highlight all text in the input so typing overwrites it
    setTimeout(() => {
      inputRef.current?.select();
    }, 50);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setDisplayValue('');
    setQuery('');
    setIsOpen(false);
  };

  // Client-side filtering of initialProducts
  const filteredProducts = initialProducts.filter((p) => {
    if (!query.trim()) return true;
    const queryLower = query.toLowerCase();
    const code = (p.code ?? p.codigo ?? '').toLowerCase();
    const desc = (p.description ?? p.nombre ?? '').toLowerCase();
    return code.includes(queryLower) || desc.includes(queryLower);
  });

  return (
    <div className="relative flex-1 min-w-0" ref={containerRef}>
      {/* Interactive Input element */}
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={displayValue}
          onChange={(e) => {
            setIsOpen(true);
            setDisplayValue(e.target.value);
            setQuery(e.target.value);
          }}
          onFocus={handleFocus}
          placeholder={disabled ? "Cargando..." : "-- Escribe para buscar producto... --"}
          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 pl-3 pr-10 text-xs text-zinc-900 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[38px] cursor-pointer font-sans"
        />
        
        {/* Clear / Action icons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-0.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              title="Limpiar selección"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) {
                if (isOpen) {
                  setIsOpen(false);
                  if (selectedProduct) setDisplayValue(getProductDisplay(selectedProduct));
                  else setDisplayValue('');
                  setQuery('');
                } else {
                  setIsOpen(true);
                  setTimeout(() => inputRef.current?.select(), 50);
                }
              }
            }}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-0.5 cursor-pointer"
          >
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[220px]">
          {/* Options list */}
          <div className="overflow-y-auto flex-1 divide-y divide-zinc-100 dark:divide-zinc-900/60 max-h-[220px]">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-zinc-400 text-xs">
                No se encontraron productos
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = p.id === value;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className={`w-full flex items-center justify-between p-2.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="truncate pr-4">{getProductDisplay(p)}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
