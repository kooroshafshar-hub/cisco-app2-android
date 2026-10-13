import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Network, 
  Terminal, 
  Lock, 
  Server, 
  Settings2, 
  Sparkles, 
  Play, 
  Eye, 
  EyeOff, 
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  Radio,
  Share2,
  Database
} from 'lucide-react';
import { CiscoConfig } from '../types/serial';

interface ConfigFormProps {
  config: CiscoConfig;
  onChange: (updated: CiscoConfig) => void;
  onInject: () => void;
  isConnected: boolean;
  language: 'fa' | 'en';
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  config,
  onChange,
  onInject,
  isConnected,
  language,
}) => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = <K extends keyof CiscoConfig>(key: K, value: CiscoConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const applyPreset = (preset: 'lsz_24p' | 'lsz_48p' | 'lsz_dhcp') => {
    if (preset === 'lsz_24p') {
      onChange({
        ...config,
        hostname: 'SW-LSZ-ACC-01',
        vlan1Mode: 'static',
        vlan1Ip: '192.168.1.10',
        vlan1Subnet: '255.255.255.0',
        defaultGateway: '192.168.1.1',
        enablePortRangeVlan1: true,
        vlan1PortRange: 'FastEthernet0/1 - 24',
        enableSnmp: true,
        snmpCommunity: 'LSZ-SNMP-2026',
        enableRstp: true,
        enablePortfastBpduguard: true,
      });
    } else if (preset === 'lsz_48p') {
      onChange({
        ...config,
        hostname: 'SW-LSZ-DIST-48P',
        vlan1Mode: 'static',
        vlan1Ip: '192.168.1.15',
        vlan1Subnet: '255.255.255.0',
        defaultGateway: '192.168.1.1',
        enablePortRangeVlan1: true,
        vlan1PortRange: 'GigabitEthernet1/0/1 - 48',
        enableSnmp: true,
        snmpCommunity: 'LSZ-SNMP-2026',
        enableRstp: true,
        enablePortfastBpduguard: true,
      });
    } else if (preset === 'lsz_dhcp') {
      onChange({
        ...config,
        hostname: 'SW-LSZ-DHCP-01',
        vlan1Mode: 'dhcp',
        enablePortRangeVlan1: true,
        vlan1PortRange: 'FastEthernet0/1 - 24',
        enableSnmp: true,
        enableRstp: true,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Quick Presets Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            {language === 'fa' ? 'قالب‌های سازمانی لوح سبز جنوب:' : 'Corporate Presets:'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => applyPreset('lsz_24p')}
            className="px-2.5 py-1 text-xs rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 transition-colors"
          >
            {language === 'fa' ? 'سوئیچ ۲۴ پورت لوح سبز (Fa0/1 - 24)' : 'LSZ 24-Port (Static IP)'}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('lsz_48p')}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {language === 'fa' ? 'سوئیچ ۴۸ پورت گیگابیت (Gi1/0/1 - 48)' : 'LSZ 48-Port Gigabit'}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('lsz_dhcp')}
            className="px-2.5 py-1 text-xs rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 transition-colors"
          >
            {language === 'fa' ? 'دریافت IP از DHCP روی VLAN 1' : 'DHCP Client on VLAN 1'}
          </button>
        </div>
      </div>

      {/* Section 1: Device Identity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2.5 mb-4 text-cyan-400">
          <Server className="w-5 h-5" />
          <h3 className="font-bold text-sm text-white">
            {language === 'fa' ? '۱. مشخصات و هویت سویچ (Device Identity)' : '1. Device Identity'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {language === 'fa' ? 'نام سویچ (Hostname)' : 'Switch Hostname'}
              <span className="text-cyan-400 font-mono text-[11px] ms-1">*</span>
            </label>
            <input
              type="text"
              value={config.hostname}
              onChange={(e) => update('hostname', e.target.value)}
              placeholder="SW-LSZ-ACC-01"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {language === 'fa' ? 'دستور: hostname <نام>' : 'Command: hostname <name>'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {language === 'fa' ? 'نام دامنه (Domain Name)' : 'Domain Name'}
              <span className="text-cyan-400 font-mono text-[11px] ms-1">* ضروری برای SSH</span>
            </label>
            <input
              type="text"
              value={config.domainName}
              onChange={(e) => update('domainName', e.target.value)}
              placeholder="lohesabz.ir"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {language === 'fa' ? 'دستور: ip domain-name <دامنه>' : 'Command: ip domain-name <domain>'}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Passwords & Authentication */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Lock className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">
              {language === 'fa' ? '۲. امنیت و رمزهای عبور (Security & Credentials)' : '2. Security & Credentials'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPasswords ? (language === 'fa' ? 'مخفی‌سازی' : 'Hide') : (language === 'fa' ? 'نمایش رمزها' : 'Show Passwords')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {language === 'fa' ? 'رمز ورود به مد ارشد (Enable Secret)' : 'Enable Secret Password'}
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={config.enableSecret}
              onChange={(e) => update('enableSecret', e.target.value)}
              placeholder="Loh@Sabz#2026"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {language === 'fa' ? 'دستور: enable secret <رمز>' : 'Command: enable secret'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {language === 'fa' ? 'نام کاربری ادمین (Admin Username)' : 'Admin Username'}
            </label>
            <input
              type="text"
              value={config.adminUsername}
              onChange={(e) => update('adminUsername', e.target.value)}
              placeholder="admin_lsz"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {language === 'fa' ? 'سطح دسترسی: Privilege 15' : 'Privilege Level: 15'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {language === 'fa' ? 'رمز کاربری ادمین (Admin Password)' : 'Admin Password'}
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={config.adminPassword}
              onChange={(e) => update('adminPassword', e.target.value)}
              placeholder="LSZ@StrongAdmin2026"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {language === 'fa' ? 'دستور: username secret' : 'Command: username secret'}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={config.encryptPasswords}
              onChange={(e) => update('encryptPasswords', e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span>{language === 'fa' ? 'رمزنگاری تمام پسوردها در کانفیگ (service password-encryption)' : 'Encrypt Passwords (service password-encryption)'}</span>
          </label>
        </div>
      </div>

      {/* Section 3: VLAN 1 Management IP & Port Allocation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-blue-400">
            <Network className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">
              {language === 'fa' ? '۳. تنظیمات IP و تخصیص پورت‌ها به VLAN 1' : '3. VLAN 1 IP & Port Assignment'}
            </h3>
          </div>

          {/* Static vs DHCP toggle */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
            <button
              type="button"
              onClick={() => update('vlan1Mode', 'static')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                config.vlan1Mode === 'static'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'fa' ? 'IP استاتیک (دستی)' : 'Static IP'}
            </button>
            <button
              type="button"
              onClick={() => update('vlan1Mode', 'dhcp')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                config.vlan1Mode === 'dhcp'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'fa' ? 'دریافت از DHCP' : 'DHCP Client'}
            </button>
          </div>
        </div>

        {/* IP fields */}
        {config.vlan1Mode === 'dhcp' ? (
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-cyan-200 text-xs flex items-center gap-3">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {language === 'fa'
                ? 'دستورات ip address dhcp و no shutdown روی Interface Vlan 1 اعمال خواهد شد تا سویچ به صورت خودکار از شبکه IP دریافت کند.'
                : 'Interface Vlan 1 will be configured with "ip address dhcp" to lease IP automatically.'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'fa' ? 'آدرس آی‌پی (IP Address)' : 'IP Address'}
              </label>
              <input
                type="text"
                value={config.vlan1Ip}
                onChange={(e) => update('vlan1Ip', e.target.value)}
                placeholder="192.168.1.10"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'fa' ? 'سابنت ماسک (Subnet Mask)' : 'Subnet Mask'}
              </label>
              <input
                type="text"
                value={config.vlan1Subnet}
                onChange={(e) => update('vlan1Subnet', e.target.value)}
                placeholder="255.255.255.0"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'fa' ? 'گیت‌وی پیش‌فرض (Default Gateway)' : 'Default Gateway'}
              </label>
              <input
                type="text"
                value={config.defaultGateway}
                onChange={(e) => update('defaultGateway', e.target.value)}
                placeholder="192.168.1.1"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Port Range to VLAN 1 Allocation */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={config.enablePortRangeVlan1}
                onChange={(e) => update('enablePortRangeVlan1', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
              />
              <span>{language === 'fa' ? 'تخصیص رنج پورت‌های فیزیکی به VLAN 1 (حالت Access)' : 'Assign Port Range to VLAN 1 (Access Mode)'}</span>
            </label>
          </div>

          {config.enablePortRangeVlan1 && (
            <div className="pt-1">
              <label className="block text-[11px] text-slate-400 mb-1">
                {language === 'fa' ? 'رنج اینترفیس‌ها (مثلاً: FastEthernet0/1 - 24 یا GigabitEthernet1/0/1 - 48):' : 'Interface range string:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={config.vlan1PortRange}
                  onChange={(e) => update('vlan1PortRange', e.target.value)}
                  placeholder="FastEthernet0/1 - 24"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => update('vlan1PortRange', 'FastEthernet0/1 - 24')}
                  className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono"
                >
                  Fa0/1-24
                </button>
                <button
                  type="button"
                  onClick={() => update('vlan1PortRange', 'GigabitEthernet1/0/1 - 24')}
                  className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono"
                >
                  Gi1/0/1-24
                </button>
                <button
                  type="button"
                  onClick={() => update('vlan1PortRange', 'GigabitEthernet1/0/1 - 48')}
                  className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono"
                >
                  Gi1/0/1-48
                </button>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                دستورات: interface range [پورت] &gt; switchport mode access &gt; switchport access vlan 1
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: SSH Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2.5 mb-4 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="font-bold text-sm text-white">
            {language === 'fa' ? '۴. فعال‌سازی SSH و دسترسی از راه دور (SSH v2 & Line VTY)' : '4. SSH & Remote Access'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {language === 'fa' ? 'اندازه کلید رمزنگاری RSA (بیت)' : 'RSA Key Modulus (bits)'}
            </label>
            <select
              value={config.rsaKeySize}
              onChange={(e) => update('rsaKeySize', Number(e.target.value) as 1024 | 2048 | 4096)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value={2048}>2048 بیت (استاندارد امن شرکت لوح سبز)</option>
              <option value={1024}>1024 بیت (حداقل برای SSH v2)</option>
              <option value={4096}>4096 بیت (حداکثر امنیت)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {language === 'fa' ? 'نسخه SSH (SSH Version)' : 'SSH Version'}
            </label>
            <select
              value={config.sshVersion}
              onChange={(e) => update('sshVersion', e.target.value as '2' | '1.99')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="2">نسخه ۲ (SSH Version 2 - امن)</option>
              <option value="1.99">سازگار ۱.۹۹ (Version 1.99)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {language === 'fa' ? 'خطوط VTY (سشن‌های همزمان)' : 'Line VTY Range'}
            </label>
            <select
              value={config.lineVtyCount}
              onChange={(e) => update('lineVtyCount', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="0 15">line vty 0 15 (۱۶ سشن همزمان)</option>
              <option value="0 4">line vty 0 4 (۵ سشن همزمان)</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-400 font-mono">
          بستن پروتکل Telnet و تنظیم انحصاری <span className="text-emerald-400 font-semibold">transport input ssh</span> و <span className="text-emerald-400 font-semibold">login local</span>
        </div>
      </div>

      {/* Section 5: Protocols: SNMP & RSTP */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400">
          <Radio className="w-5 h-5" />
          <h3 className="font-bold text-sm text-white">
            {language === 'fa' ? '۵. پروتکل‌های مانیتورینگ SNMP و همگرایی RSTP' : '5. SNMP Monitoring & RSTP'}
          </h3>
        </div>

        {/* SNMP Activation */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={config.enableSnmp}
                onChange={(e) => update('enableSnmp', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>{language === 'fa' ? 'فعال‌سازی پروتکل SNMP برای مانیتورینگ (Zabbix, PRTG, SolarWinds)' : 'Enable SNMP Protocol'}</span>
            </label>
          </div>

          {config.enableSnmp && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'fa' ? 'رشته رمز (Community String):' : 'Community String:'}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={config.snmpCommunity}
                    onChange={(e) => update('snmpCommunity', e.target.value)}
                    placeholder="LSZ-SNMP-2026"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={config.snmpPermission}
                    onChange={(e) => update('snmpPermission', e.target.value as 'RO' | 'RW')}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-300 font-mono focus:outline-none"
                  >
                    <option value="RO">RO (فقط خواندنی)</option>
                    <option value="RW">RW (خواندن و نوشتن)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'fa' ? 'آدرس سرور NMS / Trap Receiver:' : 'NMS Server IP:'}
                </label>
                <input
                  type="text"
                  value={config.snmpNmsIp}
                  onChange={(e) => update('snmpNmsIp', e.target.value)}
                  placeholder="192.168.1.50"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'fa' ? 'اطلاعات تماس و مسئول:' : 'SNMP Contact:'}
                </label>
                <input
                  type="text"
                  value={config.snmpContact}
                  onChange={(e) => update('snmpContact', e.target.value)}
                  placeholder="Koorosh Afshar (09120760865)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* RSTP Activation */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={config.enableRstp}
                onChange={(e) => update('enableRstp', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-0"
              />
              <span>{language === 'fa' ? 'فعال‌سازی پروتکل Rapid Spanning Tree (RSTP: rapid-pvst)' : 'Enable Rapid Spanning Tree Protocol (RSTP)'}</span>
            </label>
          </div>

          {config.enableRstp && (
            <div className="text-[11px] text-slate-400 space-y-1">
              <p>دستور: <code className="text-purple-300 font-mono">spanning-tree mode rapid-pvst</code> جهت همگرایی سریع زیر ۲ ثانیه و جلوگیری از Broadcast Storm</p>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={config.enablePortfastBpduguard}
                  onChange={(e) => update('enablePortfastBpduguard', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-0"
                />
                <span>فعال‌سازی Spanning-Tree Portfast و BPDUguard به صورت پیش‌فرض روی پورت‌های اکسس</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Section 6: Hardening & Best Practices */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2.5 text-purple-400">
            <Settings2 className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">
              {language === 'fa' ? '۶. تنظیمات تکمیلی، بنر امنیتی و ذخیره NVRAM' : '6. Hardening & Advanced Options'}
            </h3>
          </div>
          <div className="text-slate-400 flex items-center gap-1 text-xs">
            <span>{showAdvanced ? (language === 'fa' ? 'بستن' : 'Collapse') : (language === 'fa' ? 'مشاهده بیشتر' : 'Expand')}</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-5 pt-1 border-t border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.disableDnsLookup}
                  onChange={(e) => update('disableDnsLookup', e.target.checked)}
                  className="rounded mt-0.5 bg-slate-800 border-slate-700 text-purple-500 focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">no ip domain-lookup</span>
                  <span className="text-slate-400">
                    {language === 'fa' ? 'جلوگیری از هنگ کردن سویچ در صورت اشتباه تایپی در دستورات' : 'Prevents switch from freezing when mistyping'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.loggingSynchronous}
                  onChange={(e) => update('loggingSynchronous', e.target.checked)}
                  className="rounded mt-0.5 bg-slate-800 border-slate-700 text-purple-500 focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">logging synchronous</span>
                  <span className="text-slate-400">
                    {language === 'fa' ? 'جلوگیری از قطع شدن خط فرمان با پیام‌های سیستمی لاگ' : 'Keeps typing buffer intact during syslog messages'}
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'fa' ? 'بنر هشدار امنیتی (Banner MOTD)' : 'Banner MOTD Message'}
              </label>
              <input
                type="text"
                value={config.bannerMotd}
                onChange={(e) => update('bannerMotd', e.target.value)}
                placeholder="COMPANY: LOH-E SABZ-E JONOOB - AUTHORIZED ACCESS ONLY"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'fa' ? 'دستورات دلخواه اضافه (Custom CLI Commands)' : 'Extra CLI Commands'}
              </label>
              <textarea
                rows={3}
                value={config.customExtraCommands}
                onChange={(e) => update('customExtraCommands', e.target.value)}
                placeholder="! هر خط یک دستور اضافه&#10;ntp server 192.168.1.1"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 pt-2">
              <input
                type="checkbox"
                checked={config.saveConfig}
                onChange={(e) => update('saveConfig', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span className="font-medium text-emerald-400">
                {language === 'fa' ? 'ذخیره دائمی کانفیگ در حافظه NVRAM با دستور write memory' : 'Save running-config permanently to startup-config (write memory)'}
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Main Injection Trigger Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onInject}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all ${
            isConnected
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-600/30 border border-emerald-400/30 transform hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30 border border-cyan-400/20'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>
            {language === 'fa'
              ? (isConnected ? 'شروع تزریق مستقیم کانفیگ به پورت کنسول سوئیچ' : 'اتصال و تزریق مستقیم به سوئیچ سیسکو')
              : (isConnected ? 'Start Injecting Config to Cisco Console' : 'Connect & Inject Config into Switch')}
          </span>
        </button>
      </div>
    </div>
  );
};
