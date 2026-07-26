import React from 'react';
import { AngleMode } from '../types';

interface DisplayProps {
  expression: string;
  livePreview: string;
  result: string;
  error: string | null;
  angleMode: AngleMode;
  hasMemory: boolean;
  memoryValue: number;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  livePreview,
  result,
  error,
  angleMode,
  hasMemory,
  memoryValue
}) => {
  // Format expression for visual elegance matching screenshot (e.g. golden yellow math text)
  const formattedExpr = expression
    ? expression
        .replace(/×/g, ' × ')
        .replace(/÷/g, ' ÷ ')
        .replace(/\+/g, ' + ')
        .replace(/−/g, ' − ')
        .replace(/\^/g, '^')
    : '';

  return (
    <div className="relative w-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl display-unit-glow border border-white/5 overflow-hidden mb-4 sm:mb-6">
      {/* Top Status Indicators (Angle Mode & Memory Indicator) */}
      <div className="relative flex items-center justify-between text-xs font-medium text-slate-400 mb-3 z-10">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px] tracking-widest uppercase">
            {angleMode}
          </span>
          {hasMemory && (
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-[11px] uppercase tracking-wider">
              MEM: {memoryValue}
            </span>
          )}
        </div>
        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
          {expression ? `${expression.length} CHARS` : 'DISP // OK'}
        </div>
      </div>

      {/* Main Display Unit Content */}
      <div className="relative flex flex-col justify-end items-end min-h-[120px] sm:min-h-[140px] text-right z-10 space-y-1 select-text">
        {/* Math Expression Line */}
        <div className="w-full text-sm sm:text-lg font-calc-mono tracking-wider text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 transition-all">
          {formattedExpr || <span className="opacity-0">0</span>}
        </div>

        {/* Live Preview / Intermediate Result */}
        <div className="text-xs sm:text-sm font-calc-mono text-amber-400/80 h-5 overflow-hidden transition-opacity">
          {error ? (
            <span className="text-red-400 font-sans uppercase tracking-wider text-xs">! {error}</span>
          ) : livePreview && livePreview !== result ? (
            <span>≈ {livePreview}</span>
          ) : (
            <span className="opacity-0">.</span>
          )}
        </div>

        {/* Current Main Value */}
        <div className="w-full text-3xl sm:text-5xl lg:text-6xl font-calc-mono font-light tracking-tight text-white current-val-glow overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          {error ? (
            <span className="text-red-400 text-2xl sm:text-4xl font-sans font-light">{error}</span>
          ) : (
            result || '0'
          )}
        </div>
      </div>
    </div>
  );
};
