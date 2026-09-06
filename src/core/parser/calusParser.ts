/**
 * Netral Calus Parser & Evaluator
 * Uses math.js for robust computation, equation solving, and implicit curve support.
 * Performance: expressions are pre-compiled with math.compile() for fast repeated evaluation.
 */

import { create, all, MathNode, EvalFunction } from 'mathjs';

const math = create(all, {});

// ─── Types ───────────────────────────────────────────────────────────────

export interface CalusResult {
  type: 'value' | 'assignment' | 'function' | 'plot' | 'error' | 'empty' | 'comment' | 'equation' | 'implicit' | 'stats';
  input: string;
  output: string;
  name?: string;
  value?: number;
  plotFn?: (x: number) => number;
  implicitFn?: (x: number, y: number) => number;
  color?: string;
}

interface CalusContext {
  variables: Record<string, number>;
  functions: Record<string, { param: string; expr: string }>;
  scope: Record<string, any>;
}

// ─── Constants ───────────────────────────────────────────────────────────

const PLOT_COLORS = [
  'hsl(220, 90%, 56%)',
  'hsl(0, 84%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(280, 68%, 55%)',
  'hsl(25, 95%, 53%)',
  'hsl(190, 90%, 50%)',
  'hsl(340, 82%, 52%)',
  'hsl(45, 93%, 47%)',
];

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (Number.isNaN(n)) return 'NaN';
  if (!Number.isFinite(n)) return n > 0 ? '∞' : '-∞';
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(8)).toString();
}

/** Normalize unicode superscripts */
function normalize(expr: string): string {
  return expr.replace(/²/g, '^2').replace(/³/g, '^3');
}

/** Check which free variables exist in an expression */
function freeVariables(expr: string, knownVars: Set<string>): Set<string> {
  const vars = new Set<string>();
  try {
    const node = math.parse(normalize(expr));
    node.traverse((n: MathNode) => {
      if (n.type === 'SymbolNode' && !(n as any).isFunctionName) {
        const name = (n as any).name as string;
        if (['pi', 'e', 'i', 'Infinity', 'NaN', 'true', 'false'].includes(name)) return;
        if (!knownVars.has(name)) vars.add(name);
      }
    });
  } catch { /* ignore parse errors */ }
  return vars;
}

/** Compile an expression once, return a fast evaluator */
function compileExpr(expr: string): EvalFunction {
  return math.compile(normalize(expr));
}

/** Safely evaluate with mathjs scope */
function safeEval(expr: string, scope: Record<string, any>): number {
  const result = math.evaluate(normalize(expr), { ...scope });
  if (typeof result === 'number') return result;
  if (typeof result?.toNumber === 'function') return result.toNumber();
  if (typeof result === 'object' && result !== null && 'value' in result) return Number(result.value);
  return Number(result);
}

/** Fast eval from a pre-compiled expression */
function evalCompiled(compiled: EvalFunction, scope: Record<string, any>): number {
  try {
    const result = compiled.evaluate({ ...scope });
    if (typeof result === 'number') return result;
    if (typeof result?.toNumber === 'function') return result.toNumber();
    return Number(result);
  } catch {
    return NaN;
  }
}

// ─── Statistics helpers ──────────────────────────────────────────────────

const STATS_FUNCTIONS: Record<string, (args: number[]) => number | string> = {
  mean: (a) => math.mean(a) as number,
  median: (a) => math.median(a) as number,
  std: (a) => math.std(a) as unknown as number,
  variance: (a) => math.variance(a) as unknown as number,
  min: (a) => Math.min(...a),
  max: (a) => Math.max(...a),
  sum: (a) => a.reduce((s, v) => s + v, 0),
  count: (a) => a.length,
};

function tryStatsCall(line: string, scope: Record<string, any>): { fn: string; result: number | string } | null {
  const m = line.match(/^(mean|median|std|variance|min|max|sum|count)\s*\((.+)\)$/i);
  if (!m) return null;
  const fn = m[1].toLowerCase();
  const handler = STATS_FUNCTIONS[fn];
  if (!handler) return null;
  try {
    const args = m[2].split(',').map(s => safeEval(s.trim(), scope));
    const result = handler(args);
    return { fn, result };
  } catch {
    return null;
  }
}

