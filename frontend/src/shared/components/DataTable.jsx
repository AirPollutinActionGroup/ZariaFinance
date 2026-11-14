import { useMemo, useState } from 'react';
import {
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { LoadingState } from './LoadingState.jsx';
import { ErrorState } from './ErrorState.jsx';
import { EmptyState } from './EmptyState.jsx';

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1; // blanks last
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Declarative table for list pages.
 *
 * columns: [{ key, header, align?, width?, render?(row), sortValue?(row) }]
 * A column with `sortValue` gets a clickable, sortable header; `defaultSort`
 * ({ key, direction: 'asc' | 'desc' }) sets the initial order.
 * `actions` sits beside the title (e.g. an Add button); `dense` uses smaller
 * rows and a smaller title for tables embedded in a detail page.
 * Handles the four canonical states (loading / error / empty / data) so
 * every list page behaves identically.
 */
export function DataTable({
  columns = [],
  rows = [],
  getRowKey = (row) => row.id ?? row.key ?? row.code ?? row.srNo ?? String(row),
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDescription = '',
  title = null,
  actions = null,
  dense = false,
  onRowClick,
  defaultSort = null,
  footer = null,
}) {
  const [sort, setSort] = useState(defaultSort);

  const sortedRows = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key && c.sortValue);
    if (!col) return rows;
    const dir = sort.direction === 'desc' ? -1 : 1;
    return [...rows].sort((a, b) => dir * compareValues(col.sortValue(a), col.sortValue(b)));
  }, [rows, columns, sort]);

  const toggleSort = (key) =>
    setSort((s) => (s?.key === key ? { key, direction: s.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }));

  if (isLoading) return <LoadingState label="Loading records…" />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  return (
    <Card>
      {title || actions ? (
        <Stack
          direction="row"
          sx={{
            px: 2.5,
            pt: dense ? 1.75 : 2.5,
            pb: dense ? 1.25 : 1.5,
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {title ? (
            <Typography variant={dense ? 'h6' : 'h4'} component="h2">
              {title}
            </Typography>
          ) : <span />}
          {actions}
        </Stack>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} compact={dense} />
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align || 'left'}
                    width={col.width}
                    sx={col.sx}
                    sortDirection={sort?.key === col.key ? sort.direction : false}
                  >
                    {col.sortValue ? (
                      <TableSortLabel
                        active={sort?.key === col.key}
                        direction={sort?.key === col.key ? sort.direction : 'asc'}
                        onClick={() => toggleSort(col.key)}
                      >
                        {col.header}
                      </TableSortLabel>
                    ) : (
                      col.header
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align || 'left'} sx={col.sx}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            {footer}
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
