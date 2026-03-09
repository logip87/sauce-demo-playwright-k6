export const parseCurrency = (value: string): number => Number(value.replace(/[^\d.]/g, ''));
export const roundCurrency = (value: number): number => Math.round(value * 100) / 100;
export const formatCurrency = (value: number): string => value.toFixed(2);
