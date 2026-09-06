/**
 * Student Exam View
 * Online exam interface: student fills in answers and gets a score code to send to teacher.
 * No answers are included in the page — grading happens via the teacher's answer key.
 */

import { useState, useMemo, useCallback } from 'react';
import { LuateRenderer } from '@/core/renderer/LuateRenderer';
import { parseLuateDocument } from '@/core/parser/luateParser';
import { compressToEncodedURIComponent } from 'lz-string';
import { GraduationCap, Send, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentExamViewProps {
  content: string;
}

export function StudentExamView({ content }: StudentExamViewProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreCode, setScoreCode] = useState('');
  const [copied, setCopied] = useState(false);

  const doc = useMemo(() => parseLuateDocument(content), [content]);

  const handleAnswer = useCallback((qi: number, answer: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qi]: answer }));
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    const studentName = answers[-1] || 'Anonymous';
    // Build submission: name + answers (no questions, no correct answers)
    const submission = {
      n: studentName,
      a: { ...answers },
      t: Date.now(),
    };
    delete submission.a[-1]; // remove name from answers map
    const compressed = compressToEncodedURIComponent(JSON.stringify(submission));
    setScoreCode(compressed);
    setSubmitted(true);
  }, [answers]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(scoreCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [scoreCode]);

  // Count answered questions
  const totalQuestions = doc.sections.reduce((s, sec) => s + sec.questions.length, 0);
  const answeredCount = Object.keys(answers).filter(k => k !== '-1' && answers[parseInt(k)]).length;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card rounded-xl border border-border p-8 text-center space-y-6">
          <GraduationCap className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Exam Submitted!</h1>
          <p className="text-muted-foreground">
            Copy the code below and send it to your teacher for grading.
          </p>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Your response code:</p>
            <textarea
              readOnly
              value={scoreCode}
              className="w-full h-24 text-xs font-mono bg-background border border-border rounded p-2 resize-none"
            />
          </div>
          <Button onClick={handleCopy} className="gap-2 w-full">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Student: <strong>{answers[-1] || 'Anonymous'}</strong> · {answeredCount}/{totalQuestions} answered
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">{doc.title}</span>
          <span className="text-xs text-muted-foreground">{answeredCount}/{totalQuestions} answered</span>
        </div>
        <Button onClick={handleSubmit} className="gap-2" disabled={!answers[-1]}>
          <Send className="h-4 w-4" />
          Submit
        </Button>
      </div>

      {/* Exam content */}
      <LuateRenderer
        content={content}
        interactive
        studentAnswers={answers}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
