import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Skeleton,
  IconButton
} from '@mui/material';
import { Sort, Inbox } from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { UI_LABELS } from './ui/UIStandardization';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'Keine Daten verfügbar',
  className,
}: TableProps<T>) {
  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Box>
          <Skeleton variant="rectangular" height={32} sx={{ mb: 2 }} />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1 }} />
          ))}
        </Box>
      </Paper>
    );
  }

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <Inbox sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden' }} className={className}>
      <TableContainer>
        <MuiTable>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'text.secondary',
                    width: column.width
                  }}
                >
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="caption" fontWeight="medium">
                      {column.header}
                    </Typography>
                    {column.sortable && (
                      <IconButton size="small" sx={{ p: 0 }}>
                        <Sort fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    sx={{
                      px: 3,
                      py: 2,
                      fontSize: '0.875rem',
                      color: 'text.primary'
                    }}
                  >
                    {column.render
                      ? column.render((row as any)[column.key], row)
                      : (row as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Paper>
  );
} 