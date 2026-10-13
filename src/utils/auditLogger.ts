import { AuditLog } from '../types/serial';

const LOG_STORAGE_KEY = 'cisco_audit_logs_lohesabz';

function formatPersianDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function getStoredAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading audit logs:', err);
    return [];
  }
}

export function recordAuditLog(
  entry: Omit<AuditLog, 'id' | 'timestamp' | 'formattedDate'>
): AuditLog {
  const currentLogs = getStoredAuditLogs();
  const now = new Date();

  const newLog: AuditLog = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: now.toISOString(),
    formattedDate: formatPersianDate(now),
  };

  const updatedLogs = [newLog, ...currentLogs.slice(0, 150)]; // Keep last 150 operations
  try {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.warn('Storage quota exceeded, trimming logs:', e);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs.slice(0, 50)));
  }

  return newLog;
}

export function clearAllAuditLogs(): void {
  localStorage.removeItem(LOG_STORAGE_KEY);
}

export function exportAuditLogsJson(): string {
  const logs = getStoredAuditLogs();
  return JSON.stringify(logs, null, 2);
}

export function exportAuditLogsText(): string {
  const logs = getStoredAuditLogs();
  let text = `=========================================================\n`;
  text += `گزارش لاگ‌های عملیاتی کانفیگ سوئیچ‌های سیسکو - شرکت لوح سبز جنوب\n`;
  text += `تهیه کننده: کورش افشار | 09120760865\n`;
  text += `تاریخ گزارش: ${new Date().toLocaleString()}\n`;
  text += `تعداد لاگ‌ها: ${logs.length}\n`;
  text += `=========================================================\n\n`;

  logs.forEach((log, idx) => {
    text += `[${idx + 1}] تاریخ: ${log.formattedDate} (${log.timestamp})\n`;
    text += `    سوئیچ هدف: ${log.targetSwitch} | پورت: ${log.portName}\n`;
    text += `    نوع عملیات: ${log.actionType} | وضعیت: ${log.status}\n`;
    text += `    شرح: ${log.summary}\n`;
    if (log.details.ip) text += `    تنظیمات IP: ${log.details.ip}\n`;
    if (log.details.vlanPorts) text += `    پورت‌های VLAN 1: ${log.details.vlanPorts}\n`;
    if (log.details.ssh) text += `    SSH: ${log.details.ssh}\n`;
    if (log.details.snmp) text += `    SNMP: ${log.details.snmp}\n`;
    if (log.details.rstp) text += `    RSTP: ${log.details.rstp}\n`;
    text += `---------------------------------------------------------\n`;
  });

  return text;
}
