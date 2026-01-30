import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <header className="fixed w-full top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                NexaOps
              </span>
            </div>

            <nav className="hidden md:flex gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
              >
                Docs
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 lg:py-32">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8 dark:bg-indigo-900/20 dark:border-indigo-800">
            <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              v1.0 is now live
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
            Incident response for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              engineering teams
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Orchestrate incidents, automate follow-ups, and keep stakeholders
            informed in real-time. The complete platform for reliability.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 dark:shadow-none"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 dark:shadow-none"
              >
                Start for Free
              </Link>
            )}
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 text-lg font-semibold rounded-xl hover:bg-gray-50 transition dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-750">
              View Documentation
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div
          id="features"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Real-time Updates"
              description="Live collaboration with WebSockets. See status changes and comments instantly without refreshing."
              icon="⚡"
            />
            <FeatureCard
              title="Role-Based Access"
              description="Granular permissions for Admins, Responders, and Viewers. Secure your incident data."
              icon="🛡️"
            />
            <FeatureCard
              title="Post-Mortems"
              description="Generate detailed reports and learn from every incident to improve future reliability."
              icon="📊"
            />
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} NexaOps. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-indigo-100 transition duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
