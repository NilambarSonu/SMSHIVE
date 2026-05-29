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
  X,
  MessageSquare,
  Infinity,
  Users,
  Clock,
  BarChart3,
  ExternalLink,
  Mail,
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
    icon: <Infinity size={24} />,
    title: 'Unlimited Everything',
    description: 'No message caps, no device limits, no feature gates. Every user gets everything, free forever.',
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Multi-Device Gateway',
    description: 'Connect unlimited Android devices. Dual SIM support with load balancing across all devices.',
  },
  {
    icon: <Code2 size={24} />,
    title: 'Developer-First API',
    description: 'RESTful API with Swagger docs, multi-language code snippets, and scoped API keys.',
  },
  {
    icon: <Webhook size={24} />,
    title: 'Real-time Webhooks',
    description: 'HMAC-signed webhooks for every event. Delivery tracking, auto-retry, and failure alerts.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Self-Hosted & Secure',
    description: 'Deploy on your own server with Docker. Your data stays on your infrastructure.',
  },
  {
    icon: <Globe size={24} />,
    title: 'Global Reach',
    description: 'Send SMS to any country. Full inbox for received messages with conversation threading.',
  },
];

const comparisonRows = [
  { feature: 'Messages per day', smshive: 'Unlimited', textbee: '50 (free) / 500 (paid)' },
  { feature: 'Messages per month', smshive: 'Unlimited', textbee: '300 (free) / 5000 (paid)' },
  { feature: 'Devices', smshive: 'Unlimited', textbee: '1 (free) / 5 (paid)' },
  { feature: 'API Rate Limit', smshive: '1000 req/s', textbee: '60 req/s' },
  { feature: 'Webhooks', smshive: 'Unlimited + HMAC', textbee: 'Limited' },
  { feature: 'Templates', smshive: 'Unlimited', textbee: 'None' },
  { feature: 'Scheduled SMS', smshive: '✅ + Recurring Cron', textbee: 'Basic' },
  { feature: 'Bulk SMS + CSV', smshive: '✅ + Variables', textbee: 'Basic CSV' },
  { feature: 'Team Members', smshive: '✅ Role-based', textbee: 'None' },
  { feature: 'Contact Book', smshive: '✅ Full CRM', textbee: 'None' },
  { feature: 'Analytics', smshive: '✅ Charts + Export', textbee: 'Basic' },
  { feature: 'Price', smshive: 'Free Forever', textbee: '$10/mo+' },
];

const steps = [
  {
    number: '01',
    title: 'Install the Android App',
    description: 'Download the SMSHIVE APK on any Android phone. Grant SMS permissions and enter your API key.',
  },
  {
    number: '02',
    title: 'Connect to Dashboard',
    description: 'Your phone instantly appears as a gateway device. Configure SIM, naming, and rate limits.',
  },
  {
    number: '03',
    title: 'Start Sending',
    description: 'Send SMS via the dashboard, API, or webhooks. Track delivery in real-time with full analytics.',
  },
];

export default function LandingPage() {
  const messageCount = useCounter(1284739, 3000);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <SmshiveLogoFull />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#comparison" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="https://github.com/yourusername/smshive" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ExternalLink size={14} /> GitHub
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Dot grid background */}
        <div className="absolute inset-0 dot-grid opacity-40" />
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8 animate-fade-in">
            <Zap size={14} />
            <span>100% Free & Open Source · No Paywalls</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Turn your Android into a{' '}
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#8B83FF] to-[#00D4AA] bg-clip-text text-transparent animate-gradient">
              professional SMS gateway
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Free. Forever. No limits. Send unlimited SMS via REST API, manage multiple devices, 
            track delivery in real-time — all from a beautiful dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-8 py-4 text-base font-bold text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <a
              href="https://github.com/yourusername/smshive"
              className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-8 py-4 text-base font-medium hover:bg-accent transition-colors"
            >
              <ExternalLink size={18} /> Star on GitHub
            </a>
          </div>

          {/* Live Stats Ticker */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-sm px-6 py-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground font-mono">{messageCount.toLocaleString()}</span> messages sent today globally
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature that competitors charge for — we give away free. No hidden costs, no usage limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card-hover p-6 group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="py-24 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
              SMSHIVE vs TextBee
            </h2>
            <p className="text-muted-foreground">
              See why developers are switching to SMSHIVE.
            </p>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Feature</span>
              <span className="text-center text-primary">SMSHIVE</span>
              <span className="text-center">TextBee</span>
            </div>
            {comparisonRows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-3 px-6 py-3.5 border-t border-border hover:bg-muted/20 transition-colors"
              >
                <span className="text-sm">{row.feature}</span>
                <span className="text-sm text-center font-medium text-success flex items-center justify-center gap-1">
                  {row.smshive.startsWith('✅') ? (
                    <>
                      <Check size={14} className="text-success" />
                      {row.smshive.replace('✅ ', '')}
                    </>
                  ) : (
                    row.smshive
                  )}
                </span>
                <span className="text-sm text-center text-muted-foreground">{row.textbee}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
              Up and running in 3 minutes
            </h2>
            <p className="text-muted-foreground">
              It really is this simple. No infrastructure to manage, no API keys to buy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {steps.map((step) => (
              <div key={step.number} className="relative group">
                <div className="glass-card-hover p-6 h-full">
                  <span className="text-5xl font-display font-extrabold text-primary/10 absolute top-4 right-4">
                    {step.number}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
                Ready to build your SMS gateway?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of developers who use SMSHIVE to power their messaging. 
                Free forever, no credit card required.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5B54E8] px-8 py-4 text-base font-bold text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                Get Started Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <SmshiveLogoFull className="mb-4" />
              <p className="text-sm text-muted-foreground max-w-sm">
                The most powerful free SMS gateway. Self-hostable, open source, and built for developers.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#comparison" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Comparison</a>
                <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
                <Link href="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Community</h4>
              <div className="space-y-2">
                <a href="https://github.com/yourusername/smshive" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ExternalLink size={14} /> GitHub
                </a>
                <a href="mailto:support@smshive.app" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail size={14} /> Support
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} SMSHIVE. Free & Open Source.</p>
            <p>Made with 💜 for the developer community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
