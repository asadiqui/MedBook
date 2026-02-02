"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";

export default function HomePage() {
  const { isAuthenticated, user } = useAuthRedirect();

  if (isAuthenticated && user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute top-40 -left-10 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <nav className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Get started
              </Link>
            </div>
          </nav>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Smart care scheduling
              </p>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Book trusted care, instantly.
              </h1>
              <p className="mt-4 text-base text-gray-600 sm:text-lg">
                Sa7ti connects patients and doctors in one place. Discover specialists, book appointments, manage schedules, and chat securely — all with real‑time availability.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/find-doctor"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Find a doctor
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                >
                  Create account
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live availability updates
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Secure chat & reminders
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Verified doctor profiles
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Today</p>
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming appointments</h3>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Live</span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { name: "Dr. Amine Belhaj", time: "09:30", type: "Cardiology" },
                  { name: "Dr. Sara Othman", time: "11:00", type: "Dermatology" },
                  { name: "Dr. Youssef Karim", time: "14:15", type: "Pediatrics" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-700">{item.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-blue-50 px-4 py-4 text-sm text-blue-700">
                Seamless booking with reminders, receipts, and chat support.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">👤</div>
            <h3 className="text-lg font-semibold text-gray-900">Patients first</h3>
            <p className="mt-2 text-sm text-gray-600">
              Browse by specialty, compare profiles, and book in minutes with secure payments.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">🩺</div>
            <h3 className="text-lg font-semibold text-gray-900">Doctor toolkit</h3>
            <p className="mt-2 text-sm text-gray-600">
              Control availability, accept appointments, and keep your practice organized.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">💬</div>
            <h3 className="text-lg font-semibold text-gray-900">Connected care</h3>
            <p className="mt-2 text-sm text-gray-600">
              Built‑in chat and reminders keep everyone aligned before the visit.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-gray-900 px-8 py-12 text-white md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Ready to get started?</h2>
            <p className="mt-2 text-sm text-gray-300">
              Join Sa7ti and book your next appointment in seconds.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 md:mt-0">
            <Link
              href="/auth/register"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900"
            >
              Create account
            </Link>
            <Link
              href="/auth/login"
              className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