// ─── Equation Solver ─────────────────────────────────────────────────────

function solveEquation(
  lhs: string,
  rhs: string,
  scope: Record<string, any>,
  knownVars: Set<string>
): { solutions: { variable: string; values: number[] } } | null {
  const allVars = new Set([...freeVariables(lhs, knownVars), ...freeVariables(rhs, knownVars)]);
  if (allVars.has('x') && allVars.has('y')) return null;
  
  let variable: string;
  if (allVars.size === 1) {
    variable = [...allVars][0];
  } else {
    return null;
  }

  // Pre-compile both sides for fast evaluation
  let compiledLhs: EvalFunction, compiledRhs: EvalFunction;
  try {
    compiledLhs = compileExpr(lhs);
    compiledRhs = compileExpr(rhs);
  } catch { return null; }

  const makeF = (v: number): number => {
    const s = { ...scope, [variable]: v };
    return evalCompiled(compiledLhs, s) - evalCompiled(compiledRhs, s);
  };

  const f0 = makeF(0), f1 = makeF(1), f2 = makeF(2), f3 = makeF(3), f4 = makeF(4);
  if ([f0, f1, f2, f3, f4].some(v => isNaN(v) || !isFinite(v))) return null;

  // Linear check
  const a1 = f1 - f0;
  if (Math.abs(f2 - (a1 * 2 + f0)) < 1e-6) {
    if (Math.abs(a1) < 1e-12) return null;
    return { solutions: { variable, values: [-f0 / a1] } };
  }

  // Quadratic check
  const fm1 = makeF(-1);
  const c = f0;
  const aPlusB = f1 - c;
  const aMinusB = fm1 - c;
  const a = (aPlusB + aMinusB) / 2;
  const b = (aPlusB - aMinusB) / 2;

  if (Math.abs(f2 - (a * 4 + b * 2 + c)) < 1e-4) {
    const disc = b * b - 4 * a * c;
    if (disc < -1e-10) return { solutions: { variable, values: [] } };
    if (Math.abs(disc) < 1e-10) return { solutions: { variable, values: [-b / (2 * a)] } };
    const sqrtDisc = Math.sqrt(disc);
    return { solutions: { variable, values: [(-b + sqrtDisc) / (2 * a), (-b - sqrtDisc) / (2 * a)] } };
  }

  // Higher degree: scan + bisection
  const roots: number[] = [];
  const scanRange = 50, scanSteps = 500;
  for (let i = 0; i < scanSteps; i++) {
    const v1 = -scanRange + (i / scanSteps) * 2 * scanRange;
    const v2 = -scanRange + ((i + 1) / scanSteps) * 2 * scanRange;
    const fv1 = makeF(v1), fv2 = makeF(v2);
    if (isNaN(fv1) || isNaN(fv2)) continue;
    if (fv1 * fv2 <= 0) {
      let lo = v1, hi = v2;
      for (let j = 0; j < 40; j++) {
        const mid = (lo + hi) / 2;
        if (makeF(mid) * makeF(lo) <= 0) hi = mid; else lo = mid;
      }
      const root = (lo + hi) / 2;
      if (!roots.some(r => Math.abs(r - root) < 1e-6)) roots.push(root);
    }
  }
  if (roots.length > 0) return { solutions: { variable, values: roots.sort((a, b) => a - b) } };
  return null;
}

// ─── Main Parse Function ─────────────────────────────────────────────────

