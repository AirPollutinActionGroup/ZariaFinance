import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/index.js';
import { ErrorState, PageHeader } from '../../../shared/components/index.js';
import { BudgetLineEditor, newLine } from '../components/BudgetLineEditor.jsx';
import { EDITABLE_STATUSES, createBudget, getBudgetById, updateBudget } from '../data/budgetRepository.js';
import { isBudgetValid, validateBudget } from '../lib/budgetMath.js';
import { isFinancialYearLabel } from '../lib/financialYear.js';
import { SearchableSelect } from '../../../components/SearchableSelect.jsx';
import { useProgrammes } from '../../donor-management/hooks/useProgrammes.js';
import { geographyService } from '../../donor-management/services/geographyService.js';
import {
  BUDGET_STATUS,
  BUDGET_TYPE,
  BUDGET_TYPE_HINT,
  CURRENT_FINANCIAL_YEAR,
  FINANCIAL_YEARS,
  ORGANISATION_WIDE,
  QUARTERS,
  budgetTypeOf,
} from '../constants.js';

function initialDraft(existing, owner, fyParam) {
  if (existing) {
    const budgetType = budgetTypeOf(existing);
    return {
      name: existing.name,
      financialYear: existing.financialYear,
      budgetType,
      programmeId: existing.programmeId ?? null,
      programme: budgetType === 'PROGRAMME' ? existing.programme : '',
      stateId: existing.stateId ?? null,
      stateName: existing.stateName || '',
      owner: existing.owner,
      notes: existing.notes,
      lines: existing.lines.map((l) => ({ ...l })),
    };
  }
  const financialYear = isFinancialYearLabel(fyParam) ? fyParam : CURRENT_FINANCIAL_YEAR;
  return {
    name: '',
    financialYear,
    budgetType: 'PROGRAMME',
    programmeId: null,
    programme: '',
    stateId: null,
    stateName: '',
    owner: owner || '',
    notes: '',
    lines: [newLine()],
  };
}

/**
 * Coerces the editable string inputs into the stored shape. `programme` stays
 * the budget's display scope everywhere (list, detail): the programme name, or
 * "Organisation-wide". State is optional for both types — empty means all states.
 */
function toPayload(draft) {
  const isOrg = draft.budgetType === 'ORGANISATION';
  return {
    ...draft,
    name: draft.name.trim(),
    programmeId: isOrg ? null : draft.programmeId,
    programme: isOrg ? ORGANISATION_WIDE : draft.programme.trim(),
    stateId: draft.stateId ?? null,
    stateName: draft.stateName || '',
    owner: draft.owner.trim(),
    notes: draft.notes.trim(),
    lines: draft.lines.map((line) => ({
      ...line,
      description: line.description.trim(),
      ...Object.fromEntries(QUARTERS.map((q) => [q.key, Number(line[q.key]) || 0])),
    })),
  };
}

