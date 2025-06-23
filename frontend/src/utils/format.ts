export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
