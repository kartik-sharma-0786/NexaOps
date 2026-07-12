import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Clock,
  KeyRound,
  MonitorCheck,
  Rocket,
  ShieldCheck,
  Siren,
  Webhook,
} from "lucide-react";
import Link from "next/link";
import { LandingNavbar } from "../../components/landing/navbar";

export const metadata = {
  title: "Documentation — NexaOps",
  description:
    "Product documentation for NexaOps: incidents, alert ingestion API, escalation policies, on-call, notifications, and roles.",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://nexaops-api-ta1p.onrender.com";

const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: Rocket },
  { id: "incidents", label: "Incidents", icon: Siren },
  { id: "monitors", label: "Uptime Monitors", icon: MonitorCheck },
  { id: "alert-api", label: "Alert Ingestion API", icon: Webhook },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "escalation", label: "Escalation Policies", icon: ArrowUpRight },
  { id: "oncall", label: "On-Call Schedules", icon: Clock },
  { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
  { id: "api-keys", label: "API Keys", icon: KeyRound },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-gray-900 dark:bg-black/60 text-gray-100 rounded-xl p-4 text-[13px] leading-relaxed overflow-x-auto my-4 border border-gray-800">
      <code>{children}</code>
    </pre>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[13px] font-mono text-indigo-700 dark:text-indigo-300">
      {children}
    </code>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold text-gray-900 dark:text-white mt-14 mb-4 scroll-mt-24 first:mt-0"
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-300 mb-4">
      {children}
    </p>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <LandingNavbar />

      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-2">
            <BookOpen className="w-4 h-4" />
            Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            NexaOps Docs
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl">
            Everything you need to run incidents with NexaOps — from your first
            workspace to wiring your monitoring stack into the alert API.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <nav className="sticky top-24 space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                <Icon className="w-4 h-4 shrink-0 text-gray-400" />
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1 max-w-3xl">
          {/* Mobile section pills */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-100 dark:border-gray-800 -mx-4 px-4">
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                {label}
              </a>
            ))}
          </div>

          <H2 id="getting-started">Getting Started</H2>
          <P>
            Create an account at{" "}
            <Link href="/auth/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              /auth/register
            </Link>{" "}
            — this creates your organization (tenant) and makes you its OWNER.
            Everything in NexaOps is scoped to your organization: incidents,
            policies, schedules, and API keys are never visible to other tenants.
          </P>
          <P>
            Next, invite your team from <InlineCode>Dashboard → Team</InlineCode>.
            Each invite generates a single-use link (also emailed) that expires in
            7 days. Invitees pick a password and land directly in your workspace
            with the role you chose.
          </P>

          <H2 id="incidents">Incidents</H2>
          <P>
            An incident has a <strong>severity</strong> (CRITICAL, HIGH, MEDIUM,
            LOW), a <strong>status</strong> (OPEN → ACKNOWLEDGED → RESOLVED), an
            optional assignee, and a timeline. Every status change, assignment,
            comment, and escalation is recorded on the timeline automatically —
            it is your incident&apos;s memory for the post-mortem.
          </P>
          <P>
            <strong>Acknowledge early.</strong> Moving an incident to
            ACKNOWLEDGED tells the team someone owns it — and stops escalation
            timers. The <strong>AI Summary</strong> button on the incident page
            generates a 2–3 sentence recap of the timeline, useful for handoffs
            and stakeholder updates.
          </P>
          <P>
            Once an incident is RESOLVED, a <strong>Post-mortem</strong> button
            appears on its page. It downloads a ready-to-edit Markdown file with
            the severity, time-to-resolve, description, AI summary, the full
            timeline, and an action-items checklist — a head start on your
            review instead of a blank page.
          </P>

          <H2 id="monitors">Uptime Monitors</H2>
          <P>
            <InlineCode>Dashboard → Monitors</InlineCode> watches any HTTP
            endpoint for you. Add a name, a URL, and a check interval (1–60
            minutes). When a check fails (5xx, timeout after 10s, or network
            error), NexaOps <strong>automatically opens a HIGH incident</strong>{" "}
            — which flows through the normal pipeline: chat notifications fire
            and escalation policies apply. When the endpoint recovers, the
            incident <strong>auto-resolves</strong> with the recovery recorded
            on its timeline.
          </P>
          <P>
            Every check is recorded, powering the{" "}
            <strong>response-time sparklines</strong> and 24h/7d uptime
            percentages on the Monitors page, and the{" "}
            <strong>30-day uptime strips</strong> on your public status page.
            History is kept for 30 days. Monitors marked{" "}
            <InlineCode>public</InlineCode> appear on your status page at{" "}
            <InlineCode>/status/&lt;your-slug&gt;</InlineCode> (the exact link
            is shown in Settings → Integrations); the rest stay internal. You
            can pause a monitor any time with its toggle — paused monitors are
            skipped and never open incidents.
          </P>

          <H2 id="alert-api">Alert Ingestion API</H2>
          <P>
            Wire your monitoring stack (Prometheus Alertmanager, Grafana, Datadog,
            cron scripts — anything that can send HTTP) into NexaOps so alerts
            become incidents automatically. First create an API key in{" "}
            <InlineCode>Dashboard → Settings → Integrations</InlineCode>, then:
          </P>
          <Code>{`curl -X POST ${API_URL}/alerts/ingest \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "title": "Database CPU above 95% for 5 minutes",
    "description": "Prometheus alert: instance db-1",
    "severity": "HIGH"
  }'`}</Code>
          <P>
            <strong>Fields:</strong> <InlineCode>title</InlineCode> (required, max
            300 chars), <InlineCode>description</InlineCode> (optional, max 5000),{" "}
            <InlineCode>severity</InlineCode> (optional — CRITICAL, HIGH, MEDIUM or
            LOW; defaults to MEDIUM). The response returns the created
            incident&apos;s <InlineCode>id</InlineCode> and{" "}
            <InlineCode>status</InlineCode>. The incident behaves exactly like one
            created by hand: chat notifications fire, and escalation policies
            apply.
          </P>

          <H2 id="notifications">Notifications</H2>
          <P>
            The <strong>bell icon</strong> (sidebar on desktop, top bar on
            mobile) shows incident activity live — created, updated, escalated —
            with an unread badge. Clicking a notification jumps straight to the
            incident. No configuration needed; it works over the same realtime
            connection that keeps the incident list fresh.
          </P>
          <P>
            Connect Slack and/or Discord in{" "}
            <InlineCode>Dashboard → Settings → Integrations</InlineCode> by pasting
            an incoming-webhook URL (must be on{" "}
            <InlineCode>hooks.slack.com</InlineCode> or{" "}
            <InlineCode>discord.com</InlineCode>). NexaOps posts a message when an
            incident is <strong>created</strong>, its{" "}
            <strong>status changes</strong>, it is <strong>assigned</strong>, or it{" "}
            <strong>escalates</strong>.
          </P>
          <P>
            Email notifications go to the incident creator on creation, all
            notifiable members on status changes, the assignee on assignment, and
            the escalation target role on escalation. Chat and email failures
            never block incident operations — they are fire-and-forget with
            logging.
          </P>

          <H2 id="escalation">Escalation Policies</H2>
          <P>
            A policy says: <em>“if a {`{severity}`} incident stays OPEN
            (unacknowledged) for {`{N}`} minutes, notify everyone at or above{" "}
            {`{role}`}.”</em> Configure them in{" "}
            <InlineCode>Dashboard → Settings → Escalation Policies</InlineCode>{" "}
            with a delay from 1 to 1440 minutes.
          </P>
          <P>
            The escalation engine sweeps every minute. When a policy fires, the
            incident gets an <InlineCode>ESCALATED</InlineCode> event on its
            timeline, the target role is emailed, and your chat channels are
            notified. Each incident escalates <strong>at most once</strong> —
            acknowledging it before the delay elapses prevents escalation
            entirely.
          </P>

          <H2 id="oncall">On-Call Schedules</H2>
          <P>
            Build a rotation in <InlineCode>Dashboard → On-Call</InlineCode>:
            order your responders, set a shift length in days, and pick a start
            date. NexaOps computes who is on call right now from the rotation.
            Temporary <strong>overrides</strong> (vacations, swaps) take
            precedence over the rotation for their time window and can be added
            or removed in seconds.
          </P>

          <H2 id="roles">Roles &amp; Permissions</H2>
          <P>Five roles, in descending privilege:</P>
          <div className="overflow-x-auto my-4">
            <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                <tr>
                  <th className="px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-200">Role</th>
                  <th className="px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-200">Can do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                <tr><td className="px-4 py-2.5 font-medium">OWNER</td><td className="px-4 py-2.5">Everything — including promoting/demoting owners and billing. A tenant always keeps at least one owner.</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">ADMIN</td><td className="px-4 py-2.5">Manage incidents, team, invitations, integrations, policies, and on-call.</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">RESPONDER</td><td className="px-4 py-2.5">Create, acknowledge, assign, comment on, and resolve incidents.</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">OBSERVER</td><td className="px-4 py-2.5">Read-only access to incidents and analytics.</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">VIEWER</td><td className="px-4 py-2.5">Read-only access, typically for stakeholders.</td></tr>
              </tbody>
            </table>
          </div>

          <H2 id="api-keys">API Keys</H2>
          <P>
            API keys authenticate the alert ingestion endpoint. Create and revoke
            them in <InlineCode>Dashboard → Settings → Integrations</InlineCode>.
            Keys are shown <strong>once</strong> at creation and stored hashed —
            treat them like passwords. Revoking a key immediately stops alerts
            sent with it.
          </P>

          {/* Footer CTA */}
          <div className="mt-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Looking for guides instead?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Best practices for incident management, on-call health, SLOs and
              more live in Resources.
            </p>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Resources
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
