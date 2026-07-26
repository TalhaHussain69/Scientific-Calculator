/**
 * Scientific Calculator Math Engine
 * Recursive descent / Tokenizer parser supporting DEG/RAD,
 * trigonometry, logarithms, powers, factorials, memory, and custom constants.
 */

export type AngleMode = 'DEG' | 'RAD';

export interface EvalResult {
  success: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

// Factorial calculation with integer optimization & Gamma function for floats
function factorial(n: number): number {
  if (n < 0) throw new Error('Invalid Input');
  if (n === 0 || n === 1) return 1;
  if (Number.isInteger(n) && n <= 170) {
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  if (n > 170) return Infinity;
  // Lanczos approximation for Gamma(n+1)
  return gamma(n + 1);
}

function gamma(z: number): number {
  const g = 7;
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.139216722289,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  z -= 1;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) {
    x += p[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * Format result cleanly to avoid JS floating point artifacts
 * e.g., 0.1 + 0.2 -> 0.3
 */
export function formatResult(num: number): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Fix tiny precision errors near integers or simple decimals
  const precisionClean = Number(num.toPrecision(12));
  if (Math.abs(precisionClean) < 1e-12 && Math.abs(precisionClean) > 0) {
    return precisionClean.toExponential(6);
  }

  // Large or extremely small numbers -> exponential
  if (Math.abs(precisionClean) >= 1e12 || (Math.abs(precisionClean) < 1e-6 && precisionClean !== 0)) {
    return precisionClean.toExponential(8).replace(/\.?0+e/, 'e');
  }

  // Format with sensible decimal length
  let str = precisionClean.toString();
  if (str.includes('.')) {
    // Trim trailing zeros
    str = str.replace(/0+$/, '').replace(/\.$/, '');
  }
  return str;
}

/**
 * Normalizes input expression for parsing:
 * replaces display symbols with standard code tokens,
 * handles implicit multiplication.
 */
export function normalizeExpression(expr: string): string {
  let s = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, ' PI ')
    .replace(/\be\b/g, ' E ')
    .replace(/√/g, ' sqrt ')
    .replace(/²/g, ' ^ 2 ')
    .replace(/³/g, ' ^ 3 ')
    .replace(/10\^/g, ' 10^ ')
    .replace(/e\^/g, ' E^ ')
    .replace(/MOD/gi, ' % ');

  return s;
}

/**
 * Evaluates a mathematical expression string
 */
export function evaluateExpression(
  expr: string,
  angleMode: AngleMode = 'DEG',
  ansValue: number = 0
): EvalResult {
  if (!expr || expr.trim() === '') {
    return { success: true, value: 0, formatted: '0' };
  }

  try {
    let raw = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'PI')
      .replace(/√\(/g, 'sqrt(')
      .replace(/√(\d+(\.\d+)?)/g, 'sqrt($1)')
      .replace(/MOD/gi, '%')
      .replace(/\bAns\b/gi, `(${ansValue})`);

    // Replace display exponents
    raw = raw.replace(/²/g, '^2').replace(/³/g, '^3');

    // Tokenize
    const tokens = tokenize(raw);
    const implicitTokens = addImplicitMultiplication(tokens);
    const rpn = shuntingYard(implicitTokens);
    const val = evaluateRPN(rpn, angleMode);

    if (isNaN(val)) {
      return { success: false, error: 'Invalid Input' };
    }
    if (!isFinite(val)) {
      return { success: false, error: 'Cannot divide by zero' };
    }

    return {
      success: true,
      value: val,
      formatted: formatResult(val)
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Syntax Error'
    };
  }
}

// Token Types
type TokenType = 'NUMBER' | 'OPERATOR' | 'FUNCTION' | 'LPAREN' | 'RPAREN' | 'IDENTIFIER' | 'POSTFIX';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(str: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < str.length) {
    const ch = str[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Numbers & Decimals
    if (/\d/.test(ch) || (ch === '.' && i + 1 < str.length && /\d/.test(str[i + 1]))) {
      let num = '';
      while (i < str.length && (/\d/.test(str[i]) || str[i] === '.')) {
        num += str[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }

    // Identifiers & Functions (sin, cos, tan, asin, acos, atan, log, ln, sqrt, abs, exp, PI, E)
    if (/[a-zA-Z]/.test(ch)) {
      let id = '';
      while (i < str.length && /[a-zA-Z0-9_]/.test(str[i])) {
        id += str[i];
        i++;
      }
      const lower = id.toLowerCase();
      if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'abs', 'exp', 'rad', 'deg'].includes(lower)) {
        tokens.push({ type: 'FUNCTION', value: lower });
      } else if (id === 'PI' || id === 'E' || lower === 'pi' || lower === 'e') {
        tokens.push({ type: 'IDENTIFIER', value: id.toUpperCase() });
      } else {
        tokens.push({ type: 'FUNCTION', value: lower });
      }
      continue;
    }

    // Postfix operators: !
    if (ch === '!') {
      tokens.push({ type: 'POSTFIX', value: '!' });
      i++;
      continue;
    }

    // Basic operators
    if (['+', '-', '*', '/', '%', '^'].includes(ch)) {
      tokens.push({ type: 'OPERATOR', value: ch });
      i++;
      continue;
    }

    // Parentheses
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Comma for multi-argument functions if needed
    if (ch === ',') {
      tokens.push({ type: 'OPERATOR', value: ',' });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${ch}`);
  }

  return tokens;
}

/**
 * Inserts implicit multiplication tokens where appropriate.
 * e.g., 2(3) -> 2*(3), 3sin(45) -> 3*sin(45), 2PI -> 2*PI, (1+2)(3+4) -> (1+2)*(3+4)
 */
function addImplicitMultiplication(tokens: Token[]): Token[] {
  const result: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    const prev = result[result.length - 1];

    if (prev) {
      const prevCanEndExpr =
        prev.type === 'NUMBER' ||
        prev.type === 'IDENTIFIER' ||
        prev.type === 'RPAREN' ||
        prev.type === 'POSTFIX';

      const currentCanStartExpr =
        current.type === 'NUMBER' ||
        current.type === 'IDENTIFIER' ||
        current.type === 'FUNCTION' ||
        current.type === 'LPAREN';

      if (prevCanEndExpr && currentCanStartExpr) {
        result.push({ type: 'OPERATOR', value: '*' });
      }
    }

    result.push(current);
  }

  return result;
}

interface OpInfo {
  prec: number;
  assoc: 'L' | 'R';
}

const OPERATORS: Record<string, OpInfo> = {
  '+': { prec: 2, assoc: 'L' },
  '-': { prec: 2, assoc: 'L' },
  '*': { prec: 3, assoc: 'L' },
  '/': { prec: 3, assoc: 'L' },
  '%': { prec: 3, assoc: 'L' },
  '^': { prec: 5, assoc: 'R' },
  'u+': { prec: 4, assoc: 'R' },
  'u-': { prec: 4, assoc: 'R' }
};

/**
 * Converts token list into Reverse Polish Notation using Shunting-Yard Algorithm
 */
function shuntingYard(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prev = i > 0 ? tokens[i - 1] : null;

    if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
      output.push(token);
    } else if (token.type === 'FUNCTION') {
      stack.push(token);
    } else if (token.type === 'POSTFIX') {
      output.push(token);
    } else if (token.type === 'OPERATOR') {
      let opVal = token.value;

      // Unary plus/minus check
      if (opVal === '+' || opVal === '-') {
        if (
          !prev ||
          prev.type === 'OPERATOR' ||
          prev.type === 'LPAREN' ||
          prev.type === 'FUNCTION'
        ) {
          opVal = opVal === '-' ? 'u-' : 'u+';
        }
      }

      const op = OPERATORS[opVal];
      if (!op) throw new Error(`Unknown operator ${opVal}`);

      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.type === 'OPERATOR') {
          const topOp = OPERATORS[top.value];
          if (
            topOp &&
            ((op.assoc === 'L' && op.prec <= topOp.prec) ||
              (op.assoc === 'R' && op.prec < topOp.prec))
          ) {
            output.push(stack.pop()!);
            continue;
          }
        }
        break;
      }

      stack.push({ type: 'OPERATOR', value: opVal });
    } else if (token.type === 'LPAREN') {
      stack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundLparen = false;
      while (stack.length > 0) {
        const top = stack.pop()!;
        if (top.type === 'LPAREN') {
          foundLparen = true;
          break;
        }
        output.push(top);
      }
      if (!foundLparen) {
        throw new Error('Mismatched parentheses');
      }
      if (stack.length > 0 && stack[stack.length - 1].type === 'FUNCTION') {
        output.push(stack.pop()!);
      }
    }
  }

  while (stack.length > 0) {
    const top = stack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Mismatched parentheses');
    }
    output.push(top);
  }

  return output;
}

/**
 * Evaluates RPN token stack
 */
function evaluateRPN(rpn: Token[], angleMode: AngleMode): number {
  const stack: number[] = [];

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      stack.push(parseFloat(token.value));
    } else if (token.type === 'IDENTIFIER') {
      if (token.value === 'PI') stack.push(Math.PI);
      else if (token.value === 'E') stack.push(Math.E);
      else throw new Error(`Unknown constant ${token.value}`);
    } else if (token.type === 'POSTFIX') {
      if (stack.length < 1) throw new Error('Syntax Error');
      const val = stack.pop()!;
      if (token.value === '!') {
        stack.push(factorial(val));
      }
    } else if (token.type === 'OPERATOR') {
      const op = token.value;

      if (op === 'u-') {
        if (stack.length < 1) throw new Error('Syntax Error');
        stack.push(-stack.pop()!);
      } else if (op === 'u+') {
        // no-op
      } else {
        if (stack.length < 2) throw new Error('Syntax Error');
        const b = stack.pop()!;
        const a = stack.pop()!;

        switch (op) {
          case '+':
            stack.push(a + b);
            break;
          case '-':
            stack.push(a - b);
            break;
          case '*':
            stack.push(a * b);
            break;
          case '/':
            if (b === 0) throw new Error('Cannot divide by zero');
            stack.push(a / b);
            break;
          case '%':
            if (b === 0) throw new Error('Cannot divide by zero');
            stack.push(a % b);
            break;
          case '^':
            stack.push(Math.pow(a, b));
            break;
          default:
            throw new Error(`Unknown operator ${op}`);
        }
      }
    } else if (token.type === 'FUNCTION') {
      if (stack.length < 1) throw new Error('Syntax Error');
      const x = stack.pop()!;
      const fn = token.value;

      switch (fn) {
        case 'sin': {
          let rad = angleMode === 'DEG' ? toRad(x) : x;
          // Precision fix for sin(180deg), sin(360deg)
          if (angleMode === 'DEG' && x % 180 === 0) {
            stack.push(0);
          } else {
            stack.push(Math.sin(rad));
          }
          break;
        }
        case 'cos': {
          let rad = angleMode === 'DEG' ? toRad(x) : x;
          // Precision fix for cos(90deg), cos(270deg)
          if (angleMode === 'DEG' && (x - 90) % 180 === 0) {
            stack.push(0);
          } else {
            stack.push(Math.cos(rad));
          }
          break;
        }
        case 'tan': {
          if (angleMode === 'DEG' && (x - 90) % 180 === 0) {
            throw new Error('Domain Error');
          }
          let rad = angleMode === 'DEG' ? toRad(x) : x;
          stack.push(Math.tan(rad));
          break;
        }
        case 'asin': {
          if (x < -1 || x > 1) throw new Error('Domain Error');
          const rad = Math.asin(x);
          stack.push(angleMode === 'DEG' ? toDeg(rad) : rad);
          break;
        }
        case 'acos': {
          if (x < -1 || x > 1) throw new Error('Domain Error');
          const rad = Math.acos(x);
          stack.push(angleMode === 'DEG' ? toDeg(rad) : rad);
          break;
        }
        case 'atan': {
          const rad = Math.atan(x);
          stack.push(angleMode === 'DEG' ? toDeg(rad) : rad);
          break;
        }
        case 'log': {
          if (x <= 0) throw new Error('Domain Error');
          stack.push(Math.log10(x));
          break;
        }
        case 'ln': {
          if (x <= 0) throw new Error('Domain Error');
          stack.push(Math.log(x));
          break;
        }
        case 'sqrt': {
          if (x < 0) throw new Error('Domain Error');
          stack.push(Math.sqrt(x));
          break;
        }
        case 'abs': {
          stack.push(Math.abs(x));
          break;
        }
        case 'exp': {
          stack.push(Math.exp(x));
          break;
        }
        default:
          throw new Error(`Unknown function ${fn}`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Syntax Error');
  }

  return stack[0];
}
