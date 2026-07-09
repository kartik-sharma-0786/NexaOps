"use client";

import { LandingNavbar } from "../../components/landing/navbar";

const sections = [
  {
    title: "1. The service",
    body: [
      "NexaOps is an incident management platform provided as-is during its active development phase. Features may change, and while we aim for high availability, we do not currently guarantee an uptime SLA.",
    ],
  },
  {
    title: "2. Your account",
    body: [
      "You are responsible for keeping your credentials secure and for all activity in your workspace. Workspace owners and admins control who can join their tenant and what roles they hold.",
    ],
  },
  {
    title: "3. Acceptable use",
    body: [
      "Do not use the service to store unlawful content, attempt to access other tenants' data, probe or overload the infrastructure, or send spam through its notification features. We may suspend accounts that do.",
    ],
  },
  {
    title: "4. Your data",
    body: [
      "You own the data you put into NexaOps. We claim no rights over your incidents, comments, or team information, and we handle it as described in the Privacy Policy.",
    ],
  },
  {
    title: "5. Liability",
    body: [
      "To the maximum extent permitted by law, NexaOps is provided without warranties of any kind, and we are not liable for indirect or consequential damages arising from use of the service. Our total liability is limited to the amount you paid for the service in the preceding 12 months.",
    ],
  },
  {
    title: "6. Termination",
    body: [
      "You may stop using the service and request deletion of your data at any time. We may terminate accounts that violate these terms, with notice where practical.",
    ],
  },
  {
    title: "7. Changes",
    body: [
      "We may update these terms as the product evolves; material changes will be announced on this page with an updated date. Continued use after changes means you accept the new terms.",
    ],
  },
  {
    title: "8. Contact",
    body: ["Questions about these terms: kartikeysharma0786@gmail.com"],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <LandingNavbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
          Last updated: July 9, 2026
        </p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
