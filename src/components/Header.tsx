import React from 'react';
import { 
  Network, 
  HelpCircle, 
  Cpu, 
  Globe, 
  History, 
  FolderGit2, 
  RefreshCw, 
  ShieldAlert,
  Download
} from 'lucide-react';
import { ConnectionStatus, SerialPortInfo } from '../types/serial';

interface HeaderProps {
  status: ConnectionStatus;
  portInfo: SerialPortInfo | null;
  baudRate: number;
  isSimulated: boolean;
  isWebSerialSupported: boolean;
  language: 'fa' | 'en';
  onToggleLanguage: () => void;
  onToggleSimulation: () => void;
  onOpenHelp: () => void;
  onOpenProfiles: () => void;
  onOpenAuditLogs: () => void;
  onOpenOperations: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  portInfo,
  baudRate,
  isSimulated,
  isWebSerialSupported,
  language,
  onToggleLanguage,
  onToggleSimulation,
  onOpenHelp,
  onOpenProfiles,
  onOpenAuditLogs,
  onOpenOperations,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-emerald-950/80 sticky top-0 z-40 px-4 lg:px-8 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Company & System Title */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white shrink-0 ring-1 ring-emerald-400/30">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>
                  {language === 'fa' 
                    ? 'کانفیگ سویچ های سیسکو شرکت لوح سبز جنوب' 
                    : 'Cisco Switch Auto-Config | Loh-e Sabz-e Jonoob Co.'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-sans bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-medium">
                  {language === 'fa' ? 'نسخه سازمانی' : 'Enterprise'}
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'fa' 
                ? 'مدیریت پروفایل‌ها، اتصال کنسول، VLAN 1، SSH، SNMP، RSTP، لاگ‌گیری و بکاپ'
                : 'Profile Management, Console Injection, VLAN 1, SSH, SNMP, RSTP, Audit Logs & Backup'}
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Pills */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Profiles Manager Button */}
          <button
            onClick={onOpenProfiles}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50 flex items-center gap-1.5 transition-all shadow-sm"
            title={language === 'fa' ? 'مدیریت و انتخاب پروفایل‌های پیکربندی' : 'Manage Configuration Profiles'}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'fa' ? 'پروفایل‌ها' : 'Profiles'}</span>
          </button>

          {/* Audit Logs Button */}
          <button
            onClick={onOpenAuditLogs}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/50 flex items-center gap-1.5 transition-all shadow-sm"
            title={language === 'fa' ? 'مشاهده لاگ‌ها و تاریخچه عملیات‌های انجام‌شده' : 'View Audit Logs & Operation History'}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'fa' ? 'گزارش لاگ‌ها' : 'Audit Logs'}</span>
          </button>

          {/* Switch Operations (Backup, Reload, Factory Reset) */}
          <button
            onClick={onOpenOperations}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-800/50 flex items-center gap-1.5 transition-all shadow-sm"
            title={language === 'fa' ? 'عملیات سوئیچ: بکاپ‌گیری، ریست معمولی و ریست فکتوری' : 'Switch Operations: Backup, Reboot & Factory Reset'}
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'fa' ? 'عملیات سوئیچ' : 'Operations'}</span>
          </button>

          {/* Simulation Toggle Button */}
          <button
            onClick={onToggleSimulation}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              isSimulated
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={language === 'fa' ? 'شبیه‌ساز تستی (بدون نیاز به کابل فیزیکی)' : 'Simulator Mode'}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>
              {language === 'fa'
                ? isSimulated ? 'شبیه‌ساز (فعال)' : 'شبیه‌ساز'
                : isSimulated ? 'Simulator (Active)' : 'Simulator'}
            </span>
          </button>

          {/* Connection Status Pill */}
          <div className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border flex items-center gap-2 ${
            status === 'connected' 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
              : status === 'connecting'
              ? 'bg-blue-500/15 border-blue-500/30 text-blue-300 animate-pulse'
              : status === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              status === 'connected' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 
              status === 'connecting' ? 'bg-blue-400' :
              status === 'error' ? 'bg-rose-400' : 'bg-slate-500'
            }`} />
            <span>
              {status === 'connected'
                ? (language === 'fa' ? `متصل (${baudRate})` : `Connected (${baudRate})`)
                : status === 'connecting'
                ? (language === 'fa' ? 'در حال اتصال...' : 'Connecting...')
                : status === 'error'
                ? (language === 'fa' ? 'خطا' : 'Error')
                : (language === 'fa' ? 'کنسول قطع است' : 'Disconnected')}
            </span>
          </div>

          {/* Help Modal Button */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={language === 'fa' ? 'راهنما و مشخصات کابل‌ها' : 'Help & Cable Guide'}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="تغییر زبان / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'fa' ? 'EN' : 'فارسی'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
