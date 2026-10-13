import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  AlertOctagon, 
  X, 
  Cpu, 
  ArrowRight, 
  ShieldCheck, 
  Network, 
  Key, 
  HardDrive
} from 'lucide-react';
import { CiscoConfig } from '../types/serial';

interface InjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAbort: () => void;
  percent: number;
  currentStepIndex: number;
  totalSteps: number;
  currentCommand: string;
  statusText: string;
  isFinished: boolean;
  hasError: boolean;
  config: CiscoConfig;
  pacingMs: number;
  onPacingChange: (ms: number) => void;
  language: 'fa' | 'en';
}

export const InjectionModal: React.FC<InjectionModalProps> = ({
  isOpen,
  onClose,
  onAbort,
  percent,
  currentStepIndex,
  totalSteps,
  currentCommand,
  statusText,
  isFinished,
  hasError,
  config,
  pacingMs,
  onPacingChange,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${
          hasError 
            ? 'bg-rose-500' 
            : isFinished 
            ? 'bg-emerald-500' 
            : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 animate-pulse'
        }`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              hasError
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : isFinished
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              {isFinished ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : hasError ? (
                <AlertOctagon className="w-6 h-6" />
              ) : (
                <Cpu className="w-6 h-6 animate-spin" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'fa' 
                  ? (isFinished ? 'تزریق کانفیگ با موفقیت به پایان رسید' : hasError ? 'خطا در حین تزریق' : 'در حال تزریق کانفیگ به سویچ سیسکو...')
                  : (isFinished ? 'Configuration Injected Successfully' : hasError ? 'Injection Failed' : 'Injecting Configuration into Switch...')}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'fa' 
                  ? `هدف: سویچ ${config.hostname} | پورت کنسول RS-232` 
                  : `Target: ${config.hostname} | RS-232 Console`}
              </p>
            </div>
          </div>

          {(isFinished || hasError) && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mb-5 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300">
              {language === 'fa' ? `گام ${currentStepIndex} از ${totalSteps}` : `Step ${currentStepIndex} of ${totalSteps}`}
            </span>
            <span className={`font-bold ${
              hasError ? 'text-rose-400' : isFinished ? 'text-emerald-400' : 'text-cyan-400'
            }`}>
              {percent}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                hasError
                  ? 'bg-rose-500'
                  : isFinished
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Live Command Stream Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-5 font-mono text-xs">
          <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
            <span>{language === 'fa' ? 'دستور در حال اجرا:' : 'Current Command:'}</span>
            <span className="text-cyan-400 font-semibold">{statusText}</span>
          </div>
          <div className="text-emerald-400 bg-black/60 p-2.5 rounded-lg border border-slate-800/80 truncate">
            {currentCommand ? `Switch# ${currentCommand}` : 'Switch# ...'}
          </div>
        </div>

        {/* Configuration Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400 block text-[10px]">VLAN 1 IP</span>
              <span className="text-white font-mono font-medium">
                {config.vlan1Mode === 'dhcp' ? 'DHCP Client' : config.vlan1Ip}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400 block text-[10px]">SSH & RSA</span>
              <span className="text-white font-mono font-medium">
                SSH v{config.sshVersion} ({config.rsaKeySize}b)
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400 block text-[10px]">Admin User</span>
              <span className="text-white font-mono font-medium">
                {config.adminUsername} (Priv 15)
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400 block text-[10px]">NVRAM Save</span>
              <span className="text-white font-mono font-medium">
                write memory
              </span>
            </div>
          </div>
        </div>

        {/* Pacing Speed Controller */}
        {!isFinished && !hasError && (
          <div className="mb-5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-400">
              {language === 'fa' ? 'سرعت تاخیر بین دستورات (Pacing Delay):' : 'Line Pacing Delay:'}
            </span>
            <div className="flex items-center gap-2 font-mono text-cyan-300">
              <input
                type="range"
                min="80"
                max="500"
                step="20"
                value={pacingMs}
                onChange={(e) => onPacingChange(Number(e.target.value))}
                className="w-24 accent-cyan-400 cursor-pointer"
              />
              <span>{pacingMs}ms</span>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          {!isFinished && !hasError ? (
            <button
              onClick={onAbort}
              className="py-2.5 px-5 rounded-xl font-medium text-xs text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors"
            >
              {language === 'fa' ? 'توقف و انصراف از تزریق' : 'Abort Injection'}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl font-medium text-xs text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-600/30 transition-colors"
            >
              {language === 'fa' ? 'تایید و بستن' : 'Done & Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
