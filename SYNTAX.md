# Netral — Syntax Reference

Complete syntax documentation for every Netral tool. Each tool uses a Markdown-inspired syntax extended with custom directives of the form `Name[...]`.

---

## Table of Contents

- [Shared Syntax](#shared-syntax)
- [Netral Block](#netral-block) — websites
- [Netral Deck](#netral-deck) — presentations
- [Netral Doc](#netral-doc) — documents
- [Netral Calus](#netral-calus) — math & graphs
- [Netral Luate](#netral-luate) — exams & quizzes
- [File Extensions](#file-extensions)
- [Sharing](#sharing)

---

## Shared Syntax

These directives work across Block, Deck, Doc and Luate.

### Document title

```
--- My Document Title
```

Sets the document / site / presentation / exam title. Conventionally placed on the first line.

### Theme

```
Theme[Modern]
```

Available themes:

`Modern` · `Natural` · `Latte` · `Dark Mode` · `Terminal` · `Ocean` · `Solarized` · `Midnight` · `Minimal` · `Sunset` · `Neon` · `Rosé` · `Forest`

### Inline formatting

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

Netral Block creates full websites with sections, navigation and interactive components.

### Document setup

| Directive | Example | Description |
|-----------|---------|-------------|
| Title | `--- My Site` | Site title (first line) |
| Theme | `Theme[Modern]` | One of the 13 themes |
| Logo | `Logo[My Brand]` or `Logo[https://.../logo.png]` | Navbar logo (text or image URL) |
| Navbar | `Navbar[{Home;#home}{Pricing;#pricing}]` | Navigation items, `{Label;URL}` |
| Header | `Header[Type;Title;Description;ImageURL;Link]` | Hero section |
| Section | `-- Section Title` | Starts a new content section |
| Meta | `Meta[Title;Description;Image]` | SEO / Open Graph tags |
| AnimateOnScroll | `AnimateOnScroll[]` | Fade-in animations on scroll |

#### Header types

- `Classic` — centered hero
- `BigText` — large typography hero
- `SplitImage` — text on one side, image on the other

```
Header[BigText;Welcome to Netral;Build beautiful sites with simple syntax;https://picsum.photos/1200/600;#features]
```

### Media & content

| Directive | Example | Description |
|-----------|---------|-------------|
| Image | `Image[https://.../image.jpg]` | Full-width responsive image |
| Video | `Video[https://youtube.com/watch?v=...]` | Embedded video player |
| Embed | `Embed[https://example.com]` | Embed a website via iframe |
| Gallery | `Gallery[{url;caption}{url;caption}]` | Image gallery grid |
| Bigtitle | `Bigtitle[Large Centered Title]` | Prominent centered title |
| Column | `Column[{Left content}{Right content}]` | Two-column layout |

### Components

| Directive | Example | Description |
|-----------|---------|-------------|
| Feature | `Feature[{🚀;Title;Description}]` | Feature cards (emoji, title, text) |
| Element | `Element[{Title;Description;ImageURL}]` | Cards with image, title, text |
| Testimonial | `Testimonial[{Name;Role;Quote;PhotoURL}]` | Customer testimonials |
| Pricing | `Pricing[{Plan;$9/mo;Feature 1, Feature 2}]` | Pricing cards (benefits comma-separated) |
| Stats | `Stats[{100+;Label}]` | Statistics display |
| Team | `Team[{Name;Role;PhotoURL;Bio}]` | Team member profiles |
| Steps | `Steps[{1;Title;Description}]` | Numbered process steps |
| Metric | `Metric[{📈;Value;Label;+15%}]` | KPI cards with change indicator |
| Showcase | `Showcase[Image;Title;Subtitle;{Spec;Value}{Spec;Value}]` | Product showcase |

### Interactive

| Directive | Example | Description |
|-----------|---------|-------------|
| FAQ | `FAQ[{Question?;Answer}]` | Expandable FAQ accordion |
| CTA | `CTA[Title;Description;Button;URL]` | Call-to-action block |
| Timeline | `Timeline[{2024;Event;Description}]` | Chronological timeline |
| Countdown | `Countdown[Label;2025-12-31;Description]` | Event countdown |
| Badge | `Badge[New Feature]` | Colored tag/badge |
| Progress | `Progress[75;Label]` | Progress bar (0–100) |
| Form | `Form[{action;method;submit}{type;name;label;placeholder}]` | Contact form |

#### Form example

```
Form[
{mailto:contact@example.com;POST;Send Message}
{text;name;Your Name;Enter your name}
{email;email;Your Email;you@example.com}
{textarea;message;Your Message;Write your message here}
]
```

Field types: `text`, `email`, `textarea`, `select`. The first `{...}` is optional config (`action;method;submitText`).

### Callouts & decorative

| Directive | Example | Description |
|-----------|---------|-------------|
| Warn | `Warn[Message]` | Warning callout |
| Def | `Def[Message]` | Info / definition callout |
| quote | `quote[Text]` | Styled blockquote |
| Divider | `Divider[wave]` | Visual divider (`wave`, `dots`, `line`) |

---

## Netral Deck

Netral Deck creates presentation slides with fullscreen and presenter modes.

### Slide structure

| Directive | Example | Description |
|-----------|---------|-------------|
| Title | `--- My Presentation` | Presentation title |
| Theme | `Theme[Modern]` | One of the 13 themes |
| New slide | `-- Slide Title` | Starts a new slide |
| Logo | `Logo[Text or URL]` | Logo shown on every slide |
| Background | `Background[https://.../image.jpg]` | Slide background image |
| Notes | `Notes[Private notes for this slide]` | Speaker notes (presenter mode) |

### Slide content

| Directive | Example | Description |
|-----------|---------|-------------|
| Bigtitle | `Bigtitle[Main Title]` | Large slide title |
| Image | `Image[url]` | Display an image |
| Video | `Video[url]` | Embed a video |
| Code | `Code[javascript; ... ]` | Syntax-highlighted code block |
| Column | `Column[{Left}{Right}]` | Two-column layout (supports nested blocks) |
| List | `List[{✅;Item}{❌;Item}]` | Icon list |
| Feature | `Feature[{🚀;Title;Description}]` | Feature cards |
| Stats | `Stats[{100+;Label}]` | Statistics |
| Timeline | `Timeline[{2024;Event;Description}]` | Timeline events |
| Gallery | `Gallery[{url;caption}]` | Image grid |
| Progress | `Progress[75;Label]` | Progress bar |
| Graph | `Graph[{a;Start;->b}{b;End;}]` | Flowchart |
| Comparison | `Comparison[{Before;❌}{After;✅}]` | Side-by-side columns |
| Agenda | `Agenda[{1;Topic;5 min}]` | Meeting agenda |
| Speaker | `Speaker[Quote;Name;Role;PhotoURL]` | Quote with speaker photo |

### Callouts

`Warn[Message]` · `Def[Message]` · `quote[Text]` · `Badge[Text]`

### Presentation controls

| Key | Action |
|-----|--------|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `F` | Toggle fullscreen |
| `Escape` | Exit fullscreen |

### Presenter mode

Launch from the dropdown next to "Present". Opens a popup with current slide, next slide, speaker notes, slide counter and timer.

---

## Netral Doc

Netral Doc creates professional documents optimized for PDF export via the browser print dialog.

### Document structure

| Directive | Example | Description |
|-----------|---------|-------------|
| Title | `--- My Document` | Document title |
| Theme | `Theme[Modern]` | One of the 13 themes |
| Section | `--- Section Title` | Top-level section (level 1) |
| Subsection | `-- Subsection Title` | Subsection (level 2) |

### Content (standard Markdown)

- Headings (`#`, `##`, `###`, …)
- Bold, italic, strikethrough, inline code
- Bullet, numbered and task lists
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

Types: `info` (blue), `warning` (yellow), `success` (green), `error` (red).

### Advanced

- Footnotes: `Text[^1]` + `[^1]: explanation`
- Table of contents is auto-generated when there are 3+ sections

### PDF export

Use the **Export** button or `Ctrl+P` / `Cmd+P` to open the print dialog. The document uses an A4 layout optimized for print.

---

## Netral Calus

Netral Calus is an interactive math calculator, equation solver and function plotter.

### Arithmetic

`2 + 3` · `10 - 4` · `3 * 4` · `10 / 3` · `2^8` · `10 % 3`

### Variables

```
a = 5
b = 3
a^2 + b^2
```

### Functions (auto-plotted)

```
f(x) = x^2 - 4
g(x) = sin(x) * 3
f(3)
```

### Built-in functions

`sqrt(144)` · `sin(pi / 2)` · `cos(0)` · `tan(x)` · `log(100)` · `ln(e)` · `abs(-5)` · `floor(3.7)` · `ceil(3.2)`

### Constants

`pi` (3.14159…) · `e` (2.71828…)

### Equations

```
2x + 5 = 15        → solves for x
x^2 - 5x + 6 = 0   → solves quadratic
x^2 + y^2 = 9      → plots implicit curves
```

### Statistics

`mean(1, 2, 3, 4)` · `median(1, 3, 5, 7)` · `std(1, 2, 3, 4)` · `sum(1, 2, 3)`

### Comments

Lines starting with `#` are ignored.

---

## Netral Luate

Netral Luate creates exams and quizzes. Questions are grouped into sections and carry point values.

### Document setup

| Directive | Example | Description |
|-----------|---------|-------------|
| Title | `--- Mathematics Final Exam` | Exam title |
| Theme | `Theme[Modern]` | One of the 13 themes |
| Subtitle | `Subtitle[Grade 10 — Semester 2]` | Subtitle under title |
| Duration | `Duration[90 minutes]` | Time allowed |
| Instructions | `Instructions[Answer all questions.]` | Exam instructions |
| Section | `-- Part 1: Algebra` | Starts a new section |

### Question types

#### MCQ — multiple choice (single answer)

```
MCQ[2;What is 2 + 2?;{3;4;5;6};4]
```

Format: `MCQ[points;question;{options};answer]`. The trailing `answer` is optional.

#### Checkbox — multiple answers

```
Checkbox[3;Select all prime numbers;{2;4;7;9};2,7]
```

Format: `Checkbox[points;question;{options};answers]` (comma-separated answers, optional).

#### Open — open-ended

```
Open[5;Explain your reasoning]
Open[5;Question?;10;Model answer]
```

Format: `Open[points;question]` or `Open[points;question;lines;answer]`.

#### Canvas — drawing area

```
Canvas[0;Draw the graph of f(x);250]
```

Format: `Canvas[points;label;height]` (height in pixels).

#### Short / TrueFalse / FillBlank

Single-item form:

```
Short[1;What is 2+2?;4]
TrueFalse[1;The Earth is round;true]
FillBlank[2;The capital of France is ___;Paris]
```

Multi-item form (one exercise with several sub-items):

```
TrueFalse[3;Evaluate each statement;{The Earth is round;true}{Pi is rational;false}]
FillBlank[4;Complete each sentence;{The capital of France is ___;Paris}{Water freezes at ___ °C;0}]
Short[6;Answer each briefly;{What is 2+2?;4}{What is 5×5?;25}]
```

Format: `Type[points;header;{prompt;answer}{prompt;answer}...]`.

### Points & grading

- The first number in a question directive is its point value.
- Section totals and the grand total are computed automatically.
- Use the **eye icon** in the toolbar to toggle answer visibility in the preview.
- Use **Interrogate** to generate a student link and grade responses.

### Exercise generator

The **Generate** button opens a gallery organized by subject (Mathematics, Sciences, Geography, History, Languages, Computer Science, Business). Within each subject, generators are grouped by level:

- **Primary** (ages 6–11)
- **GCSE** (ages 14–16)
- **A Level** (ages 16–18)

Choose a generator, configure the number of questions, output format, points and difficulty, then insert the generated Luate syntax at the cursor.

---

## File Extensions

| Tool | Extension |
|------|-----------|
| Netral Block | `.netblock` |
| Netral Deck | `.netdeck` |
| Netral Doc | `.netdoc` |
| Netral Calus | `.netcalus` |
| Netral Luate | `.netluate` |

Files are plain text — human-readable, version-control friendly and portable. Open them by dragging onto the launcher or using the file menu in each tool.

---

## Sharing

All tools support URL-based sharing. Click **Share** to generate a compressed link containing the entire document. Recipients can open it without an account or setup.
