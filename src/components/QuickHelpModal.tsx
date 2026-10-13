import React from 'react';
import { X, Usb, Cable, ShieldAlert, CheckCircle2, HelpCircle, Laptop } from 'lucide-react';

interface QuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fa' | 'en';
}

export const QuickHelpModal: React.FC<QuickHelpModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'fa' ? 'راهنمای اتصال کابل کنسول و نکات فنی سیسکو' : 'Cisco Console Connection Guide'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'fa' ? 'راهنمای سخت‌افزاری کابل Rollover، چیپ‌ست‌ها و رفع اشکال' : 'Hardware Rollover Cable, Pinout, and Troubleshooting'}
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

        <div className="space-y-4 py-4 text-xs text-slate-300">
          {/* Item 1 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-cyan-400 text-sm">
              <Usb className="w-4 h-4" />
              <span>{language === 'fa' ? '۱. انواع کابل کنسول سیسکو' : '1. Supported Console Cables'}</span>
            </div>
            <p className="leading-relaxed">
              {language === 'fa'
                ? 'این برنامه از تمام کابل‌های استاندارد پشتیبانی می‌کند: کابل آبی فیروزه‌ای RJ45 به USB (با چیپ‌ست FTDI، CP2102، Prolific PL2303 یا CH340) و همچنین کابل‌های مستقیم Mini-USB یا Type-C کنسول سویچ‌های جدید سیسکو.'
                : 'Supports all standard console cables: RJ45-to-USB Rollover cables (FTDI, CP2102, Prolific PL2303, CH340) and direct Type-C/Mini-USB console ports.'}
            </p>
          </div>

          {/* Item 2 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <Laptop className="w-4 h-4" />
              <span>{language === 'fa' ? '۲. نحوه اتصال در مرورگر' : '2. Browser Web Serial Connection'}</span>
            </div>
            <p className="leading-relaxed">
              {language === 'fa'
                ? 'مرورگرهای Chrome و Edge از Web Serial API پشتیبانی می‌کنند. هنگامی که دکمه «شناسایی و اتصال» را می‌زنید، پنجره مجوز باز می‌شود. پورت سریال (مثلاً COM3 یا USB Serial) را انتخاب کرده و Connect بزنید.'
                : 'Chrome and Edge support Web Serial API natively. Clicking "Connect" prompts you to pick the COM port. Select your USB Serial device and grant access.'}
            </p>
          </div>

          {/* Item 3 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'fa' ? '۳. تنظیمات استاندارد پورت کنسول سیسکو' : '3. Cisco Standard Serial Parameters'}</span>
            </div>
            <ul className="list-disc list-inside space-y-1 font-mono text-slate-400">
              <li>Baud Rate: <strong>9600 bps</strong></li>
              <li>Data Bits: <strong>8</strong></li>
              <li>Parity: <strong>None</strong></li>
              <li>Stop Bits: <strong>1</strong></li>
              <li>Flow Control: <strong>None</strong> (8-N-1)</li>
            </ul>
          </div>

          {/* Item 4 */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-purple-400 text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>{language === 'fa' ? '۴. خطای Initial Configuration Dialog' : '4. Initial Configuration Dialog'}</span>
            </div>
            <p className="leading-relaxed">
              {language === 'fa'
                ? 'اگر سویچ نو یا ریست فکتوری باشد، پیامی با مضمون "Would you like to enter the initial configuration dialog? [yes/no]:" نمایش می‌دهد. موتور این برنامه به صورت خودکار با ارسال دستور "no" این مرحله را رد می‌کند تا وارد حالت پیکربندی استاندارد شود.'
                : 'If the switch is freshly unboxed or factory-reset, it will show the initial setup dialog. The injection engine automatically sends "no" to bypass it and proceed to standard CLI configuration.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            {language === 'fa' ? 'متوجه شدم' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
