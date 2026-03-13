/**
 * Netral Calus Application
 * Math calculator, equation solver & function/circle plotter
 */

import { useState, useCallback, useMemo } from "react";
import { Editor } from "@/components/Editor";
import { CalusRenderer } from "@/core/renderer/CalusRenderer";
import { parseCalus } from "@/core/parser/calusParser";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Calculator, Eye, Code2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { HelpModal } from "@/shared/components/HelpModal";
import { FileMenu } from "@/shared/components/FileMenu";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Default Content ─────────────────────────────────────────────────────

const DEFAULT_CONTENT = `# Netral Calus — Math & Graphs

# Basic arithmetic
2 + 3 * 4
sqrt(144)
sin(pi / 2)

# Variables
a = 5
b = 3
a^2 + b^2

# Functions (plotted)
f(x) = x^2 - 4
g(x) = sin(x) * 3
h(x) = 2x + 1

# Evaluate
f(3)
g(pi)

# Solve equations
2x + 5 = 15
3x - 7 = 20

# Circles
(x-2)² + (y-1)² = 9
x² + y² = 16
`;

interface CalusAppProps {
  initialContent?: string;
  onBack: () => void;
}

export function CalusApp({ initialContent, onBack }: CalusAppProps) {
  const [content, setContent] = useState(initialContent || DEFAULT_CONTENT);
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const isMobile = useIsMobile();

  const results = useMemo(() => parseCalus(content), [content]);

  const handleChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  const handleReset = useCallback(() => {
    setContent(DEFAULT_CONTENT);
    toast({ title: "Reset to default" });
  }, []);

  // Extract title from first comment line
  const docTitle = useMemo(() => {
    const firstComment = content
      .split("\n")
      .find((l) => l.trim().startsWith("#"));
    return firstComment?.replace(/^#\s*/, "").trim() || "Calculations";
  }, [content]);

  // ─── Results Panel ────────────────────────────────────────────────────

  const ResultsPanel = () => (
    <div className="h-full overflow-auto bg-card border-r border-border font-mono text-sm">
      {results.map((r, i) => (
        <div
          key={i}
          className={`px-3 py-1 border-b border-border/50 flex items-center min-h-[28px] ${
            r.type === "error"
              ? "bg-destructive/5"
              : r.type === "empty" || r.type === "comment"
                ? "opacity-40"
                : ""
          }`}
        >
          {r.type === "value" && (
            <span className="text-foreground font-semibold">= {r.output}</span>
          )}
          {r.type === "assignment" && (
            <span className="text-primary">{r.output}</span>
          )}
          {r.type === "equation" && (
            <span className="text-accent-foreground font-semibold">
              → {r.output}
            </span>
          )}
          {r.type === "circle" && (
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block shrink-0"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-muted-foreground text-xs">{r.output}</span>
            </span>
          )}
          {r.type === "plot" && (
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block shrink-0"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-muted-foreground">{r.output}</span>
            </span>
          )}
          {r.type === "error" && (
            <span className="text-destructive text-xs">⚠ {r.output}</span>
          )}
          {r.type === "comment" && (
            <span className="text-muted-foreground text-xs italic">
              {r.input.trim().replace(/^[#/]+\s*/, "")}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  // ─── Mobile Layout ─────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <header className="flex h-12 items-center justify-between border-b border-border bg-card px-2 gap-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Calculator className="h-5 w-5 text-primary" />
            <FileMenu
              documentTitle={docTitle}
              content={content}
              onLoad={handleChange}
              fileExtension=".netcalus"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={mobileView === "editor" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMobileView("editor")}
              className="h-7 gap-1 text-xs"
            >
              <Code2 className="h-3 w-3" />
              Editor
            </Button>
            <Button
              variant={mobileView === "preview" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMobileView("preview")}
              className="h-7 gap-1 text-xs"
            >
              <Eye className="h-3 w-3" />
              Graph
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          {mobileView === "editor" ? (
            <div className="h-full flex flex-col">
              <div className="flex-1">
                <Editor value={content} onChange={handleChange} mode="doc" />
              </div>
              <div className="h-1/3 border-t border-border">
                <ResultsPanel />
              </div>
            </div>
          ) : (
            <CalusRenderer results={results} />
          )}
        </div>
      </div>
    );
  }

  // ─── Desktop Layout ────────────────────────────────────────────────────

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Calculator className="h-5 w-5 text-primary shrink-0" />
          <FileMenu
            documentTitle={docTitle}
            content={content}
            onLoad={handleChange}
            fileExtension=".netcalus"
          />
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
            {results.filter((r) => r.type === "plot").length} functions ·{" "}
            {results.filter((r) => r.type === "circle").length} circles ·{" "}
            {
              results.filter(
                (r) =>
                  r.type === "value" ||
                  r.type === "assignment" ||
                  r.type === "equation",
              ).length
            }{" "}
            results
          </span>
        </div>

        <div className="flex items-center gap-2">
          <HelpModal mode="calus" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to default</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={30} minSize={20}>
          <Editor value={content} onChange={handleChange} mode="doc" />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={20} minSize={12}>
          <ResultsPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={25}>
          <CalusRenderer results={results} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default CalusApp;
