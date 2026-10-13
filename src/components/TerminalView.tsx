import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Send, 
  Trash2, 
  Download, 
  ArrowDown, 
  Maximize2, 
  Minimize2, 
  CornerDownLeft,
  PlayCircle
} from 'lucide-react';
import { ConnectionStatus } from '../types/serial';

interface TerminalViewProps {
  logs: string;
  onSendCommand: (cmd: string) => void;
  onClear: () => void;
  status: ConnectionStatus;
  language: 'fa' | 'en';
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  logs,
  onSendCommand,
  onClear,
  status,
  language,
}) => {
  const [inputCommand, setInputCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isConnected = status === 'connected';

  // Auto-scroll whenever logs change
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = inputCommand.trim();
    if (!cmd && !inputCommand.includes('\n')) {
      // Just sending an empty Enter to wake up switch
      onSendCommand('');
      return;
    }

    onSendCommand(cmd);
    setCommandHistory(prev => [cmd, ...prev.slice(0, 40)]);
    setHistoryIndex(-1);
    setInputCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCommand('');
      }
    }
  };

  const downloadLogFile = () => {
    const blob = new Blob([logs || 'No logs recorded'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cisco-console-session-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const QUICK_COMMANDS = [
    { label: 'show ip int br', cmd: 'show ip interface brief' },
    { label: 'show ip ssh', cmd: 'show ip ssh' },
    { label: 'show version', cmd: 'show version' },
    { label: 'term len 0', cmd: 'terminal length 0' },
    { label: 'write memory', cmd: 'write memory' },
  ];

  return (
    <div className={`bg-slate-950 border border-slate-800 rounded-2xl flex flex-col shadow-2xl transition-all ${
      isExpanded ? 'fixed inset-4 z-50' : 'h-[520px]'
    }`}>
      {/* Terminal Title Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/90 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 ms-2 text-slate-300 font-mono text-xs">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cisco IOS Console Terminal</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg text-xs font-mono border transition-colors ${
              autoScroll 
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={language === 'fa' ? 'اسکرول خودکار به آخرین خط' : 'Toggle Auto-scroll'}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={downloadLogFile}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={language === 'fa' ? 'دانلود لاگ سشن به صورت فایل .log' : 'Download Session Log'}
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={language === 'fa' ? 'پاکسازی صفحه ترمینال' : 'Clear Terminal'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={language === 'fa' ? 'تمام‌صفحه' : 'Toggle Fullscreen'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div 
        dir="ltr"
        className="flex-1 overflow-y-auto p-4 terminal-font text-xs leading-relaxed text-emerald-400 bg-black/90 selection:bg-cyan-800 selection:text-white"
      >
        {logs ? (
          <pre className="whitespace-pre-wrap break-all font-mono">
            {logs}
          </pre>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-2 font-mono">
            <TerminalIcon className="w-10 h-10 stroke-[1.5] text-slate-700" />
            <p className="text-slate-500">
              {language === 'fa' 
                ? 'پورت کنسول آماده دریافت سیگنال است. کابل را متصل کرده و اینتر بزنید.'
                : 'Console stream is idle. Connect serial cable to see live switch I/O.'}
            </p>
            <p className="text-[11px] text-slate-600">Baud: 9600 | 8-N-1 | VT100 / ANSI</p>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Quick macro command chips */}
      <div className="bg-slate-900/60 border-t border-slate-800/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-mono shrink-0">
          {language === 'fa' ? 'دستورات سریع:' : 'Macros:'}
        </span>
        {QUICK_COMMANDS.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={!isConnected}
            onClick={() => onSendCommand(item.cmd)}
            className="px-2 py-0.5 rounded font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 shrink-0 transition-colors disabled:opacity-40"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form 
        onSubmit={handleSend}
        dir="ltr"
        className="bg-slate-900 border-t border-slate-800 p-2.5 flex items-center gap-2 rounded-b-2xl"
      >
        <span className="font-mono text-cyan-400 text-xs font-bold px-1 select-none">
          Switch#
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isConnected 
              ? (language === 'fa' ? 'دستور CLI سیسکو را بنویسید (مثلاً: show version)...' : 'Type Cisco CLI command and press Enter...') 
              : (language === 'fa' ? 'ابتدا کابل کنسول را متصل کنید' : 'Connect console cable first...')
          }
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
        <button
          type="submit"
          disabled={!isConnected}
          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-md shadow-cyan-600/20 disabled:opacity-40 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{language === 'fa' ? 'ارسال' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
};
