import React from 'react';
import { Phone, User, ShieldCheck, Cpu } from 'lucide-react';

interface FooterProps {
  language: 'fa' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">
              {language === 'fa' 
                ? 'کانفیگ سویچ های سیسکو شرکت لوح سبز جنوب' 
                : 'Cisco Switch Configuration System - Loh-e Sabz-e Jonoob Co.'}
            </div>
            <div className="text-[11px] text-slate-500">
              {language === 'fa' 
                ? 'سیستم اختصاصی تزریق پروفایل، VLAN 1، SSH، SNMP، RSTP و بکاپ‌گیری' 
                : 'Dedicated Console Provisioning, VLAN 1, SSH, SNMP, RSTP & Switch Backup'}
            </div>
          </div>
        </div>

        {/* Developer & Producer info */}
        <div className="flex items-center flex-wrap gap-4 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl shadow-inner">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">
              {language === 'fa' ? 'تهیه کننده:' : 'Producer:'}
            </span>
            <strong className="text-white font-medium">کورش افشار</strong>
          </div>

          <div className="h-3 w-px bg-slate-700 hidden sm:block" />

          <a 
            href="tel:09120760865"
            dir="ltr"
            className="flex items-center gap-1.5 font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wider">09120760865</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
