/**
 * Help Modal Component
 * Mode-specific guide with syntax reference
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Zap,
  Palette,
  Code,
  Layout,
  FileText,
  Sparkles,
  Presentation,
  Calculator,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HelpModalProps {
  mode?: "block" | "deck" | "doc" | "calus";
}

const blockSyntaxReference = [
  {
    category: "Document Setup",
    icon: "📄",
    items: [
      {
        name: "Title",
        syntax: "--- My Site Title",
        description: "Sets the document/site title",
      },
      {
        name: "Theme",
        syntax: "Theme[Modern]",
        description:
          "Modern, Natural, Latte, Dark Mode, Terminal, Ocean, Solarized, Midnight, Minimal, Sunset, Neon",
      },
      {
        name: "Logo",
        syntax: "Logo[https://... OR Text]",
        description: "Image URL or text for site logo",
      },
      {
        name: "Navbar",
        syntax: "Navbar[{Home;#}]",
        description: "Navigation with {Label;URL} format",
      },
      {
        name: "Header",
        syntax: "Header[Type;Title;Desc;URL;Link]",
        description: "Types: Classic, BigText, SplitImage",
      },
      {
        name: "Section",
        syntax: "-- Section Title",
        description: "Creates a new content section",
      },
    ],
  },
  {
    category: "Media & Content",
    icon: "🖼️",
    items: [
      { name: "Image", syntax: "Image[url]", description: "Full-width image" },
      {
        name: "Video",
        syntax: "Video[url]",
        description: "Embed video player",
      },
      {
        name: "Embed",
        syntax: "Embed[url]",
        description: "Embed external website",
      },
      {
        name: "Gallery",
        syntax: "Gallery[{url;caption}]",
        description: "Image gallery with captions",
      },
      {
        name: "Bigtitle",
        syntax: "Bigtitle[Text]",
        description: "Large centered title",
      },
      {
        name: "Column",
        syntax: "Column[{Left}{Right}]",
        description: "Two-column layout",
      },
    ],
  },
  {
    category: "Components",
    icon: "🧩",
    items: [
      {
        name: "Feature",
        syntax: "Feature[{🚀;Title;Desc}]",
        description: "Feature cards with emoji",
      },
      {
        name: "Element",
        syntax: "Element[{Title;Desc;URL}]",
        description: "Cards with image and text",
      },
      {
        name: "Testimonial",
        syntax: "Testimonial[{Name;Role;Quote;Photo}]",
        description: "Customer testimonials",
      },
      {
        name: "Pricing",
        syntax: "Pricing[{Plan;$9/mo;Features}]",
        description: "Pricing cards",
      },
      {
        name: "Stats",
        syntax: "Stats[{100+;Label}]",
        description: "Statistics display",
      },
      {
        name: "Team",
        syntax: "Team[{Name;Role;Photo;Bio}]",
        description: "Team member profiles",
      },
      {
        name: "Steps",
        syntax: "Steps[{1;Title;Description}]",
        description: "Numbered step process",
      },
      {
        name: "Metric",
        syntax: "Metric[{📈;Value;Label;+15%}]",
        description: "KPI metrics with change",
      },
      {
        name: "Showcase",
        syntax: "Showcase[URL;Title;Subtitle;{Spec;Value}]",
        description: "Product showcase with specs",
      },
    ],
  },
  {
    category: "Interactive",
    icon: "✨",
    items: [
      {
        name: "FAQ",
        syntax: "FAQ[{Question?;Answer}]",
        description: "Expandable FAQ accordion",
      },
      {
        name: "CTA",
        syntax: "CTA[Title;Desc;Button;URL]",
        description: "Call-to-action block",
      },
      {
        name: "Timeline",
        syntax: "Timeline[{2024;Event;Desc}]",
        description: "Chronological events",
      },
      {
        name: "Countdown",
        syntax: "Countdown[Label;Date;Desc]",
        description: "Event countdown",
      },
      {
        name: "Badge",
        syntax: "Badge[Text]",
        description: "Colored tag/badge",
      },
      {
        name: "Progress",
        syntax: "Progress[75;Label]",
        description: "Progress bar",
      },
      {
        name: "AnimateOnScroll",
        syntax: "AnimateOnScroll[]",
        description: "Animate elements on scroll",
      },
    ],
  },
  {
    category: "Callouts",
    icon: "📌",
    items: [
      { name: "Warn", syntax: "Warn[Message]", description: "Warning callout" },
      { name: "Def", syntax: "Def[Message]", description: "Info callout" },
      {
        name: "quote",
        syntax: "quote[Text]",
        description: "Styled quote block",
      },
      {
        name: "Divider",
        syntax: "Divider[wave]",
        description: "Visual divider",
      },
    ],
  },
];

const deckSyntaxReference = [
  {
    category: "Document Setup",
    icon: "📄",
    items: [
      {
        name: "Title",
        syntax: "--- Presentation Title",
        description: "Sets presentation title",
      },
      {
        name: "Theme",
        syntax: "Theme[Modern]",
        description: "11 themes available",
      },
      {
        name: "New Slide",
        syntax: "-- Slide Title",
        description: "Creates new slide",
      },
      {
        name: "Logo",
        syntax: "Logo[Text or URL]",
        description: "Logo on all slides",
      },
      {
        name: "Background",
        syntax: "Background[URL]",
        description: "Slide background image",
      },
      {
        name: "Notes",
        syntax: "Notes[Speaker notes]",
        description: "Private notes (presenter mode)",
      },
    ],
  },
  {
    category: "Slide Content",
    icon: "🖼️",
    items: [
      { name: "Image", syntax: "Image[url]", description: "Display image" },
      { name: "Video", syntax: "Video[url]", description: "Embed video" },
      { name: "Code", syntax: "Code[js; code]", description: "Code block" },
      {
        name: "Bigtitle",
        syntax: "Bigtitle[Text]",
        description: "Large title",
      },
      {
        name: "Column",
        syntax: "Column[{Left}{Right}]",
        description: "Two-column layout",
      },
    ],
  },
  {
    category: "Components",
    icon: "🧩",
    items: [
      {
        name: "Feature",
        syntax: "Feature[{🚀;Title;Desc}]",
        description: "Feature cards",
      },
      {
        name: "Stats",
        syntax: "Stats[{100+;Label}]",
        description: "Statistics",
      },
      {
        name: "Timeline",
        syntax: "Timeline[{2024;Event;Desc}]",
        description: "Timeline events",
      },
      { name: "List", syntax: "List[{✅;Item}]", description: "Icon list" },
      {
        name: "Gallery",
        syntax: "Gallery[{url;caption}]",
        description: "Image grid",
      },
      {
        name: "Progress",
        syntax: "Progress[75;Label]",
        description: "Progress bar",
      },
      {
        name: "Graph",
        syntax: "Graph[{a;Start;->b}]",
        description: "Flowchart",
      },
      {
        name: "Comparison",
        syntax: "Comparison[{Before;❌}{After;✅}]",
        description: "Compare columns",
      },
      {
        name: "Agenda",
        syntax: "Agenda[{1;Topic;5min}]",
        description: "Meeting agenda",
      },
      {
        name: "Speaker",
        syntax: "Speaker[Quote;Name;Role;Photo]",
        description: "Quote with speaker photo",
      },
    ],
  },
  {
    category: "Callouts",
    icon: "📌",
    items: [
      { name: "Warn", syntax: "Warn[Message]", description: "Warning callout" },
      { name: "Def", syntax: "Def[Message]", description: "Info callout" },
      { name: "quote", syntax: "quote[Text]", description: "Quote block" },
      { name: "Badge", syntax: "Badge[Text]", description: "Badge/tag" },
    ],
  },
];

const docSyntaxReference = [
  {
    category: "Document Structure",
    icon: "📄",
    items: [
      {
        name: "Title",
        syntax: "--- My Document",
        description: "Sets the document title",
      },
      {
        name: "Theme",
        syntax: "Theme[Modern]",
        description:
          "Themes: Modern, Natural, Latte, Dark Mode, Terminal, Ocean, Solarized, Midnight, Minimal",
      },
      {
        name: "Section",
        syntax: "--- Section Title",
        description: "Creates a main section",
      },
      {
        name: "Subsection",
        syntax: "-- Sub Section",
        description: "Creates a subsection",
      },
    ],
  },
  {
    category: "Headings",
    icon: "📝",
    items: [
      {
        name: "Heading H1",
        syntax: "# Heading level 1",
        description: "Main heading",
      },
      {
        name: "Heading H2",
        syntax: "## Heading level 2",
        description: "Subheading",
      },
      {
        name: "Heading H3",
        syntax: "### Heading level 3",
        description: "Tertiary heading",
      },
    ],
  },
  {
    category: "Formatting",
    icon: "✨",
    items: [
      { name: "Bold", syntax: "**bold text**", description: "Makes text bold" },
      {
        name: "Italic",
        syntax: "*italic text*",
        description: "Makes text italic",
      },
      {
        name: "Inline code",
        syntax: "`code`",
        description: "Code within text",
      },
      {
        name: "Link",
        syntax: "[text](https://url.com)",
        description: "Hyperlink",
      },
    ],
  },
  {
    category: "Lists",
    icon: "📋",
    items: [
      {
        name: "Bullet list",
        syntax: "- First\n- Second",
        description: "Unordered list",
      },
      {
        name: "Numbered list",
        syntax: "1. First\n2. Second",
        description: "Ordered list",
      },
      {
        name: "Checkbox",
        syntax: "- [ ] To do\n- [x] Done",
        description: "Task list",
      },
    ],
  },
  {
    category: "Blocks",
    icon: "🧩",
    items: [
      {
        name: "Quote",
        syntax: "> Important quote",
        description: "Block quote",
      },
      { name: "Code", syntax: "```\ncode\n```", description: "Code block" },
      {
        name: "Image",
        syntax: "![desc](url)",
        description: "Image with description",
      },
      {
        name: "Table",
        syntax: "| Col1 | Col2 |\n|------|------|\n| Val1 | Val2 |",
        description: "Table",
      },
      { name: "Divider", syntax: "---", description: "Horizontal rule" },
    ],
  },
  {
    category: "Callouts",
    icon: "📌",
    items: [
      {
        name: "Info",
        syntax: "Callout[info;Message]",
        description: "Blue info block",
      },
      {
        name: "Warning",
        syntax: "Callout[warning;Message]",
        description: "Yellow warning block",
      },
      {
        name: "Success",
        syntax: "Callout[success;Message]",
        description: "Green success block",
      },
      {
        name: "Error",
        syntax: "Callout[error;Message]",
        description: "Red error block",
      },
    ],
  },
];

const calusSyntaxReference = [
  {
    category: "Arithmetic",
    icon: "🔢",
    items: [
      { name: "Addition", syntax: "2 + 3", description: "Basic addition" },
      { name: "Subtraction", syntax: "10 - 4", description: "Subtraction" },
      {
        name: "Multiplication",
        syntax: "3 * 4",
        description: "Multiplication",
      },
      { name: "Division", syntax: "10 / 3", description: "Division" },
      { name: "Power", syntax: "2^8", description: "Exponentiation" },
      { name: "Modulo", syntax: "10 % 3", description: "Remainder" },
    ],
  },
  {
    category: "Variables",
    icon: "📦",
    items: [
      {
        name: "Assign",
        syntax: "a = 5",
        description: "Store a value in a variable",
      },
      {
        name: "Use",
        syntax: "a^2 + 1",
        description: "Use variables in expressions",
      },
    ],
  },
  {
    category: "Functions",
    icon: "📈",
    items: [
      {
        name: "Define",
        syntax: "f(x) = x^2 - 4",
        description: "Define a function (auto-plotted)",
      },
      {
        name: "Evaluate",
        syntax: "f(3)",
        description: "Evaluate a function at a point",
      },
      {
        name: "Multi-param",
        syntax: "g(x) = sin(x) * 3",
        description: "Any expression with x",
      },
    ],
  },
  {
    category: "Built-in Functions",
    icon: "⚙️",
    items: [
      { name: "sqrt", syntax: "sqrt(144)", description: "Square root" },
      {
        name: "sin/cos/tan",
        syntax: "sin(pi / 2)",
        description: "Trigonometric functions",
      },
      {
        name: "log/ln",
        syntax: "log(100) / ln(e)",
        description: "Logarithms (base-10 / natural)",
      },
      { name: "abs", syntax: "abs(-5)", description: "Absolute value" },
      {
        name: "floor/ceil",
        syntax: "floor(3.7)",
        description: "Rounding functions",
      },
    ],
  },
  {
    category: "Constants",
    icon: "🔣",
    items: [
      { name: "Pi", syntax: "pi", description: "3.14159…" },
      { name: "Euler", syntax: "e", description: "2.71828…" },
    ],
  },
  {
    category: "Comments",
    icon: "💬",
    items: [
      {
        name: "Comment",
        syntax: "# This is a comment",
        description: "Lines starting with # are ignored",
      },
    ],
  },
];

export function HelpModal({ mode = "block" }: HelpModalProps) {
  const isBlock = mode === "block";
  const isDeck = mode === "deck";
  const isDoc = mode === "doc";
  const isCalus = mode === "calus";

  const syntaxReference = isCalus
    ? calusSyntaxReference
    : isDoc
      ? docSyntaxReference
      : isDeck
        ? deckSyntaxReference
        : blockSyntaxReference;
  const title = isCalus
    ? "Netral Calus Guide"
    : isDoc
      ? "Netral Doc Guide"
      : isDeck
        ? "Netral Deck Guide"
        : "Netral Block Guide";
  const Icon = isCalus
    ? Calculator
    : isDoc
      ? FileText
      : isDeck
        ? Presentation
        : Sparkles;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mx-6 mb-2">
            <TabsTrigger value="overview" className="gap-2">
              <Zap className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="syntax" className="gap-2">
              <Code className="h-3.5 w-3.5" />
              Syntax
            </TabsTrigger>
            {!isCalus && (
              <TabsTrigger value="themes" className="gap-2">
                <Palette className="h-3.5 w-3.5" />
                Themes
              </TabsTrigger>
            )}
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <div className="px-6 pb-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Hero */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                  <h3 className="text-lg font-semibold mb-2">
                    {isCalus
                      ? "What is Netral Calus?"
                      : isDoc
                        ? "What is Netral Doc?"
                        : isBlock
                          ? "What is Netral Block?"
                          : "What is Netral Deck?"}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {isCalus
                      ? "Netral Calus is an interactive math calculator and function plotter. Write arithmetic expressions, define variables and functions on the left — see computed results inline and function curves plotted on a Cartesian plane on the right."
                      : isBlock
                        ? "Netral Block is a simple markup language that lets you create beautiful, responsive websites without writing HTML or CSS. Just write your content using intuitive syntax, and Netral transforms it into a polished, professional page."
                        : isDeck
                          ? "Netral Deck is a simple markup language for creating beautiful presentations. Write your slides using intuitive syntax and present them in fullscreen mode with keyboard navigation."
                          : "Netral Doc is a markdown-based document editor with live preview, themes, and rich formatting support."}
                  </p>
                </div>

                {/* Key Features */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Layout className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium">Live Preview</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      See your changes instantly as you type. The preview
                      updates in real-time.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Palette className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium">9 Themes</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose from Modern, Natural, Latte, Dark Mode, Terminal,
                      Ocean, and more.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium">
                        {isBlock ? "Export HTML" : "Fullscreen Mode"}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isBlock
                        ? "Export your site as a standalone HTML file ready to host anywhere."
                        : "Launch your presentation in fullscreen with keyboard navigation (arrows, space, escape)."}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium">Type & Tab</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Type an element name and press Tab to auto-insert a
                      template snippet.
                    </p>
                  </div>
                </div>

                {/* Quick Start */}
                <div>
                  <h3 className="font-semibold mb-3">Quick Start</h3>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-1">
                    {isBlock ? (
                      <>
                        <p className="text-muted-foreground">--- My Website</p>
                        <p className="text-muted-foreground">Theme[Modern]</p>
                        <p className="text-muted-foreground">Logo[My Brand]</p>
                        <p className="text-muted-foreground">
                          Header[BigText;Welcome;Your tagline here;;#]
                        </p>
                        <p className="text-muted-foreground">-- Features</p>
                        <p className="text-muted-foreground">Feature[</p>
                        <p className="text-muted-foreground pl-4">
                          {"{"}🚀;Fast;Lightning quick{"}"}
                        </p>
                        <p className="text-muted-foreground pl-4">
                          {"{"}💎;Beautiful;Stunning design{"}"}
                        </p>
                        <p className="text-muted-foreground">]</p>
                      </>
                    ) : (
                      <>
                        <p className="text-muted-foreground">
                          --- My Presentation
                        </p>
                        <p className="text-muted-foreground">Theme[Modern]</p>
                        <p className="text-muted-foreground">-- Welcome</p>
                        <p className="text-muted-foreground">
                          Bigtitle[Hello World]
                        </p>
                        <p className="text-muted-foreground">-- Features</p>
                        <p className="text-muted-foreground">Feature[</p>
                        <p className="text-muted-foreground pl-4">
                          {"{"}🚀;Fast;Quick to create{"}"}
                        </p>
                        <p className="text-muted-foreground pl-4">
                          {"{"}🎨;Beautiful;Stunning slides{"}"}
                        </p>
                        <p className="text-muted-foreground">]</p>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="syntax" className="mt-0 space-y-6">
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>
                    Pro tip: Type an element name and press{" "}
                    <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono">
                      Tab
                    </kbd>{" "}
                    to insert a template!
                  </span>
                </div>

                {syntaxReference.map((section) => (
                  <div key={section.category}>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <span>{section.icon}</span>
                      {section.category}
                    </h3>
                    <div className="grid gap-2">
                      {section.items.map((item) => (
                        <div
                          key={item.name}
                          className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </div>
                          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                            <code>{item.syntax}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="themes" className="mt-0 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Change your {isBlock ? "site" : "presentation"}'s appearance
                  instantly with the Theme element. Each theme includes
                  carefully chosen colors, fonts, and styling.
                </p>

                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    {
                      name: "Modern",
                      colors: ["#6366f1", "#f8fafc", "#1e293b"],
                      desc: "Clean & professional",
                    },
                    {
                      name: "Natural",
                      colors: ["#059669", "#f0fdf4", "#064e3b"],
                      desc: "Organic & fresh",
                    },
                    {
                      name: "Latte",
                      colors: ["#ca8a04", "#fefce8", "#422006"],
                      desc: "Warm & inviting",
                    },
                    {
                      name: "Dark Mode",
                      colors: ["#8b5cf6", "#0a0a0a", "#fafafa"],
                      desc: "Sleek & modern",
                    },
                    {
                      name: "Terminal",
                      colors: ["#22c55e", "#0c0c0c", "#22c55e"],
                      desc: "Hacker aesthetic",
                    },
                    {
                      name: "Ocean",
                      colors: ["#0ea5e9", "#0c4a6e", "#f0f9ff"],
                      desc: "Cool & calming",
                    },
                    {
                      name: "Solarized",
                      colors: ["#b58900", "#fdf6e3", "#002b36"],
                      desc: "Easy on eyes",
                    },
                    {
                      name: "Midnight",
                      colors: ["#f472b6", "#0f0f23", "#e2e8f0"],
                      desc: "Bold & dramatic",
                    },
                    {
                      name: "Minimal",
                      colors: ["#171717", "#ffffff", "#171717"],
                      desc: "Pure & simple",
                    },
                  ].map((theme) => (
                    <div
                      key={theme.name}
                      className="border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex gap-1 mb-2">
                        {theme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border border-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <h4 className="font-medium text-sm">{theme.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {theme.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Usage</h4>
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    Theme[Dark Mode]
                  </code>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default HelpModal;
