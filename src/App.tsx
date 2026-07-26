import React, { useState, useEffect, useCallback } from 'react';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { MemoryBar } from './components/MemoryBar';
import { HistoryPanel } from './components/HistoryPanel';
import { AngleMode, HistoryItem } from './types';
import { evaluateExpression, formatResult } from './lib/mathEngine';
import { playKeyClick } from './lib/audio';
import { History as HistoryIcon, X } from 'lucide-react';

export default function App() {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [livePreview, setLivePreview] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [isSecondMode, setIsSecondMode] = useState<boolean>(false);
  const [ans, setAns] = useState<number>(0);
  const [memory, setMemory] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState<boolean>(false);

  // Load history & sound preference from LocalStorage
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('calc_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) }));
      }
    } catch (e) {
      // ignore
    }
    return [
      {
        id: '1',
        expression: 'log(256.1 / 5.3) + e^π - (√3 * tan(60°))',
        result: '27.91234567',
        timestamp: new Date()
      },
      {
        id: '2',
        expression: 'sin(45°) * ln(12)',
        result: '8.12345678',
        timestamp: new Date()
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('calc_history', JSON.stringify(history));
    } catch (e) {
      // ignore
    }
  }, [history]);

  // Update live preview whenever expression or angleMode changes
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setLivePreview('');
      setError(null);
      return;
    }

    const evalRes = evaluateExpression(expression, angleMode, ans);
    if (evalRes.success && evalRes.formatted) {
      setLivePreview(evalRes.formatted);
      setError(null);
    } else {
      setLivePreview('');
    }
  }, [expression, angleMode, ans]);

  // Audio trigger
  const triggerAudio = (type: 'num' | 'op' | 'equals' | 'clear' = 'num') => {
    if (soundEnabled) {
      playKeyClick(type);
    }
  };

  // Handle Input (Numbers, operators, symbols)
  const handleInput = useCallback((char: string) => {
    setError(null);
    triggerAudio(['+', '−', '×', '÷', '%', '^'].includes(char) ? 'op' : 'num');

    setExpression((prev) => {
      // If we just completed a calculation and type an operator, continue with result
      if (isCalculated) {
        setIsCalculated(false);
        if (['+', '−', '×', '÷', '%', '^', ' MOD '].includes(char)) {
          return result + char;
        }
        return char;
      }
      return prev + char;
    });
  }, [isCalculated, result]);

  // Handle Scientific Functions (sin, cos, tan, log, etc.)
  const handleFunction = useCallback((fn: string) => {
    setError(null);
    triggerAudio('op');

    setExpression((prev) => {
      let base = isCalculated ? '' : prev;
      if (isCalculated) setIsCalculated(false);

      switch (fn) {
        case 'sin': return base + 'sin(';
        case 'cos': return base + 'cos(';
        case 'tan': return base + 'tan(';
        case 'asin': return base + 'asin(';
        case 'acos': return base + 'acos(';
        case 'atan': return base + 'atan(';
        case 'log': return base + 'log(';
        case 'ln': return base + 'ln(';
        case 'sqrt': return base + '√(';
        case 'sq': return base + '²';
        case 'cube': return base + '³';
        case 'pow10': return base + '10^(';
        case 'exp': return base + 'e^(';
        case 'abs': return base + 'abs(';
        default: return base + fn + '(';
      }
    });
  }, [isCalculated]);

  // Handle Backspace
  const handleBackspace = useCallback(() => {
    setError(null);
    triggerAudio('clear');

    setExpression((prev) => {
      if (isCalculated) {
        setIsCalculated(false);
        return '';
      }
      if (!prev) return '';

      // Delete multi-character function tokens cleanly if applicable
      const multiTokens = ['sin(', 'cos(', 'tan(', 'log(', 'asin(', 'acos(', 'atan(', 'MOD '];
      for (const tok of multiTokens) {
        if (prev.endsWith(tok)) {
          return prev.slice(0, -tok.length);
        }
      }
      return prev.slice(0, -1);
    });
  }, [isCalculated]);

  // Handle Clear active expression
  const handleClear = useCallback(() => {
    triggerAudio('clear');
    setExpression('');
    setError(null);
    setIsCalculated(false);
  }, []);

  // Handle All Clear (AC)
  const handleAllClear = useCallback(() => {
    triggerAudio('clear');
    setExpression('');
    setResult('0');
    setLivePreview('');
    setError(null);
    setIsCalculated(false);
  }, []);

  // Handle Calculate (=)
  const handleCalculate = useCallback(() => {
    if (!expression || expression.trim() === '') return;

    const evalRes = evaluateExpression(expression, angleMode, ans);

    if (evalRes.success && evalRes.value !== undefined && evalRes.formatted) {
      triggerAudio('equals');
      setResult(evalRes.formatted);
      setAns(evalRes.value);
      setError(null);
      setIsCalculated(true);

      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: expression,
        result: evalRes.formatted,
        timestamp: new Date()
      };

      setHistory((prev) => [newItem, ...prev.slice(0, 49)]); // Keep last 50
    } else {
      triggerAudio('clear');
      setError(evalRes.error || 'Syntax Error');
    }
  }, [expression, angleMode, ans]);

  // Memory operations
  const handleMemoryClear = () => {
    triggerAudio('clear');
    setMemory(0);
  };

  const handleMemoryRecall = () => {
    triggerAudio('num');
    handleInput(memory.toString());
  };

  const handleMemoryAdd = () => {
    triggerAudio('op');
    const evalRes = evaluateExpression(expression || result, angleMode, ans);
    if (evalRes.success && evalRes.value !== undefined) {
      setMemory((prev) => prev + evalRes.value!);
    }
  };

  const handleMemorySub = () => {
    triggerAudio('op');
    const evalRes = evaluateExpression(expression || result, angleMode, ans);
    if (evalRes.success && evalRes.value !== undefined) {
      setMemory((prev) => prev - evalRes.value!);
    }
  };

  const handleMemoryStore = () => {
    triggerAudio('op');
    const evalRes = evaluateExpression(expression || result, angleMode, ans);
    if (evalRes.success && evalRes.value !== undefined) {
      setMemory(evalRes.value!);
    }
  };

  // Keyboard Shortcuts Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input element or text area
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key;

      if (key >= '0' && key <= '9') handleInput(key);
      else if (key === '.') handleInput('.');
      else if (key === '+') handleInput('+');
      else if (key === '-') handleInput('−');
      else if (key === '*') handleInput('×');
      else if (key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (key === '%') handleInput('%');
      else if (key === '^') handleInput('^');
      else if (key === '(') handleInput('(');
      else if (key === ')') handleInput(')');
      else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        handleAllClear();
      } else if (key.toLowerCase() === 's') handleFunction('sin');
      else if (key.toLowerCase() === 'c') handleFunction('cos');
      else if (key.toLowerCase() === 't') handleFunction('tan');
      else if (key.toLowerCase() === 'l') handleFunction('ln');
      else if (key.toLowerCase() === 'g') handleFunction('log');
      else if (key.toLowerCase() === 'r') handleFunction('sqrt');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleFunction, handleCalculate, handleBackspace, handleAllClear]);

  return (
    <div className="min-h-screen bg-immersive flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 select-none">
      
      {/* Outer Immersive Container matching theme */}
      <div className="relative w-full max-w-6xl bg-[var(--panel)] rounded-[24px] sm:rounded-[32px] p-2 sm:p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/5 overflow-hidden">
        
        {/* Top Glow Accent Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/5 mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <h1 className="text-xl sm:text-2xl text-white font-semibold tracking-wide">
              Scientific Calculator
            </h1>
          </div>

          {/* Right Header: Mobile History Drawer Trigger */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={() => setIsMobileHistoryOpen(!isMobileHistoryOpen)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-semibold text-amber-400 flex items-center space-x-1.5 transition-all"
            >
              <HistoryIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 overflow-hidden">
          
          {/* Left Column (Calculator Body: Display + MemoryBar + Keypad) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {/* Calculator Display */}
            <Display
              expression={expression}
              livePreview={livePreview}
              result={result}
              error={error}
              angleMode={angleMode}
              hasMemory={memory !== 0}
              memoryValue={memory}
            />

            {/* Memory & Mode Control Bar */}
            <MemoryBar
              angleMode={angleMode}
              onToggleAngleMode={() => setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'))}
              onMemoryClear={handleMemoryClear}
              onMemoryRecall={handleMemoryRecall}
              onMemoryAdd={handleMemoryAdd}
              onMemorySub={handleMemorySub}
              onMemoryStore={handleMemoryStore}
              onAllClear={handleAllClear}
              onClear={handleClear}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((prev) => !prev)}
              hasMemory={memory !== 0}
            />

            {/* Main Keypad Grid */}
            <Keypad
              onInput={handleInput}
              onFunction={handleFunction}
              onBackspace={handleBackspace}
              onCalculate={handleCalculate}
              onToggleSecondMode={() => setIsSecondMode((prev) => !prev)}
              isSecondMode={isSecondMode}
            />
          </div>

          {/* Right Column (History Panel - Desktop view) */}
          <div className="hidden lg:block lg:col-span-4 h-full">
            <HistoryPanel
              history={history}
              onSelectHistory={(item) => {
                setExpression(item.expression);
                setResult(item.result);
                setError(null);
              }}
              onClearHistory={() => setHistory([])}
            />
          </div>

        </div>

      </div>

      {/* Mobile History Slide-over Drawer */}
      {isMobileHistoryOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm h-full bg-[var(--panel)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 p-2">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-semibold text-white text-base uppercase tracking-wider">Calculation History</span>
              <button
                onClick={() => setIsMobileHistoryOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <HistoryPanel
                history={history}
                onSelectHistory={(item) => {
                  setExpression(item.expression);
                  setResult(item.result);
                  setError(null);
                  setIsMobileHistoryOpen(false);
                }}
                onClearHistory={() => setHistory([])}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer info badge */}
      <div className="mt-4 text-center text-xs text-slate-500 font-mono tracking-wider">
        Scientific Calculator // Immersive Engine
      </div>

    </div>
  );
}
