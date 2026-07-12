import { ArrowLeft, ArrowRight, Book, Clock, FileText, Video } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingNavbar } from "../../../components/landing/navbar";
import {
  getArticle,
  RESOURCE_ARTICLES,
  type ResourceSection,
} from "../../../lib/resources-content";

export function generateStaticParams() {
  return RESOURCE_ARTICLES.map((a) => ({ slug: a.slug }));
}

const TYPE_ICON = {
  Guide: Book,
  Article: FileText,
  Webinar: Video,
} as const;

function Section({ section }: { section: ResourceSection }) {
  switch (section.kind) {
    case "h2":
      return (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">
          {section.text}
        </h2>
      );
    case "p":
      return (
        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 mb-5">
          {section.text}
        </p>
      );
    case "list":
      return (
        <ul className="space-y-3 mb-6">
          {section.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                {item}
              </span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-r-xl px-6 py-5 my-8">
          <p className="text-lg font-medium text-indigo-900 dark:text-indigo-200 italic">
            “{section.text}”
          </p>
        </blockquote>
      );
  }
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const Icon = TYPE_ICON[article.type];
  const related = RESOURCE_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <LandingNavbar />

      {/* Hero */}
      <div className={`bg-gradient-to-br ${article.gradient} py-20`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/resources"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            All resources
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur">
              <Icon className="w-3.5 h-3.5" />
              {article.type}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-white/80 leading-relaxed">
            {article.description}
          </p>
        </div>
      </div>

      {/* Body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {article.sections.map((s, i) => (
          <Section key={i} section={s} />
        ))}

        {/* CTA */}
        <div className="mt-14 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Put this into practice
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            NexaOps gives you incidents, on-call rotations, escalation policies and
            AI summaries — free to start.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related */}
        <div className="mt-14">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-5">
            Keep reading
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((r) => {
              const RIcon = TYPE_ICON[r.type];
              return (
                <Link
                  key={r.slug}
                  href={`/resources/${r.slug}`}
                  className="group rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    <RIcon className="w-3.5 h-3.5" />
                    {r.type}
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {r.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {r.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </article>
    </div>
  );
}
