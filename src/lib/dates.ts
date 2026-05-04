export function formatPHP(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  const lastDigit = day % 10;
  if (lastDigit === 1) return `${day}st`;
  if (lastDigit === 2) return `${day}nd`;
  if (lastDigit === 3) return `${day}rd`;
  return `${day}th`;
}

export function getNextDueDate(dueDay: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInThisMonth = new Date(year, month + 1, 0).getDate();
  const clampedDay = Math.min(dueDay, daysInThisMonth);
  const thisMonth = new Date(year, month, clampedDay);

  if (thisMonth > now) {
    return thisMonth.toISOString().split("T")[0];
  }

  const nextMonth = month + 1;
  const nextYear = nextMonth > 11 ? year + 1 : year;
  const nextM = nextMonth > 11 ? 0 : nextMonth;
  const daysInNextMonth = new Date(nextYear, nextM + 1, 0).getDate();
  const clampedNext = Math.min(dueDay, daysInNextMonth);
  return new Date(nextYear, nextM, clampedNext).toISOString().split("T")[0];
}

export function getDaysUntilDue(dueDay: number): number {
  const nextDue = new Date(getNextDueDate(dueDay) + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysUntilDate(dateStr: string): number {
  const due = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
