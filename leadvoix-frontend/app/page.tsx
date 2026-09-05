"use client";
import Link from "next/link";
import { useState } from "react";

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-slate-400">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] text-emerald-400">
        ✓
      </span>
      {children}
    </li>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div className="absolute -inset-8 rounded-[40px] bg-indigo-500/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1428] shadow-2xl shadow-black/50">
        {/* Browser top */}
        <div className="flex h-11 items-center justify-between border-b border-white/10 bg-[#10182f] px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>

          <div className="rounded-md bg-white/5 px-16 py-1 text-[8px] text-slate-500">
            app.leadvoix.ai
          </div>

          <span className="w-10" />
        </div>

        <div className="flex min-h-[410px]">
          {/* Sidebar */}
          <div className="hidden w-16 border-r border-white/10 bg-[#0a1021] p-3 sm:block">
            <div className="mb-8 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold">
              L
            </div>

            <div className="space-y-4 text-center text-slate-600">
              <div className="text-blue-400">⌁</div>
              <div>◉</div>
              <div>▣</div>
              <div>◌</div>
              <div>□</div>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-blue-400">
                  Live call
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  Marcus Rivera
                </h3>
                <p className="text-[10px] text-slate-500">
                  Inbound · New lead
                </p>
              </div>

              <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 text-[9px] font-semibold text-orange-300">
                HOT LEAD
              </span>
            </div>

            {/* AI call */}
            <div className="rounded-xl border border-white/10 bg-[#111c39] p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  AI Voice Agent
                </span>

                <span className="text-[10px] text-emerald-400">
                  ● Listening
                </span>
              </div>

              <div className="flex h-16 items-center justify-center gap-1">
                {[18, 32, 46, 26, 55, 38, 62, 30, 48, 22, 42, 30].map(
                  (height, index) => (
                    <span
                      key={index}
                      className={`w-1 rounded-full ${
                        index % 3 === 0
                          ? "bg-violet-400"
                          : "bg-blue-400"
                      }`}
                      style={{ height }}
                    />
                  )
                )}
              </div>

              <p className="mt-3 text-[11px] leading-5 text-slate-400">
                “I’m interested in pricing and would like to understand the
                implementation timeline.”
              </p>
            </div>

            {/* Intelligence */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[9px] text-slate-500">Lead score</p>
                <p className="mt-1 text-lg font-bold text-blue-400">78/100</p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[9px] text-slate-500">Sentiment</p>
                <p className="mt-1 text-sm font-semibold text-emerald-400">
                  Positive
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[9px] text-slate-500">Intent</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Pricing
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[9px] text-slate-500">Temperature</p>
                <p className="mt-1 text-sm font-semibold text-violet-400">
                  Hot
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-400/10 bg-emerald-400/5 px-3 py-2.5">
              <span className="text-[10px] text-slate-300">
                ✓ Follow-up task created
              </span>
              <span className="text-[9px] text-slate-500">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleDemoSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setSuccess("");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      phone: formData.get("phone") || null,
      message: formData.get("message") || null,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/demo-requests/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit demo request");
      }

      await response.json();

      setSuccess(
        "Demo request submitted successfully. Our team will contact you soon."
      );

      form.reset();
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute right-[-200px] top-[500px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      </div>

      {/* NAVBAR */}
      <header className="relative z-20 border-b border-white/[0.06]">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center">
             <img
             src="/images/logo-horizontal.png"
             alt="LeadVoix OS"
              className="h-20 w-auto object-contain"
            />
            </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#product" className="transition hover:text-white">
              Product
            </a>
            <a href="#solutions" className="transition hover:text-white">
              Solutions
            </a>
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm text-slate-400 transition hover:text-white sm:block"
            >
              Log in
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Start Free →
            </Link>
          </div>
        </nav>
      </header>
      {/* HERO */}
      <section
        id="hero"
        className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28"
      >
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-xs font-medium text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI VOICE + CRM
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Turn Every Call Into a{" "}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Qualified Lead.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              LeadVoix combines an AI Voice Agent with a powerful CRM to
              answer calls, qualify prospects, understand customer intent,
              and keep your sales pipeline moving automatically.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-3.5 text-center text-sm font-bold shadow-xl shadow-blue-500/20 transition hover:scale-[1.02]"
              >
                Start Free — No credit card
              </Link>

              <a
                href="#contact"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07]"
              >
                Book a Demo
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span>✓ Setup in minutes</span>
              <span>✓ Cancel anytime</span>
              <span>✓ SOC 2 ready</span>
            </div>
          </div>

          <DashboardMockup />
        </div>
      </section>
      {/* PRODUCT OVERVIEW */}
