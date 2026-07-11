import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

/**
 * Quick-look pop-up used by the dashboard KPI tiles — mirrors the preview's
 * in-place modals. Lists a small set of real records; an optional primary
 * action deep-links to the full register.
 */
export function RecordsDialog({ open, onClose, title, columns, rows, primaryAction }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: (t) => t.typography.h2.fontFamily, fontSize: 18 }}>
        {title}
      </DialogTitle>
      <DialogContent dividers>
        {rows.length ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align}>
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.id ?? i}>
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography sx={{ color: 'text.secondary', py: 2 }}>None.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {primaryAction ? (
          <Button
            variant="text"
            color="inherit"
            onClick={() => {
              onClose();
              primaryAction.onClick();
            }}
            sx={{ mr: 'auto' }}
          >
            {primaryAction.label}
          </Button>
        ) : null}
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
