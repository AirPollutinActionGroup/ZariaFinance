import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/index.js';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { BudgetLineEditor, newLine } from '../components/BudgetLineEditor.jsx';
import { useBudget, useBudgetFinancialYears, useSaveBudget } from '../hooks/useBudgets.js';
import { FINANCIAL_YEAR_STATUS_LABEL } from '../../financial-year/constants.js';
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
  budgetTypeOf,
} from '../constants.js';

/** Only Draft and Rejected budgets can be edited (the server enforces the same). */
const EDITABLE = ['DRAFT', 'REJECTED'];

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

/** The budget form itself; `existing` is the loaded budget when editing, null when creating. */
function BudgetForm({ existing }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  // A new budget starts on the FY chosen on the list page (?fy=2026-27); it can still be changed here.
  const [draft, setDraft] = useState(() => initialDraft(existing, user?.name, searchParams.get('fy')));
  // Years come from the Financial Year master. New work goes into an Active or
  // Upcoming year; a budget being edited keeps its own year even if it has closed.
  const fyMaster = useBudgetFinancialYears();
  const fyOptions = fyMaster.options.filter((fy) => fy.status !== 'CLOSED' || fy.label === existing?.financialYear);
  const selectedFy = fyOptions.find((fy) => fy.label === draft.financialYear) || null;
  const fyError = fyMaster.isError
    ? 'Could not load financial years from the server'
    : fyMaster.isSuccess && !selectedFy
      ? fyOptions.length
        ? `FY ${draft.financialYear} isn't open in the Financial Year master — pick another`
        : 'No open financial years — add one under Financial Year first'
      : null;
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const saveBudget = useSaveBudget();

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
  const stateOptions = useMemo(() => statesQuery.data || [], [statesQuery.data]);
  // Seed budgets only carry the programme name, so fall back to matching on it.
  const selectedProgramme =
    programmeOptions.find((o) => o.value === draft.programmeId) ||
    programmeOptions.find((o) => o.label?.toLowerCase() === draft.programme?.toLowerCase()) ||
    null;
  // The chosen programme's states, from `stateNames` on the /programmes list,
  // matched to the state options by name.
  const isProgrammeBudget = draft.budgetType === 'PROGRAMME';
  const programmeRecord =
    isProgrammeBudget && typeof draft.programmeId === 'number'
      ? (programmesQuery.data || []).find((p) => p.id === draft.programmeId)
      : null;
  const programmeStateIds = useMemo(() => {
    const names = new Set((programmeRecord?.stateNames || []).map((n) => n.trim().toLowerCase()));
    return new Set(stateOptions.filter((o) => names.has(o.label?.trim().toLowerCase())).map((o) => String(o.value)));
  }, [programmeRecord, stateOptions]);
  // The programme's own states are listed first, then every other state — nothing is hidden.
  // A programme with no states set just shows the plain list.
  const hasProgrammeStates = programmeStateIds.size > 0;
  const programmeStatesGroup = `${draft.programme || 'Programme'} runs in`;
  const stateGroupOf = (option) => (programmeStateIds.has(String(option.value)) ? programmeStatesGroup : 'All other states');
  const availableStates = hasProgrammeStates
    ? [
        ...stateOptions.filter((o) => programmeStateIds.has(String(o.value))),
        ...stateOptions.filter((o) => !programmeStateIds.has(String(o.value))),
      ]
    : stateOptions;
  const statesLoading = statesQuery.isLoading || (isProgrammeBudget && programmesQuery.isLoading);

  const selectedState =
    (draft.stateId != null && stateOptions.find((o) => String(o.value) === String(draft.stateId))) ||
    // Seed budgets carry only the state name.
    (draft.stateName && stateOptions.find((o) => o.label?.toLowerCase() === draft.stateName.toLowerCase())) ||
    null;
  // Allowed, but worth pointing out: the budget is placed outside where the programme runs.
  const stateOutsideProgramme = Boolean(selectedState) && hasProgrammeStates && !programmeStateIds.has(String(selectedState.value));

  const errors = useMemo(() => validateBudget(draft), [draft]);
  const shown = showErrors ? errors : { header: {}, lines: {}, form: null };
  const backTo = existing ? `/budgets/${existing.id}` : `/budgets?fy=${draft.financialYear}`;

  if (existing && !EDITABLE.includes(existing.status)) {
    return (
      <ErrorState
        error={{ message: `${existing.budgetCode} is ${BUDGET_STATUS[existing.status].toLowerCase()} and can no longer be edited.` }}
      />
    );
  }

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  const save = async (submit) => {
    setShowErrors(true);
    setSaveError(null);
    if (!isBudgetValid(errors) || !selectedFy) return;
    try {
      const saved = await saveBudget.mutateAsync({
        id: existing?.id ?? null,
        draft: { ...draft, financialYearId: selectedFy.id },
        meta: { submit, actor: user?.name || 'You' },
      });
      navigate(`/budgets/${saved.id}`);
    } catch (err) {
      // Server-side rule failures (e.g. an inactive category) come back as a readable message.
      setSaveError(err.message || 'Could not save the budget.');
    }
  };

  return (
    <Box sx={{ maxWidth: 1400 }}>
      <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate(backTo)}>
        {existing ? existing.budgetCode : 'Budget'}
      </Button>

      <PageHeader
        eyebrow={selectedFy ? selectedFy.code : `FY ${draft.financialYear}`}
        title={existing ? `Edit ${existing.budgetCode}` : 'New budget'}
        subtitle="Define the budget header, then add each line with its category, book and quarterly phasing."
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
              <TextField
                select
                fullWidth
                label="Financial year *"
                // Only a value that's in the list, so MUI doesn't warn while the master loads.
                value={selectedFy ? draft.financialYear : ''}
                onChange={set('financialYear')}
                disabled={fyMaster.isPending}
                error={Boolean(shown.header.financialYear || fyError)}
                helperText={shown.header.financialYear || fyError || (fyMaster.isPending ? 'Loading financial years…' : ' ')}
              >
                {fyOptions.map((fy) => (
                  <MenuItem key={fy.id} value={fy.label}>
                    {fy.code}
                    <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: 12 }}>
                      · {FINANCIAL_YEAR_STATUS_LABEL[fy.status] || fy.status}
                    </Box>
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
                options={availableStates}
                groupBy={hasProgrammeStates ? stateGroupOf : undefined}
                value={selectedState}
                onChange={(opt) => setDraft((d) => ({ ...d, stateId: opt?.value ?? null, stateName: opt?.label || '' }))}
                loading={statesLoading}
                placeholder="Leave empty for all states"
                error={statesQuery.isError ? 'Could not load states — the budget will cover all states' : null}
              />
              {hasProgrammeStates ? (
                <Typography
                  variant="caption"
                  color={stateOutsideProgramme ? 'warning.main' : 'text.secondary'}
                  sx={{ display: 'block', mt: -1.5 }}
                >
                  {stateOutsideProgramme
                    ? `${selectedState.label} is outside the states ${draft.programme} runs in.`
                    : `${draft.programme} runs in ${programmeStateIds.size} ${programmeStateIds.size === 1 ? 'state' : 'states'} — listed first.`}
                </Typography>
              ) : null}
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
        <Button variant="outlined" onClick={() => save(false)} disabled={saveBudget.isPending}>
          Save as draft
        </Button>
        <Button variant="contained" onClick={() => save(true)} disabled={saveBudget.isPending}>
          {saveBudget.isPending ? 'Saving…' : 'Save & submit for approval'}
        </Button>
      </Stack>
    </Box>
  );
}

/** Create (/budgets/new) and edit (/budgets/:id/edit) a budget — loads the budget first when editing. */
export function BudgetFormPage() {
  const { id } = useParams();
  const budgetQuery = useBudget(id);

  if (id && budgetQuery.isPending) return <LoadingState label="Loading budget…" />;
  if (id && budgetQuery.isError) {
    return <ErrorState error={budgetQuery.error} onRetry={budgetQuery.refetch} />;
  }
  // Keyed so switching between budgets (or to /new) starts a fresh form.
  return <BudgetForm key={id || 'new'} existing={id ? budgetQuery.data : null} />;
}