<section
  id="product"
  className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] py-24 lg:py-32"
>
  <div className="mx-auto max-w-7xl px-5 lg:px-8">
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
        The LeadVoix OS Platform
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        Everything You Need to Turn Conversations Into Revenue
      </h2>

      <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">
        AI voice agents, CRM, call intelligence, and automated follow-ups —
        all connected in one platform.
      </p>
    </div>

    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

      {/* AI Voice Agent */}
      <div
       id="ai-voice-agent"
       className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="text-2xl">🎙️</div>
        <h3 className="mt-5 text-lg font-semibold text-white">
          AI Voice Agent
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Handle inbound and outbound customer calls with intelligent AI voice agents.
        </p>
      </div>

      {/* Agent Calls */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="text-2xl">📞</div>
        <h3 className="mt-5 text-lg font-semibold text-white">
          Agent Calls
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Track calls, call status, duration, transcripts, summaries, and outcomes.
        </p>
      </div>

      {/* Call Intelligence */}
      <div 
       id="call-intelligence"
       className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="text-2xl">🧠</div>
        <h3 className="mt-5 text-lg font-semibold text-white">
          Call Intelligence
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Understand sentiment, intent, lead score, buying signals, and objections.
        </p>
      </div>

      {/* CRM */}
      <div 
        id="crm"
       className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="text-2xl">👥</div>
        <h3 className="mt-5 text-lg font-semibold text-white">
          CRM & Leads
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Manage leads, contacts, companies, and customer relationships in one place.
        </p>
      </div>

      {/* Deals */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="text-2xl">💼</div>
        <h3 className="mt-5 text-lg font-semibold text-white">
          Deals & Pipelines
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Track opportunities through customizable sales pipelines and deal stages.
        </p>
      </div>

      {/* Follow-ups */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="text-2xl">✅</div>
        <h3 className="mt-5 text-lg font-semibold text-white">
          AI Follow-ups & Tasks
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Turn AI recommendations into actionable follow-ups and tasks automatically.
        </p>
      </div>

      {/* Knowledge */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="text-2xl">📚</div>
        <h3 className="mt-5 text-lg font-semibold text-white">
          Agent Knowledge
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Give your AI agents the business knowledge they need to handle real conversations.
        </p>
      </div>

      {/* Analytics */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="text-2xl">📊</div>
        <h3 className="mt-5 text-lg font-semibold text-white">
          Dashboard & Analytics
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Get a clear view of leads, deals, calls, tasks, and sales performance.
        </p>
      </div>

    </div>
  </div>
</section>

      {/* PROBLEM */}
      <section 
       className="relative z-10 border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              THE PROBLEM
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Your best leads are calling.
              <br />
              Your team cannot answer every time.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Every missed call, delayed response, and manual update creates
              another opportunity for revenue to disappear.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "01",
                "Missed Calls",
                "Every unanswered call is a lead handed to a competitor.",
              ],
              [
                "02",
                "Slow Follow-up",
                "Hours can pass before your sales team gets back to a prospect.",
              ],
              [
                "03",
                "Manual Qualification",
                "Sales teams waste time asking repetitive questions and sorting leads.",
              ],
              [
                "04",
                "Scattered Data",
                "Customer context gets lost between calls, notes, inboxes, and spreadsheets.",
              ],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-2xl border border-white/[0.07] bg-[#0a1021] p-6"
              >
                <span className="text-[10px] font-bold text-blue-400">
                  {number}
                </span>

                <h3 className="mt-5 text-lg font-semibold">{title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl px-5 py-24 lg:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-400">
            PLATFORM FEATURES
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Everything your sales team needs,
            <br />
            powered by AI.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[
            {
              icon: "⌁",
              label: "AI VOICE AGENT",
              title: "Answer every call. Capture every detail.",
              text: "Your always-on AI agent answers customer calls naturally, introduces your brand, gathers intent, and routes or escalates in real time.",
            },
            {
              icon: "◎",
              label: "AI LEAD QUALIFICATION",
              title: "Know who is serious before they leave the call.",
              text: "Every inbound call is scored by intent, urgency, and fit. High-value prospects are flagged instantly so your team works the right pipeline.",
            },
            {
              icon: "◫",
              label: "AI CALL INTELLIGENCE",
              title: "Understand what was said — and what it means.",
              text: "Sentiment, buying signals, objections, and intent are extracted automatically from every conversation and surfaced as structured data.",
            },
            {
              icon: "▣",
              label: "CRM & FOLLOW-UP AUTOMATION",
              title: "Conversations become organized, actionable data.",
              text: "Contacts, deals, notes, and follow-up tasks are created automatically from call outcomes so nothing falls through the cracks.",
            },
          ].map((feature) => (
            <div
              key={feature.label}
              className="rounded-2xl border border-white/[0.08] bg-[#0a1021] p-7 transition hover:-translate-y-1 hover:border-blue-400/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-lg text-blue-400">
                {feature.icon}
              </div>

              <p className="mt-6 text-[9px] font-bold tracking-[0.2em] text-blue-400">
                {feature.label}
              </p>

              <h3 className="mt-3 text-xl font-bold">{feature.title}</h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* INTELLIGENCE */}
      <section className="border-y border-white/[0.06] bg-[#080d1d]">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-400">
              AI CALL INTELLIGENCE
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Every call tells you exactly what to do next.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              LeadVoix analyzes every conversation and turns unstructured
              conversations into clear sales actions.
            </p>

            <ul className="mt-8 space-y-4">
              <CheckItem>Real-time sentiment and intent detection</CheckItem>
              <CheckItem>Structured buying signal extraction</CheckItem>
              <CheckItem>Objection identification and tagging</CheckItem>
              <CheckItem>AI-generated recommended actions</CheckItem>
              <CheckItem>Full call summary and searchable transcript</CheckItem>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1428] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold">Call Intelligence Report</p>
                <p className="mt-1 text-[9px] text-slate-500">
                  Marcus Rivera · Inbound
                </p>
              </div>

              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] text-emerald-400">
                ANALYZED
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                <p className="text-[9px] text-slate-500">LEAD SCORE</p>
                <p className="mt-2 text-2xl font-bold text-blue-400">78</p>
              </div>

              <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                <p className="text-[9px] text-slate-500">SENTIMENT</p>
                <p className="mt-2 text-sm font-bold text-emerald-400">
                  Positive
                </p>
              </div>

              <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                <p className="text-[9px] text-slate-500">TEMPERATURE</p>
                <p className="mt-2 text-sm font-bold text-orange-300">Hot</p>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-white/[0.03] p-4">
              <p className="text-[9px] uppercase tracking-wider text-slate-600">
                Customer Intent
              </p>
              <p className="mt-2 text-sm font-semibold">
                Pricing Interest
              </p>
            </div>

            <div className="mt-3 rounded-lg bg-white/[0.03] p-4">
              <p className="text-[9px] uppercase tracking-wider text-slate-600">
                Buying Signals
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Interested in pricing, asked about implementation timeline.
              </p>
            </div>

            <div className="mt-3 rounded-lg border border-blue-400/20 bg-blue-400/5 p-4">
              <p className="text-[9px] uppercase tracking-wider text-blue-400">
                Recommended Action
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                Send pricing details and schedule a follow-up call.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-400">
            HOW IT WORKS
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            From phone call to sales action in seconds.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-5">
          {[
            ["01", "Customer Calls", "A prospect calls your business."],
            ["02", "AI Answers", "Your AI Voice Agent answers instantly."],
            ["03", "AI Qualifies", "Intent and lead score are captured."],
            ["04", "CRM Updates", "Contact, lead and deal data are updated."],
            ["05", "Follow-up", "The next sales action is triggered automatically."],
          ].map(([number, title, text]) => (
            <div key={number} className="relative">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/5 text-xs font-bold text-blue-400">
                {number}
              </div>

              <h3 className="font-bold">{title}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTIONS */}
      <section
        id="solutions"
        className="border-y border-white/[0.06] bg-white/[0.015]"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
              SOLUTIONS
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Built for businesses where every call matters.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Real Estate", "Capture buyer and seller inquiries around the clock."],
              ["Healthcare", "Route patient calls and capture appointment intent."],
              ["Logistics", "Handle high call volumes and qualify inquiries."],
              ["Professional Services", "Qualify requests and schedule discovery calls."],
              ["SMBs", "Give every caller an immediate intelligent response."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/[0.07] bg-[#0a1021] p-5"
              >
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-400">
            PRICING
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Simple, transparent pricing.
          </h2>

          <p className="mt-4 text-sm text-slate-500">
            Start small and scale as your sales operation grows.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "$79",
              description: "For small teams getting started with AI voice.",
              features: [
                "1 AI Voice Agent",
                "Up to 300 calls / month",
                "Lead qualification",
                "CRM up to 500 contacts",
                "Email follow-up templates",
              ],
            },
            {
              name: "Growth",
              price: "$199",
              description: "For growing teams that need more power.",
              popular: true,
              features: [
                "3 AI Voice Agents",
                "Up to 1,000 calls / month",
                "AI Call Intelligence",
                "Full CRM + Pipelines",
                "Automated follow-up sequences",
              ],
            },
            {
              name: "Scale",
              price: "$499",
              description: "For businesses with high call volumes.",
              features: [
                "Unlimited AI Agents",
                "Unlimited calls",
                "Advanced call analytics",
                "Custom integrations",
                "Dedicated onboarding",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-7 ${
                plan.popular
                  ? "border-violet-400/30 bg-violet-500/[0.07]"
                  : "border-white/[0.08] bg-[#0a1021]"
              }`}
            >
              {plan.popular && (
                <span className="absolute right-5 top-5 rounded-full bg-violet-500 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-bold">{plan.name}</h3>

              <p className="mt-2 text-xs text-slate-500">
                {plan.description}
              </p>

              <div className="mt-6">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-sm text-slate-500"> / month</span>
              </div>

              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <CheckItem key={feature}>{feature}</CheckItem>
                ))}
              </ul>

              <Link
                href="/login"
                className={`mt-8 block rounded-xl px-5 py-3 text-center text-sm font-bold ${
                  plan.popular
                    ? "bg-gradient-to-r from-blue-500 to-violet-500"
                    : "border border-white/10 bg-white/[0.04]"
                }`}
              >
                Start Free
              </Link>
            </div>
          ))}
        </div>
      </section>

        {/* FINAL CTA / CONTACT */}
<section id="contact" className="px-5 pb-24 lg:px-8">
  <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-transparent px-6 py-12 sm:px-10 lg:px-16">
    
    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

      {/* LEFT */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
          GET STARTED TODAY
        </p>

        <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Stop losing leads while your team is busy.
        </h2>

        <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
          Let LeadVoix answer the call, understand the customer, and move
          the opportunity forward automatically.
        </p>

        <div className="mt-8 space-y-3 text-sm text-slate-400">
          <p>✓ AI-powered voice agents</p>
          <p>✓ Automatic lead qualification</p>
          <p>✓ CRM and call intelligence</p>
          <p>✓ No credit card required</p>
        </div>
      </div>

      {/* DEMO FORM */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h3 className="text-2xl font-bold text-white">
          Book a Demo
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Tell us a little about your business and our team will get in touch.
        </p>

        <form 
        onSubmit={handleDemoSubmit}
        className="mt-6 space-y-4">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Your full name"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Work Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Company Name
            </label>

            <input
              type="text"
              name="company"
              placeholder="Your company"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              How can we help?
            </label>

            <textarea
              name="message"
              rows={4}
              placeholder="Tell us about your business or what you need..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/50"
            />
          </div>

          <button
            type="submit"
             disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl transition hover:opacity-90"
          >
              {submitting ? "Submitting..." : "Request a Demo →"}
          </button>
          {success && (
           <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-400">
           {success}
          </p>
        )}

        {error && (
        <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-sm text-red-400">
       {error}
       </p>
        )}

          <p className="text-center text-xs text-slate-500">
            We&apos;ll never share your information.
          </p>

        </form>
      </div>

    </div>
  </div>
</section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-black">
                  L
                </span>
                <span className="font-bold">LeadVoix OS</span>
              </Link>

              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
                AI Voice Agent + CRM platform for businesses that cannot
                afford to miss a lead.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-white">Product</h3>
              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <a className="block hover:text-white" href="#ai-voice-agent">
                  AI Voice Agent
                </a>
                <a className="block hover:text-white" href="#call-intelligence">
                  Call Intelligence
                </a>
                <a className="block hover:text-white" href="#crm">
                  CRM
                </a>
                <a className="block hover:text-white" href="#pricing">
                  Pricing
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-white">Solutions</h3>
              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <a className="block hover:text-white" href="#solutions">
                  Real Estate
                </a>
                <a className="block hover:text-white" href="#solutions">
                  Healthcare
                </a>
                <a className="block hover:text-white" href="#solutions">
                  Logistics
                </a>
                <a className="block hover:text-white" href="#solutions">
                  SMBs
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-white">Company</h3>
              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <a className="block hover:text-white" href="#contact">
                  Contact
                </a>
                <a className="block hover:text-white" href="#pricing">
                  Pricing
                </a>
                <Link className="block hover:text-white" href="/login">
                  Login
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-slate-700 sm:flex-row">
            <p>© 2026 LeadVoix OS. All rights reserved.</p>
            <p>Built for businesses where every call matters.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}