import SectionObserver from '@/components/marketing/SectionObserver';
import AdvancedAnalytics from '@/components/marketing/advanced-analytics';
import AnalyticsInitializer from '@/components/marketing/analytics-initializer';
import { EnhancedStatsSection } from '@/components/marketing/enhanced-visual-design';
import FeatureShowcase from '@/components/marketing/feature-showcase';
import HeroSection from '@/components/marketing/hero-section';
// import IndustrySpecificLanding from '@/components/marketing/industry-specific-landing';
// import { default as ROICalculator } from '@/components/marketing/interactive-demo';
// import PersonalizedExperience from '@/components/marketing/personalized-experience';
// import ConversionOptimization from '@/components/marketing/conversion-optimization';
// import EnterpriseFeatures from '@/components/marketing/enterprise-features';
import { MobileCarousel } from '@/components/marketing/mobile-optimized-section';
import type { Metadata, Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title:
    'Aegrid: Asset Management Reimagined | Four Rules That Change Everything',
  description:
    'Built on revolutionary simplicity: Every Asset Has a Purpose, Risk Sets the Rhythm, Respond to the Real World, Operate with Margin. Transform your asset management with intelligent systems that work.',
  keywords: [
    'Aegrid Rules',
    'asset management reimagined',
    'resilient asset management',
    'every asset has a purpose',
    'risk sets the rhythm',
    'respond to the real world',
    'operate with margin',
    'asset intelligence platform',
    'ISO 55000 compliance',
    'energy management',
    'AI optimisation',
    'predictive maintenance',
    'intelligent asset management',
    'Australian asset management',
    'service design led',
  ],
  authors: [
    { name: 'Dale Rogers', url: 'https://linkedin.com/in/dale-rogers' },
  ],
  creator: 'Dale Rogers',
  publisher: 'Aegrid',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title:
      'Aegrid: Asset Management Reimagined | Four Rules That Change Everything',
    description:
      'Built on revolutionary simplicity: Every Asset Has a Purpose, Risk Sets the Rhythm, Respond to the Real World, Operate with Margin. Transform your asset management with intelligent systems that work.',
    url: 'https://aegrid.au',
    siteName: 'Aegrid',
    images: [
      {
        url: '/images/Aegrid_HERO.png',
        width: 1200,
        height: 630,
        alt: 'Aegrid dashboard interface showing ISO 55000 compliance and energy management capabilities',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Aegrid: Asset Management Reimagined | Four Rules That Change Everything',
    description:
      'Built on revolutionary simplicity: Every Asset Has a Purpose, Risk Sets the Rhythm, Respond to the Real World, Operate with Margin. Transform your asset management with intelligent systems that work.',
    images: ['/images/Aegrid_HERO.png'],
    creator: '@aegrid_au',
  },
  alternates: {
    canonical: 'https://aegrid.au',
  },
  category: 'Technology',
  classification: 'Asset Management Software',
  other: {
    'geo.region': 'AU',
    'geo.country': 'Australia',
    'geo.placename': 'Australia',
    'DC.title': 'Aegrid: Intelligent Asset Management for Visionary Councils',
    'DC.creator': 'Dale Rogers',
    'DC.subject': 'Asset Management, Council Technology, Service Design',
    'DC.description':
      "Partner with Aegrid to transform your council's asset management. Service designer-led platform built on revolutionary Aegrid Rules.",
    'DC.publisher': 'Aegrid',
    'DC.contributor': 'Dale Rogers',
    'DC.type': 'Website',
    'DC.format': 'text/html',
    'DC.identifier': 'https://aegrid.au',
    'DC.source': 'https://aegrid.au',
    'DC.language': 'en-AU',
    'DC.coverage': 'Australia',
    'DC.rights': 'Copyright Aegrid',
  },
};

export default async function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Aegrid',
    description: 'Intelligent Asset Management for Visionary Councils',
    url: 'https://aegrid.au',
    logo: 'https://aegrid.au/images/logos/Aegrid.svg',
    founder: {
      '@type': 'Person',
      name: 'Dale Rogers',
      jobTitle: 'Founder & Service Designer',
      url: 'https://linkedin.com/in/dale-rogers',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AU',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'dale@aegrid.au',
      contactType: 'Business Inquiry',
    },
    sameAs: [
      'https://linkedin.com/company/aegrid',
      'https://twitter.com/aegrid_au',
    ],
    offers: {
      '@type': 'Offer',
      name: 'Pilot Partnership',
      description:
        "Explore a pilot partnership to transform your council's asset management",
      category: 'Asset Management Software',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        {/* Initialize Analytics */}
        <AnalyticsInitializer />

        {/* Enhanced Hero Section */}
        <HeroSection />

        {/* Enhanced Feature Showcase */}
        <FeatureShowcase maxVisible={3} variant="grid" />

        {/* Enhanced Stats Section */}
        <EnhancedStatsSection />

        {/* Interactive Product Demo - Phase 3 - Temporarily disabled */}
        {/* <LazySection className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <InteractiveProductDemo />
        </LazySection> */}

        {/* Industry-Specific Landing - Phase 3 - Temporarily disabled */}
        {/* <LazySection className="mx-auto max-w-6xl px-6 py-16 sm:py-20 bg-muted/30">
          <IndustrySpecificLanding />
        </LazySection> */}

        {/* Personalized Experience - Phase 3 - Temporarily disabled */}
        {/* <LazySection className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <PersonalizedExperience />
        </LazySection> */}

        {/* Conversion Optimization - Phase 3 - Temporarily disabled */}
        {/* <LazySection className="mx-auto max-w-6xl px-6 py-16 sm:py-20 bg-muted/30">
          <ConversionOptimization />
        </LazySection> */}

        {/* Enterprise Features - Phase 3 - Temporarily disabled */}
        {/* <LazySection className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <EnterpriseFeatures />
        </LazySection> */}

        {/* Founder & Aegrid Rules */}
        <section
          id="founder"
          className="mx-auto max-w-6xl px-6 py-16 sm:py-20"
          aria-labelledby="founder-heading"
        >
          <div className="mb-10 max-w-3xl">
            <h2
              id="founder-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Built by Someone Who&apos;s Lived the Problem
            </h2>
            <p className="mt-3 text-muted-foreground">
              Meet Dale Rogers, the founder behind Aegrid&apos;s revolutionary
              approach to asset management.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  From the Trenches to a New Philosophy
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Dale Rogers brings over 30 years of experience in service
                  design and asset management. Having worked directly with
                  councils across Australia, Dale witnessed firsthand the
                  challenges of reactive maintenance and fragmented systems.
                  This experience led to the development of the Aegrid Rules –
                  four fundamental principles that transform how organisations
                  approach asset management.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-base font-semibold">The Aegrid Rules</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </span>
                    <div>
                      <h5 className="font-medium">Every Asset Has a Purpose</h5>
                      <p className="text-sm text-muted-foreground">
                        Structure assets around what they do, not just where
                        they are.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </span>
                    <div>
                      <h5 className="font-medium">Risk Sets the Rhythm</h5>
                      <p className="text-sm text-muted-foreground">
                        Let consequence × likelihood determine cadence, scope,
                        and budget allocation.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </span>
                    <div>
                      <h5 className="font-medium">Respond to the Real World</h5>
                      <p className="text-sm text-muted-foreground">
                        Treat plans as hypotheses and roll with the punches and
                        reallocate resources when risk signals change.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      4
                    </span>
                    <div>
                      <h5 className="font-medium">Operate with Margin</h5>
                      <p className="text-sm text-muted-foreground">
                        Build practical slack, create room to recover that
                        creates tomorrow&apos;s resilience from today&apos;s
                        actions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <a
                  href="/docs/whitepaper"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
                >
                  Read the Whitepaper: The Aegrid Rules - Resilient Asset
                  Management for Critical Control →
                </a>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/images/dale-portrait.png"
                alt="Dale Rogers, Founder of Aegrid, professional headshot"
                width={400}
                height={500}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Pilot Partnership Journey */}
        <section
          id="how"
          className="mx-auto max-w-6xl px-6 py-16 sm:py-20"
          aria-labelledby="pilot-heading"
        >
          <div className="mb-10 max-w-3xl">
            <h2
              id="pilot-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Our Pilot Partnership Journey
            </h2>
            <p className="mt-3 text-muted-foreground">
              We&apos;ll work with you every step of the way to ensure a
              successful pilot and a smooth transition to a new way of working.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold">
                  1) Discovery & Goal Setting
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;ll start by understanding your unique challenges and
                  goals. Together, we&apos;ll define what success looks like for
                  your pilot.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold">
                  2) Rapid Prototyping & Configuration
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;ll quickly configure a prototype of Aegrid that&apos;s
                  tailored to your specific needs. You&apos;ll get to see your
                  data in a new light and experience the power of the Aegrid
                  Rules firsthand.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold">3) Pilot & Iterate</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;ll work closely with your team to pilot Aegrid in a
                  real-world setting. We&apos;ll gather feedback, iterate on the
                  solution, and ensure that it&apos;s delivering real value.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold">4) Scale & Sustain</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once the pilot is complete, we&apos;ll help you scale the
                  solution across your organisation and embed a new culture of
                  proactive, intelligent asset management.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Let&apos;s Start Your Pilot Journey
                </Link>
              </div>
            </div>
            <MobileCarousel
              items={[
                {
                  id: 'pilot-1',
                  title: 'Pilot Planning',
                  description: 'Strategic assessment and roadmap development',
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  ),
                  badge: 'Phase 1',
                },
                {
                  id: 'pilot-2',
                  title: 'Implementation',
                  description: 'Deploy and configure your pilot solution',
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ),
                  badge: 'Phase 2',
                },
                {
                  id: 'pilot-3',
                  title: 'Scale & Sustain',
                  description: 'Expand across your organisation',
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  ),
                  badge: 'Phase 3',
                },
              ]}
            />
          </div>
        </section>

        {/* Value for every stakeholder */}
        <section
          id="personas"
          className="mx-auto max-w-6xl px-6 py-16 sm:py-20"
          aria-labelledby="stakeholder-heading"
        >
          <div className="mb-10 max-w-3xl">
            <h2
              id="stakeholder-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Value for Every Stakeholder
            </h2>
            <p className="mt-3 text-muted-foreground">
              From the front line to the executive suite, Aegrid delivers
              tangible benefits that align with your organisation&apos;s
              strategic objectives and ISO 55000 compliance requirements.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ValueCard
              role="For Executives"
              bullets={[
                'Strategic asset management with ISO 55000 compliance framework',
                'Energy consumption analysis and cost optimisation',
                'AI-powered performance insights and ROI tracking',
                'Executive dashboard with $AUD budget views and KPI monitoring',
              ]}
            />
            <ValueCard
              role="For Managers"
              bullets={[
                'Optimise resource allocation with data-driven decision making',
                'Risk-based maintenance planning and scheduling',
                'Energy efficiency monitoring and sustainability reporting',
                'Compliance status tracking and audit preparation',
              ]}
            />
            <ValueCard
              role="For Supervisors"
              bullets={[
                'Work order assignment and progress tracking',
                'Real-time asset condition monitoring',
                'Mobile field operations with GPS and photo capture',
                'Performance metrics and SLA compliance monitoring',
              ]}
            />
            <ValueCard
              role="For Crew Members"
              bullets={[
                'Mobile-optimised interface for field operations',
                'Offline inspection capabilities with GPS integration',
                'Simplified work order management and completion',
                'Safety requirements and work instructions access',
              ]}
            />
            <ValueCard
              role="For Citizens"
              bullets={[
                'Community portal for issue reporting and tracking',
                'Transparent service delivery updates',
                'Real-time request status and resolution tracking',
                'Improved service reliability and response times',
              ]}
            />
            <ValueCard
              role="For Administrators"
              bullets={[
                'Single Sign-On (SSO) and Role-Based Access Control (RBAC)',
                'Comprehensive audit logging and compliance monitoring',
                'System configuration and user management',
                'Data import/export and integration capabilities',
              ]}
            />
          </div>
        </section>

        {/* Pilot-Focused FAQ */}
        <section
          id="faqs"
          className="mx-auto max-w-6xl px-6 py-16 sm:py-20"
          aria-labelledby="faq-heading"
        >
          <div className="mb-10 max-w-3xl">
            <h2
              id="faq-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Your Pilot Partnership Questions, Answered
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to know about partnering with Aegrid for a
              pilot project.
            </p>
          </div>
          <div className="space-y-3">
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-medium">
                What are the benefits of a pilot partnership?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                A pilot partnership gives you early access to innovative asset
                management approaches, reduced risk through phased
                implementation, direct input into product development, and the
                opportunity to be a leader in your sector. You&apos;ll also
                benefit from our expertise in service design and change
                management.
              </p>
            </details>
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-medium">
                What&apos;s the time commitment for a pilot?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Most pilots run for 3-6 months, with initial setup taking 2-4
                weeks. We work around your schedule and can adapt the timeline
                to fit your operational requirements. The key is finding the
                right balance between thorough testing and minimal disruption to
                your current operations.
              </p>
            </details>
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-medium">
                What happens after the pilot?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                After a successful pilot, we&apos;ll work with you to develop a
                full implementation plan. This includes scaling across your
                organisation, training your team, and establishing ongoing
                support. Pilot partners receive preferential pricing and
                priority support for full implementation.
              </p>
            </details>
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-medium">
                How much does a pilot cost?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Pilot partnerships are designed to be low-risk investments. We
                offer flexible pricing models that can include reduced rates,
                success-based pricing, or even no-cost pilots for the right
                partners. The goal is mutual success, not immediate revenue.
              </p>
            </details>
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-medium">
                What if the pilot doesn&apos;t work for us?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                That&apos;s exactly why we do pilots! If the pilot doesn&apos;t
                deliver the expected value, we&apos;ll work together to
                understand why and either adjust the approach or part ways
                amicably. There are no long-term commitments or penalties for
                ending a pilot early.
              </p>
            </details>
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-medium">
                How do we get started with a pilot?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Start by reaching out to discuss your specific challenges and
                goals. We&apos;ll schedule a discovery call to understand your
                needs, then develop a tailored pilot proposal. The entire
                process typically takes 1-2 weeks from initial contact to pilot
                kickoff.
              </p>
            </details>
          </div>
        </section>

        {/* Security & Compliance */}
        <section
          id="security-compliance"
          className="mx-auto max-w-6xl px-6 py-16 sm:py-20"
          aria-labelledby="security-heading"
        >
          <div className="mb-10 max-w-3xl">
            <h2
              id="security-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Enterprise Security & Compliance
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built on Australian standards with enterprise-grade security and
              compliance built-in from day one.
            </p>
          </div>

          {/* Security Badges */}
          <div className="mb-12 flex flex-wrap items-center justify-center gap-6 opacity-80">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Essential 8 Compliant
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                ISO 27001 Ready
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Australian Sovereign
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                SOC 2 Ready
              </span>
            </div>
          </div>

          {/* Security Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-6 rounded-lg border border-border bg-background">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Essential 8 Aligned
              </h3>
              <p className="text-sm text-muted-foreground">
                Level 3 compliance across all Australian Cyber Security Centre
                strategies.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-border bg-background">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Enterprise Security
              </h3>
              <p className="text-sm text-muted-foreground">
                MFA, RBAC, AES-256 encryption, and comprehensive audit logging.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-border bg-background">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Australian Sovereign
              </h3>
              <p className="text-sm text-muted-foreground">
                Data sovereignty guarantees and compliance with Australian
                privacy laws.
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  100%
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Essential 8 Compliance
              </h3>
              <p className="text-sm text-muted-foreground">
                Level 3 (Fully Aligned) across all eight strategies
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  24/7
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Security Monitoring
              </h3>
              <p className="text-sm text-muted-foreground">
                Continuous monitoring and automated threat detection
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  AES-256
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Data Encryption</h3>
              <p className="text-sm text-muted-foreground">
                Military-grade encryption for data at rest and in transit
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ISO
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Standards Compliant
              </h3>
              <p className="text-sm text-muted-foreground">
                ISO 27001/27002 certified security management
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  Aegrid: Asset Management Reimagined
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Built on revolutionary simplicity: Four Rules That Change
                  Everything. Transform your asset management with intelligent
                  systems that work.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Aegrid. All rights reserved.
                </div>
                <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Link href={'/contact' as Route}>Contact</Link>
                  <Link href={'/docs' as Route}>Docs</Link>
                  <Link href={'/docs/aegrid-rules' as Route}>
                    The Aegrid Rules
                  </Link>
                  <Link href={'/docs/releases/changelog' as Route}>
                    Changelog
                  </Link>
                  <a
                    href="https://www.linkedin.com/company/aegrid/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                  <a href="mailto:support@aegrid.au">Support</a>
                </nav>
              </div>
            </div>
          </div>
        </footer>
        <SectionObserver
          sectionIds={[
            'hero',
            'core-features',
            'interactive-demos',
            'founder',
            'how',
            'personas',
            'faqs',
            'security-compliance',
            'security-commitment',
            'enterprise-credentials',
          ]}
        />

        {/* Advanced Analytics - Phase 3 */}
        <AdvancedAnalytics />
      </main>
    </>
  );
}

function ValueCard({ role, bullets }: { role: string; bullets: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
      <h3 className="text-base font-semibold">{role}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {bullets.map(b => (
          <li key={b} className="flex items-start gap-2">
            <span aria-hidden>•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
