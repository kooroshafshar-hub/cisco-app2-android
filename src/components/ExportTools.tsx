import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Terminal, 
  FileText, 
  BookOpen, 
  ExternalLink 
} from 'lucide-react';
import { CiscoConfig } from '../types/serial';
import { generateFullConfigText, generatePythonScript } from '../utils/configGenerator';

interface ExportToolsProps {
  config: CiscoConfig;
  language: 'fa' | 'en';
}

export const ExportTools: React.FC<ExportToolsProps> = ({ config, language }) => {
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'python' | 'cheatsheet'>('config');

  const fullConfig = generateFullConfigText(config);
  const pythonScript = generatePythonScript(config);

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(fullConfig);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleCopyPython = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2000);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CHEAT_SHEET = [
    { cmd: 'show ip interface brief', descFa: 'بررسی وضعیت تمام پورت‌ها و IP تنظیم‌شده روی VLAN 1', descEn: 'Check IP addresses and line status of all interfaces' },
    { cmd: 'show ip ssh', descFa: 'بررسی فعال بودن SSH v2 و پارامترهای تایم‌اوت', descEn: 'Verify SSH version 2 status and authentication timeout' },
    { cmd: 'show crypto key mypubkey rsa', descFa: 'مشاهده کلیدهای عمومی RSA تولیدشده برای SSH', descEn: 'Display generated RSA public keys used by SSH' },
    { cmd: 'show running-config', descFa: 'مشاهده کانفیگ فعلی سویچ در حافظه موقت RAM', descEn: 'Display active running configuration in RAM' },
    { cmd: 'show startup-config', descFa: 'مشاهده کانفیگ ذخیره‌شده در حافظه پایدار NVRAM', descEn: 'Display permanent configuration stored in NVRAM' },
    { cmd: 'show vlan brief', descFa: 'لیست VLANها و پورت‌های متصل به هر شبکه مجازی', descEn: 'List VLAN IDs, names, and assigned switchports' },
    { cmd: 'show mac address-table', descFa: 'جدول آدرس‌های فیزیکی MAC شناسایی‌شده روی پورت‌ها', descEn: 'Display dynamically learned MAC address table' },
    { cmd: 'write memory', descFa: 'ذخیره دائم کانفیگ (معادل copy run start)', descEn: 'Save running-config permanently to startup-config' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm text-white">
            {language === 'fa' ? 'پیش‌نمایش کانفیگ، اسکریپت پایتون و مراجع دستورات' : 'Config Preview, Python Script & Cheat Sheet'}
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'config' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'fa' ? 'دستورات سیسکو (IOS)' : 'Cisco IOS CLI'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'python' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'fa' ? 'اسکریپت پایتون' : 'Python Script'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cheatsheet')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'cheatsheet' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'fa' ? 'دستورات تست (Cheat Sheet)' : 'Verification'}
          </button>
        </div>
      </div>

      {/* Tab 1: Cisco IOS CLI */}
      {activeTab === 'config' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {language === 'fa'
                ? 'کد آماده کانفیگ سیسکو با فرمت استاندارد IOS جهت تزریق یا کپی دستی در PuTTY'
                : 'Ready-to-use Cisco IOS script for console injection or PuTTY copy-paste'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyConfig}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedConfig ? (language === 'fa' ? 'کپی شد!' : 'Copied!') : (language === 'fa' ? 'کپی متن' : 'Copy')}</span>
              </button>
              <button
                type="button"
                onClick={() => downloadFile(fullConfig, `${config.hostname || 'switch'}-initial-config.cfg`, 'text/plain')}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? 'دانلود .cfg' : 'Download .cfg'}</span>
              </button>
            </div>
          </div>

          <div dir="ltr" className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-72 overflow-y-auto">
            <pre className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap">
              {fullConfig}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Standalone Python Script */}
      {activeTab === 'python' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {language === 'fa'
                ? 'اسکریپت مستقل پایتون با pyserial جهت اجرا مستقیم از خط فرمان لینوکس یا ویندوز'
                : 'Standalone Python script with pyserial for terminal execution'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPython}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPython ? (language === 'fa' ? 'کپی شد!' : 'Copied!') : (language === 'fa' ? 'کپی' : 'Copy')}</span>
              </button>
              <button
                type="button"
                onClick={() => downloadFile(pythonScript, `cisco_${config.hostname || 'switch'}_auto.py`, 'text/x-python')}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? 'دانلود .py' : 'Download .py'}</span>
              </button>
            </div>
          </div>

          <div dir="ltr" className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-72 overflow-y-auto">
            <pre className="font-mono text-xs text-cyan-300 leading-relaxed whitespace-pre-wrap">
              {pythonScript}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Verification Cheat Sheet */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-2">
          <div className="text-xs text-slate-400 mb-2">
            {language === 'fa'
              ? 'دستورات تستی و نظارتی سیسکو پس از تزریق کانفیگ برای اطمینان از صحت کارکرد IP، SSH و پورت‌ها:'
              : 'Post-provisioning verification commands to inspect IP, SSH, and port health:'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {CHEAT_SHEET.map((item) => (
              <div key={item.cmd} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <code dir="ltr" className="font-mono text-xs text-cyan-300 font-semibold">
                    {item.cmd}
                  </code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(item.cmd)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    title="Copy command"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'fa' ? item.descFa : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
