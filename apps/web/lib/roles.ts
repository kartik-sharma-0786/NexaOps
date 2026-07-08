export const INCIDENT_WRITE_ROLES = ["OWNER", "ADMIN", "RESPONDER"] as const;
export const TEAM_MANAGE_ROLES = ["OWNER", "ADMIN"] as const;

export function canManageIncidents(role?: string): boolean {
  return INCIDENT_WRITE_ROLES.includes(
    role as (typeof INCIDENT_WRITE_ROLES)[number],
  );
}

export function canManageTeam(role?: string): boolean {
  return TEAM_MANAGE_ROLES.includes(
    role as (typeof TEAM_MANAGE_ROLES)[number],
  );
}
