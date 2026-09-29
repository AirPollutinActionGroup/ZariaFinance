import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/index.js';
import { ConfirmDialog, DataTable, ErrorState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate, formatDateTime } from '../../../lib/format/date.js';
import { BOOK, BOOK_TONE } from '../../donation-management/constants.js';
import { EDITABLE_STATUSES, deleteBudget, getBudgetById, transitionBudget } from '../data/budgetRepository.js';
import { budgetTotal, lineTotal, quarterTotals, totalsBy } from '../lib/budgetMath.js';
import { getBudgetCategoryName } from '../data/budgetCategoryRepository.js';
import {
  BUDGET_STATUS,
  BUDGET_STATUS_TONE,
  BUDGET_TYPE,
  QUARTERS,
  budgetTypeOf,
} from '../constants.js';

const MONEY_SX = { fontVariantNumeric: 'tabular-nums' };

/** What each action does, keyed by action id. `to: null` means delete. */
const ACTIONS = {
  submit: { to: 'SUBMITTED', title: 'Submit for approval?', confirm: 'Submit', color: 'primary', description: 'The budget is locked for editing while it awaits approval.' },
  withdraw: { to: 'DRAFT', title: 'Withdraw submission?', confirm: 'Withdraw', color: 'inherit', description: 'The budget returns to Draft so it can be edited again.' },
  approve: { to: 'APPROVED', title: 'Approve budget?', confirm: 'Approve', color: 'success', description: 'Approved budgets are final and feed the outflow schedule.' },
  reject: { to: 'REJECTED', title: 'Return for revision?', confirm: 'Reject', color: 'error', description: 'The owner can revise and resubmit it.', noteRequired: true },
  delete: { to: null, title: 'Delete draft budget?', confirm: 'Delete', color: 'error', description: 'This cannot be undone.' },
};

