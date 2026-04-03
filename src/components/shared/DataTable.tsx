import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tableVariants } from '@/lib/constants';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  sortable?: boolean;
}

export interface DataTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  actions,
  emptyMessage = 'No data available',
  isLoading = false,
  className = '',
  pageSize = 10,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc: any, part: string) => acc?.[part], obj);
  };

  const tanstackColumns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = columns.map((col) => ({
      id: col.key,
      accessorFn: (row: T) => getNestedValue(row, col.key),
      header: col.label,
      cell: ({ row }) => {
        const value = getNestedValue(row.original, col.key);
        return col.render ? col.render(value, row.original) : (value ?? '-');
      },
      enableSorting: col.sortable !== false,
      meta: { align: col.align || 'left', className: col.className || '' },
    }));

    if (actions) {
      cols.push({
        id: '__actions__',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {actions(row.original)}
          </div>
        ),
        enableSorting: false,
        meta: { align: 'right', className: '' },
      });
    }

    return cols;
  }, [columns, actions]);

  const table = useReactTable({
    data: data ?? [],
    columns: tanstackColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  if (isLoading) {
    return <div className="py-8 text-center text-slate-500">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="py-8 text-center text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className={tableVariants.header}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = (header.column.columnDef.meta as any) ?? {};
                  const align = meta.align || 'left';
                  const isSortable = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      className={`px-4 py-3 font-semibold text-${align} whitespace-nowrap ${isSortable ? 'cursor-pointer select-none' : ''} ${meta.className || ''}`}
                      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && (
                          header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="w-3 h-3 text-blue-600" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="w-3 h-3 text-blue-600" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                          )
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={tableVariants.row}>
                {row.getVisibleCells().map((cell) => {
                  const meta = (cell.column.columnDef.meta as any) ?? {};
                  const align = meta.align || 'left';
                  return (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-${align} ${tableVariants.cellBold}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 px-1">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            {' '}({data.length} total)
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
