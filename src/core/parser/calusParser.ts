/**
 * Netral Calus Parser & Evaluator
 * Parses math expressions, function definitions, equations, and implicit curves.
 *
 * Supported syntax:
 *   2 + 3 * 4           → arithmetic
 *   sqrt(16)            → 4
 *   sin(pi/2)           → 1
 *   x = 5               → variable assignment
 *   f(x) = x^2 + 1     → function definition (plotted)
 *   2x + 5 = 15         → equation solving → x = 5
 *   (x-a)²+(y-b)²=r²   → circle (implicit curve, plotted)
 */

// ─── Types ───────────────────────────────────────────────────────────────

export interface CalusResult {
  type:
    | "value"
    | "assignment"
    | "function"
    | "plot"
    | "error"
    | "empty"
    | "comment"
    | "equation"
    | "circle";
  input: string;
  output: string;
  name?: string;
  value?: number;
  plotFn?: (x: number) => number;
  color?: string;
  // Circle data
  circle?: { cx: number; cy: number; r: number };
}

interface CalusContext {
  variables: Record<string, number>;
  functions: Record<string, { param: string; expr: string }>;
}

// ─── Constants ───────────────────────────────────────────────────────────

const PLOT_COLORS = [
  "hsl(220, 90%, 56%)",
  "hsl(0, 84%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(280, 68%, 55%)",
  "hsl(25, 95%, 53%)",
  "hsl(190, 90%, 50%)",
  "hsl(340, 82%, 52%)",
  "hsl(45, 93%, 47%)",
];

const MATH_CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  PI: Math.PI,
  e: Math.E,
  E: Math.E,
  tau: Math.PI * 2,
  phi: (1 + Math.sqrt(5)) / 2,
  inf: Infinity,
};

const MATH_FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  abs: Math.abs,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  ln: Math.log,
  exp: Math.exp,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
  sign: Math.sign,
};

// ─── Tokenizer & Evaluator ──────────────────────────────────────────────

function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    if (/\s/.test(expr[i])) {
      i++;
      continue;
    }
    // Unicode ² ³
    if (expr[i] === "²") {
      tokens.push("^", "2");
      i++;
      continue;
    }
    if (expr[i] === "³") {
      tokens.push("^", "3");
      i++;
      continue;
    }
    // Number
    if (/[0-9.]/.test(expr[i])) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i++];
      }
      // Implicit multiplication: 2x, 2pi, 2sin(x)
      if (i < expr.length && /[a-zA-Z_(]/.test(expr[i])) {
        tokens.push(num, "*");
      } else {
        tokens.push(num);
      }
      continue;
    }
    // Identifier
    if (/[a-zA-Z_]/.test(expr[i])) {
      let id = "";
      while (i < expr.length && /[a-zA-Z_0-9]/.test(expr[i])) {
        id += expr[i++];
      }
      tokens.push(id);
      // Implicit multiplication: x(... or variable followed by number/variable
      // e.g., xy → x * y (but not function calls)
      if (i < expr.length && /[0-9]/.test(expr[i]) && !MATH_FUNCTIONS[id]) {
        tokens.push("*");
      }
      continue;
    }
    // Operators
    if (expr[i] === "*" && expr[i + 1] === "*") {
      tokens.push("**");
      i += 2;
      continue;
    }
    tokens.push(expr[i++]);
  }
  return tokens;
}

