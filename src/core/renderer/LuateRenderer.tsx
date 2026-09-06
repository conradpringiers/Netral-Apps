/**
 * Netral Luate Renderer
 * Renders exam/quiz documents with point tracking, answer key support, and canvas blanks
 */

import { useMemo } from 'react';
import { LuateDocument, LuateSection, LuateQuestion, parseLuateDocument, pointsPerSubItem } from '@/core/parser/luateParser';
import { getTheme, generateThemeCSS } from '@/core/themes/themes';

/** Encoding for multi-item answers: items joined by "||". */
const SUB_SEP = '||';
const decodeSub = (s?: string): string[] => (s ? s.split(SUB_SEP) : []);
const encodeSub = (arr: string[]) => arr.join(SUB_SEP);
const setSubAt = (current: string | undefined, idx: number, val: string, total: number): string => {
  const arr = decodeSub(current);
  while (arr.length < total) arr.push('');
  arr[idx] = val;
  return encodeSub(arr.slice(0, total));
};

interface LuateRendererProps {
  content: string;
  showAnswers?: boolean;
  interactive?: boolean;
  studentAnswers?: Record<number, string>;
  onAnswer?: (questionIndex: number, answer: string) => void;
}

export function LuateRenderer({ content, showAnswers = false, interactive = false, studentAnswers, onAnswer }: LuateRendererProps) {
  const doc = useMemo(() => parseLuateDocument(content), [content]);
  const theme = useMemo(() => getTheme(doc.theme), [doc.theme]);
  const themeStyle = useMemo(() => generateThemeCSS(theme), [theme]);

  let globalQuestionNum = 0;

  return (
    <div
      className="luate-render min-h-full"
      style={{
        cssText: themeStyle,
        fontFamily: theme.fontFamily,
        backgroundColor: `hsl(${theme.colors.background})`,
        color: `hsl(${theme.colors.foreground})`,
      } as any}
    >
      <div className="max-w-3xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8 pb-6" style={{ borderBottom: `2px solid hsl(${theme.colors.primary})` }}>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: theme.headingFontFamily, color: `hsl(${theme.colors.foreground})` }}>
            {doc.title}
          </h1>
          {doc.subtitle && (
            <p className="text-base mb-2" style={{ color: `hsl(${theme.colors.mutedForeground})` }}>{doc.subtitle}</p>
          )}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm flex-wrap">
            {doc.duration && (
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `hsl(${theme.colors.muted})`, color: `hsl(${theme.colors.mutedForeground})` }}>
                ⏱ {doc.duration}
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `hsl(${theme.colors.primary})`, color: `hsl(${theme.colors.primaryForeground})` }}>
              Total: {doc.totalPoints} pts
            </span>
          </div>
          {showAnswers && (
            <div className="mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'hsl(142, 71%, 45%)', color: 'white' }}>
                ✓ ANSWER KEY
              </span>
            </div>
          )}
        </div>

        {/* Name field for interactive mode */}
        {interactive && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `hsl(${theme.colors.muted})`, border: `1px solid hsl(${theme.colors.border})` }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: `hsl(${theme.colors.foreground})` }}>Student Name</label>
            <input
              type="text"
              placeholder="Enter your full name..."
              className="w-full px-3 py-2 rounded-md text-sm border"
              style={{ borderColor: `hsl(${theme.colors.border})`, backgroundColor: `hsl(${theme.colors.background})`, color: `hsl(${theme.colors.foreground})` }}
              onChange={(e) => onAnswer?.(-1, e.target.value)}
              value={studentAnswers?.[-1] || ''}
            />
          </div>
        )}

        {/* Instructions */}
        {doc.instructions && (
          <div className="mb-8 p-4 rounded-lg text-sm leading-relaxed" style={{ backgroundColor: `hsl(${theme.colors.muted})`, color: `hsl(${theme.colors.mutedForeground})`, border: `1px solid hsl(${theme.colors.border})` }}>
            <span className="font-semibold" style={{ color: `hsl(${theme.colors.foreground})` }}>Instructions:</span>{' '}
            {doc.instructions}
          </div>
        )}

        {/* Sections */}
        {doc.sections.map((section, si) => (
          <SectionBlock
            key={si}
            section={section}
            sectionIndex={si}
            theme={theme}
            showAnswers={showAnswers}
            interactive={interactive}
            studentAnswers={studentAnswers}
            onAnswer={onAnswer}
            startNum={(() => {
              const start = globalQuestionNum + 1;
              globalQuestionNum += section.questions.length;
              return start;
            })()}
            globalOffset={(() => {
              let offset = 0;
              for (let s = 0; s < si; s++) offset += doc.sections[s].questions.length;
              return offset;
            })()}
          />
        ))}
      </div>
    </div>
  );
}

