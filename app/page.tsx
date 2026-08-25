"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  Clock,
  Users,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Shield,
  Layers,
  AlertTriangle,
  FileText,
  Lock,
} from "lucide-react";
import { getStoredToken, getStoredUser, getRedirectPathForRole } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      setCurrentUser(user);
    }
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const dashboardUrl = currentUser ? getRedirectPathForRole(currentUser.role) : "/login";

  const faqs = [
    {
      question: "How does automated priority scoring work?",
      answer:
        "When a ticket is submitted, our backend engine evaluates the title, description keywords, and category against predefined rules. Critical emergencies and system outages receive a 2-hour resolution deadline, billing issues receive 8 hours, technical bugs receive 24 hours, and general inquiries receive 72 hours.",
    },
    {
      question: "What happens when an SLA deadline is breached?",
      answer:
        "The automated background SLA monitor continuously calculates time remaining for all open tickets. If a deadline passes, the ticket is flagged as breached, marked in high-visibility audit logs, and instant notifications are dispatched to assigned agents and administrators.",
    },
    {
      question: "Can support agents communicate privately about a ticket?",
      answer:
        "Yes. Support agents and administrators can post 'Internal Staff Notes' that are highlighted in amber and restricted from customer view, while standard public replies remain visible to the ticket requester.",
    },
    {
      question: "How are roles and permissions isolated?",
      answer:
        "The system enforces strict role-based access control (RBAC). Customers can only create and track their own tickets; Agents access their assigned queues with status progression controls; Administrators oversee organization-wide queues, override priorities, reassign agents, and view executive analytics.",
    },
    {
      question: "Are ticket lifecycle transitions and closures audited?",
      answer:
        "Every lifecycle state change (Open → In Progress → Resolved → Closed), agent assignment, priority override, and file upload generates an immutable, tamper-evident audit log entry with timestamp and actor tracking.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2933] flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E4E7EB] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-[#1F2933] tracking-tight">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#1F2933] text-white text-sm font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span>SupportOps</span>
          </Link>

          {/* 4 Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#52606D]">
            <a href="#features" className="hover:text-[#1F2933] transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#1F2933] transition">
              How It Works
            </a>
            <a href="#sla-engine" className="hover:text-[#1F2933] transition">
              SLA Engine
            </a>
            <a href="#faq" className="hover:text-[#1F2933] transition">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link href={dashboardUrl}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  <span>Go to Dashboard</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#52606D] hover:text-[#1F2933] px-3 py-1.5 transition"
                >
                  Sign In
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    <span>Get Started</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-semibold text-[#0D9488]">
          <Shield className="w-3.5 h-3.5" />
          <span>Enterprise Customer Support & SLA Automation</span>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1F2933] tracking-tight leading-[1.15]">
            Fast, Reliable Support with <span className="text-[#0D9488]">Strict SLA Guarantees</span>
          </h1>
          <p className="text-base sm:text-lg text-[#52606D] max-w-2xl mx-auto leading-relaxed">
            Automate ticket triage, enforce resolution deadlines with real-time breach detection, and streamline communication across customer and agent workflows.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {currentUser ? (
            <Link href={dashboardUrl} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                <span>Open {currentUser.role === "admin" ? "Admin Console" : currentUser.role === "agent" ? "Agent Queue" : "My Tickets"}</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  <span>Create Customer Account</span>
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto font-semibold">
                  <span>Sign In to Dashboard</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Highlights Bar */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 bg-white rounded-xl border border-[#E4E7EB] shadow-card space-y-1">
            <div className="text-2xl font-extrabold text-[#1F2933]">2h - 72h</div>
            <div className="text-xs font-semibold text-[#52606D] uppercase tracking-wider">Fixed SLA Deadlines</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#E4E7EB] shadow-card space-y-1">
            <div className="text-2xl font-extrabold text-[#0D9488]">100%</div>
            <div className="text-xs font-semibold text-[#52606D] uppercase tracking-wider">Automated Scoring</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#E4E7EB] shadow-card space-y-1">
            <div className="text-2xl font-extrabold text-blue-600">3 Roles</div>
            <div className="text-xs font-semibold text-[#52606D] uppercase tracking-wider">Customer, Agent, Admin</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#E4E7EB] shadow-card space-y-1">
            <div className="text-2xl font-extrabold text-emerald-600">Immutable</div>
            <div className="text-xs font-semibold text-[#52606D] uppercase tracking-wider">Audit Trail Logging</div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section (Cards) */}
      <section id="features" className="py-16 bg-white border-y border-[#E4E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Core Capabilities</h2>
            <h3 className="text-3xl font-bold text-[#1F2933] tracking-tight">
              Engineered for Speed, Accountability & Precision
            </h3>
            <p className="text-sm text-[#52606D] leading-relaxed">
              Every component is purpose-built to eliminate support bottlenecks and ensure tickets are resolved within contractual SLAs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <Card className="hoverable shadow-card">
              <CardBody className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1F2933] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-base font-bold text-[#1F2933]">Automated Priority Scoring</h4>
                <p className="text-xs text-[#52606D] leading-relaxed">
                  Evaluates issue descriptions, keywords, and category upon submission to assign strict priority levels without manual triage delays.
                </p>
              </CardBody>
            </Card>

            {/* Card 2 */}
            <Card className="hoverable shadow-card">
              <CardBody className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1F2933] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-base font-bold text-[#1F2933]">Real-Time SLA Monitor</h4>
                <p className="text-xs text-[#52606D] leading-relaxed">
                  Live countdown engine tracks expiration deadlines per ticket, flagging at-risk tickets and firing instant alert notifications upon breach.
                </p>
              </CardBody>
            </Card>

            {/* Card 3 */}
            <Card className="hoverable shadow-card">
              <CardBody className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1F2933] flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="text-base font-bold text-[#1F2933]">Role-Based Workspaces</h4>
                <p className="text-xs text-[#52606D] leading-relaxed">
                  Dedicated views for Customers (my tickets), Support Agents (assigned queues), and Administrators (global registry & reassignments).
                </p>
              </CardBody>
            </Card>

            {/* Card 4 */}
            <Card className="hoverable shadow-card">
              <CardBody className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1F2933] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="text-base font-bold text-[#1F2933]">Threaded Replies & Internal Notes</h4>
                <p className="text-xs text-[#52606D] leading-relaxed">
                  Seamless customer communication paired with private staff-only internal notes and secure document attachments.
                </p>
              </CardBody>
            </Card>

            {/* Card 5 */}
            <Card className="hoverable shadow-card">
              <CardBody className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1F2933] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-700" />
                </div>
                <h4 className="text-base font-bold text-[#1F2933]">Executive Analytics & SLA Reports</h4>
                <p className="text-xs text-[#52606D] leading-relaxed">
                  Comprehensive performance dashboards featuring agent resolution leaderboards, volume distribution, and SLA breach rate audits.
                </p>
              </CardBody>
            </Card>

            {/* Card 6 */}
            <Card className="hoverable shadow-card">
              <CardBody className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1F2933] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#0D9488]" />
                </div>
                <h4 className="text-base font-bold text-[#1F2933]">Tamper-Evident Closure Trail</h4>
                <p className="text-xs text-[#52606D] leading-relaxed">
                  Every status progression (Open → In Progress → Resolved → Closed) and administrative override is permanently recorded in an immutable audit trail.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Workflow</h2>
          <h3 className="text-3xl font-bold text-[#1F2933] tracking-tight">
            How Tickets Move from Submission to Resolution
          </h3>
          <p className="text-sm text-[#52606D]">
            A structured, forward-only lifecycle that ensures transparency at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-xl border border-[#E4E7EB] shadow-card space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="text-base font-bold text-[#1F2933]">Ticket Submission</h4>
            <p className="text-xs text-[#52606D] leading-relaxed">
              Customer submits an issue. The backend auto-calculates priority and establishes the exact SLA deadline timestamp.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#E4E7EB] shadow-card space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 font-bold text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="text-base font-bold text-[#1F2933]">Triage & Assignment</h4>
            <p className="text-xs text-[#52606D] leading-relaxed">
              Admin assigns the ticket to an active support agent, placing it directly in their active workload queue.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#E4E7EB] shadow-card space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="text-base font-bold text-[#1F2933]">In Progress & Replies</h4>
            <p className="text-xs text-[#52606D] leading-relaxed">
              Agent claims the ticket, investigates, exchanges replies/attachments with customer, and coordinates via staff notes.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#E4E7EB] shadow-card space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-sm flex items-center justify-center">
              4
            </div>
            <h4 className="text-base font-bold text-[#1F2933]">Resolution & Audit</h4>
            <p className="text-xs text-[#52606D] leading-relaxed">
              Ticket is marked resolved, SLA compliance is frozen, and final closure is committed to the tamper-evident audit log.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SLA Engine Tier Breakdown */}
      <section id="sla-engine" className="py-16 bg-white border-y border-[#E4E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Guaranteed Deadlines</h2>
            <h3 className="text-3xl font-bold text-[#1F2933] tracking-tight">
              Standardized SLA Tier Hierarchy
            </h3>
            <p className="text-sm text-[#52606D]">
              Clear expectations for response and resolution across all complaint categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-red-50/60 border border-red-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Critical</span>
                <span className="text-xs font-bold text-red-900 bg-red-100 px-2 py-0.5 rounded-md">2h SLA</span>
              </div>
              <p className="text-xs text-red-950 leading-relaxed">
                System outages, security incidents, data loss, and active emergency service disruptions.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">High</span>
                <span className="text-xs font-bold text-orange-900 bg-orange-100 px-2 py-0.5 rounded-md">8h SLA</span>
              </div>
              <p className="text-xs text-orange-950 leading-relaxed">
                Payment failures, checkout blockers, critical account access issues, and billing discrepancies.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Medium</span>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">24h SLA</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                Standard technical bugs, application errors, performance degradation, and UI glitches.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-[#E4E7EB] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#52606D] uppercase tracking-wider">Low</span>
                <span className="text-xs font-bold text-[#1F2933] bg-slate-200 px-2 py-0.5 rounded-md">72h SLA</span>
              </div>
              <p className="text-xs text-[#52606D] leading-relaxed">
                General inquiries, feedback, product questions, and non-urgent configuration requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Questions & Answers</h2>
          <h3 className="text-3xl font-bold text-[#1F2933] tracking-tight">
            Frequently Asked Questions
          </h3>
          <p className="text-sm text-[#52606D]">
            Everything you need to know about the SupportOps platform.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <Card key={index} className="border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#1F2933] hover:text-[#0D9488] transition"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-[#52606D] transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#0D9488]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#52606D] leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 7. Call to Action Banner */}
      <section className="py-12 bg-slate-100 border-t border-[#E4E7EB]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1F2933] tracking-tight">
            Ready to streamline your customer support operations?
          </h3>
          <p className="text-sm text-[#52606D] max-w-xl mx-auto">
            Experience fast automated triage, role-based workflows, and real-time SLA compliance tracking.
          </p>
          <div className="flex justify-center gap-4">
            {currentUser ? (
              <Link href={dashboardUrl}>
                <Button variant="primary" size="md">
                  <span>Enter Dashboard</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button variant="primary" size="md">
                    <span>Create Free Account</span>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="md">
                    <span>Sign In</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-white border-t border-[#E4E7EB] py-8 text-xs text-[#52606D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-[#1F2933]">
            <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
            <span>SupportOps</span>
            <span className="font-normal text-xs text-[#9AA5B1]">© 2026 SupportOps Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-[#1F2933] transition">
              Customer Portal
            </Link>
            <Link href="/login" className="hover:text-[#1F2933] transition">
              Agent Queue
            </Link>
            <Link href="/login" className="hover:text-[#1F2933] transition">
              Admin Console
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
