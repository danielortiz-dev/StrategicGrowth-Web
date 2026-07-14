import { LayoutTemplate, Cpu, Search, BarChart } from 'lucide-react';

export const servicesData = [
  {
    slug: 'website-infrastructure',
    title: 'Website Infrastructure',
    description: 'High-velocity 3-7 day deployment. Modern websites, landing pages, mobile optimization, conversion-focused structure, analytics, SEO foundation.',
    icon: <LayoutTemplate className="w-6 h-6" />,
    hero: {
       headline: 'High-Performance Website Infrastructure',
       subheadline: 'Engineered for speed, conversion, and architectural authority.'
    },
    problems: [
       { title: 'Low Conversion Rates', desc: 'Traffic bounces due to poor structure.' },
       { title: 'Slow Load Times', desc: 'Losing prospects before the page even loads.' },
       { title: 'Brand Weakness', desc: 'Looking like every other competitor in the market.' }
    ],
    outcomes: [
       'Qualified Lead Generation', 'Instant Trust & Authority', 'Seamless Mobile Experience'
    ],
    deliverables: [
       'High-Velocity 7-Day Sprint', 'Custom Web Architecture', 'Conversion Copywriting', 'Technical SEO Setup', 'Speed Optimization', 'Analytics Integration'
    ],
    process: [
       { step: 'Audit', desc: 'Analyzing current friction points.' },
       { step: 'Wireframe', desc: 'Mapping the conversion journey.' },
       { step: 'Deploy', desc: 'Pushing the high-performance build live.' }
    ],
    faq: [
       { q: 'How long does a build take?', a: 'High-velocity deployment takes 3-7 business days.' },
       { q: 'Do you provide hosting?', a: 'Yes, we provide professional hosting and deployment infrastructure managed under your primary domain.' }
    ]
  },
  {
    slug: 'ai-automation',
    title: 'AI Automation Systems',
    description: 'Automated follow-up, lead routing, CRM integrations, AI workflows, appointment automation, internal systems.',
    icon: <Cpu className="w-6 h-6" />,
    hero: {
       headline: 'Autonomous Business Operations',
       subheadline: 'Replace manual friction with intelligent, learning systems.'
    },
    problems: [
       { title: 'Manual Lead Follow-Up', desc: 'Leads cool down because no one responds in time.' },
       { title: 'Data Silos', desc: 'Information stuck in disconnected tools finding.' },
       { title: 'Operational Bottlenecks', desc: 'Human limits restricting structural scaling.' }
    ],
    outcomes: [
       'Instant Lead Response', 'Zero-Friction Booking', 'Reduced Overhead'
    ],
    deliverables: [
       'Custom AI Agents', 'CRM Integrations', 'Automated Lead Routing', 'Appointment Engine', 'Workflow Automations'
    ],
    process: [
       { step: 'Map', desc: 'Identifying operational bottlenecks.' },
       { step: 'Engineer', desc: 'Building the autonomous workflows.' },
       { step: 'Activate', desc: 'Flipping the switch on intelligent routing.' }
    ],
    faq: [
       { q: 'What tools do you integrate with?', a: 'We work with modern APIs and major CRMs.' },
       { q: 'Will AI replace my team?', a: 'AI removes repetitive tasks, letting your team focus on high-leverage work.' }
    ]
  },
  {
    slug: 'seo-visibility',
    title: 'SEO & Visibility Systems',
    description: 'Local SEO, Google Business optimization, on-page optimization, content structure, analytics.',
    icon: <Search className="w-6 h-6" />,
    hero: {
       headline: 'Search & Visibility Dominance',
       subheadline: 'Commanding local and structural search intent to capture high-value traffic.'
    },
    problems: [
       { title: 'Invisible to Local Search', desc: 'Competitors stealing obvious demand.' },
       { title: 'Poor Content Structure', desc: 'Search engines unable to parse your value.' },
       { title: 'Weak Reputation Signals', desc: 'Failing to establish verified trust.' }
    ],
    outcomes: [
       'Dominant Search Presence', 'High-Intent Traffic', 'Compounding Growth'
    ],
    deliverables: [
       'On-Page Optimization', 'Google Business Setup', 'Local Citation Sync', 'Content Strategy', 'Search Analytics'
    ],
    process: [
       { step: 'Analyze', desc: 'Discovering gaps in search density.' },
       { step: 'Optimize', desc: 'Deploying structural keyword architecture.' },
       { step: 'Maintain', desc: 'Ongoing signal generation and reporting.' }
    ],
    faq: [
       { q: 'How long until I see results?', a: 'SEO compounds structurally over 3-6 months.' },
       { q: 'Do you guarantee an exact rank?', a: 'We guarantee systematic optimization; algorithms determine final placement.' }
    ]
  },
  {
    slug: 'growth-optimization',
    title: 'Growth Optimization',
    description: 'Conversion improvements, funnel refinement, analytics reviews, performance tuning, ongoing management.',
    icon: <BarChart className="w-6 h-6" />,
    hero: {
       headline: 'Continuous System Performance',
       subheadline: 'Data-driven refinement to maximize throughput and minimize leaks.'
    },
    problems: [
       { title: 'Stagnant Conversion Rates', desc: 'Traffic grows but leads remain flat.' },
       { title: 'Blind Spots', desc: 'Making decisions without hard data.' },
       { title: 'System Decay', desc: 'Tech stacks falling behind market standards.' }
    ],
    outcomes: [
       'Maximized Throughput', 'Data-Backed Decisions', 'Predictable Acquisition'
    ],
    deliverables: [
       'A/B Testing Implementation', 'Funnel Analytics', 'Heatmap Review', 'Iterative Tweaks', 'Performance Reporting'
    ],
    process: [
       { step: 'Measure', desc: 'Establishing baseline performance data.' },
       { step: 'Hypothesize', desc: 'Predicting high-impact conversion levers.' },
       { step: 'Test', desc: 'Deploying and measuring adjustments.' }
    ],
    faq: [
       { q: 'Is this an ongoing service?', a: 'Yes, optimization requires continuous iteration.' },
       { q: 'What metrics do you track?', a: 'A.C.R. metrics: Acquisition cost, Conversion rate, Retention length.' }
    ]
  }
];
