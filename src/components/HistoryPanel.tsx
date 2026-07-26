import React from 'react';
import { HistoryItem } from '../types';
import { Trash2, History as HistoryIcon, ArrowUpRight } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectHistory,
  onClearHistory,
  isOpenMobile = false,
  onCloseMobile
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-[var(--panel)] border border-white/5 rounded-2xl p-4 sm:p-6 overflow-hidden">
      {/* History Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4">
        <div className="flex items-center space-x-2">
          <HistoryIcon className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-bold text-white tracking-wide uppercase">History</h2>
          {history.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
              {history.length}
            </span>
          )}
        </div>

        {/* Clear History Pill Button */}
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95"
            title="Clear All Calculation History"
          >
            <Trash2 className="w-3 h-3 text-amber-400" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* History Items Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-1">
              <HistoryIcon className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">No History Yet</p>
            <p className="text-[11px] text-slate-600 max-w-[200px]">
              Calculations you perform will automatically appear here.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className="group relative p-3 rounded-xl bg-[#090b0e] hover:bg-[#131720] border border-white/5 hover:border-amber-500/30 transition-all duration-150 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-1 text-xs text-slate-400 font-calc-mono tracking-wide group-hover:text-amber-200 transition-colors">
                <span className="truncate max-w-[200px]">{item.expression}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity" />
              </div>
              <div className="text-right text-base sm:text-lg font-calc-mono font-semibold text-amber-400 tracking-tight">
                = {item.result}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
