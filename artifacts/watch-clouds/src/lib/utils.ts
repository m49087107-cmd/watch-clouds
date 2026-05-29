import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function getPosterUrl(path: string | null | undefined, size = "w500"): string {
  if (!path) return "/placeholder-poster.png";
  if (path.startsWith("http")) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null | undefined, size = "w1280"): string {
  if (!path) return "/placeholder-backdrop.png";
  if (path.startsWith("http")) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
