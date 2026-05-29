'use client';

import React, { useState } from 'react';
import { SearchInput } from './SearchInput';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  actions?: React.ReactNode;
  serverSide?: boolean;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  itemsPerPage?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Buscar...',
  searchKey,
  loading = false,
  emptyMessage = 'No se encontraron registros.',
  actions,
  serverSide = false,
  totalItems,
  totalPages: propTotalPages,
  currentPage: propCurrentPage,
  onPageChange,
  onSearchChange,
  searchValue,
  itemsPerPage = 8,
}: DataTableProps<T>) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localCurrentPage, setLocalCurrentPage] = useState(1);

  const searchQuery = serverSide ? (searchValue ?? '') : localSearchQuery;
  const currentPage = serverSide ? (propCurrentPage ?? 1) : localCurrentPage;

  // Search filter
  const filteredData = React.useMemo(() => {
    if (serverSide) return data;
    if (!searchQuery || !searchKey) return data;
    return data.filter((item) => {
      const val = item[searchKey as string];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery, searchKey, serverSide]);

  // Pagination calculation
  const totalPages = serverSide ? (propTotalPages ?? 1) : (Math.ceil(filteredData.length / itemsPerPage) || 1);
  
  const paginatedData = React.useMemo(() => {
    if (serverSide) return data;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, serverSide, data]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      if (serverSide && onPageChange) {
        onPageChange(page);
      } else {
        setLocalCurrentPage(page);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (serverSide && onSearchChange) {
      onSearchChange(val);
    } else {
      setLocalSearchQuery(val);
      setLocalCurrentPage(1);
    }
  };

  const showPagination = serverSide 
    ? (totalPages > 1) 
    : (filteredData.length > itemsPerPage);

  const startRecord = ((currentPage - 1) * itemsPerPage + 1);

  const endRecord = serverSide
    ? Math.min(totalItems ?? 0, currentPage * itemsPerPage)
    : Math.min(filteredData.length, currentPage * itemsPerPage);

  const totalCount = serverSide ? (totalItems ?? 0) : filteredData.length;

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="w-full max-w-xs">
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={!serverSide && !searchKey}
          />
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table grid */}
      <div className="w-full overflow-hidden border border-zinc-200 bg-white rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50 select-none">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="py-4 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loader Skeletons
                Array.from({ length: 4 }).map((_, rIdx) => (
                  <tr key={rIdx} className="border-b border-zinc-100">
                    {columns.map((col) => (
                      <td key={col.key} className="py-5 px-5">
                        <div className="h-3 bg-zinc-100 rounded animate-pulse w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={columns.length} className="py-12 px-5 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-xs font-semibold text-zinc-400">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                paginatedData.map((row, rIdx) => (
                  <tr
                    key={row.id || rIdx}
                    className="border-b border-zinc-100 hover:bg-slate-50/50 transition-colors text-xs text-zinc-700 font-medium"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="py-4 px-5 align-middle">
                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && showPagination && (
          <div className="p-4 bg-zinc-50/50 border-t border-zinc-150 flex items-center justify-between text-[11px] text-zinc-500 select-none">
            <span>
              Mostrando {totalCount > 0 ? startRecord : 0} -{' '}
              {endRecord} de {totalCount} registros
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white disabled:opacity-50 hover:bg-zinc-50 transition-colors font-semibold cursor-pointer text-zinc-600"
              >
                Anterior
              </button>
              <span className="px-3 font-mono font-semibold">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white disabled:opacity-50 hover:bg-zinc-50 transition-colors font-semibold cursor-pointer text-zinc-600"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
