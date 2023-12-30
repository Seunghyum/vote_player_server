import { format } from "date-fns";

export function defaultTimeFormat(dateTime: Date) {
  return format(dateTime, "y-M-d-k-m");
}
