import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onInput: (val: string) => void;
  onFunction: (fn: string) => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onToggleSecondMode: () => void;
  isSecondMode: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onInput,
  onFunction,
  onBackspace,
  onCalculate,
  onToggleSecondMode,
  isSecondMode
}) => {
  return (
    <div className="w-full p-3 sm:p-5 bg-[var(--panel)] rounded-b-2xl sm:rounded-b-3xl border-t border-white/5">
      {/* 8-Column Responsive Keypad Grid matching Immersive UI theme */}
      <div className="grid grid-cols-8 gap-1.5 sm:gap-2.5 max-w-4xl mx-auto">
        
        {/* ================= ROW 1 ================= */}
        {/* sin / asin */}
        <button
          onClick={() => onFunction(isSecondMode ? 'asin' : 'sin')}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'asin' : 'sin'}
        </button>

        {/* cos / acos */}
        <button
          onClick={() => onFunction(isSecondMode ? 'acos' : 'cos')}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'acos' : 'cos'}
        </button>

        {/* tan / atan */}
        <button
          onClick={() => onFunction(isSecondMode ? 'atan' : 'tan')}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'atan' : 'tan'}
        </button>

        {/* x² / x! */}
        <button
          onClick={() => (isSecondMode ? onInput('!') : onFunction('sq'))}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'x!' : 'x²'}
        </button>

        {/* x³ / 10ˣ */}
        <button
          onClick={() => (isSecondMode ? onFunction('pow10') : onFunction('cube'))}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? '10ˣ' : 'x³'}
        </button>

        {/* yˣ / eˣ */}
        <button
          onClick={() => (isSecondMode ? onFunction('exp') : onInput('^'))}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'eˣ' : 'yˣ'}
        </button>

        {/* Backspace Key spanning Col 7 & Col 8 */}
        <button
          onClick={onBackspace}
          className="btn-base btn-op col-span-2 h-11 sm:h-13 text-amber-400"
          title="Backspace (Delete)"
        >
          <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>


        {/* ================= ROW 2 ================= */}
        {/* asin / 10ˣ */}
        <button
          onClick={() => onFunction(isSecondMode ? 'pow10' : 'asin')}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? '10ˣ' : 'asin'}
        </button>

        {/* acos / eˣ */}
        <button
          onClick={() => onFunction(isSecondMode ? 'exp' : 'acos')}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'eˣ' : 'acos'}
        </button>

        {/* atan / abs */}
        <button
          onClick={() => onFunction(isSecondMode ? 'abs' : 'atan')}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'abs' : 'atan'}
        </button>

        {/* 7 */}
        <button
          onClick={() => onInput('7')}
          className="btn-base btn-num h-11 sm:h-13 text-base sm:text-xl font-medium"
        >
          7
        </button>

        {/* 8 */}
        <button
          onClick={() => onInput('8')}
          className="btn-base btn-num h-11 sm:h-13 text-base sm:text-xl font-medium"
        >
          8
        </button>

        {/* 9 */}
        <button
          onClick={() => onInput('9')}
          className="btn-base btn-num h-11 sm:h-13 text-base sm:text-xl font-medium"
        >
          9
        </button>

        {/* ÷ */}
        <button
          onClick={() => onInput('÷')}
          className="btn-base btn-op h-11 sm:h-13 text-lg sm:text-2xl"
        >
          ÷
        </button>

        {/* × */}
        <button
          onClick={() => onInput('×')}
          className="btn-base btn-op h-11 sm:h-13 text-lg sm:text-2xl"
        >
          ×
        </button>


        {/* ================= ROW 3 ================= */}
        {/* ln / e */}
        <button
          onClick={() => (isSecondMode ? onInput('e') : onFunction('ln'))}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'e' : 'ln'}
        </button>

        {/* log / 10ˣ */}
        <button
          onClick={() => (isSecondMode ? onFunction('pow10') : onFunction('log'))}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? '10ˣ' : 'log'}
        </button>

        {/* √ / π */}
        <button
          onClick={() => (isSecondMode ? onInput('π') : onFunction('sqrt'))}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'π' : '√'}
        </button>

        {/* 4 */}
        <button
          onClick={() => onInput('4')}
          className="btn-base btn-num h-11 sm:h-13 text-base sm:text-xl font-medium"
        >
          4
        </button>

        {/* 5 */}
        <button
          onClick={() => onInput('5')}
          className="btn-base btn-num h-11 sm:h-13 text-base sm:text-xl font-medium"
        >
          5
        </button>

        {/* 6 */}
        <button
          onClick={() => onInput('6')}
          className="btn-base btn-num h-11 sm:h-13 text-base sm:text-xl font-medium"
        >
          6
        </button>

        {/* + */}
        <button
          onClick={() => onInput('+')}
          className="btn-base btn-op h-11 sm:h-13 text-lg sm:text-2xl"
        >
          +
        </button>

        {/* − */}
        <button
          onClick={() => onInput('−')}
          className="btn-base btn-op h-11 sm:h-13 text-lg sm:text-2xl"
        >
          −
        </button>


        {/* ================= ROW 4 ================= */}
        {/* ( / π */}
        <button
          onClick={() => onInput(isSecondMode ? 'π' : '(')}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'π' : '('}
        </button>

        {/* ) / e */}
        <button
          onClick={() => onInput(isSecondMode ? 'e' : ')')}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? 'e' : ')'}
        </button>

        {/* , / % */}
        <button
          onClick={() => onInput(isSecondMode ? '%' : ',')}
          className="btn-base btn-fn h-11 sm:h-13"
        >
          {isSecondMode ? '%' : ','}
        </button>

        {/* 1 */}
        <button
          onClick={() => onInput('1')}
          className="btn-base btn-num h-11 sm:h-13 text-base sm:text-xl font-medium"
        >
          1
        </button>

        {/* 2 */}
        <button
          onClick={() => onInput('2')}
          className="btn-base btn-num h-11 sm:h-13 text-base sm:text-xl font-medium"
        >
          2
        </button>

        {/* 3 */}
        <button
          onClick={() => onInput('3')}
          className="btn-base btn-num h-11 sm:h-13 text-base sm:text-xl font-medium"
        >
          3
        </button>

        {/* = Action Equals Button spanning Rows 4 & 5 across Cols 7 & 8 */}
        <button
          onClick={onCalculate}
          className="btn-base btn-action col-span-2 row-span-2 rounded-xl text-3xl font-bold"
        >
          =
        </button>


        {/* ================= ROW 5 ================= */}
        {/* MOD */}
        <button
          onClick={() => onInput(' MOD ')}
          className="btn-base btn-fn h-11 sm:h-13 text-xs uppercase font-bold"
        >
          MOD
        </button>

        {/* Ans */}
        <button
          onClick={() => onInput('Ans')}
          className="btn-base btn-fn h-11 sm:h-13 text-xs uppercase font-bold"
        >
          Ans
        </button>

        {/* 2nd toggle key */}
        <button
          onClick={onToggleSecondMode}
          className={`btn-base h-11 sm:h-13 text-xs font-bold uppercase ${
            isSecondMode
              ? 'bg-amber-500/25 border border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'btn-fn text-amber-400 hover:text-amber-300'
          }`}
        >
          2nd
        </button>

        {/* 0 (spanning 2 columns) */}
        <button
          onClick={() => onInput('0')}
          className="btn-base btn-num col-span-2 h-11 sm:h-13 text-base sm:text-xl font-medium"
        >
          0
        </button>

        {/* . Decimal */}
        <button
          onClick={() => onInput('.')}
          className="btn-base btn-num h-11 sm:h-13 text-base sm:text-2xl font-bold"
        >
          .
        </button>

      </div>
    </div>
  );
};
