"use client";

import { Mail, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { ChatWidget } from "../../components/landing/chat-widget";
import { LandingNavbar } from "../../components/landing/navbar";
import { useLanguage } from "../../contexts/language-context";

export default function ContactPage() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <LandingNavbar />

      <div className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl mb-6">
              {t.contact.heroTitle}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t.contact.heroSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            {/* Contact Form */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t.contact.form.successMessage}
                  </h3>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t.contact.form.nameLabel}
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t.contact.form.emailLabel}
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t.contact.form.companyLabel}
                    </label>
                    <input
                      type="text"
                      id="company"
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t.contact.form.messageLabel}
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting
                      ? t.contact.form.submitting
                      : t.contact.form.submitButton}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-12 flex flex-col justify-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t.contact.sales.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t.contact.sales.description}
                </p>
                <a
                  href={`mailto:${t.contact.sales.email}`}
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {t.contact.sales.email}
                </a>
              </div>

              <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t.contact.support.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t.contact.support.description}
                </p>
                <a
                  href={`mailto:${t.contact.support.email}`}
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {t.contact.support.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
