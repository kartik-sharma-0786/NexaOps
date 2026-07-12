export type ResourceSection =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "quote"; text: string };

export type ResourceArticle = {
  slug: string;
  key: string; // matches t.resources.items key for the listing card
  type: "Guide" | "Article" | "Webinar";
  title: string;
  description: string;
  readTime: string;
  gradient: string;
  sections: ResourceSection[];
};

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  {
    slug: "incident-management-guide",
    key: "guideIncidentManagement",
    type: "Guide",
    title: "The Ultimate Guide to Incident Management",
    description:
      "Everything you need to know about setting up an incident response process from scratch.",
    readTime: "12 min read",
    gradient: "from-indigo-600 to-violet-600",
    sections: [
      {
        kind: "p",
        text: "Every minute of downtime costs money, trust, and momentum. Yet most teams don't design their incident response process — it just accumulates, one outage at a time. This guide walks through building an incident management practice deliberately, from first principles.",
      },
      { kind: "h2", text: "What counts as an incident?" },
      {
        kind: "p",
        text: "An incident is any unplanned event that degrades — or threatens to degrade — the service your users depend on. The key word is unplanned. A slow deploy is not an incident; a deploy that takes checkout down is. Write your own definition down and make it boring: if engineers have to debate whether something is an incident, they will hesitate to declare one, and hesitation is where minutes are lost.",
      },
      { kind: "h2", text: "Severity levels that people actually use" },
      {
        kind: "p",
        text: "Four levels is the sweet spot. More than that and nobody remembers the difference; fewer and everything becomes an emergency.",
      },
      {
        kind: "list",
        items: [
          "CRITICAL — the product is down or unusable for most users. All hands, immediate escalation, status page update within 15 minutes.",
          "HIGH — a core feature is broken or badly degraded. On-call responds now; escalates if not mitigated within an hour.",
          "MEDIUM — a non-core feature is broken, or a core feature is degraded for a small slice of users. Handled during working hours.",
          "LOW — cosmetic issues, slow queries, flaky alerts. Tracked, batched, and fixed in normal sprint work.",
        ],
      },
      { kind: "h2", text: "The lifecycle: detect, respond, resolve, learn" },
      {
        kind: "p",
        text: "Detection should be automatic wherever possible — alerts wired to your monitoring, not a customer tweet. Response starts with acknowledgement: someone owns the incident, visibly. Resolution is mitigation first, root cause later; your job during an incident is to stop the bleeding, not to write the perfect fix. Learning happens in the post-mortem, and it is the only step that makes the next incident shorter.",
      },
      { kind: "h2", text: "Roles: who does what" },
      {
        kind: "list",
        items: [
          "Incident Commander — runs the response, makes decisions, keeps the timeline. Not necessarily the most senior engineer; the calmest one.",
          "Responders — hands on keyboards, investigating and mitigating.",
          "Communicator — updates stakeholders and the status page so responders don't have to context-switch.",
        ],
      },
      {
        kind: "quote",
        text: "The best incident response looks boring from the outside. Everyone knows their job, updates land on schedule, and nobody is guessing who's in charge.",
      },
      { kind: "h2", text: "Timelines are your memory" },
      {
        kind: "p",
        text: "During a serious incident nobody remembers what happened at minute 12. Record every action — status changes, hypotheses, commands run — in one place as it happens. Tools like NexaOps keep this timeline automatically as responders acknowledge, comment, and resolve, which turns the post-mortem from archaeology into review.",
      },
      { kind: "h2", text: "Start smaller than you think" },
      {
        kind: "p",
        text: "You do not need a 40-page runbook to start. You need: a severity scale, one on-call rotation, a place incidents are declared, and a habit of writing two-paragraph post-mortems. Ship that this week; refine it every incident after.",
      },
    ],
  },
  {
    slug: "resilient-systems-at-scale",
    key: "webinarResilientSystems",
    type: "Webinar",
    title: "Building Resilient Systems at Scale",
    description:
      "Learn from SREs at Netflix and Google about how they design for failure.",
    readTime: "9 min read",
    gradient: "from-violet-600 to-fuchsia-600",
    sections: [
      {
        kind: "p",
        text: "The biggest mindset shift in modern reliability engineering: stop trying to prevent failure and start designing for it. Hardware dies, networks partition, dependencies rot. Resilient systems assume all of this and degrade gracefully instead of collapsing.",
      },
      { kind: "h2", text: "Failure is the default state" },
      {
        kind: "p",
        text: "At sufficient scale, something is always broken. A fleet of 10,000 machines with 99.9% per-node reliability has ten nodes down at any moment. The question is never whether components fail — it is whether users notice.",
      },
      { kind: "h2", text: "Patterns that survive contact with production" },
      {
        kind: "list",
        items: [
          "Timeouts everywhere — an unbounded wait is an outage waiting to propagate. Every network call gets a deadline.",
          "Circuit breakers — when a dependency is failing, stop hammering it. Fail fast, serve degraded, recover automatically.",
          "Bulkheads — isolate resource pools so one misbehaving feature can't starve the rest of the service.",
          "Retries with jitter — retry storms take down more systems than the original fault. Back off exponentially, add randomness.",
          "Graceful degradation — a product page without recommendations beats an error page. Decide in advance what you can drop.",
        ],
      },
      { kind: "h2", text: "Test the failure paths, not just the happy ones" },
      {
        kind: "p",
        text: "Chaos engineering sounds dramatic but starts small: kill one instance in staging and watch what happens. Does traffic reroute? Do alerts fire? Does the on-call engineer get paged? Every failure path you exercise on purpose is one that won't surprise you at 3 a.m.",
      },
      {
        kind: "quote",
        text: "Hope is not a strategy. If you haven't tested the failover, you don't have a failover — you have a wish.",
      },
      { kind: "h2", text: "Observability closes the loop" },
      {
        kind: "p",
        text: "Resilience without observability is luck. You need to know not just that the system is up, but how close to the edge it is running: saturation, error budgets, tail latency. Wire those signals into your incident platform so a degrading trend becomes a MEDIUM incident today instead of a CRITICAL one on Friday night.",
      },
    ],
  },
  {
    slug: "post-mortem-best-practices",
    key: "articlePostMortem",
    type: "Article",
    title: "Post-Mortem Best Practices",
    description:
      "How to conduct blameless post-mortems that actually lead to system improvements.",
    readTime: "8 min read",
    gradient: "from-emerald-600 to-teal-600",
    sections: [
      {
        kind: "p",
        text: "A post-mortem is not paperwork — it is the mechanism by which an organization converts downtime into knowledge. Done badly, it becomes a blame ritual that teaches engineers to hide mistakes. Done well, it is the highest-leverage hour your team spends all week.",
      },
      { kind: "h2", text: "Blameless means systems, not feelings" },
      {
        kind: "p",
        text: "Blamelessness is often misunderstood as being gentle. It is actually about accuracy: if an engineer could take the system down with one wrong command, the system was one wrong command away from an outage. The engineer is not the root cause — the missing guardrail is. Ask 'what allowed this?' instead of 'who did this?'.",
      },
      { kind: "h2", text: "The anatomy of a useful post-mortem" },
      {
        kind: "list",
        items: [
          "Timeline — what happened, minute by minute, from first alert to resolution. Pull it from your incident tool, don't reconstruct from memory.",
          "Impact — who was affected, for how long, and how badly. Numbers, not adjectives.",
          "Root cause(s) — keep asking why until you reach a process or design decision, not a person.",
          "What went well — detection that worked, runbooks that helped. Reinforce it.",
          "Action items — each with an owner and a deadline, tracked like any other engineering work.",
        ],
      },
      { kind: "h2", text: "The five whys, used honestly" },
      {
        kind: "p",
        text: "'The database ran out of connections.' Why? 'A deploy doubled connection usage.' Why did that ship? 'No load test covers connection pooling.' Why not? 'Load tests only run against the read path.' — three whys in, you've moved from an incident to a systemic gap worth fixing.",
      },
      {
        kind: "quote",
        text: "If your action items list contains 'be more careful', you haven't found the root cause yet.",
      },
      { kind: "h2", text: "Make them cheap, make them habitual" },
      {
        kind: "p",
        text: "Reserve heavyweight reviews for CRITICAL incidents. For everything else, a two-paragraph write-up attached to the incident record is enough. The goal is a searchable institutional memory: six months from now, the engineer staring at a familiar error should be able to find how it was fixed last time.",
      },
    ],
  },
  {
    slug: "oncall-health",
    key: "guideOnCallHealth",
    type: "Guide",
    title: "On-Call Health: Sustainable Rotations",
    description:
      "How to build on-call schedules that don't burn out your team.",
    readTime: "10 min read",
    gradient: "from-blue-600 to-cyan-600",
    sections: [
      {
        kind: "p",
        text: "On-call is where reliability meets human beings. A rotation that looks fine on a spreadsheet can quietly destroy sleep, morale, and eventually retention. Healthy on-call is a design problem, and it is solvable.",
      },
      { kind: "h2", text: "The math of a humane rotation" },
      {
        kind: "list",
        items: [
          "Minimum four people per rotation — below that, everyone is on-call one week in three, which is not sustainable.",
          "One week shifts beat one day shifts — context accumulates; handing off daily loses it.",
          "Always have a secondary — a single point of human failure is still a single point of failure.",
          "Overrides must be first-class — vacations, sick days, and emergencies happen. Swapping shifts should take seconds, not negotiation.",
        ],
      },
      { kind: "h2", text: "Page quality is everything" },
      {
        kind: "p",
        text: "The fastest way to burn out an on-call engineer is a pager that cries wolf. Every page should be urgent, actionable, and real. Track your signal-to-noise ratio: if more than a quarter of pages end with 'no action needed', your alerting needs work more than your people do.",
      },
      {
        kind: "quote",
        text: "An alert that can wait until morning is a ticket, not a page.",
      },
      { kind: "h2", text: "Escalation policies remove guesswork" },
      {
        kind: "p",
        text: "When a CRITICAL incident is not acknowledged in fifteen minutes, something should happen automatically — the secondary gets paged, then the manager. Escalation policies aren't about distrust; they protect the primary responder. Missing one page shouldn't mean an outage runs unattended for an hour.",
      },
      { kind: "h2", text: "Measure the human cost" },
      {
        kind: "p",
        text: "Review on-call load quarterly like you review error budgets: pages per shift, pages outside working hours, time to acknowledge. If one service generates half your pages, that service owes your team engineering time. If one person absorbs the worst shifts repeatedly, fix the rotation before they fix it by leaving.",
      },
    ],
  },
  {
    slug: "slo-fundamentals",
    key: "articleSLO",
    type: "Article",
    title: "SLOs, SLIs and Error Budgets, Explained",
    description:
      "A practical introduction to service level objectives without the jargon.",
    readTime: "7 min read",
    gradient: "from-amber-500 to-orange-600",
    sections: [
      {
        kind: "p",
        text: "Teams argue endlessly about how reliable a service should be. SLOs end the argument with a number — and error budgets turn that number into day-to-day engineering decisions.",
      },
      { kind: "h2", text: "Three terms, one idea" },
      {
        kind: "list",
        items: [
          "SLI (indicator) — a measurement. 'The fraction of requests served successfully in under 300ms.'",
          "SLO (objective) — a target for that measurement. '99.9% of requests over 30 days.'",
          "Error budget — the inverse of the SLO. 99.9% means 0.1% of requests are allowed to fail: that is budget you can spend.",
        ],
      },
      { kind: "h2", text: "Why 100% is the wrong target" },
      {
        kind: "p",
        text: "Users cannot tell the difference between 99.99% and 100% — their wifi is worse than that. But your engineers can: each extra nine costs roughly ten times the effort. Choosing an SLO below 100% is choosing to ship features with the reliability headroom you deliberately left yourself.",
      },
      { kind: "h2", text: "The budget changes behavior" },
      {
        kind: "p",
        text: "Budget remaining? Ship the risky migration, run the chaos experiment. Budget exhausted? Feature work pauses and reliability work takes over — not as punishment, but because the data says users are already feeling the failures. This single rule aligns product and platform teams better than any meeting.",
      },
      {
        kind: "quote",
        text: "An SLO nobody can violate is decoration. The budget only works if burning it changes what the team does next sprint.",
      },
      { kind: "h2", text: "Start with one" },
      {
        kind: "p",
        text: "Pick your most user-visible endpoint. Measure availability for two weeks to find your baseline. Set the SLO slightly below what you actually achieve, wire a MEDIUM incident to fire when the budget burns fast, and iterate quarterly. One meaningful SLO beats a dashboard of forty ignored ones.",
      },
    ],
  },
  {
    slug: "automating-incident-response",
    key: "webinarAutomation",
    type: "Webinar",
    title: "Automating Incident Response",
    description:
      "From auto-escalation to AI summaries: reduce toil in your incident pipeline.",
    readTime: "8 min read",
    gradient: "from-rose-600 to-red-600",
    sections: [
      {
        kind: "p",
        text: "The minutes after an alert fires are full of work that no human should be doing by hand: paging the right person, opening the incident record, pulling up dashboards, telling stakeholders. Every one of those steps can be automated — and each automation shaves minutes off every future incident.",
      },
      { kind: "h2", text: "The automation ladder" },
      {
        kind: "list",
        items: [
          "Level 1: Auto-creation — alerts from your monitoring create incidents directly. No copy-pasting from one tool to another.",
          "Level 2: Auto-routing — severity and service determine who gets notified, instantly, via escalation policies and on-call schedules.",
          "Level 3: Auto-escalation — unacknowledged incidents climb the ladder on a timer, so nothing sits unowned.",
          "Level 4: Auto-context — the incident arrives with links to dashboards, recent deploys, and runbooks already attached.",
          "Level 5: Auto-summarization — AI reads the timeline and writes the recap, so handoffs and post-mortems start from a draft instead of a blank page.",
        ],
      },
      { kind: "h2", text: "Webhooks are the glue" },
      {
        kind: "p",
        text: "Your monitoring stack — Prometheus, Grafana, Datadog, custom scripts — already knows when things break. An alert-ingestion webhook turns that knowledge into a structured incident with severity, ownership, and a timeline. If a human is transcribing alerts into an incident tool, you are paying an engineer to be a webhook.",
      },
      { kind: "h2", text: "Where AI actually helps today" },
      {
        kind: "p",
        text: "Not in deciding what to do — in writing things down. Summarizing a noisy timeline for the next responder, drafting the customer-facing update, extracting action items from the resolution thread. These are real, shippable wins that save attention exactly when attention is scarcest.",
      },
      {
        kind: "quote",
        text: "Automate the response around the humans, so the humans can focus on the actual problem.",
      },
      { kind: "h2", text: "Keep humans in the loop where it counts" },
      {
        kind: "p",
        text: "Automation should never auto-resolve an incident or silence a page without a person confirming. The goal is fewer decisions per incident, not zero decisions — remove the toil, keep the judgment.",
      },
    ],
  },
];

export function getArticle(slug: string): ResourceArticle | undefined {
  return RESOURCE_ARTICLES.find((a) => a.slug === slug);
}
