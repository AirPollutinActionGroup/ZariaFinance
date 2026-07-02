export function formatIndianCurrencyFromLakhs(amountInLakhs) {
  const amount = Number(amountInLakhs || 0) * 100000;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}

export function formatCompactCroreFromLakhs(amountInLakhs) {
  const crore = Number(amountInLakhs || 0) / 100;
  return `₹${crore.toFixed(2)} Cr`;
}

export function formatLakhs(amountInLakhs) {
  const value = Number(amountInLakhs || 0);
  return `₹${value.toFixed(2)} L`;
}

export function formatDateTime(dateTimeValue) {
  if (!dateTimeValue) {
    return "-";
  }

  const date = new Date(dateTimeValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
