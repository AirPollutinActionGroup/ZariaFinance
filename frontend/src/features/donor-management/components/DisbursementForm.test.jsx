import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DisbursementForm } from './DisbursementForm.jsx';

const SCHEDULE = {
  id: 1,
  grantId: 7,
  grantCode: 'ZRY/GA/2026/001',
  disbursementType: 'TRANCHES',
  scheduleType: 'QUARTERLY',
  frequencyLabel: 'Quarterly',
  finalised: false,
  totalAmountCommitted: 250000,
  allocatedAmount: 250000,
  unallocatedAmount: 0,
  balanced: true,
  tranches: [
    {
      id: 11,
      trancheNumber: 1,
      trancheName: 'First',
      amount: 150000,
      expectedReleaseDate: '2026-04-01',
      frequencyLabel: 'Quarterly',
      finalTranche: false,
      received: false,
      criteriaSatisfied: false,
      criteriaMetCount: 0,
      criteria: [{ id: 21, sequence: 1, criterionType: 'ON_SIGNING', met: false, humanActioned: false }],
    },
    {
      id: 12,
      trancheNumber: 2,
      trancheName: 'Second',
      amount: 100000,
      expectedReleaseDate: '2026-07-01',
      frequencyLabel: 'Quarterly',
      finalTranche: true,
      received: true,
      criteriaSatisfied: true,
      criteriaMetCount: 1,
      criteria: [{ id: 22, sequence: 1, criterionType: 'DONOR_APPROVAL', met: true, humanActioned: true }],
    },
  ],
};

function renderForm(props = {}) {
  return render(
    <DisbursementForm
      schedule={SCHEDULE}
      onSubmit={vi.fn()}
      onFinalise={vi.fn()}
      onPrefill={vi.fn()}
      {...props}
    />,
  );
}

describe('DisbursementForm', () => {
  it('shows the committed total read-only, sourced from the grant', () => {
    renderForm();
    const committed = screen.getByLabelText(/total amount committed/i);
    expect(committed).toBeDisabled();
    expect(committed).toHaveValue('₹2,50,000');
    expect(screen.getByText(/from the grant's total grant amount/i)).toBeInTheDocument();
  });

  it('collapses saved tranches into summary cards with an Edit action', () => {
    renderForm();
    expect(screen.getByText('Tranche 1')).toBeInTheDocument();
    expect(screen.getByText('Tranche 2')).toBeInTheDocument();
    // Summary view: figures as text, no inputs.
    expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2);
    expect(screen.queryByLabelText(/tranche name/i)).not.toBeInTheDocument();
  });

  it('expands a tranche for editing and locks a received one', async () => {
    const user = userEvent.setup();
    renderForm();

    // Tranche 2 has a recorded receipt.
    await user.click(screen.getAllByRole('button', { name: /edit/i })[1]);

    expect(await screen.findByText(/its amount is locked and it cannot be removed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^amount/i)).toBeDisabled();
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('echoes the schedule cadence as each tranche frequency, read-only', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);

    const frequency = await screen.findByLabelText(/frequency/i);
    expect(frequency).toBeDisabled();
    expect(frequency).toHaveValue('Quarterly');
  });

  it('swaps the schedule fields when the disbursement type changes', async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.getByRole('combobox', { name: /schedule type/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/receiving date/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: /disbursement type/i }));
    await user.click(await screen.findByRole('option', { name: 'Lump Sum' }));

    expect(await screen.findByLabelText(/receiving date/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /schedule type/i })).not.toBeInTheDocument();
    // Adding tranches makes no sense for a single release.
    expect(screen.queryByRole('button', { name: /add tranche/i })).not.toBeInTheDocument();
  });

  it('shows criterion fields and the reminder switch only where they apply', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);

    // On Signing: no extra fields, and no reminder (it is instant).
    expect(screen.queryByText(/remind someone about this/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: /criterion 1/i }));
    await user.click(await screen.findByRole('option', { name: 'Milestone Based' }));

    expect(await screen.findByLabelText(/milestone name/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /verification sign-off/i })).toBeInTheDocument();
    expect(screen.getByText(/optional — some milestones are event-driven/i)).toBeInTheDocument();
    expect(screen.getByText(/remind someone about this/i)).toBeInTheDocument();

    // A threshold is checked by the system, so it offers no reminder.
    await user.click(screen.getByRole('combobox', { name: /criterion 1/i }));
    await user.click(await screen.findByRole('option', { name: 'Utilisation Threshold' }));

    expect(await screen.findByLabelText(/utilisation %/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /trigger basis/i })).toBeInTheDocument();
    expect(screen.queryByText(/remind someone about this/i)).not.toBeInTheDocument();
  });

  it('reveals the reminder fields once the switch is on', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getAllByRole('button', { name: /edit/i })[1]);

    // Tranche 2's criterion is Donor Approval — human-actioned.
    await user.click(screen.getByLabelText(/remind someone about this/i));

    expect(await screen.findByRole('combobox', { name: /responsible role/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/lead time \(days\)/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /repeat/i })).toBeInTheDocument();
    expect(screen.getByText(/the deputy is notified only/i)).toBeInTheDocument();
  });

  it('tracks allocation against the committed amount and gates finalising on it', async () => {
    const user = userEvent.setup();
    const onFinalise = vi.fn();
    renderForm({ onFinalise });

    // Balanced to start: 150,000 + 100,000 = 250,000.
    expect(screen.getByRole('button', { name: /finalise/i })).toBeEnabled();

    await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    const amount = await screen.findByLabelText(/^amount/i);
    await user.clear(amount);
    await user.type(amount, '50000');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /finalise/i })).toBeDisabled());
    expect(screen.getByText(/still to allocate/i)).toBeInTheDocument();
    expect(
      screen.getByText(/finalising needs the tranche amounts to equal the committed amount/i),
    ).toBeInTheDocument();
    expect(onFinalise).not.toHaveBeenCalled();
  });

  it('surfaces a finalise rejection from the server', () => {
    renderForm({
      finaliseError: {
        message: 'Tranche amounts must add up to the total grant amount before finalising',
        fieldErrors: { tranches: 'Short by 100000.00' },
      },
    });
    expect(screen.getByText(/short by 100000.00/i)).toBeInTheDocument();
  });

  it('offers the fund profile prefill only while there are no tranches', () => {
    renderForm({ canPrefill: false });
    expect(screen.queryByRole('button', { name: /copy from fund profile plan/i })).not.toBeInTheDocument();

    renderForm({
      canPrefill: true,
      schedule: { ...SCHEDULE, tranches: [], allocatedAmount: 0, balanced: false },
    });
    expect(screen.getByRole('button', { name: /copy from fund profile plan/i })).toBeInTheDocument();
  });

  it('adds a tranche expanded, with one criterion ready to configure', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /add tranche/i }));

    // The new card opens for editing: three saved-but-collapsed cards would hide it.
    const cards = screen.getAllByText(/^Tranche \d$/);
    expect(cards).toHaveLength(3);
    expect(await screen.findByRole('combobox', { name: /criterion 1/i })).toBeInTheDocument();
  });

  it('marks a met criterion in the tranche summary', () => {
    renderForm();
    const secondCard = screen.getByText('Tranche 2').closest('div');
    expect(within(secondCard).getByText(/donor approval · met/i)).toBeInTheDocument();
  });
});
