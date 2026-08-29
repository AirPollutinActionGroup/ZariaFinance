import { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '../../../shared/components/index.js';
import { SearchableSelect } from '../../../components/SearchableSelect.jsx';
import { formatInr } from '../../../lib/format/currency.js';
import {
  ACCOUNT_GROUPS,
  BOOK,
  DR_CR_OPTIONS,
  MOCK_ACCOUNTS,
  MOCK_LEDGERS,
  MOCK_PARTIES,
  PARTY_CATEGORIES,
  PAYMENT_MODES,
  VOUCHER_TYPES,
} from '../data/transactionData.js';

export function TransactionEntryPage() {
  // Form State
  const [voucherType, setVoucherType] = useState('DEBIT_NOTE');
  const [bookOption, setBookOption] = useState('LC');
  const [partyCategory, setPartyCategory] = useState('VENDOR');
  const [selectedPartyId, setSelectedPartyId] = useState('VEN-201');
  const [paymentMode, setPaymentMode] = useState('NEFT');
  const [voucherDate, setVoucherDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [transactionId, setTransactionId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('ACC-LC-01');
  const [accountGroup, setAccountGroup] = useState('INCOME_AND_EXPENDITURE');
  const [selectedLedgerId, setSelectedLedgerId] = useState('LED-IE-01');
  const [amount, setAmount] = useState('');
  const [drCrType, setDrCrType] = useState('DEBIT');
  const [narration, setNarration] = useState('');

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState(null);

  // Sync default Dr/Cr with Voucher Type selection
  useEffect(() => {
    setDrCrType(voucherType === 'DEBIT_NOTE' ? 'DEBIT' : 'CREDIT');
  }, [voucherType]);

  // Filter parties by selected party category
  const availableParties = useMemo(() => {
    return MOCK_PARTIES[partyCategory] || [];
  }, [partyCategory]);

  // Keep party ID valid when party category changes
  const currentPartyId = useMemo(() => {
    const exists = availableParties.some((p) => p.id === selectedPartyId);
    if (exists) return selectedPartyId;
    return availableParties[0]?.id || '';
  }, [availableParties, selectedPartyId]);

  // Filter accounts strictly by FC (Foreign) vs LC (Domestic) Book and Payment Mode
  const filteredAccounts = useMemo(() => {
    return MOCK_ACCOUNTS.filter((acc) => {
      // Categorized strictly by FC (Foreign) or LC (Domestic) Book
      if (acc.book !== bookOption) return false;
      // If Cash mode is selected, show cash accounts + bank accounts
      if (paymentMode === 'CASH') return true;
      // For electronic/bank payment modes, show Bank Accounts only
      return acc.type !== 'Cash Account';
    });
  }, [bookOption, paymentMode]);

  // Automatically update and select the categorized bank account when LC or FC changes
  useEffect(() => {
    if (filteredAccounts.length > 0) {
      const isCurrentInFiltered = filteredAccounts.some((a) => a.id === selectedAccountId);
      if (!isCurrentInFiltered) {
        setSelectedAccountId(filteredAccounts[0].id);
      }
    } else {
      setSelectedAccountId('');
    }
  }, [bookOption, filteredAccounts, selectedAccountId]);

  // Filter Ledgers cascading from the selected Group
  const filteredLedgers = useMemo(() => {
    return MOCK_LEDGERS.filter((l) => l.group === accountGroup);
  }, [accountGroup]);

  // Keep selectedLedgerId valid when Group changes
  useEffect(() => {
    if (filteredLedgers.length > 0) {
      const isCurrentInFiltered = filteredLedgers.some((l) => l.id === selectedLedgerId);
      if (!isCurrentInFiltered) {
        setSelectedLedgerId(filteredLedgers[0].id);
      }
    } else {
      setSelectedLedgerId('');
    }
  }, [accountGroup, filteredLedgers, selectedLedgerId]);

  // Get currently selected Ledger object
  const currentLedger = useMemo(() => {
    return (
      filteredLedgers.find((l) => l.id === selectedLedgerId) ||
      filteredLedgers[0] ||
      null
    );
  }, [filteredLedgers, selectedLedgerId]);

  // Current payment mode definition (for placeholder)
  const currentModeDef = useMemo(() => {
    return PAYMENT_MODES.find((m) => m.id === paymentMode) || PAYMENT_MODES[0];
  }, [paymentMode]);

  // Suggest-field (searchable) option lists, memoized so `value` lookups reuse the same array
  const voucherOptions = useMemo(
    () => VOUCHER_TYPES.map((v) => ({ value: v.value, label: v.label })),
    []
  );
  const bookOptions = useMemo(
    () => Object.entries(BOOK).map(([code, label]) => ({ value: code, label: `${code} · ${label}` })),
    []
  );
  const partyCategoryOptions = useMemo(
    () => PARTY_CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label })),
    []
  );
  const partyOptions = useMemo(
    () => availableParties.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` })),
    [availableParties]
  );
  const paymentModeOptions = useMemo(
    () => PAYMENT_MODES.map((mode) => ({ value: mode.id, label: mode.label })),
    []
  );
  const accountOptions = useMemo(
    () =>
      filteredAccounts.map((acc) => ({
        value: acc.id,
        label: `${acc.accountName} — ${acc.accountNumber} (${formatInr(acc.balance)})`,
      })),
    [filteredAccounts]
  );
  const accountGroupOptions = useMemo(
    () => ACCOUNT_GROUPS.map((grp) => ({ value: grp.value, label: grp.label })),
    []
  );
  const ledgerOptions = useMemo(
    () => filteredLedgers.map((ledger) => ({ value: ledger.id, label: `${ledger.name} (${ledger.code})` })),
    [filteredLedgers]
  );
  const drCrOptions = useMemo(
    () => DR_CR_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      setToastMessage({
        type: 'error',
        text: 'Please enter a valid amount.',
      });
      return;
    }

    if (!selectedAccountId) {
      setToastMessage({
        type: 'error',
        text: 'Please select a valid Bank / Cash Account.',
      });
      return;
    }

    if (!selectedLedgerId) {
      setToastMessage({
        type: 'error',
        text: 'Please select a valid Ledger.',
      });
      return;
    }

    const selectedAcc = MOCK_ACCOUNTS.find((a) => a.id === selectedAccountId);

    setToastMessage({
      type: 'success',
      text: `Transaction voucher for ${formatInr(amount)} (${currentLedger?.name || 'Ledger'} · ${drCrType === 'DEBIT' ? 'Dr' : 'Cr'}) posted successfully!`,
    });

    // Reset optional fields
    setAmount('');
    setTransactionId('');
    setNarration('');
  };

  const isForeign = bookOption === 'FC';

  return (
    <Box sx={{ maxWidth: 1000, pb: 4 }}>
      <PageHeader
        title="Payment Window(Cr/Dr)"
        subtitle="Record a financial voucher"
      />

      <Card component="form" onSubmit={handleSubmit} noValidate sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4, md: 4.5 } }}>
          <Stack spacing={4}>
            <section>
              <Typography variant="h4" component="h2" sx={{ mb: 3.5, fontWeight: 700 }}>
                Identity
              </Typography>

              <Grid container rowSpacing={3.25} columnSpacing={3}>
                {/* 1. Voucher Dropdown */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Voucher *"
                    options={voucherOptions}
                    value={voucherOptions.find((o) => o.value === voucherType) || null}
                    onChange={(newValue) => setVoucherType(newValue?.value || '')}
                  />
                </Grid>

                {/* 2. FC / LC Book Option Dropdown */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Book *"
                    options={bookOptions}
                    value={bookOptions.find((o) => o.value === bookOption) || null}
                    onChange={(newValue) => setBookOption(newValue?.value || '')}
                  />
                </Grid>

                {/* 3. Party Category Dropdown */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Party category *"
                    options={partyCategoryOptions}
                    value={partyCategoryOptions.find((o) => o.value === partyCategory) || null}
                    onChange={(newValue) => {
                      setPartyCategory(newValue?.value || '');
                      setSelectedPartyId('');
                    }}
                  />
                </Grid>

                {/* 4. Specific Party Name / Selector */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label={
                      partyCategory === 'EMPLOYEE'
                        ? 'Employee name *'
                        : partyCategory === 'VENDOR'
                        ? 'Vendor / Supplier name *'
                        : 'Beneficiary name *'
                    }
                    options={partyOptions}
                    value={partyOptions.find((o) => o.value === currentPartyId) || null}
                    onChange={(newValue) => setSelectedPartyId(newValue?.value || '')}
                  />
                </Grid>

                {/* 5. Payment Mode Dropdown */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Payment mode *"
                    options={paymentModeOptions}
                    value={paymentModeOptions.find((o) => o.value === paymentMode) || null}
                    onChange={(newValue) => setPaymentMode(newValue?.value || '')}
                  />
                </Grid>

                {/* 6. Date (Before Transaction ID) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Transaction date *"
                    InputLabelProps={{ shrink: true }}
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                  />
                </Grid>

                {/* 7. Transaction ID / Reference */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Transaction ID / Reference *"
                    placeholder={currentModeDef.refPlaceholder}
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </Grid>

                {/* 8. Bank / Cash Account (AFTER Transaction ID) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label={
                      isForeign
                        ? 'Foreign / FCRA Bank Account *'
                        : 'Domestic Bank / Cash Account *'
                    }
                    options={accountOptions}
                    value={accountOptions.find((o) => o.value === selectedAccountId) || null}
                    onChange={(newValue) => setSelectedAccountId(newValue?.value || '')}
                  />
                </Grid>

                {/* 9. Group Dropdown */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Group *"
                    options={accountGroupOptions}
                    value={accountGroupOptions.find((o) => o.value === accountGroup) || null}
                    onChange={(newValue) => setAccountGroup(newValue?.value || '')}
                  />
                </Grid>

                {/* 10. Ledger Dropdown (Cascading from Group) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Ledger *"
                    options={ledgerOptions}
                    value={ledgerOptions.find((o) => o.value === selectedLedgerId) || null}
                    onChange={(newValue) => setSelectedLedgerId(newValue?.value || '')}
                  />
                </Grid>

                {/* 11. Bucket (Auto-Derived & Highlighted from Ledger) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Bucket"
                    value={currentLedger?.bucket || '—'}
                    disabled
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      sx: {
                        bgcolor: '#FAFAFB',
                        fontWeight: 600,
                        color: '#17191C',
                      },
                    }}
                  />
                </Grid>

                {/* 12. CapEx / OpEx (Auto-Derived & Highlighted from Ledger) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="CapEx / OpEx"
                    value={currentLedger?.capExOpEx || '—'}
                    disabled
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      sx: {
                        bgcolor: '#FAFAFB',
                        fontWeight: 700,
                        color: currentLedger?.capExOpEx === 'CapEx' ? '#8F6A12' : '#2F5FA8',
                      },
                    }}
                  />
                </Grid>

                {/* 13. Amount */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Amount (₹) *"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Grid>

                {/* 14. Debit / Credit (AFTER Amount) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Debit / Credit *"
                    options={drCrOptions}
                    value={drCrOptions.find((o) => o.value === drCrType) || null}
                    onChange={(newValue) => setDrCrType(newValue?.value || '')}
                  />
                </Grid>

                {/* 15. Narration */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Narration / Remarks"
                    placeholder="Enter voucher description"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                  />
                </Grid>
              </Grid>
            </section>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setAmount('');
                  setTransactionId('');
                  setNarration('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#17191C',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': { bgcolor: '#232629' },
                }}
              >
                Save Transaction
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Feedback Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toastMessage ? (
          <Alert
            severity={toastMessage.type}
            onClose={() => setToastMessage(null)}
            sx={{ width: '100%', boxShadow: 3 }}
          >
            {toastMessage.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
