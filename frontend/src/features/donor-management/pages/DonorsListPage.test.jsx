import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../core/auth/AuthContext.jsx';
import { USER_STATUS, ROLES } from '../../../core/permissions/permissions.js';
import { DonorsListPage } from './DonorsListPage.jsx';
import { donorService } from '../services/donorService.js';

vi.mock('../services/donorService.js', () => ({
  donorService: { listDonors: vi.fn() },
}));

function renderPage(user) {
  window.sessionStorage.setItem('zariya.session.v1', JSON.stringify(user));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <DonorsListPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('DonorsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it('renders donors with status, fund-source and fund-class (A/B/C) chips', async () => {
    donorService.listDonors.mockResolvedValue([
      {
        id: 1,
        donorCode: 'DNR-001',
        donorName: 'Tata Foundation',
        donorType: 'Foundation',
        fundClassCodes: ['A', 'C'],
        fundSourceDomicile: 'Domestic',
        status: 'ACTIVE',
        statusLabel: 'Active',
        totalCommitted: 12000000,
        commitmentBreakdown: [
          { fundMode: 'Restricted', committed: 8000000, fundProfileCount: 1 },
          { fundMode: 'Unrestricted', committed: 4000000, fundProfileCount: 1 },
        ],
      },
    ]);
    renderPage({ name: 'T', role: ROLES.FINANCE_OFFICER, status: USER_STATUS.APPROVED });

    expect(await screen.findByText('Tata Foundation')).toBeInTheDocument();
    // Fund source (Domestic/Foreign) is now its own column.
    expect(screen.getByText('Domestic')).toBeInTheDocument();
    // Fund class shows the donor's restriction classes as A/B/C chips.
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    // Finance officer holds EDIT → the create action is visible.
    expect(screen.getByRole('button', { name: /new donor/i })).toBeInTheDocument();
  });

  it('hides the create action from view-only roles (CEO)', async () => {
    donorService.listDonors.mockResolvedValue([]);
    renderPage({ name: 'C', role: ROLES.CEO, status: USER_STATUS.APPROVED });

    expect(await screen.findByText(/no donors registered/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new donor/i })).not.toBeInTheDocument();
  });
});
