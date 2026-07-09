"use client";

import { LandingNavbar } from "../../components/landing/navbar";

const sections = [
  {
    title: "1. What we collect",
    body: [
      "Account information: your name, email address, and a hashed password (we never store plaintext passwords — they are hashed with Argon2).",
      "Workspace data: the tenants, incidents, comments, timeline events, and team memberships you create while using the service.",
      "Technical data: standard server logs (IP address, request timestamps) kept for security and debugging, and a session cookie required for sign-in.",
    ],
  },
  {
    title: "2. How we use it",
    body: [
      "To operate the service: authenticate you, isolate your workspace's data from other tenants, and deliver notifications you request (such as password resets, invitations, and incident emails).",
      "We do not sell your data, show ads, or share your information with third parties except the infrastructure providers that host the service (cloud hosting, database, and email delivery).",
    ],
  },
  {
    title: "3. Cookies",
    body: [
      "We use only essential cookies: a session cookie to keep you signed in. No advertising or cross-site tracking cookies are used. Preferences such as language and theme are stored locally in your browser.",
    ],
  },
  {
    title: "4. Data retention & deletion",
    body: [
      "Your data is retained while your account is active. To delete your account and its data, contact us at the email below and we will remove it within 30 days.",
    ],
  },
  {
    title: "5. Security",
    body: [
      "All traffic is encrypted with TLS. Passwords are hashed with Argon2. Every workspace's data is isolated per tenant and access is enforced with role-based permissions. Reset and invitation links are single-use, expiring tokens stored only as hashes.",
      "No system is perfectly secure. If we become aware of a breach affecting your data, we will notify you without undue delay.",
    ],
  },
  {
    title: "6. Contact",
    body: [
      "For privacy questions or data requests, contact: kartikeysharma0786@gmail.com",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <LandingNavbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
          Last updated: July 9, 2026
        </p>

        <div className="space-y-8" id="security">
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
