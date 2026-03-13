<p align="center">
  <img src="https://img.shields.io/badge/Netral-Create%20Without%20Limits-blue?style=for-the-badge" alt="Netral Badge" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

# Netral — Create Without Limits

**Netral** is a browser-based suite of creative tools that turns simple, human-readable syntax into beautiful websites, presentations, and documents — no design skills or complex code required.

> Write text. Get a polished result. Instantly.

<img src="https://i.ibb.co/Z6zVR7K8/Screenshot-2025-12-13-at-06-29-22.png">

---

## ✨ Why Netral?

| Problem | Netral's Answer |
|---------|----------------|
| HTML/CSS is verbose and slow | A concise, intuitive syntax that compiles to rich visuals |
| PowerPoint is heavy and rigid | Live-preview presentations built from plain text |
| Document tools lack flexibility | Export to PDF, HTML, or share via URL — all from one editor |
| Switching between tools is painful | One unified syntax, three powerful modes |

Netral bridges the gap between **simplicity** and **polish**. If you can write a text file, you can build with Netral.

---

## 🧰 The Suite

### 🌐 Netral Block
Create **full websites** with components like navbars, hero sections, feature grids, pricing tables, testimonials, FAQs, and more — all with a clean markup syntax.

```
--- My Website
Theme[Modern]
Logo[Netral]
Header[BigText;Build faster;Create beautiful sites in minutes]

-- Features
Feature[
{🚀;Fast;Build in minutes}
{🎨;Themed;11 professional themes}
{📱;Responsive;Mobile-ready by default}
]
```

### 📺 Netral Deck
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

### 📄 Netral Doc
Create **structured documents** with sections, callouts, tables, and export to PDF or `.netdoc` files.

```
--- Project Report
Theme[Latte]

--- Executive Summary
## Overview
This document summarizes the project progress...

Callout[info;All milestones have been completed on time.]
```

### 🔜 Coming Soon
- **🎓 Netral Luate** — Interactive quizzes and exercises for education
- **⚡️ Netral Flow** — A visual programming language

---

## 🎨 Themes

11 built-in themes, instantly switchable:

`Modern` · `Natural` · `Latte` · `Dark Mode` · `Terminal` · `Ocean` · `Solarized` · `Midnight` · `Minimal` · `Sunset` · `Neon`

---

## 🚀 Getting Started (Local Installation from repo)

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

The app will be available at `http://localhost:8080`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture

```
src/
├── apps/                  # App-level components (Block, Deck, Doc, Launcher)
├── components/            # Shared UI components (Editor, Toolbar)
│   └── ui/                # shadcn/ui primitives
├── core/
│   ├── parser/            # Netral syntax parsers (block, deck, doc)
│   ├── renderer/          # React renderers for each mode
│   │   └── components/    # Slide blocks, headers, scaled slides
│   ├── exporter/          # HTML export logic
│   └── themes/            # Theme definitions
├── shared/components/     # Cross-app components (FileMenu, ShareButton, HelpModal)
└── hooks/                 # Custom React hooks
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Editor | CodeMirror 6 |
| Compression | lz-string (for shareable URLs) |
| Markdown | marked |
| Sanitization | DOMPurify |

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

Files are plain text — version-control friendly, human-readable, and portable.

---

## 🗺️ Roadmap

- [x] Netral Block — Website builder
- [x] Netral Deck — Presentation builder with presenter mode
- [x] Netral Doc — Document builder with PDF export
- [x] 11 themes with dark mode support
- [x] Share by URL (lz-string compression)
- [x] Drag & drop file loading
- [x] Adaptive text sizing for presentations
- [ ] Netral Luate — Quiz & exercise builder
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
- Test your changes across Block, Deck, and Doc modes

---

## ❓ FAQ

**Q: Do I need a backend or database?**
A: No. Netral runs entirely in the browser. Files are saved locally, and sharing works through URL compression.

**Q: Can I use my own theme?**
A: Currently, 11 built-in themes are available. A custom theme editor is on the roadmap.

**Q: Is the syntax similar to Markdown?**
A: Yes! Netral extends Markdown with custom components like `Feature[...]`, `Stats[...]`, `Column[...]`, etc. Standard Markdown (headings, bold, italic, lists, links) works as expected.

**Q: Can I export my work?**
A: Block exports to HTML, Doc exports to PDF (via print) or `.netdoc`, and Deck runs as a fullscreen presentation. All modes support shareable URLs.

**Q: Is it free?**
A: YES! Netral apps is free and open source. I work 100% for free because I believe that decent productivity tools should be free. My primary goal is to help as many people as possible. However, if you are satisfied, you are of course welcome to make a donation..

**Q: Did AI helped ?**
A: Yes, as my abilities as a 16-year-old were limited, I used AI to help me finish the project on time (especially in v2.0), but the concept and design are 100% mine...

---

## 📄 License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Netral</strong> — Create without limits.<br/>
  <sub>Built with ❤️ using React, TypeScript & Tailwind CSS</sub>
</p>
# Netral-Apps
