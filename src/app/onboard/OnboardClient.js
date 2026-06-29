"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
  Users,
  ShieldCheck,
} from "lucide-react";
import InfluencerForm from "@/components/InfluencerForm";
import { submitOnboarding } from "@/lib/public-api";

const STEPS = [
  { title: "Profile", desc: "Photo & basic info" },
  { title: "Social", desc: "Handles & niche" },
  { title: "Location", desc: "State & city" },
  { title: "Review", desc: "Submit for approval" },
];

const BENEFITS = [
  {
    icon: Users,
    title: "Get discovered",
    desc: "Brands search by city and niche to find creators like you.",
  },
  {
    icon: MapPin,
    title: "Local reach",
    desc: "Show up when brands look for influencers in your state and city.",
  },
  {
    icon: ShieldCheck,
    title: "Verified listing",
    desc: "Every profile is reviewed before going live on InflConnect.",
  },
];

export default function OnboardClient() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);

    try {
      await submitOnboarding(formData);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(
        err.message?.includes("Too many")
          ? err.message
          : "Something went wrong while submitting your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-lg shadow-indigo-100/50 border border-slate-100 p-8 sm:p-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Profile submitted!
          </h1>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Thank you for joining InflConnect. Our team will review your profile
            shortly. Once approved, brands can discover you in your city.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-8">
            <Clock className="w-4 h-4" />
            Review typically takes 1–2 business days
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-50/40 via-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-indigo-100/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Creator onboarding
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight max-w-2xl">
            Build your profile.{" "}
            <span className="text-indigo-600">Get found by brands.</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-xl leading-relaxed">
            Join India&apos;s growing network of local influencers. Fill in your
            details — it only takes a few minutes.
          </p>

          {/* Step pills */}
          <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl text-sm"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <span className="font-medium text-slate-800">{step.title}</span>
                  <span className="hidden sm:inline text-slate-400"> · {step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 sm:p-8 lg:p-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-1">
                Your creator profile
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                All fields marked with * are required.
              </p>
              <InfluencerForm
                onSubmit={handleSubmit}
                submitLabel="Submit for Review"
                loading={loading}
                confirmBeforeSubmit
              />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Why join?</h3>
              <ul className="space-y-4">
                {BENEFITS.map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white">
              <p className="text-sm font-medium opacity-90">Pro tip</p>
              <p className="mt-2 text-sm leading-relaxed opacity-95">
                Select your exact state and city so brands searching locally can
                find you faster.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