function SectionBlock({
  section, sectionIndex, theme, showAnswers, interactive, studentAnswers, onAnswer, startNum, globalOffset,
}: {
  section: LuateSection; sectionIndex: number; theme: ReturnType<typeof getTheme>;
  showAnswers: boolean; interactive: boolean;
  studentAnswers?: Record<number, string>; onAnswer?: (qi: number, answer: string) => void;
  startNum: number; globalOffset: number;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5 pb-2" style={{ borderBottom: `1px solid hsl(${theme.colors.border})` }}>
        <h2 className="text-xl font-bold" style={{ fontFamily: theme.headingFontFamily, color: `hsl(${theme.colors.foreground})` }}>{section.title}</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.primary} / 0.1)`, color: `hsl(${theme.colors.primary})` }}>
          {section.totalPoints} pts
        </span>
      </div>
      <div className="space-y-6">
        {section.questions.map((q, qi) => (
          <QuestionBlock
            key={qi}
            question={q}
            number={startNum + qi}
            theme={theme}
            showAnswers={showAnswers}
            interactive={interactive}
            studentAnswer={studentAnswers?.[globalOffset + qi]}
            onAnswer={(answer) => onAnswer?.(globalOffset + qi, answer)}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionBlock({
  question, number, theme, showAnswers, interactive, studentAnswer, onAnswer,
}: {
  question: LuateQuestion; number: number; theme: ReturnType<typeof getTheme>;
  showAnswers: boolean; interactive: boolean;
  studentAnswer?: string; onAnswer?: (answer: string) => void;
}) {
  const answerStyle = {
    backgroundColor: 'hsl(142, 71%, 45%, 0.1)',
    border: '1px solid hsl(142, 71%, 45%, 0.3)',
    color: 'hsl(142, 50%, 30%)',
  };

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: `hsl(${theme.colors.card})`, border: `1px solid hsl(${theme.colors.border})` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 flex-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5" style={{ backgroundColor: `hsl(${theme.colors.primary})`, color: `hsl(${theme.colors.primaryForeground})` }}>
            Q{number}
          </span>
          <p className="text-sm font-medium leading-relaxed" style={{ color: `hsl(${theme.colors.foreground})` }}>
            {question.question}
          </p>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `hsl(${theme.colors.muted})`, color: `hsl(${theme.colors.mutedForeground})` }}>
          {question.points} pt{question.points > 1 ? 's' : ''}
        </span>
      </div>

      {/* MCQ */}
      {question.type === 'mcq' && question.options && (
        <div className="space-y-2 ml-8">
          {question.options.map((opt, oi) => {
            const isCorrect = showAnswers && question.answer && opt.startsWith(question.answer);
            const isSelected = interactive && studentAnswer === opt;
            return (
              <label key={oi} className={`flex items-center gap-2.5 ${interactive ? 'cursor-pointer' : ''}`} onClick={() => interactive && onAnswer?.(opt)}>
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center`}
                  style={{ borderColor: isCorrect ? 'hsl(142, 71%, 45%)' : isSelected ? `hsl(${theme.colors.primary})` : `hsl(${theme.colors.border})`,
                    backgroundColor: isSelected ? `hsl(${theme.colors.primary})` : 'transparent' }}>
                  {isSelected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.primaryForeground})` }} />}
                </div>
                <span className="text-sm" style={{ color: isCorrect ? 'hsl(142, 50%, 30%)' : `hsl(${theme.colors.foreground})`, fontWeight: isCorrect ? 600 : 400 }}>
                  {opt} {isCorrect && '✓'}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* Checkbox */}
      {question.type === 'checkbox' && question.options && (
        <div className="space-y-2 ml-8">
          {question.options.map((opt, oi) => {
            const correctAnswers = question.answer?.split(',').map(a => a.trim()) || [];
            const isCorrect = showAnswers && correctAnswers.includes(opt);
            const selectedAnswers = studentAnswer?.split(',') || [];
            const isSelected = interactive && selectedAnswers.includes(opt);
            return (
              <label key={oi} className={`flex items-center gap-2.5 ${interactive ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (!interactive) return;
                  const current = studentAnswer?.split(',').filter(Boolean) || [];
                  const next = current.includes(opt) ? current.filter(a => a !== opt) : [...current, opt];
                  onAnswer?.(next.join(','));
                }}>
                <div className="w-4 h-4 rounded-sm border-2 shrink-0 flex items-center justify-center"
                  style={{ borderColor: isCorrect ? 'hsl(142, 71%, 45%)' : isSelected ? `hsl(${theme.colors.primary})` : `hsl(${theme.colors.border})`,
                    backgroundColor: isSelected ? `hsl(${theme.colors.primary})` : 'transparent' }}>
                  {isSelected && <span className="text-[10px]" style={{ color: `hsl(${theme.colors.primaryForeground})` }}>✓</span>}
                </div>
                <span className="text-sm" style={{ color: isCorrect ? 'hsl(142, 50%, 30%)' : `hsl(${theme.colors.foreground})`, fontWeight: isCorrect ? 600 : 400 }}>
                  {opt} {isCorrect && '✓'}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* True/False — multi or single sub-items */}
      {question.type === 'truefalse' && question.subItems && (
        <div className="space-y-3 ml-8">
          {question.subItems.length > 1 && (
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: `hsl(${theme.colors.mutedForeground})` }}>
              {question.subItems.length} statements · {pointsPerSubItem(question.points, question.subItems.length)} pt(s) each
            </p>
          )}
          {question.subItems.map((item, ii) => {
            const subAns = decodeSub(studentAnswer)[ii];
            return (
              <div key={ii} className="flex items-start gap-3">
                {question.subItems!.length > 1 && (
                  <span className="text-xs font-bold mt-1 shrink-0" style={{ color: `hsl(${theme.colors.mutedForeground})` }}>
                    {String.fromCharCode(97 + ii)})
                  </span>
                )}
                <div className="flex-1">
                  <p className="text-sm mb-1.5" style={{ color: `hsl(${theme.colors.foreground})` }}>{item.prompt}</p>
                  <div className="flex gap-6">
                    {['True', 'False'].map(val => {
                      const isCorrect = showAnswers && item.answer?.toLowerCase() === val.toLowerCase();
                      const isSelected = interactive && subAns === val;
                      return (
                        <label key={val} className={`flex items-center gap-2 ${interactive ? 'cursor-pointer' : ''}`}
                          onClick={() => interactive && onAnswer?.(setSubAt(studentAnswer, ii, val, question.subItems!.length))}>
                          <div className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                            style={{ borderColor: isCorrect ? 'hsl(142, 71%, 45%)' : isSelected ? `hsl(${theme.colors.primary})` : `hsl(${theme.colors.border})`,
                              backgroundColor: isSelected ? `hsl(${theme.colors.primary})` : 'transparent' }}>
                            {isSelected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.primaryForeground})` }} />}
                          </div>
                          <span className="text-sm font-medium" style={{ color: isCorrect ? 'hsl(142, 50%, 30%)' : `hsl(${theme.colors.foreground})`, fontWeight: isCorrect ? 600 : 400 }}>
                            {val} {isCorrect && '✓'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Short — multi or single sub-items */}
      {question.type === 'short' && question.subItems && (
        <div className="space-y-3 ml-8">
          {question.subItems.length > 1 && (
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: `hsl(${theme.colors.mutedForeground})` }}>
              {question.subItems.length} questions · {pointsPerSubItem(question.points, question.subItems.length)} pt(s) each
            </p>
          )}
          {question.subItems.map((item, ii) => {
            const subAns = decodeSub(studentAnswer)[ii];
            return (
              <div key={ii} className="flex items-start gap-3">
                {question.subItems!.length > 1 && (
                  <span className="text-xs font-bold mt-2 shrink-0" style={{ color: `hsl(${theme.colors.mutedForeground})` }}>
                    {String.fromCharCode(97 + ii)})
                  </span>
                )}
                <div className="flex-1">
                  <p className="text-sm mb-1.5" style={{ color: `hsl(${theme.colors.foreground})` }}>{item.prompt}</p>
                  {interactive ? (
                    <input type="text" className="w-full px-3 py-2 rounded-md text-sm border"
                      style={{ borderColor: `hsl(${theme.colors.border})`, backgroundColor: `hsl(${theme.colors.muted} / 0.3)`, color: `hsl(${theme.colors.foreground})` }}
                      placeholder="Your answer..."
                      value={subAns || ''}
                      onChange={(e) => onAnswer?.(setSubAt(studentAnswer, ii, e.target.value, question.subItems!.length))} />
                  ) : (
                    <div className="h-8 rounded-md" style={{ borderBottom: `1.5px solid hsl(${theme.colors.border})`, backgroundColor: `hsl(${theme.colors.muted} / 0.3)` }} />
                  )}
                  {showAnswers && item.answer && (
                    <div className="mt-1.5 px-3 py-1 rounded text-sm" style={answerStyle}>✓ {item.answer}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fill Blank — multi or single sub-items */}
      {question.type === 'fillblank' && question.subItems && (
        <div className="space-y-3 ml-8">
          {question.subItems.length > 1 && (
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: `hsl(${theme.colors.mutedForeground})` }}>
              {question.subItems.length} sentences · {pointsPerSubItem(question.points, question.subItems.length)} pt(s) each
            </p>
          )}
          {question.subItems.map((item, ii) => {
            const subAns = decodeSub(studentAnswer)[ii];
            return (
              <div key={ii} className="flex items-start gap-3">
                {question.subItems!.length > 1 && (
                  <span className="text-xs font-bold mt-1 shrink-0" style={{ color: `hsl(${theme.colors.mutedForeground})` }}>
                    {String.fromCharCode(97 + ii)})
                  </span>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed" style={{ color: `hsl(${theme.colors.foreground})` }}>
                    {item.prompt.split('___').map((part, pi, arr) => (
                      <span key={pi}>
                        {part}
                        {pi < arr.length - 1 && (
                          interactive ? (
                            <input type="text" className="inline-block mx-1 px-2 py-0.5 rounded text-sm border w-28 text-center"
                              style={{ borderColor: `hsl(${theme.colors.primary})`, color: `hsl(${theme.colors.foreground})` }}
                              value={subAns || ''}
                              onChange={(e) => onAnswer?.(setSubAt(studentAnswer, ii, e.target.value, question.subItems!.length))} />
                          ) : (
                            <span className="inline-block mx-1" style={{ width: '100px', borderBottom: `1.5px solid hsl(${theme.colors.primary})` }}>&nbsp;</span>
                          )
                        )}
                      </span>
                    ))}
                  </p>
                  {showAnswers && item.answer && (
                    <div className="mt-1.5 px-3 py-1 rounded text-sm inline-block" style={answerStyle}>✓ {item.answer}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Open */}
      {question.type === 'open' && (
        <div className="ml-8 mt-1">
          {interactive ? (
            <textarea className="w-full px-3 py-2 rounded-md text-sm border resize-y"
              rows={question.lines || 6}
              style={{ borderColor: `hsl(${theme.colors.border})`, backgroundColor: `hsl(${theme.colors.muted} / 0.3)`, color: `hsl(${theme.colors.foreground})` }}
              placeholder="Your answer..."
              value={studentAnswer || ''}
              onChange={(e) => onAnswer?.(e.target.value)} />
          ) : (
            <div className="space-y-2">
              {Array.from({ length: question.lines || 6 }).map((_, li) => (
                <div key={li} className="h-6" style={{ borderBottom: `1px solid hsl(${theme.colors.border} / 0.5)` }} />
              ))}
            </div>
          )}
          {showAnswers && question.answer && (
            <div className="mt-2 px-3 py-1.5 rounded text-sm" style={answerStyle}>✓ {question.answer}</div>
          )}
        </div>
      )}

      {/* Canvas */}
      {question.type === 'canvas' && (
        <div className="ml-8 mt-1">
          <div
            className="rounded-md"
            style={{
              height: `${question.canvasHeight || 200}px`,
              border: `1.5px solid hsl(${theme.colors.border})`,
              backgroundColor: `hsl(${theme.colors.background})`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default LuateRenderer;
