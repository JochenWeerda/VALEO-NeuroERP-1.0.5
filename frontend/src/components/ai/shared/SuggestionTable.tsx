import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip } from '@mui/material';
import { Visibility as ViewIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { ConfidenceIndicator } from './ConfidenceIndicator';

export interface SuggestionTableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

interface SuggestionTableProps<T> {
  data: T[];
  columns: SuggestionTableColumn<T>[];
  onView?: (row: T) => void;
  onOptimize?: (row: T) => void;
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

export function SuggestionTable<T extends { id: string }>({
  data,
  columns,
  onView,
  onOptimize,
  loading = false,
  emptyText = 'Keine Vorschläge gefunden',
  className = ''
}: SuggestionTableProps<T>) {
  return (
    <TableContainer component={Paper} className={className}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key as string} align={col.align || 'left'} style={col.width ? { width: col.width } : {}}>
                {col.label}
              </TableCell>
            ))}
            {(onView || onOptimize) && <TableCell align="center">Aktionen</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length + ((onView || onOptimize) ? 1 : 0)} align="center">
                {emptyText}
              </TableCell>
            </TableRow>
          )}
          {data.map((row) => (
            <TableRow key={row.id} hover>
              {columns.map((col) => (
                <TableCell key={col.key as string} align={col.align || 'left'}>
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </TableCell>
              ))}
              {(onView || onOptimize) && (
                <TableCell align="center">
                  <div className="flex gap-1 justify-center">
                    {onView && (
                      <Tooltip title="Details anzeigen">
                        <IconButton size="small" onClick={() => onView(row)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onOptimize && (
                      <Tooltip title="Optimieren">
                        <IconButton size="small" onClick={() => onOptimize(row)}>
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 