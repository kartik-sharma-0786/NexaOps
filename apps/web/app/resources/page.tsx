"use client";

import { ArrowRight, Book, FileText, Search, Video } from "lucide-react";
import Link from "next/link";

const resources = [
  {
    type: "Guide",
    title: "The Ultimate Guide to Incident Management",
    description:
      "Everything you need to know about setting up an incident response process from scratch.",
    icon: <Book className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "Webinar",
    title: "Building Resilient Systems at Scale",
    description:
      "Learn from SREs at Netflix and Google about how they design for failure.",
    icon: <Video className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    type: "Article",
    title: "Post-Mortem Best Practices",
    description:
      "How to conduct blameless post-mortems that actually lead to system improvements.",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-green-100 text-green-600",
  },
  {
    type: "Guide",
    title: "On-Call Health Check",
    description:
      "A framework for assessing and improving the health of your on-call rotations.",
    icon: <Book className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "Article",
    title: "Defining Service Level Objectives",
    description:
      "A practical guide to choosing and measuring the right SLOs for your service.",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-green-100 text-green-600",
  },
  {
    type: "Webinar",
    title: "Automation in Incident Response",
    description: "Demystifying runbook automation and how to get started.",
    icon: <Video className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-600",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation (Simplified for sub-page) */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                N
              </div>
              <span className="text-xl font-bold text-gray-900">NexaOps</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-indigo-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl mb-6">
            NexaOps Resources
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-indigo-200">
            Insights, guides, and best practices to help you build reliable
            systems and effective teams.
          </p>
          <div className="mt-10 max-w-xl mx-auto">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-4"
                placeholder="Search articles, guides, and more..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resource.color}`}
                  >
                    {resource.icon}
                    <span className="ml-2">{resource.type}</span>
                  </span>
                </div>
                <a href="#" className="block mt-2">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
                    {resource.title}
                  </h3>
                  <p className="mt-3 text-base text-gray-500">
                    {resource.description}
                  </p>
                </a>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <a
                  href="#"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                >
                  Read more <ArrowRight className="ml-1 w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
