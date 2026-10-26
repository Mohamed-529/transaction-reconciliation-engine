import React, { useState } from 'react';
import { Copy, Check, FileCode, Sparkles } from 'lucide-react';

interface Props {
  testSuite: string;
  prNumber: number;
  groundingRationale?: string;
}

export const TestViewer: React.FC<Props> = ({ testSuite, prNumber, groundingRationale }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(testSuite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm min-w-0">
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-800 bg-slate-900/60 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">Grounded Test Suite</h3>
          <span className="text-slate-600 text-xs hidden sm:inline">·</span>
          <span className="text-[11px] sm:text-xs text-slate-400 font-mono hidden sm:inline">JUnit 5 & Mockito</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors border border-slate-700 cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-300" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {groundingRationale && (
        <div className="px-4 sm:px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 text-xs text-slate-400 flex items-start gap-2 leading-relaxed break-words">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-slate-300">Targeted Edge Cases: </span>
            {groundingRationale}
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 bg-slate-950 overflow-x-auto max-h-[380px]">
        <pre className="font-mono text-[11px] sm:text-xs text-slate-300 leading-relaxed tabular-nums max-w-full">
          <code>{testSuite || '// No test suite generated yet for this PR.'}</code>
        </pre>
      </div>
    </div>
  );
};
