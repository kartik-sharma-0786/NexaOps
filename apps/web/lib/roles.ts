export const INCIDENT_WRITE_ROLES = ["OWNER", "ADMIN", "RESPONDER"] as const;

export function canManageIncidents(role?: string): boolean {
  return INCIDENT_WRITE_ROLES.includes(
    role as (typeof INCIDENT_WRITE_ROLES)[number],
  );
}