function evaluate(
  expr: string,
  vars: Record<string, number>,
  funcs: Record<string, { param: string; expr: string }>,
): number {
  const tokens = tokenize(expr);
  let pos = 0;

  function peek(): string | undefined {
    return tokens[pos];
  }
  function consume(): string {
    return tokens[pos++];
  }

  function parseExpr(): number {
    let left = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = consume();
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parsePower();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = consume();
      const right = parsePower();
      if (op === "*") left *= right;
      else if (op === "/") left /= right;
      else left %= right;
    }
    return left;
  }

  function parsePower(): number {
    let base = parseUnary();
    while (peek() === "^" || peek() === "**") {
      consume();
      const exp = parseUnary();
      base = Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary(): number {
    if (peek() === "-") {
      consume();
      return -parseAtom();
    }
    if (peek() === "+") {
      consume();
      return parseAtom();
    }
    return parseAtom();
  }

  function parseAtom(): number {
    const tok = peek();
    if (!tok) throw new Error("Unexpected end of expression");

    if (/^[0-9.]/.test(tok)) {
      consume();
      return parseFloat(tok);
    }

    if (tok === "(") {
      consume();
      const val = parseExpr();
      if (peek() === ")") consume();
      return val;
    }

    if (tok === "|") {
      consume();
      const val = parseExpr();
      if (peek() === "|") consume();
      return Math.abs(val);
    }

    if (/^[a-zA-Z_]/.test(tok)) {
      consume();

      if (MATH_FUNCTIONS[tok] && peek() === "(") {
        consume();
        const arg = parseExpr();
        if (peek() === ")") consume();
        return MATH_FUNCTIONS[tok](arg);
      }

      if (funcs[tok] && peek() === "(") {
        consume();
        const arg = parseExpr();
        if (peek() === ")") consume();
        const fn = funcs[tok];
        return evaluate(fn.expr, { ...vars, [fn.param]: arg }, funcs);
      }

      if (MATH_CONSTANTS[tok] !== undefined) return MATH_CONSTANTS[tok];
      if (vars[tok] !== undefined) return vars[tok];

      throw new Error(`Unknown: ${tok}`);
    }

    throw new Error(`Unexpected: ${tok}`);
  }

  return parseExpr();
}

// ─── Equation Solver ─────────────────────────────────────────────────────

/**
 * Tries to solve a linear equation in one unknown.
 * Supports: ax + b = c, b + ax = c, etc.
 * Returns { variable, value } or null.
 */
function solveLinearEquation(
  lhs: string,
  rhs: string,
  vars: Record<string, number>,
  funcs: Record<string, { param: string; expr: string }>,
): { variable: string; value: number } | null {
  // Find the unknown variable (not a known constant or variable)
  const allTokens = tokenize(lhs + " " + rhs);
  const unknowns = new Set<string>();
  for (const t of allTokens) {
    if (
      /^[a-zA-Z_]\w*$/.test(t) &&
      !MATH_CONSTANTS[t] &&
      !MATH_FUNCTIONS[t] &&
      vars[t] === undefined
    ) {
      unknowns.add(t);
    }
  }

  if (unknowns.size !== 1) return null;
  const variable = [...unknowns][0];

  // Evaluate both sides at variable=0 and variable=1 to find linear coefficients
  // f(v) = lhs - rhs; solve f(v) = 0
  try {
    const f0 =
      evaluate(lhs, { ...vars, [variable]: 0 }, funcs) -
      evaluate(rhs, { ...vars, [variable]: 0 }, funcs);
    const f1 =
      evaluate(lhs, { ...vars, [variable]: 1 }, funcs) -
      evaluate(rhs, { ...vars, [variable]: 1 }, funcs);

    // Linear: f(v) = a*v + b where a = f1 - f0, b = f0
    const a = f1 - f0;
    const b = f0;

    if (Math.abs(a) < 1e-12) return null; // no solution or infinite

    const value = -b / a;

    // Verify it's actually linear by checking f(2)
    const f2 =
      evaluate(lhs, { ...vars, [variable]: 2 }, funcs) -
      evaluate(rhs, { ...vars, [variable]: 2 }, funcs);
    const expectedF2 = a * 2 + b;
    if (Math.abs(f2 - expectedF2) > 1e-6) return null; // non-linear

    return { variable, value };
  } catch {
    return null;
  }
}

// ─── Circle Detection ────────────────────────────────────────────────────

/**
 * Detects circle equations of the form (x-a)²+(y-b)²=r² or x²+y²=r²
 * Returns { cx, cy, r } or null.
 */
function detectCircle(
  lhs: string,
  rhs: string,
  vars: Record<string, number>,
  funcs: Record<string, { param: string; expr: string }>,
): { cx: number; cy: number; r: number } | null {
  // Normalize: replace ² with ^2
  const norm = (s: string) => s.replace(/²/g, "^2").replace(/³/g, "^3");
  const lhsN = norm(lhs);
  const rhsN = norm(rhs);

  // Check if both x and y appear
  const combined = lhsN + " " + rhsN;
  if (!combined.includes("x") || !combined.includes("y")) return null;

  // Strategy: evaluate lhs - rhs at several (x,y) points to determine
  // if it matches Ax² + Bx + Cy² + Dy + E = 0 with A=C (circle condition)
  // Use 6 sample points to find 5 unknowns: A, B, C, D, E

  const evalAt = (xv: number, yv: number): number => {
    try {
      const v = { ...vars, x: xv, y: yv };
      return evaluate(lhsN, v, funcs) - evaluate(rhsN, v, funcs);
    } catch {
      return NaN;
    }
  };

  // f(x,y) = A*x² + B*x + C*y² + D*y + E = 0
  // Sample points to extract coefficients
  const f00 = evalAt(0, 0); // E
  const f10 = evalAt(1, 0); // A + B + E
  const f01 = evalAt(0, 1); // C + D + E
  const fm10 = evalAt(-1, 0); // A - B + E
  const f0m1 = evalAt(0, -1); // C - D + E

  if ([f00, f10, f01, fm10, f0m1].some((v) => isNaN(v) || !isFinite(v)))
    return null;

  const E = f00;
  const ApB = f10 - E; // A + B
  const AmB = fm10 - E; // A - B
  const A = (ApB + AmB) / 2;
  const B = (ApB - AmB) / 2;
  const CpD = f01 - E; // C + D
  const CmD = f0m1 - E; // C - D
  const C = (CpD + CmD) / 2;
  const D = (CpD - CmD) / 2;

  // Circle condition: A ≈ C and A > 0
  if (Math.abs(A - C) > 1e-6 || A < 1e-12) return null;

  // Verify with another point
  const f11 = evalAt(1, 1);
  const expected = A * 1 + B * 1 + C * 1 + D * 1 + E;
  if (Math.abs(f11 - expected) > 1e-4) return null;

  // Standard form: A(x² + B/A x) + A(y² + D/A y) + E = 0
  // A(x + B/(2A))² + A(y + D/(2A))² = B²/(4A) + D²/(4A) - E
  const cx = -B / (2 * A);
  const cy = -D / (2 * A);
  const rSq = (B * B + D * D) / (4 * A * A) - E / A;

  if (rSq <= 0) return null;

  return { cx, cy, r: Math.sqrt(rSq) };
}

// ─── Main Parse Function ─────────────────────────────────────────────────

export function parseCalus(source: string): CalusResult[] {
  const lines = source.split("\n");
  const ctx: CalusContext = { variables: {}, functions: {} };
  const results: CalusResult[] = [];
  let colorIdx = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      results.push({ type: "empty", input: rawLine, output: "" });
      continue;
    }

    if (line.startsWith("#") || line.startsWith("//")) {
      results.push({ type: "comment", input: rawLine, output: "" });
      continue;
    }

    try {
      // Function definition: f(x) = expr
      const fnMatch = line.match(
        /^([a-zA-Z_]\w*)\s*\(\s*([a-zA-Z_]\w*)\s*\)\s*=\s*(.+)$/,
      );
      if (fnMatch) {
        const [, name, param, expr] = fnMatch;
        ctx.functions[name] = { param, expr };

        const color = PLOT_COLORS[colorIdx % PLOT_COLORS.length];
        colorIdx++;

        const plotFn = (x: number): number => {
          try {
            return evaluate(
              expr,
              { ...ctx.variables, [param]: x },
              ctx.functions,
            );
          } catch {
            return NaN;
          }
        };

        results.push({
          type: "plot",
          input: rawLine,
          output: `${name}(${param}) defined`,
          name,
          plotFn,
          color,
        });
        continue;
      }

      // Equation with = (but not assignment to known pattern)
      // Must contain = and have expressions on both sides
      const eqParts = line.split("=");
      if (eqParts.length === 2) {
        const lhs = eqParts[0].trim();
        const rhs = eqParts[1].trim();

        // Skip simple variable assignment (single identifier on LHS with no operators)
        const isSimpleAssign =
          /^[a-zA-Z_]\w*$/.test(lhs) && !MATH_CONSTANTS[lhs];

        if (!isSimpleAssign && lhs && rhs) {
          // Try circle detection first
          const circle = detectCircle(lhs, rhs, ctx.variables, ctx.functions);
          if (circle) {
            const color = PLOT_COLORS[colorIdx % PLOT_COLORS.length];
            colorIdx++;
            results.push({
              type: "circle",
              input: rawLine,
              output: `Circle: center (${formatNumber(circle.cx)}, ${formatNumber(circle.cy)}), r = ${formatNumber(circle.r)}`,
              circle,
              color,
            });
            continue;
          }

          // Try equation solving
          const solution = solveLinearEquation(
            lhs,
            rhs,
            ctx.variables,
            ctx.functions,
          );
          if (solution) {
            results.push({
              type: "equation",
              input: rawLine,
              output: `${solution.variable} = ${formatNumber(solution.value)}`,
              value: solution.value,
            });
            continue;
          }
        }
      }

      // Variable assignment: x = expr
      const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (assignMatch) {
        const [, name, expr] = assignMatch;
        const value = evaluate(expr, ctx.variables, ctx.functions);
        ctx.variables[name] = value;
        results.push({
          type: "assignment",
          input: rawLine,
          output: `${name} = ${formatNumber(value)}`,
          name,
          value,
        });
        continue;
      }

      // Expression evaluation
      const value = evaluate(line, ctx.variables, ctx.functions);
      results.push({
        type: "value",
        input: rawLine,
        output: formatNumber(value),
        value,
      });
    } catch (err: any) {
      results.push({
        type: "error",
        input: rawLine,
        output: err.message || "Error",
      });
    }
  }

  return results;
}

function formatNumber(n: number): string {
  if (Number.isNaN(n)) return "NaN";
  if (!Number.isFinite(n)) return n > 0 ? "∞" : "-∞";
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(8)).toString();
}

// ─── Build plot function from context ────────────────────────────────────

export function createPlotFunction(
  expr: string,
  param: string,
  variables: Record<string, number>,
  functions: Record<string, { param: string; expr: string }>,
): (x: number) => number {
  return (x: number) => {
    try {
      return evaluate(expr, { ...variables, [param]: x }, functions);
    } catch {
      return NaN;
    }
  };
}
