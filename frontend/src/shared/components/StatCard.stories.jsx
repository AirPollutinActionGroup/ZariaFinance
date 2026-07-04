import { StatCard } from './StatCard.jsx';

export default {
  title: 'Shared/StatCard',
  component: StatCard,
};

export const Default = {
  args: { label: 'Total committed', value: '₹3.65 Cr' },
};

export const Highlight = {
  args: {
    label: 'Open commitments',
    value: '₹1.23 Cr',
    hint: 'Approved · Active · On hold',
    highlight: true,
  },
};
