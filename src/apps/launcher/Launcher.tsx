/**
 * Netral Launcher
 * Gallery view to select between different Netral tools
 */

import { useRef, useState } from "react";
import {
  Layers,
  Presentation,
  Upload,
  FileText,
  GraduationCap,
  Workflow,
  Settings,
  Sun,
  Moon,
  Pentagon,
} from "lucide-react";
import { useDarkMode } from "@/shared/components/DarkModeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NetralMode = "block" | "deck" | "doc" | "calus" | null;

interface LauncherProps {
  onSelectMode: (mode: NetralMode, content?: string) => void;
}

const tools = [
  {
    id: "block" as const,
    name: "Netral Block",
    description: "Create websites with simple, intuitive syntax",
    icon: Layers,
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20",
    comingSoon: false,
  },
  {
    id: "deck" as const,
    name: "Netral Deck",
    description: "Create elegant presentations with interactive slides",
    icon: Presentation,
    gradient: "from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/20",
    comingSoon: false,
  },
  {
    id: "doc" as const,
    name: "Netral Doc",
    description: "Create beautiful documents with PDF export",
    icon: FileText,
    gradient: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/20",
    comingSoon: false,
  },
  {
    id: "calus" as const,
    name: "Netral Calus",
    description: "Interactive geometry and math visualization",
    icon: Pentagon,
    gradient: "from-cyan-500 to-cyan-600",
    shadow: "shadow-cyan-500/20",
    comingSoon: false,
  },
  {
    id: "luate" as const,
    name: "Netral Luate",
    description: "Create exercises and quizzes for education",
    icon: GraduationCap,
    gradient: "from-amber-500 to-amber-600",
    shadow: "shadow-amber-500/20",
    comingSoon: true,
  },
  {
    id: "flow" as const,
    name: "Netral Flow",
    description: "An ultra-simple visual programming language",
    icon: Workflow,
    gradient: "from-rose-500 to-rose-600",
    shadow: "shadow-rose-500/20",
    comingSoon: true,
  },
];

export function Launcher({ onSelectMode }: LauncherProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { mode, setMode } = useDarkMode();

  const handleFileLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "netdeck") onSelectMode("deck", content);
      else if (ext === "netdoc") onSelectMode("doc", content);
      else onSelectMode("block", content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileLoad(file);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileLoad(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative">
      {/* Settings gear */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 rounded-xl border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-sm">
              <Settings className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
              className="gap-2 cursor-pointer"
            >
              {mode === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {mode === "dark" ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-3 tracking-tight">
            Netral
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              .
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Choose your creation tool
          </p>
        </div>

        {/* Tools Grid - responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={
                tool.comingSoon
                  ? undefined
                  : () => onSelectMode(tool.id as NetralMode)
              }
              disabled={tool.comingSoon}
              className={`group relative bg-card border border-border rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 ${
                tool.comingSoon
                  ? "opacity-50 cursor-not-allowed"
                  : `hover:border-border/80 hover:shadow-xl hover:${tool.shadow} hover:-translate-y-1`
              }`}
            >
              {tool.comingSoon && (
                <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[9px] uppercase tracking-widest font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Soon
                </span>
              )}
              <div
                className={`inline-flex p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${tool.gradient} mb-3 sm:mb-4 transition-transform duration-300 shadow-lg ${tool.shadow} ${
                  tool.comingSoon
                    ? "grayscale opacity-60"
                    : "group-hover:scale-110 group-hover:rotate-2"
                }`}
              >
                <tool.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h2
                className={`text-sm sm:text-base font-bold mb-1 transition-colors duration-300 ${tool.comingSoon ? "text-muted-foreground" : "text-foreground"}`}
              >
                {tool.name}
              </h2>
              <p
                className={`text-[11px] sm:text-xs leading-relaxed ${tool.comingSoon ? "text-muted-foreground/60" : "text-muted-foreground"}`}
              >
                {tool.description}
              </p>
            </button>
          ))}
        </div>

        {/* Drag & Drop */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".netblock,.netdeck,.netdoc,.txt"
          onChange={handleFileInput}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all duration-200 ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-muted-foreground/30"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className={`p-2.5 rounded-full ${isDragOver ? "bg-primary/10" : "bg-muted"}`}
            >
              {isDragOver ? (
                <FileText className="h-5 w-5 text-primary" />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragOver ? "Drop file here" : "Drop a file or click to open"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                .netblock, .netdeck, or .netdoc
              </p>
            </div>
          </div>
        </button>

        <p className="text-center text-xs text-muted-foreground/50 mt-6 sm:mt-8">
          Netral Apps — Create without limits
        </p>
      </div>
    </div>
  );
}

export default Launcher;
