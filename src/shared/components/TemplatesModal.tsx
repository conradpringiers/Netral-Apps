/**
 * Templates Modal
 * Gallery of pre-made templates for Block, Deck and Doc
 */

import { useState } from 'react';
import { LayoutTemplate, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  content: string;
}

interface TemplatesModalProps {
  mode: 'block' | 'deck' | 'doc';
  onSelect: (content: string) => void;
}

// ─── Block templates ────────────────────────────────────────────────────

const blockTemplates: Template[] = [
  {
    id: 'landing',
    name: 'SaaS Landing',
    description: 'Modern SaaS landing page with hero, pricing and FAQ',
    preview: '🚀',
    content: `--- Nova — Modern SaaS Platform
Theme[Modern]
Logo[Nova]
Navbar[
{Features;#features}
{Pricing;#pricing}
{FAQ;#faq}
{Contact;#contact}
]
Header[BigText;Build software your users will love;Nova gives your team the analytics, automation and speed to ship faster than ever.;https://picsum.photos/1200/600;#features]

-- Features
Bigtitle[Everything you need to scale]

Feature[
{⚡;Real-time;Updates flow instantly across your whole workspace}
{📊;Insights;Beautiful dashboards with zero configuration}
{🔒;Secure;Enterprise-grade encryption on every plan}
{🔌;Integrations;Connect 100+ tools in one click}
]

Stats[
{10K+;Happy teams}
{99.9%;Uptime}
{4.9/5;User rating}
]

-- Pricing
Bigtitle[Simple, fair pricing]

Pricing[
{Starter;$0/mo;1 project, Community support, 1GB storage, Basic analytics}
{Pro;$29/mo;Unlimited projects, Priority support, 100GB storage, Advanced analytics}
{Enterprise;Custom;Dedicated manager, SSO/SAML, Unlimited storage, Custom SLA}
]

-- FAQ
FAQ[
{Can I try it for free?;Yes — the Starter plan is free forever and requires no credit card.}
{Do you offer discounts for startups?;Absolutely, early-stage startups get 50% off the Pro plan for 12 months.}
{Can I cancel anytime?;Of course. Your data is exportable at any time, and there are no cancellation fees.}
]

CTA[Ready to get started?;Join 10,000+ teams building with Nova;Start Free Trial;#signup]
`,
  },
  {
    id: 'portfolio',
    name: 'Creative Portfolio',
    description: 'Personal portfolio with projects and testimonials',
    preview: '👤',
    content: `--- Léa Moreau — Product Designer
Theme[Minimal]
Logo[LM]
Navbar[
{Work;#work}
{About;#about}
{Contact;#contact}
]
Header[SplitImage;Designing calm, human products;I help startups turn complex ideas into interfaces people love to use.;https://picsum.photos/800/600;#work]

-- Work
Bigtitle[Selected projects]

Gallery[
{https://picsum.photos/500/400?1;Mobile banking app}
{https://picsum.photos/500/400?2;E-commerce redesign}
{https://picsum.photos/500/400?3;Health dashboard}
]

-- About
Column[
{I'm a product designer with 8+ years of experience across fintech, e-commerce and health. I care about accessibility, clarity and small details that make products feel effortless.}
{My process is collaborative: I prototype early, test with real users, and ship iteratively. I've led design systems used by teams of 50+ engineers.}
]

quote[Design is not just what it looks like, design is how it works. — Steve Jobs]

-- Testimonials
Testimonial[
{Claire Dupont;Head of Product, Finly;Léa transformed our app — engagement doubled in a quarter.;https://i.pravatar.cc/100?img=5}
{Marco Rossi;CEO, Shoply;The most thoughtful designer we've ever worked with.;https://i.pravatar.cc/100?img=8}
]

CTA[Let's work together;Have a project in mind? I'd love to hear about it.;Get in Touch;mailto:hello@example.com]
`,
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Warm restaurant page with menu and gallery',
    preview: '🍽️',
    content: `--- La Table — Bistrot & Wine Bar
Theme[Sunset]
Logo[La Table]
Navbar[
{Menu;#menu}
{Story;#story}
{Visit;#visit}
]
Header[Classic;Seasonal French cuisine;An intimate bistro in the heart of the city, serving market-fresh dishes and natural wines.;https://picsum.photos/1200/600;#menu]

-- Menu
Bigtitle[From the kitchen]

Feature[
{🥗;Starters;Burrata, roasted beets & pistachio}
{🍝;Mains;Hand-cut pasta, slow-braised lamb}
{🍰;Desserts;Dark chocolate fondant, crème brûlée}
{🍷;Wine;Natural wines from small producers}
]

Gallery[
{https://picsum.photos/500/400?5;The dining room}
{https://picsum.photos/500/400?6;Signature dish}
{https://picsum.photos/500/400?7;The bar}
]

-- Visit
Column[
{**Opening hours**

Tuesday — Sunday
6pm — 11pm}

{**Find us**

12 Rue des Fleurs, Paris
+33 1 23 45 67 89
bookings@latable.example}
]

CTA[Book a table;Reservations recommended for weekends;Reserve Now;#visit]
`,
  },
  {
    id: 'agency',
    name: 'Marketing Agency',
    description: 'Agency site with services, team and process',
    preview: '📈',
    content: `--- Studio North — Growth Agency
Theme[Ocean]
Logo[Studio North]
Navbar[
{Services;#services}
{Process;#process}
{Team;#team}
{Contact;#contact}
]
Header[BigText;We grow brands that matter;A full-service growth agency blending strategy, creative and data to move the metrics that count.;https://picsum.photos/1200/600;#services]

-- Services
Feature[
{🎯;Brand Strategy;Positioning, messaging and identity}
{📣;Paid Media;Performance campaigns across every channel}
{✍️;Content;Editorial, social and video production}
{📊;Analytics;Dashboards and conversion optimization}
]

Stats[
{120+;Clients served}
{$48M;Revenue generated}
{4.9/5;Client satisfaction}
]

-- Process
Steps[
{1;Discover;We audit your brand, market and funnel}
{2;Strategize;We build a data-driven growth roadmap}
{3;Execute;We launch campaigns and creative at speed}
{4;Optimize;We iterate weekly on what's working}
]

-- Team
Team[
{Anna Weber;Founder & CEO;https://i.pravatar.cc/150?img=9;10 years scaling consumer brands}
{David Kim;Head of Growth;https://i.pravatar.cc/150?img=11;Performance marketer and analyst}
{Emma Laurent;Creative Director;https://i.pravatar.cc/150?img=3;Award-winning brand designer}
]

CTA[Let's grow together;Book a free 30-minute strategy call;Book a Call;#contact]
`,
  },
  {
    id: 'event',
    name: 'Event / Launch',
    description: 'Event landing page with countdown and schedule',
    preview: '🎟️',
    content: `--- PixelConf 2026
Theme[Neon]
Logo[PixelConf]
Navbar[
{Speakers;#speakers}
{Schedule;#schedule}
{Tickets;#tickets}
]
Header[BigText;The design & code conference;Two days, 40 speakers and one unforgettable community. Join us in Berlin.;https://picsum.photos/1200/600;#tickets]

Countdown[Conference starts;2026-06-10;Doors open at 9:00 AM]

-- Speakers
Feature[
{🎤;Keynotes;Visionaries shaping the future of the web}
{🧠;Workshops;Hands-on sessions with industry experts}
{🤝;Networking;Meet 1,500 creators and makers}
]

-- Schedule
Timeline[
{Day 1;Talks;Keynotes and deep-dive technical sessions}
{Day 1;Evening;Rooftop networking party}
{Day 2;Workshops;Small-group, hands-on learning}
{Day 2;Closing;Lightning talks and community showcase}
]

Stats[
{40;Speakers}
{1,500;Attendees}
{2;Days}
]

CTA[Get your ticket;Early-bird pricing ends soon;Buy Tickets;#tickets]
`,
  },
  {
    id: 'docs',
    name: 'Documentation',
    description: 'Clean documentation site with FAQ and callouts',
    preview: '📚',
    content: `--- Acme API — Documentation
Theme[Solarized]
Logo[Acme Docs]
Navbar[
{Quickstart;#quickstart}
{Guides;#guides}
{FAQ;#faq}
]

-- Quickstart
Bigtitle[Get started in minutes]

Def[This guide assumes you have Node.js 18+ installed on your machine.]

Column[
{**Install the SDK**

1. Run \`npm install acme-sdk\`
2. Import the client
3. Add your API key}
{**Make your first call**

1. Create a client instance
2. Call \`client.users.list()\`
3. Handle the response}
]

Warn[Never commit your API key to version control. Use environment variables instead.]

-- Guides
Feature[
{🔑;Authentication;API keys, scopes and webhooks}
{📦;Resources;Users, billing and events}
{🚦;Rate limits;Understanding quotas and retries}
]

-- FAQ
FAQ[
{What is the rate limit?;The free tier allows 1,000 requests per minute.}
{Do you have a sandbox?;Yes — every account includes a sandbox environment.}
{How do I get support?;Open an issue on GitHub or email support@acme.example.}
]

CTA[Read the full reference;Browse every endpoint and parameter;View API Reference;#guides]
`,
  },
];

