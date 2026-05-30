'use client';

import Link from 'next/link';
import { SmshiveLogoFull } from '@/components/shared/Logo';
import {
  Smartphone,
  Zap,
  Shield,
  Globe,
  Code2,
  Webhook,
  ArrowRight,
  Check,
  MessageSquare,
  Infinity,
  Sparkles,
  Play,
  Heart,
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Animated counter hook
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const features = [
  {
    icon: <Zap size={24} />,
    title: 'One-Click Dispatch',
    description: 'Instantly transmit carrier SMS in under 1 second via high-speed WebSockets. Real-time logging with live sync.',
    badge: 'Instant',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    iconBg: 'bg-blue-500/10 text-blue-500',
    hoverGlow: 'hover:shadow-blue-500/10 hover:border-blue-500/30'
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Dual-SIM Sync',
    description: 'Sync multiple Android devices. Intelligent active-active dual-SIM load balancing to distribute carrier routing.',
    badge: 'Hardware',
    badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    iconBg: 'bg-indigo-500/10 text-indigo-500',
    hoverGlow: 'hover:shadow-indigo-500/10 hover:border-indigo-500/30'
  },
  {
    icon: <Code2 size={24} />,
    title: 'Developer-First API',
    description: 'Beautiful Swagger docs with copy-paste code snippets for Python, Node.js, PHP, and cURL. Get active in 60s.',
    badge: 'REST API',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    iconBg: 'bg-emerald-500/10 text-emerald-500',
    hoverGlow: 'hover:shadow-emerald-500/10 hover:border-emerald-500/30'
  },
  {
    icon: <Webhook size={24} />,
    title: 'HMAC-Signed Webhooks',
    description: 'Receive real-time HTTP callbacks for sent, received, or failed SMS. Includes failure counters and automatic retries.',
    badge: 'Callbacks',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    iconBg: 'bg-rose-500/10 text-rose-500',
    hoverGlow: 'hover:shadow-rose-500/10 hover:border-rose-500/30'
  },
  {
    icon: <MessageSquare size={24} />,
    title: 'CRM Inbox & Logs',
    description: 'Fully threaded inbox for received messages, dynamic contact book, and instant stats search in a sleek logs view.',
    badge: 'CRM',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    iconBg: 'bg-amber-500/10 text-amber-500',
    hoverGlow: 'hover:shadow-amber-500/10 hover:border-amber-500/30'
  },
  {
    icon: <Shield size={24} />,
    title: 'Self-Hosted Power',
    description: 'Keep 100% of your customer SMS data under your own infrastructure. Run on your own servers in one Docker command.',
    badge: 'Secure',
    badgeColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    iconBg: 'bg-cyan-500/10 text-cyan-500',
    hoverGlow: 'hover:shadow-cyan-500/10 hover:border-cyan-500/30'
  },
];

const comparisonRows = [
  { feature: 'Messages per day', smshive: 'Unlimited', textbee: '50 (free) / 500 (paid)' },
  { feature: 'Messages per month', smshive: 'Unlimited', textbee: '300 (free) / 5000 (paid)' },
  { feature: 'Connected Devices', smshive: 'Unlimited', textbee: '1 (free) / 5 (paid)' },
  { feature: 'Webhooks', smshive: 'Unlimited + HMAC Signature', textbee: 'Limited' },
  { feature: 'Developer Templates', smshive: 'Unlimited Custom Variables', textbee: 'None' },
  { feature: 'Scheduled SMS', smshive: '✅ Cron Schedules + One-shot', textbee: 'Basic' },
  { feature: 'Bulk CSV SMS', smshive: '✅ CSV + Multi-Variable Parsing', textbee: 'Basic' },
  { feature: 'Contact CRM Book', smshive: '✅ Full CRM Management', textbee: 'None' },
  { feature: 'API Rate Limits', smshive: '1000 requests/sec', textbee: '60 requests/sec' },
  { feature: 'Pricing', smshive: 'Free Forever', textbee: '$10/mo+' },
];

const steps = [
  {
    number: '01',
    title: 'Install the Android App',
    description: 'Download the lightweight SMSHIVE APK on any Android phone. Grant system SMS permissions.',
  },
  {
    number: '02',
    title: 'Scan QR to Register',
    description: 'Generate secure API key and scan the connection QR code to link your phone instantly.',
  },
  {
    number: '03',
    title: 'Dispatch Instant SMS',
    description: 'Trigger instant dispatches via web dashboard or API. Watch delivery in sub-second speed!',
  },
];

export default function LandingPage() {
  const messageCount = useCounter(2847395, 3000);

  return (
    <div className="min-h-screen bg-background antialiased selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <SmshiveLogoFull />
          <div className="hidden md:flex items-center gap-8 font-sans font-medium text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#comparison" className="text-muted-foreground hover:text-foreground transition-colors">Compare</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="https://github.com/NilambarSonu/SMSHIVE" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              GitHub
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#10B981] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Dot grid background */}
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        {/* Soft, colorful gradients matching LectureSnap AI */}
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl opacity-60 animate-float pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Creative Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2563EB]/20 bg-[#2563EB]/5 px-4.5 py-1.5 text-xs font-bold text-[#2563EB] mb-8 animate-fade-in uppercase tracking-wider">
            <Sparkles size={12} className="animate-spin-slow" />
            <span>The #1 Alternative to Bulky Paid Gateways</span>
            <span className="rounded-full bg-[#10B981] px-2 py-0.5 text-[9px] text-white">NEW</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.08] mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Turn Your Android into a <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#10B981] bg-clip-text text-transparent animate-gradient font-black">
              Smart SMS Gateway
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-medium animate-fade-in" style={{ animationDelay: '200ms' }}>
            Send bulk SMS, trigger rapid OTP authorizations, and configure robust developer hooks 
            instantly. **Free forever. Unlimited carrier transmissions. Zero message caps.**
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link
              href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#10B981] px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Start for Free <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-8 py-4 text-base font-bold text-foreground hover:bg-accent transition-all"
            >
              <Play size={16} fill="currentColor" /> See how it works
            </a>
          </div>

          {/* Student Friendly Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20 p-6 rounded-2xl bg-card/40 border border-border/50 backdrop-blur-md stagger-children">
            <div className="text-center p-3">
              <p className="text-3xl sm:text-4xl font-display font-extrabold text-[#2563EB]">50K+</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Active Developers</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl sm:text-4xl font-display font-extrabold text-[#6366F1]">2.1M+</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Messages Dispatched</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl sm:text-4xl font-display font-extrabold text-[#10B981]">4.9★</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Console Satisfaction</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl sm:text-4xl font-display font-extrabold text-amber-500">98%</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Sub-Second Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4 leading-tight">
              Powerful Features. Student Friendly.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sans font-medium text-sm">
              We provide professional engineering tools with zero paywalls. Everything is optimized for speed, reliability, and simple copy-paste integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`glass-card-hover p-6 group rounded-2xl relative overflow-hidden border border-border/50 bg-card/30 ${feature.hoverGlow}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${feature.iconBg}`}>
                    {feature.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${feature.badgeColor}`}>
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-24 px-6 bg-card/20 border-y border-border/50 relative overflow-hidden">
        {/* Soft backlights */}
        <div className="absolute right-0 top-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
              Switching from TextBee? Smart Choice.
            </h2>
            <p className="text-muted-foreground font-sans font-medium text-sm">
              Don&apos;t limit your projects with paywalls. Experience the free gateway difference.
            </p>
          </div>

          <div className="glass-card overflow-hidden rounded-2xl border border-border/50 shadow-soft">
            <div className="grid grid-cols-3 bg-muted/40 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white border-b border-border">
              <span>Feature Capabilities</span>
              <span className="text-center text-[#10B981] font-extrabold flex items-center justify-center gap-1">SMSHIVE</span>
              <span className="text-center text-muted-foreground">TextBee</span>
            </div>
            <div className="divide-y divide-border">
              {comparisonRows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 px-6 py-3.5 border-t border-border hover:bg-muted/20 transition-colors font-sans"
                >
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground">{row.feature}</span>
                  <span className="text-xs sm:text-sm text-center font-bold text-white flex items-center justify-center gap-1 select-all">
                    {row.smshive.startsWith('✅') ? (
                      <>
                        <Check size={14} className="text-[#10B981] shrink-0" />
                        <span>{row.smshive.replace('✅ ', '')}</span>
                      </>
                    ) : (
                      row.smshive
                    )}
                  </span>
                  <span className="text-xs sm:text-sm text-center text-muted-foreground/80 font-medium">{row.textbee}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400 mb-3 uppercase tracking-wider">
              <span>Simple & Fast Setup</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight mb-4">
              Up and running in 60 seconds
            </h2>
            <p className="text-muted-foreground font-sans font-medium text-sm">
              No complicated infrastructure setup. Download, configure, and trigger carrier SMS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {steps.map((step) => (
              <div key={step.number} className="relative group">
                <div className="glass-card-hover p-6 h-full rounded-2xl border border-border/50 bg-card/30 flex flex-col justify-between">
                  <span className="text-5xl font-display font-black text-primary/5 absolute top-4 right-4 group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </span>
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-black mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-bold font-display text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-sans font-medium">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Panel */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-12 border border-border/50 shadow-soft">
            {/* Background grids and lights */}
            <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-tight text-white mb-4">
                Your SMS API, optimized.<br />
                Your projects, active.
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto font-sans font-medium text-sm leading-relaxed">
                Join thousands of students and developers who are building high-speed verification 
                gateways with zero subscription charges.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#10B981] px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.03] active:scale-[0.98] transition-all animate-pulse-glow"
              >
                Get Started Free <ArrowRight size={18} />
              </Link>
              <p className="text-[10px] text-muted-foreground/60 mt-3 font-semibold uppercase tracking-wider">No credit card required · Free forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/20 py-12 px-6 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <SmshiveLogoFull className="mb-4" />
              <p className="text-sm text-muted-foreground max-w-sm font-medium leading-relaxed">
                A modern, high-performance open-source SMS gateway companion app. Turn any Android device into an explicit REST gateway in under 60 seconds.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Navigation</h4>
              <div className="space-y-2.5 text-sm font-semibold">
                <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#comparison" className="block text-muted-foreground hover:text-foreground transition-colors">Comparison</a>
                <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
                <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground transition-colors">Web Console</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Open Source</h4>
              <div className="space-y-2.5 text-sm font-semibold">
                <a href="https://github.com/NilambarSonu/SMSHIVE" className="block text-muted-foreground hover:text-foreground transition-colors">
                  GitHub Repository
                </a>
                <a href="mailto:support@smshive.app" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Developer Support
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground font-semibold">
            <p>© {new Date().getFullYear()} SMSHIVE. MIT Licensed Open Source.</p>
            <p className="flex items-center gap-1 mt-2 sm:mt-0">
              Made with <Heart size={10} className="text-rose-500 fill-rose-500" /> for the global developer community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
