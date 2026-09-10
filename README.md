<p align="center">
  <img src="https://img.shields.io/badge/Netral-Create%20Without%20Limits-blue?style=for-the-badge" alt="Netral Badge" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

# Netral — Create Without Limits

**Netral** is a browser-based suite of creative tools that turns simple, human-readable syntax into beautiful websites, presentations, documents, math graphs, and exams — no design skills or complex code required.

> Write text. Get a polished result. Instantly.

---

## ✨ Why Netral?

| Problem | Netral's Answer |
|---------|----------------|
| HTML/CSS is verbose and slow | A concise, intuitive syntax that compiles to rich visuals |
| PowerPoint is heavy and rigid | Live-preview presentations built from plain text |
| Document tools lack flexibility | Export to PDF, HTML, or share via URL — all from one editor |
| Switching between tools is painful | One unified syntax, five powerful modes |

Netral bridges the gap between **simplicity** and **polish**. If you can write a text file, you can build with Netral.

---

## 🧰 The Suite

### 🔷 Netral Block
Create **full websites** with components like navbars, hero sections, feature grids, pricing tables, testimonials, FAQs, and more — all with a clean markup syntax.

```
--- My Website
Theme[Modern]
Logo[Netral]
Header[BigText;Build faster;Create beautiful sites in minutes]

-- Features
Feature[
{🚀;Fast;Build in minutes}
{🎨;Themed;13 professional themes}
{📱;Responsive;Mobile-ready by default}
]
```

### 🟣 Netral Deck
Build **presentations** with slides, columns, charts, speaker notes, and presenter mode — all from text.

```
--- My Presentation
Theme[Ocean]

-- Introduction
Bigtitle[Welcome to Netral Deck]

-- Key Metrics
Stats[
{100+;Components}
{11;Themes}
{0;Setup needed}
]
```

### 🟢 Netral Doc
Create **structured documents** with sections, callouts, tables, and export to PDF or `.netdoc` files.

```
--- Project Report
Theme[Latte]

--- Executive Summary
## Overview
This document summarizes the project progress...

Callout[info;All milestones have been completed on time.]
```

### 🟦 Netral Calus
Interactive math calculator, equation solver and function/curve plotter.

```
a = 5
b = 3
a^2 + b^2
f(x) = x^2 - 4
x^2 + y^2 = 9
```

### 🟧 Netral Luate
Create exams and quizzes with MCQ, checkbox, true/false, fill-the-blank, short answer, open-ended and canvas questions — plus auto-grading and a student-link system.

```
--- Mathematics Final Exam
Theme[Modern]
Subtitle[Grade 10 — Semester 2]
Duration[90 minutes]

-- Part 1: Algebra
MCQ[2;What is 2 + 2?;{3;4;5;6};4]
TrueFalse[3;Evaluate each statement;{The Earth is round;true}{Pi is rational;false}]
```

### 🔜 Coming Soon
- **Netral Flow** — A visual programming language

---

## 🎨 Themes

13 built-in themes, instantly switchable:

`Modern` · `Natural` · `Latte` · `Dark Mode` · `Terminal` · `Ocean` · `Solarized` · `Midnight` · `Minimal` · `Sunset` · `Neon` · `Aurora` · `Noir`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/your-username/netral.git
cd netral

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

### Desktop App (Tauri)

Netral can also run as a native desktop app via [Tauri 2](https://tauri.app):

```bash
npm run tauri:dev     # run desktop app in development
npm run tauri:build   # build the native installer
```

---

## 🏗️ Architecture

```
src/
├── apps/                  # App-level components (Block, Deck, Doc, Calus, Luate, Launcher)
│   └── luate/             # LuateApp + generator, grading & interrogation system
├── components/            # Shared UI components (Editor, Toolbar)
│   └── ui/                # shadcn/ui primitives
├── core/
│   ├── parser/            # Netral syntax parsers (block, deck, doc, calus, luate)
│   ├── renderer/          # React renderers for each mode
│   │   └── components/    # Content blocks, headers, scaled slides
│   ├── exporter/          # HTML export logic
│   └── themes/            # Theme definitions
├── shared/components/     # Cross-app components (FileMenu, ShareButton, HelpModal, ...)
├── hooks/                 # Custom React hooks
├── lib/                   # Platform helpers (browser/Tauri bridge)
└── pages/                 # Index & NotFound routes

src-tauri/                 # Tauri 2 desktop shell (Rust)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Editor | CodeMirror 6 |
| Routing | React Router |
| Compression | lz-string (for shareable URLs) |
| Markdown | marked |
| Sanitization | DOMPurify |
| Math engine | mathjs (Calus) |
| Desktop shell | Tauri 2 (Rust) |

---

## 🔗 Share by Link

Netral compresses your entire document into a URL using `lz-string`. No server, no database — the content lives in the link itself. Anyone who opens it gets a full, editable copy.

---

## 📂 File Formats

| Extension | Mode | Description |
|-----------|------|-------------|
| `.netblock` | Block | Website source files |
| `.netdeck` | Deck | Presentation source files |
| `.netdoc` | Doc | Document source files |
| `.netcalus` | Calus | Math / graphing source files |
| `.netluate` | Luate | Exam / quiz source files |

Files are plain text — version-control friendly, human-readable, and portable.

---

## 🗺️ Roadmap

- [x] Netral Block — Website builder
- [x] Netral Deck — Presentation builder with presenter mode
- [x] Netral Doc — Document builder with PDF export
- [x] Netral Calus — Math calculator, equation solver & function plotter
- [x] Netral Luate — Exam/quiz builder with generators & grading
- [x] 13 themes with dark mode support
- [x] Share by URL (lz-string compression)
- [x] Drag & drop file loading
- [x] Adaptive text sizing for presentations
- [ ] Netral Flow — Visual programming
- [ ] Collaborative editing
- [ ] Custom theme editor
- [ ] Plugin system for custom components

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a branch** for your feature: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to your branch: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Guidelines

- Follow existing code style and project structure
- Write descriptive commit messages
- Keep PRs focused — one feature per PR
- Test your changes across Block, Deck, Doc, Calus, and Luate modes

---

## ❓ FAQ

**Q: Do I need a backend or database?**
A: No. Netral runs entirely in the browser. Files are saved locally, and sharing works through URL compression.

**Q: Can I use my own theme?**
A: Currently, 13 built-in themes are available. A custom theme editor is on the roadmap.

**Q: Is the syntax similar to Markdown?**
A: Yes! Netral extends Markdown with custom components like `Feature[...]`, `Stats[...]`, `Column[...]`, etc. Standard Markdown (headings, bold, italic, lists, links) works as expected.

**Q: Can I export my work?**
A: Block exports to standalone HTML, Doc exports to PDF (via print) or `.netdoc`, Deck runs as a fullscreen presentation, Calus plots functions/equations live, and Luate exports printable questionnaires/answer keys plus student links. All modes support shareable URLs.

**Q: Is it free?**
A: Yes, Netral is open source and free to use.

---

## 📄 License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Netral</strong> — Create without limits.<br/>
  <sub>Built with ❤️ using React, TypeScript & Tailwind CSS</sub>
</p>