function SectionCard({ title, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

/** Horizontal share bars — label, amount and % of the budget total. */
function BreakdownBars({ rows, total, labelOf, color = 'primary.main' }) {
  return (
    <Stack spacing={1.5}>
      {rows.map((row) => {
        const pct = total > 0 ? Math.round((row.amount / total) * 100) : 0;
        return (
          <Box key={row.key}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="body2">{labelOf(row.key)}</Typography>
              <Typography variant="body2" sx={{ ...MONEY_SX, fontWeight: 600 }}>
                {formatInrExact(row.amount)} <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>({pct}%)</Box>
              </Typography>
            </Stack>
            <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: 3 }} />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

/** Single budget — /budgets/:id. */
export function BudgetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [budget, setBudget] = useState(() => getBudgetById(id));
  const [pendingAction, setPendingAction] = useState(null);
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState(null);

  const listUrl = budget ? `/budgets?fy=${budget.financialYear}` : '/budgets';
  const back = (
    <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate(listUrl)}>
      Budget
    </Button>
  );

  if (!budget) {
    return (
      <>
        {back}
        <ErrorState error={{ message: `No budget found for "${id}".` }} />
      </>
    );
  }

  const total = budgetTotal(budget.lines);
  const qTotals = quarterTotals(budget.lines);
  const maxQuarter = Math.max(1, ...Object.values(qTotals));
  const action = pendingAction ? ACTIONS[pendingAction] : null;
  const isEditable = EDITABLE_STATUSES.includes(budget.status);

  const openAction = (key) => {
    setNote('');
    setActionError(null);
    setPendingAction(key);
  };

  const confirmAction = () => {
    try {
      if (action.to === null) {
        deleteBudget(budget.id);
        navigate(listUrl);
        return;
      }
      setBudget(transitionBudget(budget.id, action.to, { by: user?.name || 'You', note: note.trim() }));
      setPendingAction(null);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const columns = [
    { key: 'id', header: 'Line', render: (l) => <Box sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12.5 }}>{l.id}</Box> },
    {
      key: 'description',
      header: 'Description',
      render: (l) => (
        <Box>
          <Typography variant="body2">{l.description}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{getBudgetCategoryName(l.category)}</Typography>
        </Box>
      ),
    },
    { key: 'book', header: 'Book', render: (l) => <StatusChip label={l.book} tone={BOOK_TONE[l.book]} /> },
    ...QUARTERS.map((q) => ({
      key: q.key,
      header: q.label,
      align: 'right',
      render: (l) => <Box sx={{ ...MONEY_SX, color: l[q.key] ? 'text.primary' : 'text.secondary' }}>{l[q.key] ? formatInrExact(l[q.key]) : '—'}</Box>,
    })),
    { key: 'total', header: 'Total', align: 'right', render: (l) => <Box sx={{ ...MONEY_SX, fontWeight: 700 }}>{formatInrExact(lineTotal(l))}</Box> },
  ];

  return (
    <Box sx={{ maxWidth: 1400 }}>
      {back}

      <PageHeader
        eyebrow={`${budget.id} · FY ${budget.financialYear} · ${BUDGET_TYPE[budgetTypeOf(budget)]}`}
        title={budget.name}
        subtitle={`${budget.programme} · ${budget.stateName || 'All states'}${budget.owner ? ` · Owner: ${budget.owner}` : ''}`}
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
            <StatusChip label={BUDGET_STATUS[budget.status]} tone={BUDGET_STATUS_TONE[budget.status]} />
            {budget.status === 'DRAFT' ? (
              <Button color="error" onClick={() => openAction('delete')}>Delete</Button>
            ) : null}
            {isEditable ? (
              <Button variant="outlined" onClick={() => navigate(`/budgets/${budget.id}/edit`)}>
                {budget.status === 'REJECTED' ? 'Revise' : 'Edit'}
              </Button>
            ) : null}
            {budget.status === 'DRAFT' ? (
              <Button variant="contained" onClick={() => openAction('submit')}>Submit for approval</Button>
            ) : null}
            {budget.status === 'SUBMITTED' ? (
              <>
                <Button onClick={() => openAction('withdraw')}>Withdraw</Button>
                <Button variant="outlined" color="error" onClick={() => openAction('reject')}>Reject</Button>
                <Button variant="contained" color="success" onClick={() => openAction('approve')}>Approve</Button>
              </>
            ) : null}
            {budget.status === 'APPROVED' ? (
              <Button variant="outlined" onClick={() => navigate('/outflow-budget')}>View outflow</Button>
            ) : null}
          </Stack>
        }
      />

      {budget.status === 'REJECTED' ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Returned for revision{budget.history.at(-1)?.note ? `: ${budget.history.at(-1).note}` : '.'}
        </Alert>
      ) : null}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Total budget">
            <Typography sx={{ ...MONEY_SX, fontFamily: 'monospace', fontWeight: 700, fontSize: 26 }}>{formatInrExact(total)}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2.5 }}>
              {budget.lines.length} lines · updated {formatDate(budget.updatedAt)}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ height: 110 }}>
              {QUARTERS.map((q) => (
                <Stack key={q.key} sx={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Box
                    title={formatInrExact(qTotals[q.key])}
                    sx={{ width: '100%', maxWidth: 40, height: `${(qTotals[q.key] / maxQuarter) * 80}%`, minHeight: 2, bgcolor: 'primary.main', borderRadius: '4px 4px 0 0' }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 600 }}>{q.label}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>{q.months}</Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="By category">
            <BreakdownBars rows={totalsBy(budget.lines, 'category')} total={total} labelOf={getBudgetCategoryName} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="By book">
            <BreakdownBars
              rows={totalsBy(budget.lines, 'book')}
              total={total}
              labelOf={(k) => (BOOK[k] ? `${k} · ${BOOK[k]}` : k)}
              color="secondary.main"
            />
          </SectionCard>
        </Grid>
      </Grid>

      <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
        Budget lines
      </Typography>
      <Box sx={{ mb: 3 }}>
        <DataTable columns={columns} rows={budget.lines} getRowKey={(l) => l.id} emptyTitle="No budget lines" />
      </Box>

      <Grid container spacing={3}>
        {budget.notes ? (
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Notes">
              <Typography variant="body2">{budget.notes}</Typography>
            </SectionCard>
          </Grid>
        ) : null}
        <Grid size={{ xs: 12, md: budget.notes ? 6 : 12 }}>
          <SectionCard title="Approval history">
            <Stack spacing={1.5}>
              {[...budget.history].reverse().map((h, i) => (
                <Stack key={`${h.at}-${i}`} direction="row" spacing={1.5} alignItems="flex-start">
                  <StatusChip label={BUDGET_STATUS[h.status]} tone={BUDGET_STATUS_TONE[h.status]} />
                  <Box>
                    <Typography variant="body2">
                      {h.by || '—'} <Box component="span" sx={{ color: 'text.secondary' }}>· {formatDateTime(h.at)}</Box>
                    </Typography>
                    {h.note ? <Typography variant="caption" sx={{ color: 'text.secondary' }}>{h.note}</Typography> : null}
                  </Box>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={Boolean(action)}
        title={action?.title}
        description={action?.description}
        confirmLabel={action?.confirm}
        confirmColor={action?.color}
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          if (action?.noteRequired && !note.trim()) {
            setActionError('Give a reason so the owner knows what to change.');
            return;
          }
          confirmAction();
        }}
      >
        {action && action.to !== null ? (
          <TextField
            fullWidth
            multiline
            minRows={2}
            sx={{ mt: 2 }}
            label={action.noteRequired ? 'Reason *' : 'Comment (optional)'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        ) : null}
        {actionError ? <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert> : null}
      </ConfirmDialog>
    </Box>
  );
}
