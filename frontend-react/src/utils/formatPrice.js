export const formatPrice = (price) => {
  const n = Number(price);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};