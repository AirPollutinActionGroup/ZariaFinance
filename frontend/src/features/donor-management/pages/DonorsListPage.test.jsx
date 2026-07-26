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

  it('renders donors from the service with fund source chips', async () => {
    donorService.listDonors.mockResolvedValue([
      {
        id: 1,
        donorCode: 'DNR-001',
        donorName: 'Tata Foundation',
        donorType: 'FOUNDATION',
        donorTypeLabel: 'Foundation',
        fundSourceDomicile: 'DOMESTIC',
        fundSourceDomicileLabel: 'Domestic',
        isActive: true,
        email: 'grants@tata.org',
      },
    ]);
    renderPage({ name: 'T', role: ROLES.FINANCE_OFFICER, status: USER_STATUS.APPROVED });

    expect(await screen.findByText('Tata Foundation')).toBeInTheDocument();
    expect(screen.getByText('Domestic')).toBeInTheDocument();
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
