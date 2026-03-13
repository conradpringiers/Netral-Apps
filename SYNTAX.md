# Netral Syntax Reference

Complete syntax documentation for all Netral tools. Each tool uses a Markdown-inspired syntax extended with custom directives.

---

## Table of Contents

- [Shared Syntax](#shared-syntax)
- [Netral Block](#netral-block)
- [Netral Deck](#netral-deck)
- [Netral Doc](#netral-doc)

---

## Shared Syntax

These directives work across all Netral tools.

### Document Title

```
--- My Document Title
```

Sets the document/site/presentation title. Must be the first line.

### Theme

```
Theme[Modern]
```

Available themes: `Modern`, `Natural`, `Latte`, `Dark Mode`, `Terminal`, `Ocean`, `Solarized`, `Midnight`, `Minimal`, `Sunset`, `Neon`

### Inline Formatting

| Syntax | Result |
|--------|--------|
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `~~strikethrough~~` | ~~strikethrough~~ |
| `==highlight==` | highlighted text |
| `` `code` `` | inline code |
| `[text](url)` | hyperlink |

### Lists

```markdown
- Bullet item
- Another item

1. Numbered item
2. Another item

- [ ] Unchecked task
- [x] Completed task
```

---

## Netral Block

Netral Block creates full websites with sections, navigation, and interactive components.

### Document Setup

#### Logo

```
Logo[My Brand]
Logo[https://example.com/logo.png]
```

Text or image URL for the site logo displayed in the navbar.

#### Navbar

```
Navbar[
{Home;#home}
{Features;#features}
{Pricing;#pricing}
{Contact;#contact}
]
```

Navigation bar with `{Label;URL}` items.

#### Header

```
Header[Type;Title;Description;ImageURL;Link]
```

Hero section at the top of the page. Types:
- `Classic` — Standard centered hero
- `BigText` — Large typography hero
- `SplitImage` — Text on one side, image on the other

Example:
```
Header[BigText;Welcome to Netral;Build beautiful sites with simple syntax;https://picsum.photos/1200/600;#features]
```

#### Sections

```
-- Section Title
```

Creates a new content section. Content below belongs to this section until the next `--`.

#### Scroll Animations

```
AnimateOnScroll[]
```

Enables fade-in animations on scroll for all elements.

### Content Elements

#### Image

```
Image[https://picsum.photos/800/400]
```

Full-width responsive image.

#### Video

```
Video[https://youtube.com/watch?v=...]
```

Embedded video player (YouTube, Vimeo, etc.).

#### Embed

```
Embed[https://example.com]
```

Embeds an external website via iframe.

#### Bigtitle

```
Bigtitle[Large Centered Title]
```

Prominent centered title text.

#### Column

```
Column[
{Left column content goes here. Supports **markdown**.}
{Right column content goes here.}
]
```

Two-column layout. Each `{...}` is a column.

#### Gallery

```
Gallery[
{https://picsum.photos/400/300;First image caption}
{https://picsum.photos/400/300;Second image caption}
]
```

Image gallery grid with optional captions.

### Components

#### Feature

```
Feature[
{🚀;Fast;Lightning-quick performance}
{🎨;Beautiful;Stunning visual design}
{📱;Responsive;Works on every device}
]
```

Feature cards with emoji icon, title, and description.

#### Element

```
Element[
{Card Title;Card description text;https://picsum.photos/300/200}
]
```

Cards with image, title, and description.

#### Stats

```
Stats[
{100+;Users}
{50K;Downloads}
{99%;Uptime}
]
```

Statistics counter display.

#### Testimonial

```
Testimonial[
{Jane Doe;CEO at TechCorp;This product changed our workflow;https://i.pravatar.cc/100?img=1}
{John Smith;Designer;Incredibly intuitive interface;https://i.pravatar.cc/100?img=2}
]
```

Customer testimonials with name, role, quote, and photo.

#### Pricing

```
Pricing[
{Free;$0/mo;1 project, Community support, Basic features}
{Pro;$19/mo;Unlimited projects, Priority support, Advanced features}
{Enterprise;$99/mo;Custom solutions, Dedicated support, API access}
]
```

Pricing cards. Benefits are comma-separated within the third field.

#### Team

```
Team[
{Alice Martin;Lead Developer;https://i.pravatar.cc/100?img=5;Full-stack engineer with 10 years of experience}
]
```

Team member profiles with name, role, photo, and bio.

#### Steps

```
Steps[
{1;Sign Up;Create your free account in seconds}
{2;Build;Use our intuitive editor to create your content}
{3;Launch;Publish and share with the world}
]
```

Numbered step-by-step process.

#### Metric

```
Metric[
{📈;$1.2M;Revenue;+15%}
{👥;12.5K;Users;+8%}
{⭐;4.9;Rating;+0.2}
]
```

KPI metric cards with icon, value, label, and change indicator.

#### Showcase

```
Showcase[
https://picsum.photos/600/400
Product Name
The best product ever made
{Weight;1.2 kg}
{Battery;24 hours}
{Display;6.7 inches}
]
```

Product showcase with image, title, subtitle, and specification pairs.

#### Timeline

```
Timeline[
{2024;Product Launch;Released v1.0 to the public}
{2025;Major Update;Added 50+ new features}
]
```

Chronological timeline of events.

#### FAQ

```
FAQ[
{What is Netral?;Netral is a simple syntax for building websites without coding.}
{Is it free?;Yes, Netral is completely free and open source.}
]
```

Expandable FAQ accordion.

#### CTA (Call to Action)

```
CTA[Ready to start?;Join thousands of creators;Get Started;#signup]
```

Call-to-action block with title, description, button text, and button URL.

#### Countdown

```
Countdown[Product Launch;2025-12-31;Don't miss it!]
```

Countdown timer with label, target date, and description.

### Callouts & Decorative

#### Warn

```
Warn[This feature is experimental and may change.]
```

Warning callout block.

#### Def

```
Def[Netral uses a Markdown-inspired syntax extended for the web.]
```

Info/definition callout block.

#### Quote

```
quote[Simplicity is the ultimate sophistication. - Leonardo da Vinci]
```

Styled blockquote.

#### Badge

```
Badge[New Feature]
```

Colored tag/badge element.

#### Progress

```
Progress[75;Project Completion]
```

Progress bar with percentage value (0–100) and label.

#### Divider

```
Divider[wave]
```

Visual section divider. Styles: `wave`, `dots`, `line`, etc.

---

## Netral Deck

Netral Deck creates presentation slides with fullscreen and presenter modes.

### Slide Structure

#### New Slide

```
-- Slide Title
```

Creates a new slide. Everything below belongs to this slide until the next `--`.

#### Logo

```
Logo[My Company]
Logo[https://example.com/logo.png]
```

Displayed on every slide.

#### Background

```
Background[https://picsum.photos/1920/1080]
```

Per-slide background image. Place inside a slide.

#### Speaker Notes

```
Notes[These are private notes only visible in presenter mode.]
```

Private notes shown only in presenter mode (popup window).

### Slide Content

All shared content elements work (Image, Video, Bigtitle, Column, Feature, Stats, Warn, Def, quote, Badge, Progress, Timeline, Gallery).

#### Code Block

```
Code[javascript;
const hello = "world";
console.log(hello);
]
```

Syntax-highlighted code block with language identifier.

#### List

```
List[
{✅;Task completed}
{❌;Task failed}
{⏳;Task pending}
]
```

Icon list with emoji and text.

#### Graph (Flowchart)

```
Graph[
{a;Start;->b}
{b;Process;->c}
{c;End;}
]
```

Visual flowchart with nodes and directed edges.

#### Comparison

```
Comparison[
{Before;❌ Slow, ❌ Complex, ❌ Expensive}
{After;✅ Fast, ✅ Simple, ✅ Free}
]
```

Side-by-side comparison columns.

#### Agenda

```
Agenda[
{1;Introduction;5 min}
{2;Main Topic;20 min}
{3;Q&A;10 min}
]
```

Meeting agenda with numbered items, topics, and durations.

#### Speaker Quote

```
Speaker[Innovation distinguishes between a leader and a follower.;Steve Jobs;CEO, Apple;https://i.pravatar.cc/200]
```

Quote block with speaker photo, name, and role.

### Presentation Controls

| Key | Action |
|-----|--------|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `Escape` | Exit fullscreen |
| `F` | Toggle fullscreen |

### Presenter Mode

Launch with the dropdown next to "Present". Opens a popup window showing:
- Current slide preview
- Next slide preview
- Speaker notes
- Slide counter and timer

---

## Netral Doc

Netral Doc creates professional documents optimized for PDF export via the browser print dialog.

### Document Structure

#### Main Section

```
--- Section Title
```

Creates a top-level section (level 1).

#### Subsection

```
-- Subsection Title
```

Creates a subsection (level 2).

### Content

Netral Doc supports standard Markdown:

- Headings (`#`, `##`, `###`)
- Bold, italic, strikethrough, inline code
- Bullet lists, numbered lists, task lists
- Links and images (`![alt](url)`)
- Blockquotes (`> quote`)
- Code blocks (triple backticks)
- Tables
- Horizontal rules (`---`)

### Callouts

```
Callout[info;This is an informational message.]
Callout[warning;Be careful with this operation.]
Callout[success;Operation completed successfully!]
Callout[error;An error occurred during processing.]
```

Styled callout blocks with four types: `info` (blue), `warning` (yellow), `success` (green), `error` (red).

### PDF Export

Use the **Export** button or `Ctrl+P` / `Cmd+P` to open the browser print dialog. The document is formatted with A4-style layout optimized for print output.

---

## File Extensions

| Tool | Extension |
|------|-----------|
| Netral Block | `.netblock` |
| Netral Deck | `.netdeck` |
| Netral Doc | `.netdoc` |

Files can be opened by dragging them onto the Netral launcher or using the file menu within each tool.

---

## Sharing

All tools support URL-based sharing. Click the **Share** button to generate a compressed link containing your entire document. Recipients can open it without any account or setup.
