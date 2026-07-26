import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GrantForm } from './GrantForm.jsx';
import { fundProfileService } from '../services/fundProfileService.js';
import { programmeApi } from '../api/programmeApi.js';
import { fxRateApi } from '../api/fxRateApi.js';
import { userRegisterApi } from '../../registration/api/userRegisterApi.js';

vi.mock('../services/fundProfileService.js', () => ({
  fundProfileService: { listByDonor: vi.fn(), getProfile: vi.fn() },
}));
vi.mock('../api/programmeApi.js', () => ({ programmeApi: { list: vi.fn() } }));
vi.mock('../api/fxRateApi.js', () => ({ fxRateApi: { get: vi.fn() } }));
vi.mock('../../registration/api/userRegisterApi.js', () => ({
  userRegisterApi: { list: vi.fn(), register: vi.fn() },
}));

const DONORS = [
  { id: 1, donorName: 'Tata Foundation', donorCode: 'DNR-001' },
  { id: 2, donorName: 'Greenline Power CSR Trust', donorCode: 'DNR-002' },
];

const PROFILES = [
  {
    id: 26,
    fundClassCode: 'C',
    fundModeLabel: 'Unrestricted',
    programmeName: 'Organisational Core',
    purpose: 'General support',
    plannedTotalAmount: 4000000,
  },
];

function renderForm(props = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <GrantForm donors={DONORS} onSubmit={vi.fn()} onCancel={vi.fn()} {...props} />
    </QueryClientProvider>,
  );
}

describe('GrantForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fundProfileService.listByDonor.mockResolvedValue(PROFILES);
    programmeApi.list.mockResolvedValue([
      { id: 8, programmeCode: 'PRG-CA', programmeName: 'Clean Air' },
    ]);
    userRegisterApi.list.mockResolvedValue([
      { id: 4, firstName: 'Asha', lastName: 'Rao', username: 'arao' },
    ]);
    fxRateApi.get.mockResolvedValue({
      currency: 'USD',
      requestedDate: '2026-07-26',
      rateDate: '2026-07-26',
      rateToInr: 85.25,
      source: 'RBI',
      stale: false,
    });
  });

  it('renders the three sections of the agreement form', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: 'Agreement' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dates & value' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Approval' })).toBeInTheDocument();
    // The document has no Notes section — description and document path are gone.
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/agreement document path/i)).not.toBeInTheDocument();
  });

  it('offers the grant code read-only and auto-generated', () => {
    renderForm();
    const grantCode = screen.getByLabelText(/grant code/i);
    expect(grantCode).toBeDisabled();
    expect(screen.getByText(/auto-generated on save/i)).toBeInTheDocument();
  });

  it('searches donors and inherits the total from the chosen fund profile', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByRole('combobox', { name: /donor/i }), 'Greenline');
    await user.click(await screen.findByText(/Greenline Power CSR Trust/));

    // Fund profile options only load once a donor scopes them.
    await waitFor(() => expect(fundProfileService.listByDonor).toHaveBeenCalledWith(2));
    await user.click(screen.getByRole('combobox', { name: /fund profile/i }));
    await user.click(await screen.findByText(/Class C · Unrestricted/));

    // Read-only, inherited = Σ tranche amounts of the profile.
    const total = screen.getByLabelText(/total grant amount/i);
    expect(total).toBeDisabled();
    await waitFor(() => expect(total).toHaveValue('₹40,00,000'));
    expect(screen.getByText(/Σ tranche amounts of the fund profile/i)).toBeInTheDocument();
  });

  it('locks the FX rate to 1 for INR grants', () => {
    renderForm();
    const fx = screen.getByLabelText(/fx rate/i);
    expect(fx).toBeDisabled();
    expect(fx).toHaveValue(1);
    expect(fxRateApi.get).not.toHaveBeenCalled();
  });

  it('auto-fills the FX rate from the reference rate for a foreign currency', async () => {
    const user = userEvent.setup();
    renderForm({ defaultValues: { ...defaults(), agreementDate: '2026-07-26' } });

    await user.click(screen.getByRole('combobox', { name: /currency/i }));
    await user.click(await screen.findByRole('option', { name: 'USD' }));

    await waitFor(() => expect(fxRateApi.get).toHaveBeenCalledWith('USD', '2026-07-26'));
    const fx = screen.getByLabelText(/fx rate/i);
    await waitFor(() => expect(fx).toHaveValue(85.25));
    expect(fx).toBeEnabled();
    expect(screen.getByText(/RBI rate for 2026-07-26/i)).toBeInTheDocument();
  });

  it('flags a stale rate rather than silently presenting it as the signing rate', async () => {
    fxRateApi.get.mockResolvedValue({
      currency: 'USD',
      requestedDate: '2026-07-26',
      rateDate: '2026-01-01',
      rateToInr: 85,
      source: 'SEED',
      stale: true,
    });
    const user = userEvent.setup();
    renderForm({ defaultValues: { ...defaults(), agreementDate: '2026-07-26' } });

    await user.click(screen.getByRole('combobox', { name: /currency/i }));
    await user.click(await screen.findByRole('option', { name: 'USD' }));

    expect(
      await screen.findByText(/No rate for 2026-07-26; showing SEED rate of 2026-01-01/i),
    ).toBeInTheDocument();
  });

  it('blocks submitting an approved grant with no approver or approval date', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderForm({
      onSubmit,
      defaultValues: {
        ...defaults(),
        donorId: '2',
        fundProfileId: '26',
        programmeId: '8',
        agreementName: 'Clean Air 2026',
        agreementDate: '2026-07-26',
        startDate: '2026-08-01',
        endDate: '2027-07-31',
        approvalStatus: '1',
      },
    });

    // Let the prefilled profile's options arrive before submitting, so the
    // assertion is about validation and not about a half-loaded select.
    await waitFor(() => expect(fundProfileService.listByDonor).toHaveBeenCalledWith(2));
    await user.click(screen.getByRole('button', { name: /create grant/i }));

    expect(await screen.findByText(/approved by is required once the grant is approved/i)).toBeInTheDocument();
    expect(screen.getByText(/approval date is required once the grant is approved/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

/** grantFormDefaults, restated locally so a test never depends on form defaults drifting. */
function defaults() {
  return {
    grantCode: '',
    donorId: '',
    fundProfileId: '',
    programmeId: '',
    agreementName: '',
    status: 'ACTIVE',
    agreementDate: '',
    startDate: '',
    endDate: '',
    grantCurrency: 'INR',
    fxLockedRate: '1',
    approvalStatus: '2',
    approvedBy: '',
    approvalDate: '',
    approvalRemarks: '',
    description: '',
    agreementDocumentPath: '',
  };
}
