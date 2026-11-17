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

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Centavos (inteiro) -> "R$ 1.234,56" */
export function formatCents(cents: number | string | null | undefined) {
	if (cents === null || cents === undefined || cents === "") return "—";
	return brl.format(Number(cents) / 100);
}

/** "12,50" | "12.50" | "12" -> 1250 (centavos). Retorna null se vazio ou inválido. */
export function reaisToCents(value: string | number): number | null {
	if (typeof value === "number") {
		return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
	}
	const trimmed = value.trim();
	if (trimmed === "") return null;
	const n = Number(trimmed.replace(",", "."));
	return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

/** 1250 -> "12,50" (para preencher inputs) */
export function centsToReais(cents: number): string {
	return (cents / 100).toFixed(2).replace(".", ",");
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