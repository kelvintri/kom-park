import { clsx } from "clsx";
import { format, formatDistanceStrict } from "date-fns";

export function cn(...inputs: Array<string | undefined | null | false>) {
  return clsx(inputs);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "-";
  }

  return format(new Date(value), "dd MMM yyyy HH:mm");
}

export function formatDuration(start: string | Date | null | undefined, end: string | Date | null | undefined) {
  if (!start || !end) {
    return "-";
  }

  return formatDistanceStrict(new Date(start), new Date(end));
}

export function buildFileUrl(filePath: string | null | undefined) {
  if (!filePath) {
    return null;
  }

  return `/api/files/${filePath.split("/").map(encodeURIComponent).join("/")}`;
}
