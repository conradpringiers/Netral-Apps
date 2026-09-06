/**
 * CodeMirror Editor Component
 * Provides syntax highlighting and editing features for Markdown
 */

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap, CompletionContext, Completion } from '@codemirror/autocomplete';

export type EditorMode = 'block' | 'deck' | 'doc' | 'luate' | 'calus';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  mode?: EditorMode;
}

// Block mode snippets (sites)
const blockSnippets: Record<string, string> = {
  'Feature': `Feature[
{🚀;Title;Description}
{⚡;Title;Description}
]`,
  'Column': `Column[
{Left content}
{Right content}
]`,
  'Element': `Element[
{Title;Description;https://image.url}
]`,
  'Testimonial': `Testimonial[
{Name;Role;Quote text;https://avatar.url}
]`,
  'Pricing': `Pricing[
{Basic;$9/mo;Feature 1, Feature 2, Feature 3}
{Pro;$29/mo;Everything in Basic, Priority support}
]`,
  'Image': `Image[https://picsum.photos/800/400?random={{random}}]`,
  'Video': `Video[https://example.com/video.mp4]`,
  'Embed': `Embed[https://example.com]`,
  'Warn': `Warn[Warning message here]`,
  'Def': `Def[Info message here]`,
  'quote': `quote[Your quote here]`,
  'Bigtitle': `Bigtitle[Your Big Title]`,
  'Header': `Header[Classic;Title;Description;https://image.url;https://link.url]`,
  'Navbar': `Navbar[
{Home;#home}
{Features;#features}
{Contact;#contact}
]`,
  'Stats': `Stats[
{100+;Clients}
{50K;Downloads}
{99%;Satisfaction}
]`,
  'CTA': `CTA[Ready to get started?;Join thousands of satisfied users;Get Started;https://example.com]`,
  'FAQ': `FAQ[
{What is this?;This is a great product that helps you achieve your goals.}
{How does it work?;Simply sign up and start using our intuitive interface.}
]`,
  'Divider': `Divider[wave]`,
  'Gallery': `Gallery[
{https://picsum.photos/400/300?random={{random}};Image 1}
{https://picsum.photos/400/300?random={{random}};Image 2}
{https://picsum.photos/400/300?random={{random}};Image 3}
]`,
  'Timeline': `Timeline[
{2024;Step 1;Description of the step}
{2025;Step 2;Description of the step}
]`,
  'Team': `Team[
{John Doe;CEO;https://i.pravatar.cc/150?img=1}
{Jane Smith;CTO;https://i.pravatar.cc/150?img=2}
]`,
  'Steps': `Steps[
{1;First Step;Description of what to do in this step}
{2;Second Step;Continue with this action}
{3;Third Step;Final step to complete}
]`,
  'Metric': `Metric[
{📈;12.5K;Monthly Users;+15%}
{💰;$48K;Revenue;+8%}
{⭐;4.9;Rating;↑0.2}
]`,
  'Badge': `Badge[New Feature]`,
  'Progress': `Progress[75;Loading...]`,
  'Showcase': `Showcase[
https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600;
Premium Headphones;
Experience crystal-clear audio with our flagship model
{Battery;40h}
{Driver;50mm}
{Noise Cancelling;Active}
{Connectivity;Bluetooth 5.0}
]`,
  'AnimateOnScroll': `AnimateOnScroll[]`,
  'Title': `--- My Site`,
  'Theme': `Theme[Modern]`,
  'Logo': `Logo[My Brand]`,
  'Section': `-- Section Title`,
  'Countdown': `Countdown[Product Launch;2025-12-31;Don't miss it!]`,
  'Meta': `Meta[Site Title;Site description for search engines;https://example.com/og-image.jpg]`,
  'Form': `Form[
{mailto:contact@example.com;POST;Send Message}
{text;name;Your Name;Enter your name}
{email;email;Your Email;you@example.com}
{textarea;message;Your Message;Write your message here}
]`,
};

