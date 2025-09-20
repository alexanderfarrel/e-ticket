export function toIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0, // kalau tidak mau ada ,00
  }).format(value);
}