// ─── Deck templates ─────────────────────────────────────────────────────

const deckTemplates: Template[] = [
  {
    id: 'pitch',
    name: 'Startup Pitch',
    description: 'Investor pitch deck with traction and ask',
    preview: '💼',
    content: `--- Startup Pitch Deck
Theme[Modern]
Logo[Looply]

-- The Problem
Bigtitle[A $50B problem]

Businesses waste hours every week on manual, repetitive workflows that could be automated.

Stats[
{72%;of time wasted}
{$50B;market size}
{10x;growth potential}
]

-- Our Solution
Bigtitle[Meet Looply]

Looply automates your workflows so your team can focus on work that actually matters.

Feature[
{🤖;AI-powered;Smart automation that learns}
{⚡;Fast;10x faster workflows}
{💰;Cost-saving;50% lower operating costs}
]

-- Traction
Timeline[
{2023;Launch;Beta with 100 paying customers}
{2024;Growth;10,000 customers and $2M ARR}
{2025;Scale;Expanding to 5 new markets}
]

-- Competition
Comparison[
{Legacy tools;❌ Slow setup, ❌ Rigid, ❌ Expensive, ❌ Poor support}
{Looply;✅ Setup in minutes, ✅ Flexible, ✅ Affordable, ✅ 24/7 support}
]

-- The Ask
Bigtitle[Join our journey]

We're raising $5M to accelerate growth and double the team.

Agenda[
{1;Product;R&D and new features}
{2;Marketing;Demand generation and sales}
{3;Team;Hiring across engineering and GTM}
]

Speaker[The best way to predict the future is to invent it.;Alan Kay;Computer Scientist;https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Alan_Kay_%282008%29.jpg/440px-Alan_Kay_%282008%29.jpg]
`,
  },
  {
    id: 'lecture',
    name: 'Educational Lecture',
    description: 'Clean lecture slides with concepts and code',
    preview: '🎓',
    content: `--- Introduction to Programming
Theme[Minimal]
Logo[CS101]

-- What is Programming?
Bigtitle[Talking to computers]

Programming is the art of giving precise instructions to a computer.

Def[A program is a set of instructions that tells a computer exactly what to do.]

-- Core Concepts
List[
{📦;Variables — store data}
{🔁;Loops — repeat actions}
{❓;Conditions — make decisions}
{🧩;Functions — reuse code}
]

-- Example: A Function
Code[javascript;
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));
]

-- Why It Matters
Feature[
{💡;Problem solving;Break big problems into steps}
{🧠;Logic;Think clearly and precisely}
{🌍;Impact;Build tools used by millions}
]

quote[Everyone should learn to program, because it teaches you how to think. — Steve Jobs]

-- Key Takeaways
List[
{✅;Practice a little every day}
{📚;Read code written by others}
{🤝;Build small projects to learn}
]
`,
  },
  {
    id: 'report',
    name: 'Business Report',
    description: 'Quarterly report with stats and outlook',
    preview: '📊',
    content: `--- Q4 2025 Report
Theme[Ocean]
Logo[Northwind]

-- Executive Summary
Bigtitle[Record-breaking quarter]

We delivered our strongest quarter yet, with 45% year-over-year growth.

Stats[
{$12M;Revenue}
{45%;YoY growth}
{98%;Customer satisfaction}
]

-- Key Achievements
Timeline[
{Oct;Launch;Released v3.0 with AI features}
{Nov;Partnership;Signed a Fortune 500 deal}
{Dec;Expansion;Opened offices in 3 cities}
]

-- Challenges & Solutions
Column[
{**Challenges**

- Supply chain delays
- Talent competition
- Market uncertainty}

{**Solutions**

- Diversified suppliers
- Stronger employer brand
- Focused on innovation}
]

-- 2026 Outlook
Feature[
{🎯;$20M;Revenue target}
{👥;100+;New hires planned}
{🌍;5;New markets}
]

Badge[CONFIDENTIAL]

-- Thank You
Bigtitle[Questions?]

Contact the leadership team for the full report.
`,
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Interactive workshop with exercises',
    preview: '🛠',
    content: `--- Design Thinking Workshop
Theme[Sunset]
Logo[Workshop]

-- Welcome
Bigtitle[Let's create together]

This hands-on workshop teaches the fundamentals of design thinking.

Warn[Have pen and paper ready — you'll be sketching!]

-- The 5 Steps
List[
{1️⃣;Empathize — understand your users}
{2️⃣;Define — frame the problem}
{3️⃣;Ideate — generate ideas}
{4️⃣;Prototype — build solutions}
{5️⃣;Test — validate with users}
]

-- Exercise 1: Empathy Map
Column[
{**What they SAY**

Listen to user interviews and capture quotes.

**What they THINK**

Infer underlying motivations and concerns.}

{**What they DO**

Observe behaviours and actions.

**What they FEEL**

Identify emotions and pain points.}
]

-- Exercise 2: Ideate
Def[There are no bad ideas in brainstorming — quantity over quality!]

Bigtitle[Brainstorm time!]

Take 10 minutes to generate as many ideas as possible for your problem.

-- Wrap Up
Feature[
{📧;Follow up;Check your inbox for resources}
{💬;Feedback;Share your thoughts with us}
{🎓;Certificate;Complete the survey to claim yours}
]

quote[Design is not just what it looks like, design is how it works. — Steve Jobs]
`,
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Campaign pitch with goals and creative',
    preview: '📣',
    content: `--- Spring Campaign 2026
Theme[Neon]
Logo[BrandCo]

-- Campaign Overview
Bigtitle[Make some noise]

A bold, always-on campaign to drive awareness and sign-ups this spring.

Stats[
{2M;Reach target}
{50K;Sign-ups goal}
{8;Channels}
]

-- Goals
List[
{🎯;Increase brand awareness by 40%}
{📈;Drive 50,000 new sign-ups}
{💬;Boost social engagement 3x}
]

-- Creative Direction
Comparison[
{Before;😴 Generic stock, 🤐 No personality, 📉 Low engagement}
{After;🎨 Bold art direction, 😄 Relatable tone, 📈 Higher engagement}
]

-- Channel Mix
Gallery[
{https://picsum.photos/500/400?11;Social}
{https://picsum.photos/500/400?12;Display}
{https://picsum.photos/500/400?13;Video}
]

-- Timeline
Agenda[
{1;Weeks 1–2;Teaser phase}
{2;Weeks 3–6;Launch & amplification}
{3;Weeks 7–8;Retargeting & wrap}
]

Badge[APPROVED FOR LAUNCH]
`,
  },
];