// Deck mode snippets (presentations)
const deckSnippets: Record<string, string> = {
  'slide': `-- Slide Title`,
  'Feature': `Feature[
{🚀;Title;Description}
{⚡;Title;Description}
{🎯;Title;Description}
]`,
  'Column': `Column[
{
## Left
Left content
}
{
## Right
Right content
}
]`,
  'Stats': `Stats[
{100+;Metric}
{50K;Value}
{99%;Score}
]`,
  'Image': `Image[https://picsum.photos/800/400?random={{random}}]`,
  'Warn': `Warn[Warning message]`,
  'Def': `Def[Important information]`,
  'quote': `quote[Your quote here]`,
  'Bigtitle': `Bigtitle[Main title]`,
  'Timeline': `Timeline[
{2024;Step 1;Step description}
{2025;Step 2;Step description}
{2026;Step 3;Step description}
]`,
  'List': `List[
{✓;First item}
{✓;Second item}
{✓;Third item}
]`,
  'Video': `Video[https://example.com/video.mp4]`,
  'Code': `Code[javascript;
function hello() {
  console.log('Hello World!');
}
]`,
  'Badge': `Badge[New]`,
  'Gallery': `Gallery[
{https://picsum.photos/400/300?random={{random}};Image 1}
{https://picsum.photos/400/300?random={{random}};Image 2}
{https://picsum.photos/400/300?random={{random}};Image 3}
]`,
  'Progress': `Progress[75;Progress]`,
  'Graph': `Graph[
{start;Start;->step1}
{step1;Step 1;->step2}
{step2;Step 2;->end}
{end;End;}
]`,
  'Comparison': `Comparison[
{Before;❌ Problem 1;❌ Problem 2}
{After;✅ Solution 1;✅ Solution 2}
]`,
  'Agenda': `Agenda[
{1;Introduction;5 min}
{2;Main topic;15 min}
{3;Conclusion;5 min}
]`,
  'Background': `Background[https://images.unsplash.com/photo-1557683316-973673baf926?w=1920]`,
  'Speaker': `Speaker[Simplicity is the ultimate sophistication;Leonardo da Vinci;Artist & Inventor;https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Leonardo_da_Vinci%2C_Head_of_a_Woman.jpg/440px-Leonardo_da_Vinci%2C_Head_of_a_Woman.jpg]`,
  'Title': `--- My Presentation`,
  'Theme': `Theme[Modern]`,
  'Logo': `Logo[My Brand]`,
  'Notes': `Notes[Private speaker notes for this slide]`,
};

// Doc mode snippets (documents)
const docSnippets: Record<string, string> = {
  'section': `--- Section Title`,
  'subsection': `-- Subsection`,
  'h1': `# Main Heading`,
  'h2': `## Subheading`,
  'h3': `### Heading level 3`,
  'h4': `#### Heading level 4`,
  'bold': `**bold text**`,
  'italic': `*italic text*`,
  'strike': `~~strikethrough~~`,
  'highlight': `==highlighted text==`,
  'list': `- First item
- Second item
- Third item`,
  'numbered': `1. First item
2. Second item
3. Third item`,
  'quote': `> Important quote`,
  'code': `\`\`\`javascript
// Your code here
\`\`\``,
  'inline': `\`inline code\``,
  'link': `[link text](https://url.com)`,
  'image': `![description](https://url.com/image.jpg)`,
  'table': `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value A  | Value B  | Value C  |`,
  'divider': `---`,
  'checkbox': `- [ ] To do
- [x] Done`,
  'note': `> **📝 Note:** Important information`,
  'warn': `> **⚠️ Warning:** Warning message`,
  'success': `> **✅ Success:** Operation succeeded`,
  'info': `> **ℹ️ Info:** Useful information`,
  'definition': `**Term**
: Definition of the term`,
  'footnote': `Text with note[^1]

[^1]: Footnote content`,
  'abbr': `*[HTML]: HyperText Markup Language`,
  'toc': `[[toc]]`,
  'Info callout': `Callout[info;This is important information to remember.]`,
  'Warning callout': `Callout[warning;Warning: this action is irreversible!]`,
  'Success callout': `Callout[success;Operation completed successfully!]`,
  'Error callout': `Callout[error;An error occurred during processing.]`,
};

// Luate mode snippets (exams & quizzes)
const luateSnippets: Record<string, string> = {
  'Title': `--- Exam Title`,
  'Theme': `Theme[Modern]`,
  'Subtitle': `Subtitle[Grade 10]`,
  'Duration': `Duration[90 minutes]`,
  'Instructions': `Instructions[Answer all questions. Show your working where required.]`,
  'Section': `-- Part 1: Section Title`,
  'MCQ': `MCQ[2;Question?;{Option A;Option B;Option C;Option D};Option A]`,
  'Checkbox': `Checkbox[3;Select all that apply;{Option A;Option B;Option C};Option A,Option C]`,
  'Short': `Short[1;Question?;Answer]`,
  'Short batch': `Short[4;Answer each briefly;{Question 1?;Answer 1}{Question 2?;Answer 2}]`,
  'TrueFalse': `TrueFalse[1;Statement;true]`,
  'TrueFalse batch': `TrueFalse[3;Evaluate each statement;{Statement 1;true}{Statement 2;false}]`,
  'FillBlank': `FillBlank[2;The capital of France is ___;Paris]`,
  'FillBlank batch': `FillBlank[4;Complete each sentence;{The capital of France is ___;Paris}{Water freezes at ___ °C;0}]`,
  'Open': `Open[5;Explain your reasoning]`,
  'Open lines': `Open[5;Question?;10;Model answer]`,
  'Canvas': `Canvas[0;Draw your answer;250]`,
};

// Calus mode snippets (math calculator) — no Netral elements, only comments
const calusSnippets: Record<string, string> = {};

// Get snippets based on mode
function getSnippetsForMode(mode: EditorMode): Record<string, string> {
  if (mode === 'deck') return deckSnippets;
  if (mode === 'doc') return docSnippets;
  if (mode === 'luate') return luateSnippets;
  if (mode === 'calus') return calusSnippets;
  return blockSnippets;
}

