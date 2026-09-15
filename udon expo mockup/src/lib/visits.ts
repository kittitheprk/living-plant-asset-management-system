/**
 * Local visit log: every plant scan records viewer + plant + zone.
 * Stored on-device now; ready to sync to a backend later.
 */
export type Visit = {
  id: string;
  visitorId: string;
  plantId: string;
  zoneId: string;
  at: string;
};

const KEY = "udon2026.visits";
const VISITOR_KEY = "udon2026.visitor";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `v_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function readVisits(): Visit[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Visit[];
  } catch {
    return [];
  }
}

export function logVisit(plantId: string, zoneId: string): Visit {
  const visit: Visit = {
    id: `s_${Date.now()}`,
    visitorId: getVisitorId(),
    plantId,
    zoneId,
    at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify([visit, ...readVisits()].slice(0, 100)));
    window.dispatchEvent(new CustomEvent("udon2026:visit", { detail: visit }));
  }
  return visit;
}

/** Zone of the most recent scan = "where the visitor is now". */
export function currentZoneId(): string | null {
  return readVisits()[0]?.zoneId ?? null;
}
