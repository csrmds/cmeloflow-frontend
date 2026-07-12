import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatDate(value: string | null) {
	if (!value) return "—";
	try {
		return new Intl.DateTimeFormat("pt-BR", {
			dateStyle: "short",
			timeStyle: "short",
		}).format(new Date(value));
	} catch {
		return value;
	}
}

export function toLocalISOString(date: string, time: string) {
	const d = new Date(`${date}T${time}:00`);
	const offsetMin = -d.getTimezoneOffset();
	const sign = offsetMin >= 0 ? "+" : "-";
	const abs = Math.abs(offsetMin);
	const hh = String(Math.floor(abs / 60)).padStart(2, "0");
	const mm = String(abs % 60).padStart(2, "0");
	return `${date}T${time}:00${sign}${hh}:${mm}`;
}