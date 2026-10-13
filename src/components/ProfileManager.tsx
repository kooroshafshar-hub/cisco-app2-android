import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Download, 
  Upload, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Network, 
  Radio, 
  Settings2,
  Play
} from 'lucide-react';
import { ConfigurationProfile, CiscoConfig } from '../types/serial';
import { 
  getStoredProfiles, 
  saveProfile, 
  deleteProfile, 
  exportProfilesJson, 
  importProfilesJson 
} from '../utils/profileStorage';

interface ProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: CiscoConfig;
  onApplyProfile: (config: CiscoConfig, profileName: string) => void;
  onInjectProfileDirect: (config: CiscoConfig, profileName: string) => void;
  isConnected: boolean;
  language: 'fa' | 'en';
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onApplyProfile,
  onInjectProfileDirect,
  isConnected,
  language,
}) => {
  const [profiles, setProfiles] = useState<ConfigurationProfile[]>(getStoredProfiles());
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || '');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');

  if (!isOpen) return null;

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

  const handleSaveCurrentAsProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newProfile: ConfigurationProfile = {
      id: `profile-${Date.now()}`,
      name: newProfileName.trim(),
      description: newProfileDesc.trim() || 'پروفایل سفارشی پیکربندی سوئیچ سیسکو',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: { ...currentConfig },
    };

    const updated = saveProfile(newProfile);
    setProfiles(updated);
    setSelectedProfileId(newProfile.id);
    setIsCreatingNew(false);
    setNewProfileName('');
    setNewProfileDesc('');
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'fa' ? 'آیا از حذف این پروفایل اطمینان دارید؟' : 'Are you sure you want to delete this profile?')) {
      const updated = deleteProfile(id);
      setProfiles(updated);
      if (selectedProfileId === id) {
        setSelectedProfileId(updated[0]?.id || '');
      }
    }
  };

  const handleExportJson = () => {
    const json = exportProfilesJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cisco-profiles-lohesabz-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importProfilesJson(text);
        setProfiles(imported);
        setSelectedProfileId(imported[0]?.id || '');
        alert(language === 'fa' ? 'پروفایل‌ها با موفقیت درون‌ریزی شدند.' : 'Profiles imported successfully.');
      } catch (err: unknown) {
        alert(language === 'fa' ? 'خطا در خواندن فایل JSON' : 'Failed to import JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'fa' 
                  ? 'مدیریت و انتخاب پروفایل‌های پیکربندی سوئیچ' 
                  : 'Cisco Configuration Profiles Manager'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'fa'
                  ? 'ذخیره تنظیمات IP، پورت‌های VLAN 1، SSH، SNMP و RSTP جهت تزریق سریع به سوئیچ'
                  : 'Save & apply switch presets including IP, VLAN 1 ports, SSH, SNMP & RSTP'}
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

        {/* Content Body (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-4 overflow-y-auto flex-1">
          {/* Left / Sidebar Column: List of Profiles (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                {language === 'fa' ? 'لیست پروفایل‌ها:' : 'Profiles List:'}
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>{language === 'fa' ? 'ثبت فرم فعلی' : 'New Profile'}</span>
              </button>
            </div>

            {/* Create New Profile inline card */}
            {isCreatingNew && (
              <form onSubmit={handleSaveCurrentAsProfile} className="p-3 bg-slate-800/80 border border-cyan-500/40 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-cyan-400">
                  {language === 'fa' ? 'ذخیره تنظیمات فعلی به عنوان پروفایل جدید' : 'Save current config as profile'}
                </div>
                <input
                  type="text"
                  required
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder={language === 'fa' ? 'نام پروفایل (مثلاً سوئیچ طبقه ۳)' : 'Profile Name'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  value={newProfileDesc}
                  onChange={(e) => setNewProfileDesc(e.target.value)}
                  placeholder={language === 'fa' ? 'توضیحات مختصر' : 'Description'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white"
                  >
                    {language === 'fa' ? 'انصراف' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  >
                    {language === 'fa' ? 'ذخیره پروفایل' : 'Save'}
                  </button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {profiles.map((profile) => {
                const isSelected = profile.id === selectedProfileId;
                return (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md shadow-cyan-950/30'
                        : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-xs leading-snug">
                        {profile.name}
                      </div>
                      {profile.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          {language === 'fa' ? 'پیش‌فرض' : 'Default'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {profile.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                      <span>IP: {profile.config.vlan1Mode === 'dhcp' ? 'DHCP' : profile.config.vlan1Ip}</span>
                      <span>VLAN 1: {profile.config.vlan1PortRange || 'Default'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Import / Export tools */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                title="دانلود فایل JSON پروفایل‌ها"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>{language === 'fa' ? 'پشتیبان JSON' : 'Export JSON'}</span>
              </button>

              <label className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <Upload className="w-3 h-3 text-amber-400" />
                <span>{language === 'fa' ? 'درون‌ریزی JSON' : 'Import JSON'}</span>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>
          </div>

          {/* Right Column: Selected Profile Details & Actions (7 cols) */}
          <div className="md:col-span-7 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            {selectedProfile ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-cyan-300">
                      {selectedProfile.name}
                    </h4>
                    {!selectedProfile.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedProfile.id)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title={language === 'fa' ? 'حذف این پروفایل' : 'Delete Profile'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedProfile.description}
                  </p>
                </div>

                {/* Configuration Breakdown Cards */}
                <div className="space-y-2 text-xs">
                  {/* IP & VLAN 1 */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <Network className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-300 block">
                        {language === 'fa' ? 'تنظیمات IP و پورت‌های VLAN 1:' : 'IP & VLAN 1 Ports:'}
                      </span>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                        {selectedProfile.config.vlan1Mode === 'dhcp' ? (
                          <span className="text-cyan-400">DHCP Client (دریافت خودکار از سرور)</span>
                        ) : (
                          <span>IP: {selectedProfile.config.vlan1Ip} | Mask: {selectedProfile.config.vlan1Subnet} | GW: {selectedProfile.config.defaultGateway}</span>
                        )}
                      </div>
                      <div className="text-emerald-400 font-mono text-[11px] mt-0.5">
                        رنج پورت‌های متصل به VLAN 1: <strong>{selectedProfile.config.vlan1PortRange || 'تمام پورت‌های پیش‌فرض'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* SSH & Passwords */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-300 block">
                        {language === 'fa' ? 'امنیت، احراز هویت و SSH:' : 'Security & SSH:'}
                      </span>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                        کاربر: {selectedProfile.config.adminUsername} (Priv 15) | دامنه: {selectedProfile.config.domainName}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        SSH v{selectedProfile.config.sshVersion} | کلید RSA: {selectedProfile.config.rsaKeySize} بیت | لاگین: login local
                      </div>
                    </div>
                  </div>

                  {/* SNMP & RSTP */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <Radio className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-300 block">
                        {language === 'fa' ? 'پروتکل‌های SNMP و RSTP:' : 'SNMP & RSTP:'}
                      </span>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                        {selectedProfile.config.enableSnmp ? (
                          <span>SNMP Community: {selectedProfile.config.snmpCommunity} ({selectedProfile.config.snmpPermission}) | NMS IP: {selectedProfile.config.snmpNmsIp || 'Default'}</span>
                        ) : (
                          <span className="text-slate-500">SNMP غیرفعال</span>
                        )}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        RSTP: {selectedProfile.config.enableRstp ? 'فعال (spanning-tree mode rapid-pvst)' : 'غیرفعال'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons for Selected Profile */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      onApplyProfile(selectedProfile.config, selectedProfile.name);
                      onClose();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span>{language === 'fa' ? 'بارگذاری در فرم' : 'Load into Form'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onInjectProfileDirect(selectedProfile.config, selectedProfile.name);
                      onClose();
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isConnected
                        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-600/25'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {language === 'fa' ? 'تزریق مستقیم به سوئیچ' : 'Inject Profile to Switch'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-10 text-xs">
                {language === 'fa' ? 'پروفایلی انتخاب نشده است.' : 'No profile selected.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
