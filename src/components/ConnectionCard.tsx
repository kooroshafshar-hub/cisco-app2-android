import React, { useState } from 'react';
import { 
  Usb, 
  Power, 
  PowerOff, 
  CornerDownLeft, 
  StopCircle, 
  Trash2, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Activity,
  Cpu,
  Info
} from 'lucide-react';
import { ConnectionStatus, SerialPortInfo } from '../types/serial';

interface ConnectionCardProps {
  status: ConnectionStatus;
  portInfo: SerialPortInfo | null;
  baudRate: number;
  onBaudRateChange: (baud: number) => void;
  isWebSerialSupported: boolean;
  isSimulated: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSendEnter: () => void;
  onSendBreak: () => void;
  onClearTerminal: () => void;
  language: 'fa' | 'en';
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  status,
  portInfo,
  baudRate,
  onBaudRateChange,
  isWebSerialSupported,
  isSimulated,
  onConnect,
  onDisconnect,
  onSendEnter,
  onSendBreak,
  onClearTerminal,
  language,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <Usb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{language === 'fa' ? 'ارتباط با پورت کنسول سیسکو' : 'Cisco Console Connection'}</span>
              {isSimulated && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-normal border border-amber-500/30">
                  {language === 'fa' ? 'شبیه‌ساز' : 'Simulator'}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'fa'
                ? 'شناسایی کابل Rollover / USB-to-Serial و اتصال با پروتکل RS-232'
                : 'Auto-detect FTDI/Prolific/CH340/Cisco USB console at standard 9600 baud'}
            </p>
          </div>
        </div>

        {/* Baud rate dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-400">
            {language === 'fa' ? 'نرخ بود (Baud):' : 'Baud:'}
          </label>
          <select
            value={baudRate}
            disabled={isConnected || isConnecting}
            onChange={(e) => onBaudRateChange(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
          >
            <option value={9600}>9600 (پیش‌فرض سیسکو)</option>
            <option value={19200}>19200</option>
            <option value={38400}>38400</option>
            <option value={57600}>57600</option>
            <option value={115200}>115200</option>
          </select>
        </div>
      </div>

      {/* Browser compatibility warning if needed */}
      {!isWebSerialSupported && !isSimulated && (
        <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            {language === 'fa' ? (
              <span>
                مرورگر فعلی شما از <strong>Web Serial API</strong> پشتیبانی نمی‌کند. برای اتصال مستقیم کابل کنسول، لطفاً از <strong>Google Chrome</strong> یا <strong>Microsoft Edge</strong> استفاده فرمایید یا دکمه «شبیه‌ساز تستی» بالای صفحه را فعال کنید.
              </span>
            ) : (
              <span>
                Web Serial API is not supported in this browser. Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for hardware serial access, or toggle Simulator Mode above.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Active Port Info Banner */}
      {isConnected && portInfo && (
        <div className="mb-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs font-semibold text-slate-200">
                {portInfo.chipName || (language === 'fa' ? 'دستگاه سریال متصل شد' : 'Serial Port Connected')}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {baudRate} bps | 8 Data Bits | No Parity | 1 Stop Bit (8-N-1)
                {portInfo.usbVendorId && ` | VID: 0x${portInfo.usbVendorId.toString(16).padStart(4, '0')}`}
              </div>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
            <CheckCircle className="w-3 h-3" /> ONLINE
          </span>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {!isConnected ? (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/25 border border-cyan-400/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{language === 'fa' ? 'در حال برقراری ارتباط...' : 'Connecting to Port...'}</span>
              </>
            ) : (
              <>
                <Power className="w-4 h-4" />
                <span>{language === 'fa' ? 'شناسایی و اتصال کابل کنسول' : 'Connect Cisco Console Cable'}</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="py-2.5 px-4 rounded-xl font-medium text-sm text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 flex items-center justify-center gap-2 transition-all"
          >
            <PowerOff className="w-4 h-4 text-rose-400" />
            <span>{language === 'fa' ? 'قطع اتصال' : 'Disconnect'}</span>
          </button>
        )}

        {/* Quick Console Action Utilities */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onSendEnter}
            disabled={!isConnected}
            className="py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title={language === 'fa' ? 'ارسال کلید Enter جهت بیداری پرامپت سویچ' : 'Send Enter key to wake up prompt'}
          >
            <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'fa' ? 'ارسال اینتر' : 'Send Enter'}</span>
          </button>

          <button
            onClick={onSendBreak}
            disabled={!isConnected}
            className="py-2 px-3 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title={language === 'fa' ? 'ارسال سیگنال Break / Ctrl+C جهت توقف فرآیندها' : 'Send Break / Ctrl+C signal'}
          >
            <StopCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'fa' ? 'سیگنال Break (Ctrl+C)' : 'Break (Ctrl+C)'}</span>
          </button>

          <button
            onClick={onClearTerminal}
            className="py-2 px-3 rounded-lg text-xs font-medium text-slate-400 bg-slate-800/80 hover:bg-slate-700 hover:text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            title={language === 'fa' ? 'پاک کردن لاگ ترمینال' : 'Clear Terminal Log'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? 'پاکسازی' : 'Clear'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
