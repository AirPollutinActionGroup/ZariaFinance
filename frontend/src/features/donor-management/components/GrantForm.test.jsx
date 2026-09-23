import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GrantForm } from './GrantForm.jsx';
import { fundProfileService } from '../services/fundProfileService.js';

vi.mock('../services/fundProfileService.js', () => ({
  fundProfileService: { listByDonor: vi.fn(), getProfile: vi.fn() },
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
    disbursementRules: [{ totalAmount: 4000000 }],
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
  });

  it('renders the three sections of the agreement form', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: 'Agreement' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dates & value' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
    // Approval workflow is managed elsewhere — this form has no Approval section.
    expect(screen.queryByRole('heading', { name: 'Approval' })).not.toBeInTheDocument();
    // Remarks and the document picker are optional.
    expect(screen.getByLabelText(/remarks/i)).not.toBeRequired();
    expect(screen.getByRole('button', { name: /choose file/i })).toBeInTheDocument();
  });

  it('hides the grant code field until one has been minted', () => {
    renderForm();
    expect(screen.queryByLabelText(/grant code/i)).not.toBeInTheDocument();
  });

  it('offers an existing grant code read-only', () => {
    renderForm({ defaultValues: { ...defaults(), grantCode: 'ZRY/GA/2026/001' } });
    const grantCode = screen.getByLabelText(/grant code/i);
    expect(grantCode).toBeDisabled();
    expect(grantCode).toHaveValue('ZRY/GA/2026/001');
    expect(screen.getByText(/grant code cannot be changed/i)).toBeInTheDocument();
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
  }, 15000);

  it('has no Currency, FX rate or Reporting amount fields', () => {
    renderForm();
    expect(screen.queryByLabelText(/currency/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/fx rate/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/reporting amount/i)).not.toBeInTheDocument();
  });

  it('has no Programme or Project fields — a grant has no programme association', () => {
    renderForm();
    expect(screen.queryByLabelText(/^programme$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^project$/i)).not.toBeInTheDocument();
  });

});

/** grantFormDefaults, restated locally so a test never depends on form defaults drifting. */
function defaults() {
  return {
    grantCode: '',
    donorId: '',
    fundProfileId: '',
    agreementName: '',
    status: 'ACTIVE',
    agreementDate: '',
    startDate: '',
    endDate: '',
    approvalStatus: '2',
    approvedBy: '',
    approvalDate: '',
    approvalRemarks: '',
    description: '',
    agreementDocumentPath: '',
  };
}
