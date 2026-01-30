import { relations } from "drizzle-orm";
import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["ADMIN", "RESPONDER", "VIEWER"]);
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
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  email: text("email").notNull(), // Unique per tenant usually, but let's keep simple unique globally for start
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(), // Will use Argon2
  role: roleEnum("role").default("VIEWER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for Users
export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
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
  actorId: uuid("actor_id").references(() => users.id), // Who did it
  message: text("message").notNull(),
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
