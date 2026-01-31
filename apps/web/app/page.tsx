"use client";

import {
    ArrowRight,
    BarChart,
    BookOpen,
    Globe,
    Play,
    Shield,
    Users,
    Zap,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ChatWidget } from "../components/landing/chat-widget";

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const userEmail = (session?.user as { email?: string } | undefined)?.email;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                  N
                </div>
                <span className="text-xl font-bold text-gray-900">NexaOps</span>
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                <Link
                  href="/features"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/resources"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Resources
                </Link>
                <Link
                  href="#"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="#"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Docs
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAuthed ? (
                <>
                  <span className="hidden sm:inline text-sm text-gray-600">
                    {userEmail || "Signed in"}
                  </span>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/api/auth/signin"
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/dashboard"
                    className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                Incident management for{" "}
                <span className="text-indigo-600">
                  modern engineering teams
                </span>
              </h1>
              <p className="text-xl text-gray-500 mb-8 max-w-2xl leading-relaxed">
                Automate incident response, manage on-call schedules, and
                conduct blameless post-mortems. NexaOps helps you build more
                reliable software, faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Start handling incidents free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-700 border border-gray-200 font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  <Play className="mr-2 w-4 h-4 text-gray-900" />
                  Watch Demo
                </Link>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white"></div>
                </div>
                <p>Trusted by engineering teams everywhere</p>
              </div>
            </div>
          </div>

          {/* Decorative background blob */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </section>

        {/* Clients Section */}
        <section className="py-10 border-y border-gray-100 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
              Powering reliability at
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos */}
              {["Acme Corp", "GlobalTech", "Nebula", "Vertex", "Horizon"].map(
                (name) => (
                  <div
                    key={name}
                    className="flex justify-center items-center h-8"
                  >
                    <span className="text-xl font-bold text-gray-400 font-serif italic">
                      {name}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* Why NexaOps / Features */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why NexaOps?
              </h2>
              <p className="text-lg text-gray-500">
                Everything you need to resolve incidents faster and learn from
                them effectively.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-yellow-500" />,
                  title: "Instant Response",
                  desc: "Automate paging, war room creation, and stakeholder updates instantly when an alert fires.",
                },
                {
                  icon: <Shield className="w-6 h-6 text-green-500" />,
                  title: "Reliability Guardrails",
                  desc: "Define service level objectives (SLOs) and error budgets to balance feature velocity with stability.",
                },
                {
                  icon: <BarChart className="w-6 h-6 text-purple-500" />,
                  title: "Actionable Insights",
                  desc: "Turn incident data into learning with automated timelines and blameless post-mortem templates.",
                },
                {
                  icon: <Users className="w-6 h-6 text-blue-500" />,
                  title: "On-Call Scheduling",
                  desc: "Fair and flexible on-call rotations that prevent burnout and ensure coverage.",
                },
                {
                  icon: <Globe className="w-6 h-6 text-indigo-500" />,
                  title: "Universal Integrations",
                  desc: "Connect with Slack, Jira, Zoom, PagerDuty, and 100+ observability tools.",
                },
                {
                  icon: <BookOpen className="w-6 h-6 text-pink-500" />,
                  title: "Runbooks",
                  desc: "Interactive runbooks that guide responders through best practices during stress.",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Resources
                </h2>
                <p className="text-lg text-gray-500">
                  Learn best practices from industry experts.
                </p>
              </div>
              <Link
                href="#"
                className="hidden md:flex items-center text-indigo-600 font-medium hover:text-indigo-700"
              >
                View all resources <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  category: "Guide",
                  title: "The Comprehensive Guide to Incident Management",
                  desc: "From SEV1 to Post-mortem, learn how to handle critical incidents.",
                  color: "bg-blue-600",
                },
                {
                  category: "Webinar",
                  title: "Building a Culture of Reliability",
                  desc: "Watch our panel discussion with SRE leaders from top tech companies.",
                  color: "bg-purple-600",
                },
                {
                  category: "Case Study",
                  title: "How TechFlow Reduced MTTR by 60%",
                  desc: "See how TechFlow leveraged NexaOps to streamline their response.",
                  color: "bg-green-600",
                },
              ].map((resource, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div
                    className={`h-48 ${resource.color} rounded-t-2xl relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="p-6 bg-white border border-t-0 border-gray-200 rounded-b-2xl shadow-sm group-hover:shadow-md transition-all">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 block">
                      {resource.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {resource.desc}
                    </p>
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      Read more <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {/* Pattern placeholder */}
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to improve your reliability?
            </h2>
            <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
              Join thousands of developers who trust NexaOps to manage their
              critical incidents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg"
              >
                Get Started for Free
              </Link>
              <Link
                href="#"
                className="px-8 py-4 bg-transparent border border-indigo-400 text-white font-medium rounded-lg hover:bg-indigo-800 transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Incidents
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    On-Call
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Post-mortems
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Status Pages
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Customers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-600">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">
                N
              </div>
              <span className="text-gray-900 font-bold">NexaOps</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} NexaOps Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
