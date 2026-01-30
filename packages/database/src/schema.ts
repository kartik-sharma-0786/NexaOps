import { relations } from "drizzle-orm";
import {
    jsonb,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", [
  "OWNER",
  "ADMIN",
  "RESPONDER",
  "OBSERVER",
  "VIEWER",
]);
export const incidentStatusEnum = pgEnum("incident_status", [
  "OPEN",
  "ACKNOWLEDGED",
  "RESOLVED",
]);
export const incidentSeverityEnum = pgEnum("incident_severity", [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
]);

// 1. Tenants (Companies)
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // e.g. "acme-corp"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(), // Argon2
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Tenant Members (Link between Users and Tenants)
export const tenantMembers = pgTable(
  "tenant_members",
  {
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    role: roleEnum("role").default("VIEWER").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.tenantId, t.userId] }),
  }),
);

// Relations for Tenant Members
export const tenantMembersRelations = relations(tenantMembers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantMembers.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantMembers.userId],
    references: [users.id],
  }),
}));

// Relations for Users
export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(tenantMembers),
  reportedIncidents: many(incidents),
}));

// 3. Incidents
export const incidents = pgTable("incidents", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(), // Tenant Isolation
  title: text("title").notNull(),
  description: text("description"),
  status: incidentStatusEnum("status").default("OPEN").notNull(),
  severity: incidentSeverityEnum("severity").default("LOW").notNull(),
  creatorId: uuid("creator_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for Incidents
export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [incidents.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [incidents.creatorId],
    references: [users.id],
  }),
  events: many(incidentEvents),
}));

// 4. Incident Events (Audit Log / Timeline)
export const incidentEvents = pgTable("incident_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  incidentId: uuid("incident_id")
    .references(() => incidents.id)
    .notNull(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(), // Denormalized for RLS efficiency
  actorId: uuid("actor_id").references(() => users.id),
  actionType: text("action_type").notNull(), // e.g. "STATUS_CHANGE", "COMMENT"
  message: text("message").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const incidentEventsRelations = relations(incidentEvents, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentEvents.incidentId],
    references: [incidents.id],
  }),
  actor: one(users, {
    fields: [incidentEvents.actorId],
    references: [users.id],
  }),
}));
