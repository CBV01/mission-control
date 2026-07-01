'use client';

import * as React from 'react';
// Force Next.js re-bundle to clear fast-refresh import cache
import {
  User, Mail, Phone, Building, Briefcase, Calendar, MessageSquare, ShieldCheck,
  Cpu, Globe, MapPin, Tag, Star, Activity, Link2, AlertTriangle, Lightbulb,
  CheckCircle, ArrowRight, Copy, Check, ExternalLink, Linkedin, Facebook,
  Twitter, Youtube, Send, PhoneCall, ChevronRight, Play, RefreshCw, Search, Zap
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ─── LEAD DATABASE FROM CHECK.MD SPEC ─────────────────────────────────
interface LeadProfile {
  id: string;
  business_name: string;
  category: string;
  rating: number;
  reviews: number;
  website: string;
  email: string;
  phone: string;
  address: string;
  socials: { platform: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'youtube'; url: string }[];
  services: string[];
  research_summary: string;
  observed_facts: string[];
  pain_points: string[];
  opportunities: string[];
  recommended_service: string;
  confidence_score: number;
  // Outreach context
  contact_person: string;
  contact_role: string;
  timeline: { date: string; title: string; desc: string; type: 'discovery' | 'enrichment' | 'crawl' | 'outreach' }[];
}

const mockLeads: LeadProfile[] = [
  {
    id: 'lead-1',
    business_name: 'Bright Smiles Dental',
    category: 'Dentist / Healthcare',
    rating: 4.8,
    reviews: 142,
    website: 'brightsmilesdental.com',
    email: 'contact@brightsmilesdental.com',
    phone: '+1 (555) 382-9901',
    address: '840 Medical Plaza, Austin, TX 78701',
    socials: [
      { platform: 'facebook', url: 'https://facebook.com/brightsmiles' },
      { platform: 'instagram', url: 'https://instagram.com/brightsmiles' },
      { platform: 'linkedin', url: 'https://linkedin.com/company/brightsmiles' },
    ],
    services: [
      'Teeth Whitening',
      'Dental Implants',
      'Invisalign Aligners',
      'Emergency Dental Care',
      'Pediatric Dentistry'
    ],
    research_summary: 'Established family clinic in Austin with premium patient ratings. Website is mobile-friendly but completely static. No online scheduling system is implemented — patients are required to call in during business hours to book or cancel appointments. Additionally, they lack any instant chat capabilities or post-treatment automatic SMS follow-ups.',
    observed_facts: [
      'No online booking / scheduling software present',
      'No live chat or automated intake widget found',
      'Website contact forms do not write back to any known CRM',
      'Social media feeds inactive since February 2026',
      'No structured FAQ or pre-qualification flow'
    ],
    pain_points: [
      'High staff overhead spent manually handling booking calls and reschedules',
      'Potential customer loss (leakage) to competitors offering instant 24/7 web booking',
      'Zero lead capture outside of standard working hours (9 AM - 5 PM)'
    ],
    opportunities: [
      'AI Booking Assistant Integration',
      '24/7 AI Voice Receptionist for phone-in bookings',
      'Google Maps Auto-Reply bot setup',
      'Sms confirmation & follow-up sequence automation'
    ],
    recommended_service: '24/7 AI Scheduler + Receptionist Suite',
    confidence_score: 95,
    contact_person: 'Dr. Evelyn Carter',
    contact_role: 'Owner & Chief Dentist',
    timeline: [
      { date: 'Jun 29, 2026 - 10:14', title: 'Outreach Campaign Initiated', desc: 'Added to sequence "Medical Booking Hook". Step 1 cold email sent.', type: 'outreach' },
      { date: 'Jun 28, 2026 - 15:30', title: 'Website Crawl & Fact Extraction', desc: 'Scrapling crawler completed on 5 core pages. Opportunities extracted.', type: 'crawl' },
      { date: 'Jun 28, 2026 - 11:22', title: 'Contact Person Enriched', desc: 'Serper verified chief dentist email and social links.', type: 'enrichment' },
      { date: 'Jun 27, 2026 - 09:15', title: 'Google Maps Discovery', desc: 'Discovered in "Austin Dentist" search queue. Raw ratings fetched.', type: 'discovery' },
    ]
  },
  {
    id: 'lead-2',
    business_name: 'ProRoof Texas LLC',
    category: 'Roofing Contractor',
    rating: 4.6,
    reviews: 88,
    website: 'prorooftexas.com',
    email: 'info@prorooftexas.com',
    phone: '+1 (214) 555-0192',
    address: '109 Industrial Pkwy, Dallas, TX 75207',
    socials: [
      { platform: 'facebook', url: 'https://facebook.com/prorooftexas' },
      { platform: 'twitter', url: 'https://twitter.com/prorooftexas' },
    ],
    services: [
      'Commercial Roof Repair',
      'Residential Shingle Replacement',
      'Emergency Storm Damage Inspection',
      'Gutter Installation',
    ],
    research_summary: 'Active contractor serving Dallas-Fort Worth. High review counts highlight strong local demand, but the digital presence is weak. Website loading speed is slow, lacks SSL security on several subpages, and has no instant lead capture system. Leads must write in via a standard input form which is not optimized for quote requests.',
    observed_facts: [
      'No online quote estimator or roofing calculator present',
      'Website is not fully responsive on mobile screen sizes',
      'Email capture is a basic unvalidated input field',
      'No automated CRM follow-up setup',
      'Missing active reviews widget on home page'
    ],
    pain_points: [
      'Delayed response times to online quote requests (manual sales check)',
      'High friction in qualifying commercial vs residential prospects',
      'Missing storm-chasing emergency alert capture workflows'
    ],
    opportunities: [
      'Interactive AI Instant Quote Calculator',
      'Mobile optimization + security updates',
      'CRM automation with immediate auto-call dispatch',
      'Reputation management automation'
    ],
    recommended_service: 'AI Instant Quote Estimator & Speed-to-Lead CRM',
    confidence_score: 87,
    contact_person: 'Marcus Vance',
    contact_role: 'Operations Director',
    timeline: [
      { date: 'Jun 29, 2026 - 14:05', title: 'Outreach Opened', desc: 'Prospect opened step 1 email. Interacted with CRM link.', type: 'outreach' },
      { date: 'Jun 29, 2026 - 08:30', title: 'Email Delivered', desc: 'Step 1 of "Contractor Speed-to-Lead" sent.', type: 'outreach' },
      { date: 'Jun 28, 2026 - 17:12', title: 'Deep Audit Completed', desc: 'Website crawled. Speed audits and quote workflows checked.', type: 'crawl' },
      { date: 'Jun 28, 2026 - 10:45', title: 'Discovered in Dallas Roofers', desc: 'Imported from local lead discoverer queue.', type: 'discovery' },
    ]
  },
  {
    id: 'lead-3',
    business_name: 'Lagos Kitchen & Bar',
    category: 'Restaurant & Hospitality',
    rating: 4.4,
    reviews: 210,
    website: 'lagoskitchenbar.com',
    email: 'bookings@lagoskitchenbar.com',
    phone: '+234 803 555 1234',
    address: '22 Adeola Odeku St, Victoria Island, Lagos',
    socials: [
      { platform: 'instagram', url: 'https://instagram.com/lagoskitchenbar' },
      { platform: 'facebook', url: 'https://facebook.com/lagoskitchenbar' },
      { platform: 'youtube', url: 'https://youtube.com/lagoskitchenbar' },
    ],
    services: [
      'Dine-in Reservations',
      'Private Events Catering',
      'Cocktail Bar & Lounge',
      'Weekend Brunch Events',
    ],
    research_summary: 'Premium dining and nightlife spot in Victoria Island. High social media follower count on Instagram, but booking table reservations is highly disjointed. Booking button links directly to a WhatsApp chat thread instead of a reservation engine, creating manual friction for staff and booking backlogs during peak weekend hours.',
    observed_facts: [
      'Reservations handled entirely via manual WhatsApp chat back-and-forth',
      'No online table selector or digital menu reservation checkout',
      'No automated birthday/anniversary marketing sequences',
      'Instagram link in bio goes directly to WhatsApp number API',
      'No customer email database collection setup'
    ],
    pain_points: [
      'High booking drop-off rate due to manual reservation bottlenecks',
      'Staff spending peak hours typing booking availability answers on WhatsApp',
      'No retargeting capability due to lack of consolidated customer records'
    ],
    opportunities: [
      'Automated WhatsApp AI Reservation Bot integration',
      'Table booking dashboard with automated availability slots',
      'VIP club email subscription & loyalty sequence',
      'Google Maps booking button integration'
    ],
    recommended_service: 'WhatsApp Reservation Bot & Booking Suite',
    confidence_score: 92,
    contact_person: 'Adeola Cole',
    contact_role: 'General Manager',
    timeline: [
      { date: 'Jun 30, 2026 - 11:45', title: 'AI Call Scheduled', desc: 'Automatic callback booking confirmed via outreach bot.', type: 'outreach' },
      { date: 'Jun 29, 2026 - 15:20', title: 'Instagram API Enriched', desc: 'Social channels verified. Whatsapp links checked.', type: 'enrichment' },
      { date: 'Jun 29, 2026 - 09:12', title: 'Scrapling crawler completed', desc: 'Scraped menu layout and reservation triggers.', type: 'crawl' },
      { date: 'Jun 28, 2026 - 12:00', title: 'Imported from Lagos Restaurants', desc: 'Discovered via restaurant discovery search.', type: 'discovery' },
    ]
  }
];

export default function LeadsProfilePage() {
  const [selectedLeadId, setSelectedLeadId] = React.useState<string>('lead-1');
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const activeLead = React.useMemo(() => {
    return mockLeads.find((l) => l.id === selectedLeadId) || mockLeads[0];
  }, [selectedLeadId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'discovery':  return <Search className="h-3.5 w-3.5" />;
      case 'enrichment': return <Zap className="h-3.5 w-3.5" />;
      case 'crawl':      return <Globe className="h-3.5 w-3.5" />;
      case 'outreach':   return <Send className="h-3.5 w-3.5" />;
      default:           return <Activity className="h-3.5 w-3.5" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'discovery':  return 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30';
      case 'enrichment': return 'bg-accent-violet/15 text-accent-violet border-accent-violet/30';
      case 'crawl':      return 'bg-status-success/15 text-status-success border-status-success/30';
      case 'outreach':   return 'bg-accent-magenta/15 text-accent-magenta border-accent-magenta/30';
      default:           return 'bg-white/5 text-text-secondary border-white/10';
    }
  };

  return (
    <ClientShell>
      <div className="flex flex-col gap-6 pb-8">
        {/* Page Header with interactive Selector */}
        <PageHeader
          title="Prospect Intelligence Workspace"
          description="Detailed deep-dive, scraped facts, opportunities, and AI recommendations for discovered businesses."
          icon={<User className="h-4 w-4 text-white" />}
          actions={
            <div className="flex items-center gap-2">
              <span className="text-2xs uppercase tracking-wider text-text-tertiary font-medium">Select Prospect:</span>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="bg-bg-elevated text-xs text-text-primary border border-white/[0.08] rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer font-semibold"
              >
                {mockLeads.map((l) => (
                  <option key={l.id} value={l.id}>{l.business_name}</option>
                ))}
              </select>
            </div>
          }
        />

        {/* Top summary dashboard banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card innerGlow className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xs uppercase tracking-widest text-text-tertiary">Business Name</div>
              <div className="font-semibold text-text-primary text-sm mt-0.5 truncate">{activeLead.business_name}</div>
              <div className="text-2xs text-text-tertiary mt-0.5">{activeLead.category}</div>
            </div>
          </Card>

          <Card innerGlow className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-status-success/10 border border-status-success/20 flex items-center justify-center text-status-success">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xs uppercase tracking-widest text-text-tertiary">Discovered Rating</div>
              <div className="font-semibold text-text-primary text-sm mt-0.5 flex items-center gap-1">
                {activeLead.rating} <span className="text-text-tertiary text-xs">/ 5</span>
              </div>
              <div className="text-2xs text-text-tertiary mt-0.5">from {activeLead.reviews} organic reviews</div>
            </div>
          </Card>

          <Card innerGlow className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center text-accent-violet">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xs uppercase tracking-widest text-text-tertiary">Key Contact</div>
              <div className="font-semibold text-text-primary text-sm mt-0.5">{activeLead.contact_person}</div>
              <div className="text-2xs text-text-tertiary mt-0.5">{activeLead.contact_role}</div>
            </div>
          </Card>

          <Card innerGlow className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-status-warning/10 border border-status-warning/20 flex items-center justify-center text-status-warning">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xs uppercase tracking-widest text-text-tertiary">AI Opportunity Score</div>
              <div className="font-semibold text-text-primary text-sm mt-0.5 flex items-center gap-1.5">
                {activeLead.confidence_score}%
                <span className="text-2xs text-status-success font-bold">High Priority</span>
              </div>
              <div className="h-1 w-20 bg-white/[0.06] rounded-full overflow-hidden mt-1">
                <div className="h-full bg-status-warning" style={{ width: `${activeLead.confidence_score}%` }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Core Layout Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Scraping details, contacts, socials, services */}
          <div className="flex flex-col gap-6">
            {/* Contact & Business Info */}
            <Card innerGlow>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-accent-cyan" />
                  <CardTitle>Business Footprint</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-3xs uppercase tracking-wider text-text-tertiary">Website</span>
                    <a
                      href={`https://${activeLead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-primary hover:text-accent-cyan transition-colors flex items-center gap-1.5 font-medium mt-0.5 truncate"
                    >
                      {activeLead.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-3xs uppercase tracking-wider text-text-tertiary">Email</span>
                    <div className="text-text-primary font-mono mt-0.5 truncate">{activeLead.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-3xs uppercase tracking-wider text-text-tertiary">Phone Number</span>
                    <div className="text-text-primary font-mono mt-0.5 truncate">{activeLead.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-3xs uppercase tracking-wider text-text-tertiary">Address</span>
                    <div className="text-text-primary mt-0.5 leading-relaxed">{activeLead.address}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Presence Indicators */}
            <Card innerGlow>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-accent-violet" />
                  <CardTitle>Social Footprint</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {((['linkedin', 'facebook', 'instagram', 'twitter', 'youtube'] as const)).map((platform) => {
                    const social = activeLead.socials.find(s => s.platform === platform);
                    const icons = {
                      linkedin: <Linkedin className="h-4 w-4" />,
                      facebook: <Facebook className="h-4 w-4" />,
                      instagram: <Activity className="h-4 w-4" />, // replacement for lucide instagram
                      twitter: <Twitter className="h-4 w-4" />,
                      youtube: <Youtube className="h-4 w-4" />,
                    };
                    return (
                      <a
                        key={platform}
                        href={social?.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all',
                          social
                            ? 'bg-white/[0.02] border-white/[0.08] text-text-primary hover:bg-white/[0.05] hover:border-white/[0.12] cursor-pointer'
                            : 'bg-white/[0.01] border-white/[0.03] text-text-tertiary pointer-events-none'
                        )}
                        title={social ? `View ${platform}` : `${platform} not found`}
                      >
                        {icons[platform]}
                        <span className="text-[9px] uppercase tracking-wider font-semibold mt-1.5">{platform.slice(0, 3)}</span>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Services Discovered */}
            <Card innerGlow className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-accent-cyan" />
                  <CardTitle>Discovered Offerings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {activeLead.services.map((service) => (
                    <div key={service} className="flex items-center gap-2.5 rounded-lg border border-white/[0.03] bg-white/[0.01] px-3 py-2 text-xs text-text-secondary">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column: Scraped Business Intelligence (observed facts, pain points, opportunities) */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card innerGlow>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-status-warning" />
                  <CardTitle>AI Research Report & Summaries</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text-secondary leading-relaxed bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg">
                  {activeLead.research_summary}
                </p>
              </CardContent>
            </Card>

            {/* Fact Check vs Inferred Pain Points (Direct spec from check.md) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Observed Facts */}
              <Card innerGlow className="border-l border-l-status-success/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-status-success" />
                    <CardTitle>Observed Crawler Facts</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeLead.observed_facts.map((fact) => (
                    <div key={fact} className="flex items-start gap-2.5 bg-white/[0.01] border border-white/[0.03] rounded-lg p-2.5 text-xs text-text-secondary leading-relaxed">
                      <Check className="h-4 w-4 text-status-success flex-shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Likely Inferences (Pain Points) */}
              <Card innerGlow className="border-l border-l-status-danger/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-status-danger" />
                    <CardTitle>Inferred Pain Points</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeLead.pain_points.map((pain) => (
                    <div key={pain} className="flex items-start gap-2.5 bg-white/[0.01] border border-white/[0.03] rounded-lg p-2.5 text-xs text-text-secondary leading-relaxed">
                      <AlertTriangle className="h-4 w-4 text-status-warning flex-shrink-0 mt-0.5" />
                      <span>{pain}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Opportunities Analysis & Outreach hook panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {/* Opportunity list */}
              <Card innerGlow className="flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-status-warning" />
                      <CardTitle>Targeted Opportunities</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {activeLead.opportunities.map((op) => (
                      <div key={op} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] rounded-xl p-3 text-xs font-semibold text-text-primary transition-all">
                        <ArrowRight className="h-4 w-4 text-accent-cyan flex-shrink-0" />
                        <span>{op}</span>
                      </div>
                    ))}
                  </CardContent>
                </div>

                <div className="p-4 border-t border-white/5 bg-accent-violet/[0.01]">
                  <div className="text-3xs uppercase tracking-widest text-text-tertiary">Recommended Action Offering</div>
                  <div className="font-semibold text-text-primary text-sm mt-1">{activeLead.recommended_service}</div>
                </div>
              </Card>

              {/* Hook Generator & Outreach Actions */}
              <Card innerGlow className="flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-accent-violet" />
                    <CardTitle>AI Outreach Assist</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between text-2xs">
                      <span className="text-text-tertiary uppercase tracking-wider">Suggested Outreach Hook</span>
                      <button
                        onClick={() => copyToClipboard(`Hi ${activeLead.contact_person.split(' ')[0]}, saw ${activeLead.business_name} listing for ${activeLead.category}. Noticed you have no instant online booking widget on your website...`, 'hook')}
                        className="text-text-tertiary hover:text-text-primary transition-all flex items-center gap-1"
                      >
                        {copiedText === 'hook' ? <Check className="h-3 w-3 text-status-success" /> : <Copy className="h-3 w-3" />}
                        {copiedText === 'hook' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary italic leading-relaxed">
                      "Hi {activeLead.contact_person.split(' ')[0]}, saw {activeLead.business_name} listing for {activeLead.category}. Noticed you have no instant online booking widget on your website..."
                    </p>
                  </div>

                  {/* Outreach options */}
                  <div className="flex flex-col gap-2">
                    <Button variant="secondary" className="w-full text-xs font-semibold justify-between cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-accent-cyan" />
                        Send Custom AI Outreach Email
                      </span>
                      <ChevronRight className="h-4 w-4 text-text-tertiary" />
                    </Button>
                    <Button variant="secondary" className="w-full text-xs font-semibold justify-between cursor-pointer">
                      <span className="flex items-center gap-2">
                        <PhoneCall className="h-3.5 w-3.5 text-status-success" />
                        Trigger Outreach Cold-Call Dialler
                      </span>
                      <ChevronRight className="h-4 w-4 text-text-tertiary" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Crawler Steps & Timeline Feed */}
        <Card innerGlow>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent-cyan" />
              <CardTitle>Discovery, Enrichment & Crawling Timeline</CardTitle>
            </div>
            <Badge tone="cyan">Audit Complete</Badge>
          </CardHeader>
          <CardContent className="pt-5 pb-6">
            <div className="relative border-l border-white/5 ml-4 pl-6 space-y-6">
              {activeLead.timeline.map((item) => (
                <div key={item.date} className="relative flex flex-col gap-1">
                  {/* Timeline circle badge */}
                  <span className={cn(
                    'absolute -left-[35px] top-0 h-5.5 w-5.5 rounded-full border flex items-center justify-center z-10 bg-bg-surface',
                    getTimelineColor(item.type)
                  )}>
                    {getTimelineIcon(item.type)}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap text-2xs">
                    <span className="font-mono text-text-tertiary">{item.date}</span>
                    <span className={cn('capitalize text-[10px] px-1 rounded font-bold uppercase tracking-wider',
                      item.type === 'discovery' ? 'text-accent-cyan bg-accent-cyan/10' :
                      item.type === 'enrichment' ? 'text-accent-violet bg-accent-violet/10' :
                      item.type === 'crawl' ? 'text-status-success bg-status-success/10' :
                      'text-accent-magenta bg-accent-magenta/10'
                    )}>
                      {item.type}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-text-primary">{item.title}</div>
                  <p className="text-xs text-text-tertiary">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientShell>
  );
}
