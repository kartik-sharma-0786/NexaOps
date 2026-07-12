import { relations } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
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
export const planEnum = pgEnum("plan", ["FREE", "PRO"]);

// 1. Tenants (Companies)
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // e.g. "acme-corp"
  plan: planEnum("plan").default("FREE").notNull(),
  // Column names predate the Razorpay switch; kept as-is to avoid a
  // migration since these were never populated (Stripe checkout never
  // went live).
  razorpayCustomerId: text("stripe_customer_id"),
  razorpaySubscriptionId: text("stripe_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end"),
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
  reportedIncidents: many(incidents, { relationName: "incidentCreator" }),
  assignedIncidents: many(incidents, { relationName: "incidentAssignee" }),
}));

// Per-tenant API keys for alert ingestion (hashed at rest)
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  name: text("name").default("Default").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

// Per-tenant chat integrations (Slack / Discord incoming webhooks)
export const tenantIntegrations = pgTable("tenant_integrations", {
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .primaryKey(),
  slackWebhookUrl: text("slack_webhook_url"),
  discordWebhookUrl: text("discord_webhook_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Team invitations (single-use, hashed at rest)
export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  email: text("email").notNull(),
  role: roleEnum("role").default("RESPONDER").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  invitedById: uuid("invited_by_id").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invitationsRelations = relations(invitations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [invitations.tenantId],
    references: [tenants.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedById],
    references: [users.id],
  }),
}));

// Password reset tokens (single-use, hashed at rest)
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  assigneeId: uuid("assignee_id").references(() => users.id),
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
    relationName: "incidentCreator",
  }),
  assignee: one(users, {
    fields: [incidents.assigneeId],
    references: [users.id],
    relationName: "incidentAssignee",
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

// Escalation policies — notify higher-priority roles when an incident is not
// acknowledged within delayMinutes of being created.
export const escalationPolicies = pgTable("escalation_policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  name: text("name").default("Default").notNull(),
  // Minimum severity that triggers this policy (CRITICAL / HIGH / MEDIUM / LOW)
  severity: text("severity").default("CRITICAL").notNull(),
  delayMinutes: integer("delay_minutes").default(15).notNull(),
  // Role to notify (OWNER / ADMIN / RESPONDER …)
  notifyRole: text("notify_role").default("OWNER").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// On-call schedules — one active schedule per tenant (simple rotation MVP).
export const onCallSchedules = pgTable("on_call_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull()
    .unique(), // one schedule per tenant for now
  name: text("name").default("Primary").notNull(),
  // Ordered list of userIds in rotation (JSONB array of UUID strings)
  memberOrder: jsonb("member_order").$type<string[]>().default([]).notNull(),
  // How many days each person is on-call before rotating
  shiftDays: integer("shift_days").default(7).notNull(),
  // Anchor date for computing whose turn it is
  startDate: timestamp("start_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Manual overrides — "I'm out Wed–Thu, swap me with Alice"
export const onCallOverrides = pgTable("on_call_overrides", {
  id: uuid("id").defaultRandom().primaryKey(),
  scheduleId: uuid("schedule_id")
    .references(() => onCallSchedules.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const onCallSchedulesRelations = relations(
  onCallSchedules,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [onCallSchedules.tenantId],
      references: [tenants.id],
    }),
    overrides: many(onCallOverrides),
  }),
);

export const onCallOverridesRelations = relations(
  onCallOverrides,
  ({ one }) => ({
    schedule: one(onCallSchedules, {
      fields: [onCallOverrides.scheduleId],
      references: [onCallSchedules.id],
    }),
    user: one(users, {
      fields: [onCallOverrides.userId],
      references: [users.id],
    }),
  }),
);

// Uptime monitors — cron-checked URLs that auto-create/resolve incidents.
export const monitors = pgTable("monitors", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  intervalMinutes: integer("interval_minutes").default(5).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  // Shown on the tenant's public status page when true.
  isPublic: boolean("is_public").default(true).notNull(),
  // Runtime state maintained by the checker.
  status: text("status").default("PENDING").notNull(), // UP | DOWN | PENDING
  lastCheckedAt: timestamp("last_checked_at"),
  lastResponseMs: integer("last_response_ms"),
  lastError: text("last_error"),
  // Open auto-created incident, cleared when the monitor recovers.
  incidentId: uuid("incident_id").references(() => incidents.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual check results for uptime history (pruned after 30 days).
export const monitorChecks = pgTable(
  "monitor_checks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    monitorId: uuid("monitor_id")
      .references(() => monitors.id, { onDelete: "cascade" })
      .notNull(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    up: boolean("up").notNull(),
    responseMs: integer("response_ms"),
    checkedAt: timestamp("checked_at").defaultNow().notNull(),
  },
  (t) => ({
    monitorTimeIdx: index("monitor_checks_monitor_time_idx").on(
      t.monitorId,
      t.checkedAt,
    ),
  }),
);
