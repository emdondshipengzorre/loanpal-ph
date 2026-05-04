export function generateGoogleCalendarUrl(params: {
  title: string;
  date: string;
  description?: string;
  recurring?: boolean;
}): string {
  const { title, date, description, recurring } = params;
  const dateFormatted = date.replace(/-/g, "");

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title);
  url.searchParams.set("dates", `${dateFormatted}/${dateFormatted}`);
  if (description) url.searchParams.set("details", description);
  if (recurring) {
    url.searchParams.set("recur", "RRULE:FREQ=MONTHLY");
  }

  return url.toString();
}