export function parseCalus(source: string): CalusResult[] {
  const lines = source.split('\n');
  const ctx: CalusContext = { variables: {}, functions: {}, scope: {} };
  const results: CalusResult[] = [];
  let colorIdx = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) { results.push({ type: 'empty', input: rawLine, output: '' }); continue; }
    if (line.startsWith('#') || line.startsWith('//')) { results.push({ type: 'comment', input: rawLine, output: '' }); continue; }

    try {
      // Stats functions
      const statsResult = tryStatsCall(line, ctx.scope);
      if (statsResult) {
        results.push({
          type: 'stats', input: rawLine,
          output: `${statsResult.fn} = ${typeof statsResult.result === 'number' ? formatNumber(statsResult.result) : statsResult.result}`,
          value: typeof statsResult.result === 'number' ? statsResult.result : undefined,
        });
        continue;
      }

      // Function definition: f(x) = expr
      const fnMatch = line.match(/^([a-zA-Z_]\w*)\s*\(\s*([a-zA-Z_]\w*)\s*\)\s*=\s*(.+)$/);
      if (fnMatch) {
        const [, name, param, expr] = fnMatch;
        const normExpr = normalize(expr);
        ctx.functions[name] = { param, expr: normExpr };

        // Pre-compile for fast plot evaluation
        const compiled = compileExpr(normExpr);
        
        ctx.scope[name] = (v: number) => evalCompiled(compiled, { ...ctx.scope, [param]: v });

        const color = PLOT_COLORS[colorIdx++ % PLOT_COLORS.length];
        const plotScope = { ...ctx.scope };
        const plotFn = (x: number): number => {
          plotScope[param] = x;
          try { return compiled.evaluate(plotScope); } catch { return NaN; }
        };

        results.push({ type: 'plot', input: rawLine, output: `${name}(${param}) defined`, name, plotFn, color });
        continue;
      }

      // Equation with =
      const eqParts = line.split('=');
      if (eqParts.length === 2) {
        const lhs = eqParts[0].trim();
        const rhs = eqParts[1].trim();
        const isSimpleAssign = /^[a-zA-Z_]\w*$/.test(lhs);

        if (!isSimpleAssign && lhs && rhs) {
          const knownVars = new Set(Object.keys(ctx.variables));
          const lhsVars = freeVariables(lhs, knownVars);
          const rhsVars = freeVariables(rhs, knownVars);
          const allVars = new Set([...lhsVars, ...rhsVars]);

          // Implicit curve: contains both x and y
          if (allVars.has('x') && allVars.has('y')) {
            const color = PLOT_COLORS[colorIdx++ % PLOT_COLORS.length];
            // Pre-compile both sides for fast marching squares
            const compiledLhs = compileExpr(lhs);
            const compiledRhs = compileExpr(rhs);
            const scopeSnapshot = { ...ctx.scope };
            // Reuse a single scope object to avoid allocation in hot loop
            const implicitScope = { ...scopeSnapshot, x: 0, y: 0 };
            const implicitFn = (xv: number, yv: number): number => {
              implicitScope.x = xv;
              implicitScope.y = yv;
              try {
                return compiledLhs.evaluate(implicitScope) - compiledRhs.evaluate(implicitScope);
              } catch { return NaN; }
            };
            results.push({ type: 'implicit', input: rawLine, output: 'Implicit curve plotted', implicitFn, color });
            continue;
          }

          // Equation solving
          const solution = solveEquation(lhs, rhs, ctx.scope, knownVars);
          if (solution) {
            const { variable, values } = solution.solutions;
            if (values.length === 0) {
              results.push({ type: 'equation', input: rawLine, output: 'No real solution' });
            } else {
              results.push({ type: 'equation', input: rawLine, output: values.map(v => `${variable} = ${formatNumber(v)}`).join(', '), value: values[0] });
            }
            continue;
          }
        }
      }

      // Variable assignment
      const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (assignMatch) {
        const [, name, expr] = assignMatch;
        const value = safeEval(expr, ctx.scope);
        ctx.variables[name] = value;
        ctx.scope[name] = value;
        results.push({ type: 'assignment', input: rawLine, output: `${name} = ${formatNumber(value)}`, name, value });
        continue;
      }

      // Expression evaluation
      const value = safeEval(line, ctx.scope);
      results.push({ type: 'value', input: rawLine, output: formatNumber(value), value });
    } catch (err: any) {
      results.push({ type: 'error', input: rawLine, output: err.message || 'Error' });
    }
  }

  return results;
}
