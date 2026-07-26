import React from 'react';
import { AngleMode } from '../types';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface MemoryBarProps {
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  onMemoryClear: () => void;
  onMemoryRecall: () => void;
  onMemoryAdd: () => void;
  onMemorySub: () => void;
  onMemoryStore: () => void;
  onAllClear: () => void;
  onClear: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hasMemory: boolean;
}

export const MemoryBar: React.FC<MemoryBarProps> = ({
  angleMode,
  onToggleAngleMode,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySub,
  onMemoryStore,
  onAllClear,
  onClear,
  soundEnabled,
  onToggleSound,
  hasMemory
}) => {
  return (
    <div className="w-full px-4 py-2 bg-[var(--panel)] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
      {/* Left: Mode & Memory Buttons */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
        <button
          onClick={onToggleAngleMode}
          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-[11px] tracking-wider active:scale-95 transition-all uppercase"
          title="Toggle Degrees or Radians"
        >
          {angleMode}
        </button>

        <div className="h-4 w-[1px] bg-white/10 mx-1" />

        <button
          onClick={onMemoryClear}
          disabled={!hasMemory}
          className={`px-2.5 py-1 rounded-lg transition-all lowercase ${
            hasMemory
              ? 'bg-[var(--btn-fn)] hover:brightness-125 text-slate-300 active:scale-95'
              : 'bg-[var(--btn-fn)] text-slate-600 opacity-60 cursor-not-allowed'
          }`}
          title="Memory Clear"
        >
          mc
        </button>
        <button
          onClick={onMemoryRecall}
          disabled={!hasMemory}
          className={`px-2.5 py-1 rounded-lg transition-all lowercase ${
            hasMemory
              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 active:scale-95'
              : 'bg-[var(--btn-fn)] text-slate-600 opacity-60 cursor-not-allowed'
          }`}
          title="Memory Recall"
        >
          mr
        </button>
        <button
          onClick={onMemoryAdd}
          className="px-2.5 py-1 rounded-lg bg-[var(--btn-fn)] hover:brightness-125 text-slate-400 active:scale-95 transition-all lowercase"
          title="Memory Add"
        >
          m+
        </button>
        <button
          onClick={onMemorySub}
          className="px-2.5 py-1 rounded-lg bg-[var(--btn-fn)] hover:brightness-125 text-slate-400 active:scale-95 transition-all lowercase"
          title="Memory Subtract"
        >
          m-
        </button>
        <button
          onClick={onMemoryStore}
          className="px-2.5 py-1 rounded-lg bg-[var(--btn-fn)] hover:brightness-125 text-slate-400 active:scale-95 transition-all lowercase"
          title="Memory Store"
        >
          ms
        </button>
      </div>

      {/* Right: Sound & Clear Buttons */}
      <div className="flex items-center space-x-1.5 ml-auto">
        <button
          onClick={onToggleSound}
          className={`p-1.5 rounded-lg transition-all ${
            soundEnabled
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-[var(--btn-fn)] text-slate-600 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Mute Key Sounds' : 'Enable Key Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onClear}
          className="px-2.5 py-1 rounded-lg bg-[var(--btn-fn)] hover:brightness-125 text-amber-400 border border-amber-500/20 active:scale-95 transition-all lowercase font-bold"
          title="Clear Display"
        >
          clear
        </button>
        <button
          onClick={onAllClear}
          className="px-2.5 py-1 rounded-lg bg-[var(--btn-fn)] hover:brightness-125 text-red-400 border border-red-500/20 active:scale-95 transition-all lowercase font-bold"
          title="All Clear"
        >
          ac
        </button>
      </div>
    </div>
  );
};
