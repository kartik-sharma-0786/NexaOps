"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentEventsRelations = exports.incidentEvents = exports.incidentsRelations = exports.incidents = exports.usersRelations = exports.users = exports.tenants = exports.incidentSeverityEnum = exports.incidentStatusEnum = exports.roleEnum = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var pg_core_1 = require("drizzle-orm/pg-core");
// Enums
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["ADMIN", "RESPONDER", "VIEWER"]);
exports.incidentStatusEnum = (0, pg_core_1.pgEnum)("incident_status", [
    "OPEN",
    "ACKNOWLEDGED",
    "RESOLVED",
]);
exports.incidentSeverityEnum = (0, pg_core_1.pgEnum)("incident_severity", [
    "CRITICAL",
    "HIGH",
    "MEDIUM",
    "LOW",
]);
// 1. Tenants (Companies)
exports.tenants = (0, pg_core_1.pgTable)("tenants", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    slug: (0, pg_core_1.text)("slug").notNull().unique(), // e.g. "acme-corp"
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// 2. Users
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id")
        .references(function () { return exports.tenants.id; })
        .notNull(),
    email: (0, pg_core_1.text)("email").notNull(), // Unique per tenant usually, but let's keep simple unique globally for start
    name: (0, pg_core_1.text)("name").notNull(),
    passwordHash: (0, pg_core_1.text)("password_hash").notNull(), // Will use Argon2
    role: (0, exports.roleEnum)("role").default("VIEWER").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Relations for Users
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        tenant: one(exports.tenants, {
            fields: [exports.users.tenantId],
            references: [exports.tenants.id],
        }),
        reportedIncidents: many(exports.incidents),
    });
});
// 3. Incidents
exports.incidents = (0, pg_core_1.pgTable)("incidents", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id")
        .references(function () { return exports.tenants.id; })
        .notNull(), // Tenant Isolation
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    status: (0, exports.incidentStatusEnum)("status").default("OPEN").notNull(),
    severity: (0, exports.incidentSeverityEnum)("severity").default("LOW").notNull(),
    creatorId: (0, pg_core_1.uuid)("creator_id").references(function () { return exports.users.id; }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Relations for Incidents
exports.incidentsRelations = (0, drizzle_orm_1.relations)(exports.incidents, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        tenant: one(exports.tenants, {
            fields: [exports.incidents.tenantId],
            references: [exports.tenants.id],
        }),
        creator: one(exports.users, {
            fields: [exports.incidents.creatorId],
            references: [exports.users.id],
        }),
        events: many(exports.incidentEvents),
    });
});
// 4. Incident Events (Audit Log / Timeline)
exports.incidentEvents = (0, pg_core_1.pgTable)("incident_events", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    incidentId: (0, pg_core_1.uuid)("incident_id")
        .references(function () { return exports.incidents.id; })
        .notNull(),
    actorId: (0, pg_core_1.uuid)("actor_id").references(function () { return exports.users.id; }), // Who did it
    message: (0, pg_core_1.text)("message").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.incidentEventsRelations = (0, drizzle_orm_1.relations)(exports.incidentEvents, function (_a) {
    var one = _a.one;
    return ({
        incident: one(exports.incidents, {
            fields: [exports.incidentEvents.incidentId],
            references: [exports.incidents.id],
        }),
        actor: one(exports.users, {
            fields: [exports.incidentEvents.actorId],
            references: [exports.users.id],
        }),
    });
});
