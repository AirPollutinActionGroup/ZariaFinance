export const onboardingSteps = [
  {
    title: 'Welcome to Zariya! 👋',
    description: 'We are excited to have you on board. Let’s take a brief 1-minute walkthrough to explain the core panels and how you can utilise them to manage budget, actuals, and reporting.',
    target: null,
    placement: 'center',
  },
  {
    title: 'Navigation Rail',
    description: 'This sidebar is your main navigation rail. You can easily access the Dashboard, the Donors Registry, active Grant Agreements, and track individual Donations. Navigation is permissions-based to keep views clean.',
    target: '#tour-sidenav',
    placement: 'right',
  },
  {
    title: 'Financial Health KPIs',
    description: 'These summary cards display live financial positions. "Funding committed" shows the outstanding pipeline (receivables yet to be received), and "Available" shows your unspent, active funds.',
    target: '#tour-kpis',
    placement: 'bottom',
  },
  {
    title: 'The Funding Chain',
    description: 'The Funding Chain visualises the flow of money: starting from committed grants, moving to actual receipts (received), then to program allocations (utilised), showing the available balance.',
    target: '#tour-funding-chain',
    placement: 'bottom',
  },
  {
    title: 'Recent Grant Agreements',
    description: 'A summary list of recently signed grant agreements. You can click on any row in the list to drill down into agreement details, schedules, and active disbursements.',
    target: '#tour-recent-grants',
    placement: 'top',
  },
  {
    title: 'Workspace & Profile Controls',
    description: 'Here you can toggle between light and dark modes, view alert notifications, check your active permission role, or sign out. You can also click the new "Help" icon here to replay this tour at any time!',
    target: '#tour-topbar',
    placement: 'bottom',
  },
];