// ─── Doc templates ──────────────────────────────────────────────────────

const docTemplates: Template[] = [
  {
    id: 'cv',
    name: 'CV / Resume',
    description: 'Professional resume with clear sections',
    preview: '👤',
    content: `--- Curriculum Vitae
Theme[Minimal]

-- Informations personnelles

# Jean Dupont

**Email:** jean.dupont@email.com | **Tél:** +33 6 12 34 56 78 | **Lieu:** Paris, France

---

-- Formation

## Formation

### Master en Informatique — Université Paris-Saclay
*2018 - 2020*

Spécialisation en Intelligence Artificielle et Data Science.

### Licence en Mathématiques — Sorbonne Université
*2015 - 2018*

Mention Bien. Parcours Mathématiques et Informatique.

---

-- Expérience professionnelle

## Expérience

### Développeur Senior — TechCorp
*Janvier 2022 - Présent*

- Développement d'applications web full-stack (React, Node.js)
- Architecture microservices et déploiement cloud (AWS)
- Encadrement d'une équipe de 3 développeurs juniors

### Développeur Full-Stack — StartupXYZ
*Septembre 2020 - Décembre 2021*

- Création d'une plateforme SaaS de A à Z
- Intégration de systèmes de paiement (Stripe)
- Optimisation des performances (temps de chargement -60%)

---

-- Compétences

## Compétences

| Domaine | Technologies |
|---------|-------------|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Node.js, Python, PostgreSQL |
| DevOps | Docker, AWS, CI/CD |
| Outils | Git, Figma, Jira |

---

-- Langues

## Langues

- **Français** — Langue maternelle
- **Anglais** — Courant (C1)
- **Espagnol** — Intermédiaire (B1)
`,
  },
  {
    id: 'report',
    name: 'Business Report',
    description: 'Quarterly or annual business report',
    preview: '📊',
    content: `--- Rapport Trimestriel Q4 2024
Theme[Modern]

-- Résumé exécutif

# Rapport Q4 2024

Callout[info;Ce rapport présente les résultats du quatrième trimestre 2024 et les perspectives pour 2025.]

## Points clés

- Chiffre d'affaires en hausse de **+23%** vs Q3
- Acquisition de **1 200** nouveaux clients
- Lancement réussi du produit v3.0
- Expansion sur le marché européen

---

-- Performance financière

## Performance Financière

| Indicateur | Q3 2024 | Q4 2024 | Variation |
|-----------|---------|---------|-----------|
| CA | 2.4M€ | 2.95M€ | +23% |
| Marge brute | 68% | 71% | +3pts |
| EBITDA | 480K€ | 620K€ | +29% |
| Clients actifs | 8 500 | 9 700 | +14% |

Callout[success;L'objectif annuel de 10M€ de CA a été dépassé avec un total de 10.2M€.]

---

-- Réalisations

## Réalisations majeures

### 1. Lancement Produit v3.0
Déploiement réussi avec un taux d'adoption de 78% parmi les clients existants en 6 semaines.

### 2. Expansion Européenne
Ouverture de bureaux à Berlin et Amsterdam. Recrutement de 15 collaborateurs.

### 3. Partenariat Stratégique
Signature d'un accord cadre avec GlobalCorp pour une valeur de 1.5M€ sur 3 ans.

---

-- Perspectives 2025

## Perspectives 2025

> Notre objectif pour 2025 est d'atteindre 15M€ de CA avec une marge EBITDA de 25%.

### Priorités stratégiques

1. **Croissance organique** — Objectif +40% de nouveaux clients
2. **Innovation produit** — Lancement de 2 nouvelles fonctionnalités majeures
3. **International** — Entrée sur le marché UK et Nordique
4. **Talent** — Recrutement de 30 collaborateurs

Callout[warning;Les projections sont soumises aux conditions macroéconomiques et aux risques identifiés en annexe.]
`,
  },
  {
    id: 'meeting',
    name: 'Meeting Minutes',
    description: 'Structured meeting notes template',
    preview: '📝',
    content: `--- Compte-Rendu de Réunion
Theme[Ocean]

-- Informations

# Réunion Projet Alpha

| | |
|---|---|
| **Date** | 15 janvier 2025 |
| **Lieu** | Salle de conférence B / Visio |
| **Durée** | 1h30 |
| **Animateur** | Marie Martin |

## Participants

- Marie Martin (Chef de projet)
- Pierre Durand (Développeur Lead)
- Sophie Bernard (Product Owner)
- Lucas Moreau (Designer UX)
- *Excusé : Thomas Petit (QA)*

---

-- Ordre du jour

## Ordre du jour

1. Bilan sprint précédent
2. Démonstration des nouvelles fonctionnalités
3. Points bloquants
4. Planification du prochain sprint
5. Questions diverses

---

-- Discussions

## Compte-rendu des discussions

### 1. Bilan Sprint S12

Callout[success;Sprint S12 terminé avec 85% des stories livrées (17/20).]

Les 3 stories non terminées ont été reportées au sprint S13 en priorité.

### 2. Démonstration

Pierre a présenté le nouveau module de reporting. Retour positif de l'équipe. Sophie a identifié 2 ajustements UX mineurs.

### 3. Points bloquants

Callout[warning;L'API partenaire présente des latences importantes (>2s) impactant la feature de synchronisation.]

**Action :** Pierre contacte l'équipe technique du partenaire avant vendredi.

---

-- Décisions et actions

## Décisions prises

- [x] Priorisation du module reporting pour la release v2.1
- [x] Report de la feature "export CSV" au sprint S14
- [x] Recrutement d'un développeur front-end supplémentaire

## Actions à suivre

| Action | Responsable | Échéance |
|--------|------------|----------|
| Contacter API partenaire | Pierre | 17/01 |
| Maquettes ajustées reporting | Lucas | 20/01 |
| Rédaction specs export CSV | Sophie | 22/01 |
| Validation budget recrutement | Marie | 19/01 |

---

*Prochain point : Mardi 22 janvier 2025, 10h00*
`,
  },
  {
    id: 'letter',
    name: 'Formal Letter',
    description: 'Professional letter template',
    preview: '✉️',
    content: `--- Lettre Professionnelle
Theme[Minimal]

-- En-tête

**Jean Dupont**
123 Rue de la Paix
75001 Paris

jean.dupont@email.com
+33 6 12 34 56 78

---

Paris, le 15 janvier 2025

---

**Société ABC**
À l'attention de Mme Claire Martin
Directrice des Ressources Humaines
456 Avenue des Champs-Élysées
75008 Paris

---

-- Corps

**Objet :** Candidature au poste de Développeur Senior

Madame Martin,

Suite à votre annonce publiée sur votre site, je me permets de vous adresser ma candidature pour le poste de Développeur Senior au sein de votre équipe technique.

Fort de **5 années d'expérience** en développement web full-stack, j'ai acquis une expertise solide en React, TypeScript et Node.js. Mon parcours chez TechCorp m'a permis de :

- Concevoir et déployer des applications à forte charge (+100K utilisateurs)
- Encadrer une équipe de développeurs juniors
- Mettre en place des pratiques DevOps (CI/CD, monitoring)

Votre entreprise m'attire particulièrement par son engagement envers l'innovation et la qualité logicielle. Je suis convaincu que mon profil technique et mon sens du travail en équipe seraient des atouts pour vos projets.

Je me tiens à votre disposition pour un entretien à votre convenance.

Dans l'attente de votre réponse, je vous prie d'agréer, Madame Martin, l'expression de mes salutations distinguées.

---

**Jean Dupont**
`,
  },
  {
    id: 'proposal',
    name: 'Project Proposal',
    description: 'Structured project proposal or thesis outline',
    preview: '📑',
    content: `--- Proposition de Projet — Refonte Plateforme
Theme[Latte]

-- Contexte

# Contexte et objectifs

Callout[info;Ce document présente la proposition de refonte de la plateforme interne pour l'exercice 2025-2026.]

## Problématique

La plateforme actuelle souffre de :
- Temps de chargement élevés (>4s)
- Une expérience utilisateur datée
- Des coûts de maintenance croissants

## Objectifs

1. Réduire le temps de chargement sous 1.5s
2. Moderniser l'interface utilisateur
3. Réduire les coûts d'infrastructure de 30%

---

-- Périmètre

## Périmètre proposé

| Phase | Contenu | Durée estimée |
|-------|---------|---------------|
| 1 | Audit & cadrage | 3 semaines |
| 2 | Design & prototype | 6 semaines |
| 3 | Développement | 10 semaines |
| 4 | Tests & déploiement | 4 semaines |

Callout[warning;Le périmètre pourra évoluer après la phase de cadrage.]

---

-- Budget

## Budget prévisionnel

- **Équipe produit** : 4 développeurs, 1 designer, 1 chef de projet
- **Infrastructure** : migration vers une architecture conteneurisée
- **Formation** : accompagnement des équipes métiers

---

-- Risques

## Risques identifiés

- [ ] Retard sur les dépendances externes
- [ ] Résistance au changement des utilisateurs
- [ ] Dépassement budgétaire

Callout[success;Un comité de pilotage hebdomadaire permettra de suivre l'avancement et de lever les blocages rapidement.]

---

-- Conclusion

## Prochaine étape

Validation de cette proposition lors du comité de direction, puis lancement de la phase 1 sous deux semaines.
`,
  },
];

export function TemplatesModal({ mode, onSelect }: TemplatesModalProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const templates = mode === 'block' ? blockTemplates : mode === 'deck' ? deckTemplates : docTemplates;

  const handleSelect = (template: Template) => {
    setSelected(template.id);
    setTimeout(() => {
      onSelect(template.content);
      setOpen(false);
      setSelected(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={`group relative p-4 text-left rounded-lg border-2 transition-all duration-200 hover:border-primary hover:shadow-md ${
                  selected === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                {selected === template.id && (
                  <div className="absolute top-2 right-2 p-1 rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}

                <div className="text-3xl mb-2">{template.preview}</div>

                <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default TemplatesModal;