/** Create (/budgets/new) and edit (/budgets/:id/edit) a budget. */
export function BudgetFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const existing = id ? getBudgetById(id) : null;
  // A new budget starts on the FY chosen on the list page (?fy=2026-27); it can still be changed here.
  const [draft, setDraft] = useState(() => initialDraft(existing, user?.name, searchParams.get('fy')));
  // Keep the starting FY selectable even if it is outside the default previous/current/next range.
  const fyOptions = [...new Set([...FINANCIAL_YEARS, existing?.financialYear, searchParams.get('fy')])]
    .filter(isFinancialYearLabel)
    .sort();
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Programme and State come from the real master data (server-backed).
  const programmesQuery = useProgrammes();
  const programmeOptions = useMemo(() => {
    const options = (programmesQuery.data || []).map((p) => ({ value: p.id, label: p.programmeName }));
    // A budget saved with a programme name that isn't a Programme record (e.g. seed data) keeps it selectable.
    const saved = existing?.programme;
    if (budgetTypeOf(existing) === 'PROGRAMME' && saved && !options.some((o) => o.label?.toLowerCase() === saved.toLowerCase())) {
      options.unshift({ value: `name:${saved}`, label: saved });
    }
    return options;
  }, [programmesQuery.data, existing]);
  // States share the cached list the Fund Profile form uses.
  const statesQuery = useQuery({
    queryKey: ['geography', 'states'],
    queryFn: () => geographyService.listStates(),
    staleTime: 1000 * 60 * 60,
  });
  const stateOptions = statesQuery.data || [];
  // Seed budgets only carry the programme name, so fall back to matching on it.
  const selectedProgramme =
    programmeOptions.find((o) => o.value === draft.programmeId) ||
    programmeOptions.find((o) => o.label?.toLowerCase() === draft.programme?.toLowerCase()) ||
    null;
  const selectedState =
    (draft.stateId != null && stateOptions.find((o) => String(o.value) === String(draft.stateId))) ||
    // Seed budgets carry only the state name.
    (draft.stateName && stateOptions.find((o) => o.label?.toLowerCase() === draft.stateName.toLowerCase())) ||
    null;

  const errors = useMemo(() => validateBudget(draft), [draft]);
  const shown = showErrors ? errors : { header: {}, lines: {}, form: null };
  const backTo = existing ? `/budgets/${existing.id}` : `/budgets?fy=${draft.financialYear}`;

  if (id && !existing) {
    return <ErrorState error={{ message: `No budget found for "${id}".` }} />;
  }
  if (existing && !EDITABLE_STATUSES.includes(existing.status)) {
    return (
      <ErrorState
        error={{ message: `${existing.id} is ${BUDGET_STATUS[existing.status].toLowerCase()} and can no longer be edited.` }}
      />
    );
  }

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  const save = (submit) => {
    setShowErrors(true);
    if (!isBudgetValid(errors)) return;
    try {
      const payload = toPayload(draft);
      const meta = { by: user?.name || 'You', submit };
      const saved = existing ? updateBudget(existing.id, payload, meta) : createBudget(payload, meta);
      navigate(`/budgets/${saved.id}`);
    } catch (err) {
      setSaveError(err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 1400 }}>
      <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate(backTo)}>
        {existing ? existing.id : 'Budget'}
      </Button>

      <PageHeader
        eyebrow={`FY ${draft.financialYear}`}
        title={existing ? `Edit ${existing.id}` : 'New budget'}
        subtitle="Define the budget header, then add each line with its category, funding source and quarterly phasing."
      />

      {existing?.status === 'REJECTED' ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This budget was returned for revision. Saving moves it back to Draft.
        </Alert>
      ) : null}
      {saveError ? <Alert severity="error" sx={{ mb: 3 }}>{saveError}</Alert> : null}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
            Budget details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                Budget type *
              </Typography>
              <Box
                role="radiogroup"
                aria-label="Budget type"
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
              >
                {Object.entries(BUDGET_TYPE).map(([code, label]) => {
                  const selected = draft.budgetType === code;
                  return (
                    <Box
                      key={code}
                      component="button"
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setDraft((d) => ({ ...d, budgetType: code }))}
                      sx={{
                        textAlign: 'left',
                        font: 'inherit',
                        color: 'inherit',
                        cursor: 'pointer',
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        border: '1.5px solid',
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? 'action.selected' : 'transparent',
                        transition: 'border-color .15s ease, background-color .15s ease',
                        '&:hover': { borderColor: 'primary.main' },
                        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="flex-start">
                        {code === 'PROGRAMME' ? (
                          <CategoryOutlinedIcon sx={{ color: selected ? 'primary.main' : 'text.secondary', mt: 0.25 }} />
                        ) : (
                          <ApartmentOutlinedIcon sx={{ color: selected ? 'primary.main' : 'text.secondary', mt: 0.25 }} />
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{label} budget</Typography>
                          <Typography variant="caption" color="text.secondary">{BUDGET_TYPE_HINT[code]}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
              {shown.header.budgetType ? (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>{shown.header.budgetType}</Typography>
              ) : null}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Budget name *" value={draft.name} onChange={set('name')} error={Boolean(shown.header.name)} helperText={shown.header.name} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField select fullWidth label="Financial year *" value={draft.financialYear} onChange={set('financialYear')} error={Boolean(shown.header.financialYear)} helperText={shown.header.financialYear}>
                {fyOptions.map((fy) => (
                  <MenuItem key={fy} value={fy}>
                    FY {fy}{fy === CURRENT_FINANCIAL_YEAR ? ' (current)' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField fullWidth label="Budget owner" value={draft.owner} onChange={set('owner')} />
            </Grid>
            {draft.budgetType === 'PROGRAMME' ? (
              <Grid size={{ xs: 12, md: 6 }}>
                <SearchableSelect
                  label="Programme *"
                  options={programmeOptions}
                  value={selectedProgramme}
                  onChange={(opt) =>
                    setDraft((d) => ({
                      ...d,
                      // A name-only option (seed data) has no Programme record id.
                      programmeId: opt && !String(opt.value).startsWith('name:') ? opt.value : null,
                      programme: opt?.label || '',
                    }))
                  }
                  loading={programmesQuery.isLoading}
                  placeholder={programmesQuery.isError ? 'Could not load programmes' : 'Select the programme'}
                  error={shown.header.programme || (programmesQuery.isError ? 'Could not load programmes from the server' : null)}
                />
              </Grid>
            ) : null}
            <Grid size={{ xs: 12, md: 6 }}>
              <SearchableSelect
                label="State (location)"
                options={stateOptions}
                value={selectedState}
                onChange={(opt) => setDraft((d) => ({ ...d, stateId: opt?.value ?? null, stateName: opt?.label || '' }))}
                loading={statesQuery.isLoading}
                placeholder="Leave empty for all states"
                error={statesQuery.isError ? 'Could not load states — the budget will cover all states' : null}
              />
            </Grid>
            <Grid size={{ xs: 12, md: draft.budgetType === 'PROGRAMME' ? 12 : 6 }}>
              <TextField fullWidth label="Notes" value={draft.notes} onChange={set('notes')} helperText=" " />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
        Budget lines
      </Typography>
      {shown.form ? <Alert severity="error" sx={{ mb: 1.5 }}>{shown.form}</Alert> : null}
      <BudgetLineEditor lines={draft.lines} errors={shown.lines} onChange={(lines) => setDraft((d) => ({ ...d, lines }))} />

      {showErrors && !isBudgetValid(errors) ? (
        <Alert severity="error" sx={{ mt: 2 }}>Fix the highlighted fields before saving.</Alert>
      ) : null}

      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate(backTo)}>
          Cancel
        </Button>
        <Button variant="outlined" onClick={() => save(false)}>
          Save as draft
        </Button>
        <Button variant="contained" onClick={() => save(true)}>
          Save &amp; submit for approval
        </Button>
      </Stack>
    </Box>
  );
}
