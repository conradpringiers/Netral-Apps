/**
 * Interrogate Modal — Full teacher dashboard
 * Tabs: Student Link | Results (Student Codes, Manual Correction, Global Results, Individual Results)
 */

import { useState, useCallback, useMemo } from 'react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { Copy, Check, Users, Plus, Trash2, ClipboardPaste, BarChart3, UserCheck, FileText, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { parseLuateDocument, stripAnswers, extractAnswerKey, LuateQuestion } from '@/core/parser/luateParser';
import { autoScoreQuestion, requiresManualGrading, decodeSubAnswers, SUB_SEP } from './grading';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

interface InterrogateModalProps {
  content: string;
}

interface StudentResult {
  name: string;
  code: string;
  answers: Record<number, string>;
  autoScore: number;
  manualScores: Record<number, number>;
  total: number;
  timestamp?: number;
}

interface FlatQuestion {
  globalIndex: number;
  sectionIndex: number;
  sectionTitle: string;
  localIndex: number;
  question: LuateQuestion;
  requiresManual: boolean;
}

export function InterrogateModal({ content }: InterrogateModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [pasteCode, setPasteCode] = useState('');
  const [resultsTab, setResultsTab] = useState('codes');
  const [selectedManualQ, setSelectedManualQ] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const doc = useMemo(() => parseLuateDocument(content), [content]);
  const answerKey = useMemo(() => extractAnswerKey(doc), [doc]);

  // Flatten questions with metadata
  const flatQuestions = useMemo<FlatQuestion[]>(() => {
    const result: FlatQuestion[] = [];
    let gi = 0;
    doc.sections.forEach((sec, si) => {
      sec.questions.forEach((q, qi) => {
        result.push({
          globalIndex: gi, sectionIndex: si, sectionTitle: sec.title,
          localIndex: qi, question: q, requiresManual: requiresManualGrading(q),
        });
        gi++;
      });
    });
    return result;
  }, [doc]);

  const manualQuestions = useMemo(() => flatQuestions.filter(fq => fq.requiresManual), [flatQuestions]);

  // Generate student link
  const studentLink = useMemo(() => {
    if (!open) return '';
    const stripped = stripAnswers(content);
    return `${BASE_URL}/?mode=exam&c=${compressToEncodedURIComponent(stripped)}`;
  }, [open, content]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(studentLink).then(() => {
      setCopied(true);
      toast({ title: 'Link copied!' });
      setTimeout(() => setCopied(false), 2000);
    });
  }, [studentLink]);

  // Grade auto-gradeable questions
  const gradeAuto = useCallback((studentAnswers: Record<number, string>): { autoScore: number; total: number } => {
    let autoScore = 0;
    let total = 0;
    for (const fq of flatQuestions) {
      total += fq.question.points;
      const result = autoScoreQuestion(fq.question, studentAnswers[fq.globalIndex], answerKey[fq.globalIndex]);
      if (result) autoScore += result.score;
    }
    return { autoScore, total };
  }, [flatQuestions, answerKey]);

  const handleAddStudent = useCallback(() => {
    if (!pasteCode.trim()) return;
    try {
      const json = decompressFromEncodedURIComponent(pasteCode.trim());
      if (!json) throw new Error('Invalid');
      const data = JSON.parse(json);
      const { autoScore, total } = gradeAuto(data.a || {});
      setStudents(prev => [...prev, {
        name: data.n || 'Anonymous',
        code: pasteCode.trim(),
        answers: data.a || {},
        autoScore,
        manualScores: {},
        total,
        timestamp: data.t,
      }]);
      setPasteCode('');
      toast({ title: `${data.n || 'Anonymous'} added` });
    } catch {
      toast({ title: 'Invalid response code', variant: 'destructive' });
    }
  }, [pasteCode, gradeAuto]);

  const getStudentTotal = (s: StudentResult) => {
    const manualSum = Object.values(s.manualScores).reduce((a, b) => a + b, 0);
    return s.autoScore + manualSum;
  };

  const handleSetManualScore = useCallback((studentIdx: number, questionIdx: number, score: number) => {
    setStudents(prev => prev.map((s, i) => {
      if (i !== studentIdx) return s;
      return { ...s, manualScores: { ...s.manualScores, [questionIdx]: score } };
    }));
  }, []);

  const handleRemoveStudent = useCallback((index: number) => {
    setStudents(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Stats
  const avgScore = students.length > 0 ? students.reduce((s, st) => s + getStudentTotal(st), 0) / students.length : 0;
  const maxPts = students[0]?.total || doc.totalPoints;

  // Per-question success rate (partial credit for multi-item questions)
  const questionStats = useMemo(() => {
    if (students.length === 0) return [];
    return flatQuestions.map(fq => {
      let achieved = 0;
      let possible = 0;
      for (const s of students) {
        possible += fq.question.points;
        if (fq.requiresManual) {
          const ms = s.manualScores[fq.globalIndex];
          if (ms !== undefined) achieved += ms;
        } else {
          const result = autoScoreQuestion(fq.question, s.answers[fq.globalIndex], answerKey[fq.globalIndex]);
          if (result) achieved += result.score;
        }
      }
      return { ...fq, successRate: possible > 0 ? achieved / possible : 0 };
    });
  }, [students, flatQuestions, answerKey]);

  const hasAnswerKey = Object.keys(answerKey).length > 0;

  /** Render a question's answer block in HTML form for the PDF export. */
  const renderQuestionPdfBlock = (fq: FlatQuestion, s: StudentResult): string => {
    const q = fq.question;
    const ans = s.answers[fq.globalIndex];
    const correct = answerKey[fq.globalIndex];
    const manual = s.manualScores[fq.globalIndex];
    const result = !fq.requiresManual ? autoScoreQuestion(q, ans, correct) : null;

    let pts: string;
    if (fq.requiresManual) {
      pts = manual !== undefined ? `${manual}/${q.points}` : 'Not graded';
    } else if (result) {
      pts = result.score === q.points
        ? `${result.score}/${q.points} ✓`
        : result.score === 0 ? `0/${q.points} ✗` : `${result.score}/${q.points}`;
    } else {
      pts = `—/${q.points}`;
    }

    let body = '';
    if (q.subItems && q.subItems.length > 0) {
      const studentItems = decodeSubAnswers(ans);
      body = `<p style="margin:6px 0;color:#333"><em>${q.question}</em></p><ol style="margin:4px 0 4px 20px;padding:0">`;
      q.subItems.forEach((item, i) => {
        const given = studentItems[i] || '';
        const ok = item.answer && given && given.toLowerCase().trim() === item.answer.toLowerCase().trim();
        const mark = item.answer ? (ok ? '<span style="color:green">✓</span>' : '<span style="color:#c00">✗</span>') : '';
        body += `<li style="margin:3px 0"><span style="color:#555">${item.prompt}</span> &mdash; <strong>${given || '<em style="color:#999">No answer</em>'}</strong> ${mark}`;
        if (item.answer && !ok) body += ` <span style="color:green;font-size:0.9em">(${item.answer})</span>`;
        body += `</li>`;
      });
      body += `</ol>`;
    } else {
      body = `<p style="color:#333">Answer: ${ans || '<em>No answer</em>'}</p>`;
      if (correct) body += `<p style="color:green">Expected: ${correct}</p>`;
    }

    return `<div style="margin:12px 0;padding:10px;border:1px solid #ddd;border-radius:6px;font-family:system-ui">
      <p style="margin:0 0 6px 0"><strong>Q${fq.globalIndex + 1}.</strong> ${q.question}
        <span style="float:right;font-size:0.85em;color:#666">${pts}</span></p>
      ${body}
    </div>`;
  };

  const handleExportStudentPDF = (studentIdx: number) => {
    const s = students[studentIdx];
    const w = window.open('', '_blank');
    if (!w) return;
    const total = getStudentTotal(s);
    let html = `<h1 style="font-family:system-ui">${doc.title} — Correction</h1>`;
    html += `<p><strong>Student:</strong> ${s.name} &nbsp; <strong>Score:</strong> ${total}/${s.total} (${Math.round(total / s.total * 100)}%)</p><hr>`;
    for (const fq of flatQuestions) {
      html += renderQuestionPdfBlock(fq, s);
    }
    w.document.write(`<!DOCTYPE html><html><head><title>Correction — ${s.name}</title><style>@page{margin:1.5cm}body{font-family:system-ui;max-width:800px;margin:auto;padding:20px}@media print{body{print-color-adjust:exact}}</style></head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Interrogate</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Online Interrogation</DialogTitle>
          <DialogDescription>Generate student links, collect responses, grade and analyze results.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="link" className="flex-1">Student Link</TabsTrigger>
            <TabsTrigger value="results" className="flex-1">
              Results {students.length > 0 && `(${students.length})`}
            </TabsTrigger>
          </TabsList>

          {/* ─── Student Link Tab ─── */}
          <TabsContent value="link" className="space-y-4 pt-2 overflow-y-auto flex-1">
            <p className="text-sm text-muted-foreground">
              Share this link with students. It contains the questionnaire <strong>without answers</strong>.
            </p>
            {!hasAnswerKey && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-700 dark:text-amber-400">
                ⚠ No answers defined. Add answers for auto-grading.<br />
                <span className="text-xs">Example: <code>Short[2;What is 2+2?;4]</code></span>
              </div>
            )}
            <div className="flex gap-2">
              <input readOnly value={studentLink} className="flex-1 px-3 py-2 text-xs bg-muted border border-border rounded-md font-mono truncate" />
              <Button size="sm" onClick={handleCopyLink} className="gap-2 shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </TabsContent>

          {/* ─── Results Tab ─── */}
          <TabsContent value="results" className="flex-1 flex flex-col min-h-0 pt-2">
            {/* Sub-tabs */}
            <div className="flex gap-1 bg-muted rounded-md p-0.5 shrink-0 mb-3">
              {[
                { id: 'codes', label: 'Student Codes', icon: ClipboardPaste },
                { id: 'manual', label: 'Manual Correction', icon: UserCheck },
                { id: 'global', label: 'Global Results', icon: BarChart3 },
                { id: 'individual', label: 'Individual', icon: FileText },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setResultsTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                    resultsTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* ─── Student Codes ─── */}
              {resultsTab === 'codes' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Paste student response code:</label>
                    <div className="flex gap-2">
                      <textarea
                        value={pasteCode}
                        onChange={(e) => setPasteCode(e.target.value)}
                        placeholder="Paste code here..."
                        className="flex-1 px-3 py-2 text-xs bg-muted border border-border rounded-md font-mono resize-none h-16"
                      />
                      <Button size="sm" onClick={handleAddStudent} className="gap-1 shrink-0 self-end">
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>
                  {students.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <ClipboardPaste className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No responses yet.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {students.map((s, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border border-border">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{s.name}</span>
                            {s.timestamp && <span className="text-xs text-muted-foreground">{new Date(s.timestamp).toLocaleString()}</span>}
                            {manualQuestions.some(mq => s.manualScores[mq.globalIndex] === undefined) && (
                              <span className="text-xs text-amber-500">⚠ Needs manual grading</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${
                              getStudentTotal(s) / s.total >= 0.7 ? 'text-green-600' :
                              getStudentTotal(s) / s.total >= 0.5 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {getStudentTotal(s)}/{s.total}
                            </span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveStudent(i)}>
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── Manual Correction ─── */}
              {resultsTab === 'manual' && (
                <div className="space-y-3">
                  {manualQuestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      All questions have predefined answers — no manual grading needed.
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Add student codes first.
                    </div>
                  ) : selectedManualQ === null ? (
                    <div className="space-y-1.5">
                      <p className="text-sm text-muted-foreground mb-2">Select a question to grade:</p>
                      {manualQuestions.map(fq => {
                        const graded = students.filter(s => s.manualScores[fq.globalIndex] !== undefined).length;
                        return (
                          <button
                            key={fq.globalIndex}
                            onClick={() => setSelectedManualQ(fq.globalIndex)}
                            className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground shrink-0">Q{fq.globalIndex + 1}</span>
                              <span className="text-sm truncate">{fq.question.question}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-muted-foreground">{graded}/{students.length} graded</span>
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted">{fq.question.points} pts</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button onClick={() => setSelectedManualQ(null)} className="text-sm text-primary hover:underline flex items-center gap-1">
                        ← Back to questions
                      </button>
                      {(() => {
                        const fq = flatQuestions.find(q => q.globalIndex === selectedManualQ)!;
                        return (
                          <>
                            <div className="p-3 rounded-lg bg-muted border border-border">
                              <p className="text-xs text-muted-foreground">Q{fq.globalIndex + 1} · {fq.sectionTitle} · {fq.question.points} pts</p>
                              <p className="text-sm font-medium mt-1">{fq.question.question}</p>
                            </div>
                            <div className="space-y-2">
                              {students.map((s, si) => (
                                <div key={si} className="p-3 rounded-lg border border-border bg-card">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{s.name}</span>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min={0}
                                        max={fq.question.points}
                                        value={s.manualScores[fq.globalIndex] ?? ''}
                                        onChange={(e) => {
                                          const v = Math.min(fq.question.points, Math.max(0, parseFloat(e.target.value) || 0));
                                          handleSetManualScore(si, fq.globalIndex, v);
                                        }}
                                        className="w-16 px-2 py-1 text-sm text-center border border-border rounded bg-muted"
                                        placeholder="—"
                                      />
                                      <span className="text-xs text-muted-foreground">/ {fq.question.points}</span>
                                    </div>
                                  </div>
                                  {fq.question.subItems && fq.question.subItems.length > 0 ? (
                                    <ol className="text-sm bg-muted/50 rounded p-2 space-y-0.5 ml-4 list-decimal">
                                      {fq.question.subItems.map((item, ii) => {
                                        const sub = decodeSubAnswers(s.answers[fq.globalIndex])[ii] || '';
                                        return (
                                          <li key={ii}><span className="text-muted-foreground">{item.prompt}:</span> <span className="text-foreground font-medium">{sub || <em>—</em>}</span></li>
                                        );
                                      })}
                                    </ol>
                                  ) : (
                                    <div className="text-sm bg-muted/50 rounded p-2 text-foreground whitespace-pre-wrap">
                                      {s.answers[fq.globalIndex] || <span className="text-muted-foreground italic">No answer</span>}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* ─── Global Results ─── */}
              {resultsTab === 'global' && (
                <div className="space-y-4">
                  {students.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">Add student codes first.</div>
                  ) : (
                    <>
                      {/* Summary cards */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-muted border border-border text-center">
                          <p className="text-2xl font-bold text-foreground">{students.length}</p>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted border border-border text-center">
                          <p className="text-2xl font-bold text-primary">{avgScore.toFixed(1)}/{maxPts}</p>
                          <p className="text-xs text-muted-foreground">Average</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted border border-border text-center">
                          <p className="text-2xl font-bold" style={{ color: avgScore / maxPts >= 0.5 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>
                            {Math.round(avgScore / maxPts * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Success Rate</p>
                        </div>
                      </div>

                      {/* Score distribution */}
                      <div className="p-3 rounded-lg border border-border">
                        <p className="text-sm font-medium mb-3">Score Distribution</p>
                        {(() => {
                          const buckets = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80-100
                          const labels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
                          const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
                          students.forEach(s => {
                            const pct = getStudentTotal(s) / s.total * 100;
                            const idx = Math.min(4, Math.floor(pct / 20));
                            buckets[idx]++;
                          });
                          const maxB = Math.max(...buckets, 1);
                          return (
                            <div className="space-y-1.5">
                              {buckets.map((count, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="text-xs w-14 text-muted-foreground">{labels[i]}</span>
                                  <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                                    <div className="h-full rounded transition-all" style={{ width: `${(count / maxB) * 100}%`, backgroundColor: colors[i] }} />
                                  </div>
                                  <span className="text-xs w-6 text-right font-medium">{count}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Per-question success */}
                      <div className="p-3 rounded-lg border border-border">
                        <p className="text-sm font-medium mb-3">Success by Question</p>
                        <div className="space-y-1">
                          {questionStats.map((qs, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-xs w-8 shrink-0 font-medium">Q{qs.globalIndex + 1}</span>
                              <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                                <div
                                  className="h-full rounded transition-all"
                                  style={{
                                    width: `${qs.successRate * 100}%`,
                                    backgroundColor: qs.successRate >= 0.7 ? '#22c55e' : qs.successRate >= 0.4 ? '#eab308' : '#ef4444',
                                  }}
                                />
                              </div>
                              <span className="text-xs w-10 text-right text-muted-foreground">{Math.round(qs.successRate * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ─── Individual Results ─── */}
              {resultsTab === 'individual' && (
                <div className="space-y-3">
                  {students.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">Add student codes first.</div>
                  ) : selectedStudent === null ? (
                    <div className="space-y-1.5">
                      {students.map((s, i) => {
                        const total = getStudentTotal(s);
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedStudent(i)}
                            className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                          >
                            <span className="text-sm font-medium">{s.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${total / s.total >= 0.7 ? 'text-green-600' : total / s.total >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
                                {total}/{s.total} ({Math.round(total / s.total * 100)}%)
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <button onClick={() => setSelectedStudent(null)} className="text-sm text-primary hover:underline">← Back</button>
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleExportStudentPDF(selectedStudent)}>
                          <Download className="h-3.5 w-3.5" /> Export PDF
                        </Button>
                      </div>
                      {(() => {
                        const s = students[selectedStudent];
                        const total = getStudentTotal(s);
                        return (
                          <>
                            <div className="p-3 rounded-lg bg-muted border border-border flex items-center justify-between">
                              <span className="text-sm font-bold">{s.name}</span>
                              <span className={`text-lg font-bold ${total / s.total >= 0.7 ? 'text-green-600' : total / s.total >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
                                {total}/{s.total} ({Math.round(total / s.total * 100)}%)
                              </span>
                            </div>
                            <div className="space-y-2">
                              {flatQuestions.map(fq => {
                                const ans = s.answers[fq.globalIndex];
                                const correct = answerKey[fq.globalIndex];
                                const result = !fq.requiresManual ? autoScoreQuestion(fq.question, ans, correct) : null;
                                let pts = '—';
                                let ptsColor = 'text-muted-foreground';
                                if (fq.requiresManual) {
                                  const ms = s.manualScores[fq.globalIndex];
                                  pts = ms !== undefined ? `${ms}/${fq.question.points}` : 'Not graded';
                                  ptsColor = ms !== undefined ? 'text-amber-600' : 'text-muted-foreground';
                                } else if (result) {
                                  pts = `${result.score}/${fq.question.points}`;
                                  ptsColor = result.score === fq.question.points ? 'text-green-600'
                                    : result.score === 0 ? 'text-red-600' : 'text-amber-600';
                                }
                                const subItems = fq.question.subItems;
                                const studentSub = decodeSubAnswers(ans);
                                return (
                                  <div key={fq.globalIndex} className="p-2.5 rounded border border-border text-sm">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-start gap-2 min-w-0">
                                        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground shrink-0">Q{fq.globalIndex + 1}</span>
                                        <span className="text-muted-foreground truncate">{fq.question.question}</span>
                                      </div>
                                      <span className={`text-xs font-bold shrink-0 ${ptsColor}`}>{pts}</span>
                                    </div>
                                    {subItems && subItems.length > 0 ? (
                                      <ol className="mt-1.5 ml-7 space-y-0.5 text-xs">
                                        {subItems.map((item, i) => {
                                          const given = studentSub[i] || '';
                                          const expected = item.answer;
                                          const ok = expected && given && given.toLowerCase().trim() === expected.toLowerCase().trim();
                                          return (
                                            <li key={i} className="flex items-baseline gap-1.5">
                                              <span className="text-muted-foreground shrink-0">{String.fromCharCode(97 + i)})</span>
                                              <span className="text-muted-foreground truncate flex-1">{item.prompt}</span>
                                              <span className="text-foreground font-medium">{given || <em className="text-muted-foreground">—</em>}</span>
                                              {expected && (
                                                <span className={ok ? 'text-green-600' : 'text-red-600'}>{ok ? '✓' : '✗'}</span>
                                              )}
                                              {expected && !ok && (
                                                <span className="text-green-600 text-[10px]">({expected})</span>
                                              )}
                                            </li>
                                          );
                                        })}
                                      </ol>
                                    ) : (
                                      <div className="mt-1.5 ml-7 text-xs">
                                        <span className="text-muted-foreground">Answer: </span>
                                        <span className="text-foreground">{ans || <em className="text-muted-foreground">No answer</em>}</span>
                                        {correct && !fq.requiresManual && (
                                          <span className="ml-2 text-green-600">Expected: {correct}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}