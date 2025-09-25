import { ContactForm } from '@/components/contact/contact-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { Metadata, Route } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Aegrid - Start Your Pilot Partnership Journey',
  description: 'Get in touch with Dale Rogers and the Aegrid team to explore pilot partnerships, discuss your asset management challenges, and learn how we can help transform your approach.',
  keywords: [
    'contact Aegrid',
    'pilot partnership',
    'asset management consultation',
    'Dale Rogers',
    'Aegrid Rules',
    'council asset management',
    'service design consultation',
    'Australian councils',
    'asset management transformation',
  ],
  authors: [
    { name: 'Dale Rogers', url: 'https://linkedin.com/in/dale-rogers' },
  ],
  creator: 'Dale Rogers',
  publisher: 'Aegrid',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Contact Aegrid - Start Your Pilot Partnership Journey',
    description: 'Get in touch with Dale Rogers and the Aegrid team to explore pilot partnerships and transform your asset management approach.',
    url: 'https://aegrid.au/contact',
    siteName: 'Aegrid',
    images: [
      {
        url: '/images/Aegrid_HERO.png',
        width: 1200,
        height: 630,
        alt: 'Contact Aegrid for pilot partnerships',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Aegrid - Start Your Pilot Partnership Journey',
    description: 'Get in touch with Dale Rogers and the Aegrid team to explore pilot partnerships and transform your asset management approach.',
    images: ['/images/Aegrid_HERO.png'],
    creator: '@aegrid_au',
  },
  alternates: {
    canonical: 'https://aegrid.au/contact',
  },
};

export default function ContactPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Aegrid',
    description: 'Contact page for Aegrid pilot partnerships and asset management consultation',
    url: 'https://aegrid.au/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'Aegrid',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'dale@aegrid.au',
        contactType: 'Business Inquiry',
        availableLanguage: 'English',
      },
      founder: {
        '@type': 'Person',
        name: 'Dale Rogers',
        jobTitle: 'Founder & Service Designer',
        email: 'dale@aegrid.au',
        url: 'https://linkedin.com/in/dale-rogers',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative isolate">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
          </div>
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Let's Start Your Pilot Partnership Journey
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Ready to transform your asset management approach? Get in touch with Dale Rogers
                and the Aegrid team to explore how we can help you implement the Aegrid Rules
                and build a more intelligent, proactive asset management system.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form and Information */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Tell us about your challenges and how we can help transform your asset management.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Direct Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Direct Contact
                  </CardTitle>
                  <CardDescription>
                    Reach out directly to Dale Rogers for immediate assistance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href="mailto:dale@aegrid.au"
                        className="text-primary hover:underline"
                      >
                        dale@aegrid.au
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href="tel:+61400000000"
                        className="text-primary hover:underline"
                      >
                        +61 400 000 000
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">Australia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Response Times
                  </CardTitle>
                  <CardDescription>
                    We're committed to getting back to you quickly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Email Inquiries</p>
                      <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Pilot Partnership Requests</p>
                      <p className="text-sm text-muted-foreground">Within 4 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Discovery Calls</p>
                      <p className="text-sm text-muted-foreground">Scheduled within 48 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common ways to get started with Aegrid.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/docs/aegrid-rules">
                    <Button variant="outline" className="w-full justify-start">
                      Read the Aegrid Rules Whitepaper
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button variant="outline" className="w-full justify-start">
                      Explore the Demo Showcase
                    </Button>
                  </Link>
                  <a href="mailto:dale@aegrid.au?subject=Pilot%20Partnership%20Inquiry">
                    <Button variant="outline" className="w-full justify-start">
                      Request Pilot Partnership
                    </Button>
                  </a>
                  <a href="mailto:dale@aegrid.au?subject=Discovery%20Call%20Request">
                    <Button variant="outline" className="w-full justify-start">
                      Book a Discovery Call
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20 bg-muted/30">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Quick answers to common questions about working with Aegrid.
            </p>
          </div>
          <div className="space-y-3">
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-medium">
                How quickly can we start a pilot partnership?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Most pilot partnerships can begin within 2-4 weeks of initial contact. We'll work
                with your team to understand your specific needs, configure a tailored prototype,
                and ensure a smooth start to your pilot journey.
              </p>
            </details>
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-medium">
                What information should I include in my inquiry?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Help us understand your challenges by sharing your current asset management approach,
                key pain points, strategic goals, and what success looks like for your organisation.
                The more context you provide, the better we can tailor our response.
              </p>
            </details>
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-medium">
                Do you work with councils outside of Australia?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                While we specialise in Australian councils and their unique requirements, we're
                open to discussing partnerships with international organisations that share our
                vision for intelligent asset management.
              </p>
            </details>
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-medium">
                What's the difference between a pilot and a full implementation?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                A pilot partnership is a low-risk way to explore the Aegrid Rules in a controlled
                environment with a subset of your assets. Full implementation comes after a
                successful pilot, scaling the approach across your entire organisation.
              </p>
            </details>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  Ready to Transform Your Asset Management?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Join the councils already exploring the future of intelligent asset management
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Aegrid. All rights reserved.
                </div>
                <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Link href={'/' as Route}>Home</Link>
                  <Link href={'/docs' as Route}>Docs</Link>
                  <Link href={'/docs/aegrid-rules' as Route}>
                    The Aegrid Rules
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
      </main>
    </>
  );
}
