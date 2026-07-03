import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { LoadingState } from './LoadingState.jsx';
import { ErrorState } from './ErrorState.jsx';
import { EmptyState } from './EmptyState.jsx';

/**
 * Declarative table for list pages.
 *
 * columns: [{ key, header, align?, width?, render?(row) }]
 * Handles the four canonical states (loading / error / empty / data) so
 * every list page behaves identically.
 */
export function DataTable({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDescription = '',
  title = null,
  onRowClick,
}) {
  if (isLoading) return <LoadingState label="Loading records…" />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  return (
    <Card>
      {title ? (
        <Typography variant="h4" component="h2" sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
          {title}
        </Typography>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align || 'left'} width={col.width}>
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align || 'left'}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