// Autocompletion for Netral elements
function createNetralCompletions(mode: EditorMode) {
  return (context: CompletionContext) => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    const snippets = getSnippetsForMode(mode);
    const detailMap: Record<EditorMode, string> = {
      block: 'Block element',
      deck: 'Slide element',
      doc: 'Doc element',
      luate: 'Exam element',
      calus: 'Math',
    };
    const completions: Completion[] = Object.entries(snippets).map(([label, snippet]) => ({
      label,
      type: 'keyword',
      apply: (view: EditorView, _completion: Completion, from: number, to: number) => {
        const text = snippet.replace(/\{\{random\}\}/g, () => String(Math.floor(Math.random() * 1000000)));
        view.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
        });
      },
      detail: detailMap[mode] || 'Netral element',
    }));

    return {
      from: word.from,
      options: completions.filter(c => c.label.toLowerCase().startsWith(word.text.toLowerCase())),
    };
  };
}

/**
 * Custom light theme for the editor with line wrapping
 */
const netralTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: '1.6',
    overflow: 'auto',
  },
  '.cm-content': {
    padding: '16px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  '.cm-line': {
    wordBreak: 'break-word',
  },
  '.cm-gutters': {
    backgroundColor: 'hsl(220 9% 46%)',
    borderRight: '1px solid hsl(220 13% 91%)',
    color: 'hsl(220 9% 46%)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 8px',
    minWidth: '40px',
  },
  '.cm-activeLine': {
    backgroundColor: 'hsl(220 9% 46%)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'hsl(220 9% 46%)',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'hsl(221 83% 53% / 0.15)',
  },
  '.cm-cursor': {
    borderLeftColor: 'hsl(221 83% 53%)',
    borderLeftWidth: '2px',
  },
  '.cm-tooltip.cm-tooltip-autocomplete': {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  '.cm-tooltip-autocomplete ul li': {
    padding: '6px 12px',
    
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'hsl(220 9% 46%)',
  },
});

// Type for editor methods
export interface EditorMethods {
  insertAtCursor: (text: string) => void;
  wrapSelection: (prefix: string, suffix: string) => void;
  focus: () => void;
}

export const Editor = forwardRef<EditorMethods, EditorProps>(
  ({ value, onChange, className = '', mode = 'block' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorView | null>(null);

    // Handle external value changes
    const updateListener = useCallback(
      (update: { docChanged: boolean; state: EditorState }) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      },
      [onChange]
    );

    /**
     * Insert text at cursor position
     */
    const insertAtCursor = useCallback((text: string) => {
      const view = editorRef.current;
      if (!view) return;

      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
      view.focus();
    }, []);

    /**
     * Wrap selected text with prefix and suffix
     */
    const wrapSelection = useCallback((prefix: string, suffix: string) => {
      const view = editorRef.current;
      if (!view) return;

      const { from, to } = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(from, to);
      const newText = `${prefix}${selectedText}${suffix}`;

      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + prefix.length, head: from + prefix.length + selectedText.length },
      });
      view.focus();
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      insertAtCursor,
      wrapSelection,
      focus: () => editorRef.current?.focus(),
    }), [insertAtCursor, wrapSelection]);

    // Initialize editor
    useEffect(() => {
      if (!containerRef.current) return;

      const state = EditorState.create({
        doc: value,
        extensions: [
          // Basic setup
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          bracketMatching(),
          closeBrackets(),
          
          // Line wrapping
          EditorView.lineWrapping,

          // Autocompletion with Netral snippets
          autocompletion({
            override: [createNetralCompletions(mode)],
            activateOnTyping: true,
          }),

          // Keymaps
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...closeBracketsKeymap,
            ...completionKeymap,
          ]),

          // Language support
          markdown(),
          syntaxHighlighting(defaultHighlightStyle),

          // Theme
          netralTheme,

          // Update listener
          EditorView.updateListener.of(updateListener),
        ],
      });

      const view = new EditorView({
        state,
        parent: containerRef.current,
      });

      editorRef.current = view;

      return () => {
        view.destroy();
      };
    }, []); // Only initialize once

    // Sync external value changes
    useEffect(() => {
      const view = editorRef.current;
      if (!view) return;

      const currentValue = view.state.doc.toString();
      if (value !== currentValue) {
        view.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }, [value]);

    // Also store methods on container for backward compatibility
    useEffect(() => {
      if (containerRef.current) {
        (containerRef.current as any).editorMethods = {
          insertAtCursor,
          wrapSelection,
          focus: () => editorRef.current?.focus(),
        };
      }
    }, [insertAtCursor, wrapSelection]);

    return (
      <div
        ref={containerRef}
        className={`h-full w-full overflow-hidden bg-background ${className}`}
        data-editor="true"
      />
    );
  }
);

Editor.displayName = 'Editor';

// Helper to get editor methods from container ref (backward compatibility)
export function getEditorMethods(containerRef: React.RefObject<HTMLDivElement>): EditorMethods | null {
  if (containerRef.current && (containerRef.current as any).editorMethods) {
    return (containerRef.current as any).editorMethods;
  }
  return null;
}
