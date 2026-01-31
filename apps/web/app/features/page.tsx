"use client";

import {
    BellRing,
    Clock3,
    ShieldCheck,
    Sparkles,
    Workflow,
} from "lucide-react";
import Link from "next/link";

const highlights = [
  {
    icon: <BellRing className="w-6 h-6 text-amber-500" />,
    title: "Smart alerting",
    copy: "Route incidents by service ownership, severity, and on-call schedules with throttling to avoid alert storms.",
  },
  {
    icon: <Workflow className="w-6 h-6 text-indigo-500" />,
    title: "Automated runbooks",
    copy: "Trigger repeatable workflows that open war rooms, post to Slack, and attach diagnostics in seconds.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    title: "Role-based control",
    copy: "Granular roles for admins, responders, and viewers keep sensitive actions protected.",
  },
  {
    icon: <Clock3 className="w-6 h-6 text-blue-500" />,
    title: "MTTR insights",
    copy: "Out-of-the-box dashboards for MTTA, MTTR, and incident burndown to spot trends early.",
  },
];

const deepDives = [
  {
    title: "Incident timeline",
    points: [
      "Auto-capture events from chat, alerts, and status updates",
      "One-click export for post-mortems",
      "Searchable context for handoffs",
    ],
  },
  {
    title: "On-call & paging",
    points: [
      "Rotations with follow-the-sun coverage",
      "Escalation policies with fallback channels",
      "Quiet hours and overrides for special cases",
    ],
  },
  {
    title: "Collaboration",
    points: [
      "Slack-first experience with synced status",
      "Zoom/Meet bridges created automatically",
      "Announcements for execs and customers",
    ],
  },
  {
    title: "Reliability guardrails",
    points: [
      "SLOs with error budget alerts",
      "Service catalog with ownership",
      "Release checks against active incidents",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              N
            </div>
            <span className="text-lg font-semibold text-gray-900">NexaOps</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              Open dashboard
            </Link>
            <Link
              href="/auth/login"
              className="text-gray-700 hover:text-indigo-600 font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
                <Sparkles className="w-4 h-4" /> Built for incident teams
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Everything you need to respond, learn, and prevent repeats.
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                NexaOps unifies alerting, collaboration, and post-incident
                analysis so your team ships fast without sacrificing
                reliability.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Try the dashboard
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex items-center px-6 py-3 border border-indigo-200 text-indigo-700 rounded-lg font-semibold hover:border-indigo-400 transition"
                >
                  Explore resources
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
              <h2 className="text-3xl font-bold text-gray-900">
                How teams use NexaOps
              </h2>
              <p className="text-gray-600 max-w-2xl">
                From the first page to the post-mortem, NexaOps stitches
                together your incident lifecycle with opinionated defaults and
                flexible automation.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {deepDives.map((block) => (
                <div
                  key={block.title}
                  className="p-6 rounded-2xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
                      {block.title.split(" ")[0]}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {block.title}
                    </h3>
                  </div>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    {block.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-[6px] h-2 w-2 rounded-full bg-indigo-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
            {["SREs", "Platform", "Security"].map((team) => (
              <div
                key={team}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <p className="text-sm uppercase tracking-wide text-slate-300 mb-2">
                  Built for {team}
                </p>
                <h3 className="text-xl font-semibold mb-3">
                  Resilient {team} teams
                </h3>
                <p className="text-slate-200 text-sm leading-relaxed">
                  Pair on-call, automation, and learning loops so{" "}
                  {team.toLowerCase()} can keep customers happy and engineers
                  unblocked.
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition"
            >
              See it in action
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
