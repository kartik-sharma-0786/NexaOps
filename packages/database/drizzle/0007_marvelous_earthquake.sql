CREATE TABLE IF NOT EXISTS "monitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"interval_minutes" integer DEFAULT 5 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"last_checked_at" timestamp,
	"last_response_ms" integer,
	"last_error" text,
	"incident_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monitors" ADD CONSTRAINT "monitors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monitors" ADD CONSTRAINT "monitors_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
