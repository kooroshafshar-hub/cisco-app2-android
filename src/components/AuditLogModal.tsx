import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Network, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  FileText,
  Clock
} from 'lucide-react';
import { AuditLog } from '../types/serial';
import { 
  getStoredAuditLogs, 
  clearAllAuditLogs, 
  exportAuditLogsJson, 
  exportAuditLogsText 
} from '../utils/auditLogger';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fa' | 'en';
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [logs, setLogs] = useState<AuditLog[]>(getStoredAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.targetSwitch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details.ip && log.details.ip.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || log.actionType === filterType;
    return matchesSearch && matchesType;
  });

  const handleClear = () => {
    if (confirm(language === 'fa' ? 'آیا از حذف تمام لاگ‌های ثبت‌شده مطمئن هستید؟' : 'Clear all audit logs?')) {
      clearAllAuditLogs();
      setLogs([]);
      setSelectedLog(null);
    }
  };

  const handleDownloadText = () => {
    const text = exportAuditLogsText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cisco-audit-report-lohesabz-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const json = exportAuditLogsJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cisco-audit-logs-lohesabz-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (type: AuditLog['actionType']) => {
    switch (type) {
      case 'full_injection':
      case 'profile_applied':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">تزریق کامل پروفایل</span>;
      case 'backup':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">بکاپ‌گیری کانفیگ</span>;
      case 'factory_reset':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">ریست فکتوری NVRAM</span>;
      case 'reload':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">ریست معمولی (Reload)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">عملیات کنسول</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'fa' 
                  ? 'ماژول لاگ‌گیری و گزارش‌گیری عملیات‌های سوئیچ سیسکو' 
                  : 'Cisco Switch Operation Audit & History Logs'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'fa'
                  ? 'ثبت زمان، سوئیچ هدف، نوع عملیات و جزئیات تغییرات (IP، رمز، SSH، VLAN 1، SNMP و RSTP)'
                  : 'Records timestamp, target switch, operation type, and details of IP, SSH, Passwords & VLAN 1'}
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

        {/* Controls Bar: Search, Filters, and Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'fa' ? 'جستجو بر اساس نام سوئیچ، IP یا شرح عملیات...' : 'Search switch, IP, or summary...'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-1.5 px-8 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">همه عملیات‌ها</option>
              <option value="full_injection">تزریق کامل کانفیگ</option>
              <option value="backup">بکاپ‌گیری</option>
              <option value="factory_reset">ریست فکتوری</option>
              <option value="reload">ریست معمولی</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadText}
              disabled={logs.length === 0}
              className="py-1.5 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="دانلود فایل گزارش متنی .txt"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'fa' ? 'گزارش متنی (TXT)' : 'Export TXT'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              disabled={logs.length === 0}
              className="py-1.5 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="دانلود دیتای کامل JSON"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'fa' ? 'خروجی JSON' : 'Export JSON'}</span>
            </button>

            <button
              onClick={handleClear}
              disabled={logs.length === 0}
              className="py-1.5 px-3 rounded-xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="پاکسازی تاریخچه لاگ‌ها"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'fa' ? 'پاکسازی' : 'Clear'}</span>
            </button>
          </div>
        </div>

        {/* Logs List & Details Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-3 overflow-y-auto flex-1">
          {/* Logs Table / Cards (7 cols) */}
          <div className="md:col-span-7 space-y-2 overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs font-mono">
                {language === 'fa' ? 'هیچ لاگی یافت نشد.' : 'No audit logs found.'}
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="font-bold text-xs text-white">{log.targetSwitch}</span>
                        {getActionBadge(log.actionType)}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {log.formattedDate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {log.summary}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-700/50">
                      <span>پورت: {log.portName}</span>
                      {log.details.ip && <span>IP: {log.details.ip}</span>}
                      {log.details.vlanPorts && <span>VLAN: {log.details.vlanPorts}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details Drawer (5 cols) */}
          <div className="md:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto">
            {selectedLog ? (
              <div className="space-y-3.5 text-xs">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-amber-300">
                    جزئیات عملیات #{selectedLog.id.slice(-6)}
                  </h4>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    زمان دقیق: {selectedLog.formattedDate} ({selectedLog.timestamp})
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">سوئیچ هدف و پورت کنسول:</span>
                    <strong className="text-white font-mono">{selectedLog.targetSwitch} ({selectedLog.portName})</strong>
                  </div>

                  {selectedLog.details.ip && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">تنظیمات IP و گیت‌وی:</span>
                      <strong className="text-cyan-300 font-mono">{selectedLog.details.ip}</strong>
                    </div>
                  )}

                  {selectedLog.details.vlanPorts && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">پورت‌های متصل به VLAN 1:</span>
                      <strong className="text-emerald-300 font-mono">{selectedLog.details.vlanPorts}</strong>
                    </div>
                  )}

                  {selectedLog.details.ssh && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">فعال‌سازی SSH و کلید RSA:</span>
                      <strong className="text-slate-200 font-mono">{selectedLog.details.ssh}</strong>
                    </div>
                  )}

                  {selectedLog.details.snmp && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">پروتکل SNMP:</span>
                      <strong className="text-amber-300 font-mono">{selectedLog.details.snmp}</strong>
                    </div>
                  )}

                  {selectedLog.details.rstp && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">پروتکل همگرایی RSTP:</span>
                      <strong className="text-purple-300 font-mono">{selectedLog.details.rstp}</strong>
                    </div>
                  )}
                </div>

                {selectedLog.rawOutput && (
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">خروجی کنسول:</span>
                    <div dir="ltr" className="bg-black/90 p-2.5 rounded-xl font-mono text-[11px] text-emerald-400 max-h-36 overflow-y-auto whitespace-pre-wrap">
                      {selectedLog.rawOutput}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                {language === 'fa' ? 'برای مشاهده جزئیات، روی یکی از لاگ‌ها کلیک کنید.' : 'Click a log entry to inspect full details.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
