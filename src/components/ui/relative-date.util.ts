const DAY_MS = 24 * 60 * 60 * 1000;

interface FormatRelativeDateOptions {
  now?: Date;
  locale?: string;
  addSuffix?: boolean;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toLargestUnit(
  days: number
): [number, "year" | "month" | "week" | "day"] {
  const absDays = Math.abs(days);

  if (absDays >= 365) return [Math.round(days / 365), "year"];
  if (absDays >= 30) return [Math.round(days / 30), "month"];
  if (absDays >= 7) return [Math.round(days / 7), "week"];
  return [days, "day"];
}

export function formatRelativeDate(
  isoDate: string,
  {
    now = new Date(),
    locale = "en",
    addSuffix = false,
  }: FormatRelativeDateOptions = {}
) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid date: ${isoDate}`);
  }

  const days = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS
  );
  const [value, unit] = toLargestUnit(days);

  if (!addSuffix) {
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: "long",
    }).format(Math.abs(value));
  }

  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    value,
    unit
  );
}
