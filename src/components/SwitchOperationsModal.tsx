import React, { useState } from 'react';
import { 
  RefreshCw, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Radio, 
  Play, 
  Database,
  Terminal,
  Activity
} from 'lucide-react';
import { CiscoConfig, SerialPortInfo } from '../types/serial';
import { serialManager } from '../utils/serialService';
import { recordAuditLog } from '../utils/auditLogger';

interface SwitchOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CiscoConfig;
  portInfo: SerialPortInfo | null;
  isConnected: boolean;
  language: 'fa' | 'en';
}

export const SwitchOperationsModal: React.FC<SwitchOperationsModalProps> = ({
  isOpen,
  onClose,
  config,
  portInfo,
  isConnected,
  language,
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionProgress, setActionProgress] = useState<string>('');
  const [backupContent, setBackupContent] = useState<string>('');
  const [isFactoryResetConfirmed, setIsFactoryResetConfirmed] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  if (!isOpen) return null;

  const portTitle = portInfo?.chipName || 'Console Port';

  // 1. Switch Backup Handler
  const handleBackup = async () => {
    if (!isConnected) {
      alert(language === 'fa' ? 'ابتدا کابل کنسول را متصل کنید.' : 'Please connect console cable first.');
      return;
    }

    setActiveAction('backup');
    setActionProgress('در حال فراخوانی دستور terminal length 0 و دریافت running-config...');

    let captured = '';
    const removeListener = serialManager.onData((chunk) => {
      captured += chunk;
    });

    try {
      await serialManager.send('\r\n');
      await new Promise(r => setTimeout(r, 300));
      await serialManager.sendLine('enable');
      await new Promise(r => setTimeout(r, 400));
      await serialManager.sendLine('terminal length 0');
      await new Promise(r => setTimeout(r, 400));
      await serialManager.sendLine('show running-config');
      
      // Wait for output accumulation
      await new Promise(r => setTimeout(r, 2200));

      removeListener();

      const fileName = `cisco-backup-${config.hostname || 'switch'}-${new Date().toISOString().slice(0, 10)}.cfg`;
      const cleanOutput = captured || '! Cisco Running-Configuration Backup\r\n! No data received from console buffer';
      setBackupContent(cleanOutput);

      // Download file automatically
      const blob = new Blob([cleanOutput], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      recordAuditLog({
        actionType: 'backup',
        targetSwitch: config.hostname,
        portName: portTitle,
        summary: `پشتیبان‌گیری موفق از کانفیگ جاری سوئیچ و ذخیره در فایل ${fileName}`,
        details: {
          backupFileName: fileName,
          ip: config.vlan1Ip,
        },
        status: 'success',
        rawOutput: cleanOutput.slice(0, 500) + '... (truncated)',
      });

      setActionProgress('بکاپ با موفقیت دریافت و فایل .cfg دانلود گردید.');
    } catch (err: unknown) {
      removeListener();
      setActionProgress('خطا در دریافت بکاپ از سوئیچ.');
    }
  };

  // 2. Normal Reboot (Reload)
  const handleReload = async () => {
    if (!isConnected) {
      alert(language === 'fa' ? 'ابتدا کابل کنسول را متصل کنید.' : 'Please connect console cable first.');
      return;
    }

    if (!confirm(language === 'fa' ? 'آیا از ریست معمولی (Reboot) سوئیچ اطمینان دارید؟' : 'Reboot Cisco switch?')) {
      return;
    }

    setActiveAction('reload');
    setActionProgress('در حال ارسال دستور reload به سوئیچ...');

    try {
      await serialManager.send('\r\n');
      await new Promise(r => setTimeout(r, 300));
      await serialManager.sendLine('enable');
      await new Promise(r => setTimeout(r, 300));
      await serialManager.sendLine('reload');
      await new Promise(r => setTimeout(r, 600));
      await serialManager.send('\r\n'); // Confirm reload

      recordAuditLog({
        actionType: 'reload',
        targetSwitch: config.hostname,
        portName: portTitle,
        summary: 'ارسال فرمان راه اندازی مجدد معمولی (Reboot / Reload) به سوئیچ',
        details: {
          ip: config.vlan1Ip,
        },
        status: 'success',
      });

      setActionProgress('فرمان Reload ارسال شد. سوئیچ در حال راه‌اندازی مجدد است.');
    } catch (err: unknown) {
      setActionProgress('خطا در ارسال دستور Reload.');
    }
  };

  // 3. Factory Reset (Wipe NVRAM & vlan.dat)
  const handleFactoryReset = async () => {
    if (!isConnected) {
      alert(language === 'fa' ? 'ابتدا کابل کنسول را متصل کنید.' : 'Please connect console cable first.');
      return;
    }

    if (confirmInput !== 'RESET') {
      alert(language === 'fa' ? 'لطفاً کلمه RESET را با حروف بزرگ برای تایید وارد نمایید.' : 'Please type RESET to confirm.');
      return;
    }

    setActiveAction('factory_reset');
    setActionProgress('در حال پاکسازی حافظه NVRAM با write erase...');

    try {
      await serialManager.send('\r\n');
      await new Promise(r => setTimeout(r, 300));
      await serialManager.sendLine('enable');
      await new Promise(r => setTimeout(r, 400));
      // Erase startup-config
      await serialManager.sendLine('write erase');
      await new Promise(r => setTimeout(r, 600));
      await serialManager.send('\r\n'); // Confirm erase
      await new Promise(r => setTimeout(r, 600));

      // Delete vlan.dat
      setActionProgress('در حال حذف پایگاه داده VLAN (delete flash:vlan.dat)...');
      await serialManager.sendLine('delete flash:vlan.dat');
      await new Promise(r => setTimeout(r, 600));
      await serialManager.send('\r\n'); // Confirm filename
      await new Promise(r => setTimeout(r, 600));
      await serialManager.send('\r\n'); // Confirm delete

      // Reload
      setActionProgress('در حال ریست سوئیچ به تنظیمات کارخانه...');
      await serialManager.sendLine('reload');
      await new Promise(r => setTimeout(r, 600));
      await serialManager.send('no\r\n'); // Don't save modified config
      await new Promise(r => setTimeout(r, 600));
      await serialManager.send('\r\n'); // Confirm reload

      recordAuditLog({
        actionType: 'factory_reset',
        targetSwitch: config.hostname,
        portName: portTitle,
        summary: 'ریست فکتوری کامل سوئیچ: پاکسازی کامل NVRAM (write erase)، حذف vlan.dat و راه‌اندازی مجدد',
        details: {
          ip: 'Factory Defaults',
        },
        status: 'success',
      });

      setActionProgress('سوئیچ به تنظیمات پیش‌فرض کارخانه بازگردانده شد و در حال بوت شدن است.');
      setIsFactoryResetConfirmed(false);
      setConfirmInput('');
    } catch (err: unknown) {
      setActionProgress('خطا در اجرای فرآیند ریست فکتوری.');
    }
  };

  // 4. Quick Apply SNMP Only
  const handleQuickSnmp = async () => {
    if (!isConnected) {
      alert(language === 'fa' ? 'ابتدا کابل کنسول را متصل کنید.' : 'Connect console cable first.');
      return;
    }

    setActiveAction('snmp');
    setActionProgress('در حال فعال‌سازی پروتکل SNMP بر روی سوئیچ...');

    try {
      await serialManager.send('\r\n');
      await new Promise(r => setTimeout(r, 300));
      await serialManager.sendLine('enable');
      await new Promise(r => setTimeout(r, 300));
      await serialManager.sendLine('configure terminal');
      await new Promise(r => setTimeout(r, 300));
      await serialManager.sendLine(`snmp-server community ${config.snmpCommunity} ${config.snmpPermission}`);
      if (config.snmpNmsIp) {
        await serialManager.sendLine(`snmp-server host ${config.snmpNmsIp} version 2c ${config.snmpCommunity}`);
      }
      await serialManager.sendLine('snmp-server enable traps');
      await serialManager.sendLine('end');
      await serialManager.sendLine('write memory');

      recordAuditLog({
        actionType: 'snmp_config',
        targetSwitch: config.hostname,
        portName: portTitle,
        summary: `فعال‌سازی پروتکل SNMP با Community String: ${config.snmpCommunity} (${config.snmpPermission})`,
        details: {
          snmp: `${config.snmpCommunity} -> NMS: ${config.snmpNmsIp || 'None'}`,
        },
        status: 'success',
      });

      setActionProgress('پروتکل SNMP با موفقیت فعال و در NVRAM ذخیره گردید.');
    } catch (err) {
      setActionProgress('خطا در فعال‌سازی SNMP.');
    }
  };

  // 5. Quick Apply RSTP Only
  const handleQuickRstp = async () => {
    if (!isConnected) {
      alert(language === 'fa' ? 'ابتدا کابل کنسول را متصل کنید.' : 'Connect console cable first.');
      return;
    }

    setActiveAction('rstp');
    setActionProgress('در حال فعال‌سازی پروتکل RSTP (Rapid Spanning Tree)...');

    try {
      await serialManager.send('\r\n');
      await new Promise(r => setTimeout(r, 300));
      await serialManager.sendLine('enable');
      await new Promise(r => setTimeout(r, 300));
      await serialManager.sendLine('configure terminal');
      await new Promise(r => setTimeout(r, 300));
      await serialManager.sendLine('spanning-tree mode rapid-pvst');
      if (config.enablePortfastBpduguard) {
        await serialManager.sendLine('spanning-tree portfast default');
        await serialManager.sendLine('spanning-tree portfast bpduguard default');
      }
      await serialManager.sendLine('end');
      await serialManager.sendLine('write memory');

      recordAuditLog({
        actionType: 'rstp_config',
        targetSwitch: config.hostname,
        portName: portTitle,
        summary: 'فعال‌سازی پروتکل Rapid Spanning Tree (RSTP: rapid-pvst) با حفاظت BPDUguard',
        details: {
          rstp: 'spanning-tree mode rapid-pvst',
        },
        status: 'success',
      });

      setActionProgress('پروتکل RSTP با موفقیت فعال و ذخیره گردید.');
    } catch (err) {
      setActionProgress('خطا در فعال‌سازی RSTP.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'fa' ? 'عملیات مدیریتی سوئیچ سیسکو' : 'Cisco Switch Maintenance Operations'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'fa' 
                  ? 'پشتیبان‌گیری، ریست معمولی، ریست فکتوری و اعمال سریع پروتکل‌های SNMP و RSTP'
                  : 'Backup running-config, reboot, factory reset & quick protocol actions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live status feedback */}
        {actionProgress && (
          <div className="mt-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{actionProgress}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs">
          {/* Card 1: Backup Switch Running Config */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                <Download className="w-4 h-4" />
                <span>{language === 'fa' ? '۱. بکاپ‌گیری از سوئیچ (Backup)' : '1. Backup Configuration'}</span>
              </div>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {language === 'fa'
                  ? 'دریافت خودکار running-config از طریق پورت کنسول و ذخیره به عنوان فایل .cfg روی سیستم'
                  : 'Fetches running-config via console and downloads a ready-to-archive .cfg file.'}
              </p>
            </div>
            <button
              onClick={handleBackup}
              disabled={activeAction === 'backup'}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'fa' ? 'تهیه بکاپ و دانلود فایل .cfg' : 'Download Backup File'}</span>
            </button>
          </div>

          {/* Card 2: Normal Reboot (Reload) */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'fa' ? '۲. ریست معمولی (Reload / Reboot)' : '2. Reboot Switch'}</span>
              </div>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {language === 'fa'
                  ? 'راه‌اندازی مجدد سوئیچ بدون پاک شدن تنظیمات ذخیره شده در NVRAM'
                  : 'Restarts the switch gracefully without altering saved configurations.'}
              </p>
            </div>
            <button
              onClick={handleReload}
              disabled={activeAction === 'reload'}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{language === 'fa' ? 'اجرای دستور reload' : 'Reboot Switch'}</span>
            </button>
          </div>

          {/* Card 3: Quick SNMP Apply */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-cyan-400 text-sm">
                <Radio className="w-4 h-4" />
                <span>{language === 'fa' ? '۳. فعال‌سازی سریع SNMP' : '3. Quick SNMP Activation'}</span>
              </div>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {language === 'fa'
                  ? `Community: ${config.snmpCommunity} (${config.snmpPermission}) | NMS IP: ${config.snmpNmsIp || 'تعیین‌نشده'}`
                  : `Applies SNMP community string and NMS server host traps directly.`}
              </p>
            </div>
            <button
              onClick={handleQuickSnmp}
              disabled={activeAction === 'snmp'}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'fa' ? 'تزریق مستقل تنظیمات SNMP' : 'Apply SNMP Only'}</span>
            </button>
          </div>

          {/* Card 4: Quick RSTP Apply */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-purple-400 text-sm">
                <Database className="w-4 h-4" />
                <span>{language === 'fa' ? '۴. فعال‌سازی سریع RSTP' : '4. Quick RSTP Activation'}</span>
              </div>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {language === 'fa'
                  ? 'اعمال Rapid PVST+ و فعال‌سازی BPDUguard جهت جلوگیری از Loop و قطعی شبکه'
                  : 'Activates Rapid Spanning Tree Protocol (rapid-pvst) and BPDUguard.'}
              </p>
            </div>
            <button
              onClick={handleQuickRstp}
              disabled={activeAction === 'rstp'}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/60 font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'fa' ? 'تزریق مستقل RSTP' : 'Apply RSTP Only'}</span>
            </button>
          </div>
        </div>

        {/* Card 5: Danger Zone - Factory Reset */}
        <div className="mt-2 p-4 rounded-2xl bg-rose-950/30 border border-rose-800/60 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>{language === 'fa' ? '۵. ریست فکتوری کامل سوئیچ (Factory Reset / Wipe)' : '5. Full Factory Reset'}</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {language === 'fa'
              ? 'هشدار: این عملیات دستورات write erase و delete flash:vlan.dat را اجرا کرده و تمام تنظیمات سوئیچ، پسوردها و VLANها را برای همیشه پاک می‌کند و سوئیچ را به حالت صفر کارخانه بازمی‌گرداند.'
              : 'Warning: This executes "write erase" and deletes "flash:vlan.dat", erasing all configurations and returning the switch to unconfigured factory state.'}
          </p>

          {!isFactoryResetConfirmed ? (
            <button
              onClick={() => setIsFactoryResetConfirmed(true)}
              className="py-2.5 px-4 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/50 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'fa' ? 'می‌خواهم سوئیچ را ریست فکتوری کنم' : 'I want to factory reset'}</span>
            </button>
          ) : (
            <div className="p-3 bg-black/60 rounded-xl border border-rose-600/60 space-y-2">
              <label className="text-rose-300 block font-semibold text-xs">
                {language === 'fa' ? 'جهت تایید نهایی عبارت RESET را بنویسید:' : 'Type RESET to confirm:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="RESET"
                  className="bg-slate-900 border border-rose-600/60 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none uppercase"
                />
                <button
                  onClick={handleFactoryReset}
                  disabled={confirmInput !== 'RESET'}
                  className="py-1.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-40 transition-colors"
                >
                  {language === 'fa' ? 'پاکسازی کامل و ریست فکتوری' : 'Execute Wipe'}
                </button>
                <button
                  onClick={() => {
                    setIsFactoryResetConfirmed(false);
                    setConfirmInput('');
                  }}
                  className="py-1.5 px-3 rounded-lg text-slate-400 hover:text-white"
                >
                  {language === 'fa' ? 'انصراف' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
