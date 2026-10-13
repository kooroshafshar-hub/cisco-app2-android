export interface CiscoConfig {
  hostname: string;
  domainName: string;
  enableSecret: string;
  adminUsername: string;
  adminPassword: string;
  vlan1Mode: 'static' | 'dhcp';
  vlan1Ip: string;
  vlan1Subnet: string;
  defaultGateway: string;
  // VLAN 1 Port Assignment
  enablePortRangeVlan1: boolean;
  vlan1PortRange: string; // e.g. 'FastEthernet0/1 - 24' or 'GigabitEthernet1/0/1 - 24'
  // SSH & RSA
  rsaKeySize: 1024 | 2048 | 4096;
  sshVersion: '2' | '1.99';
  sshTimeout: number; // in seconds
  sshRetries: number;
  lineVtyCount: string; // '0 4' or '0 15'
  // SNMP Protocol
  enableSnmp: boolean;
  snmpCommunity: string;
  snmpPermission: 'RO' | 'RW';
  snmpNmsIp: string;
  snmpLocation: string;
  snmpContact: string;
  // RSTP (Rapid Spanning Tree Protocol)
  enableRstp: boolean;
  enablePortfastBpduguard: boolean;
  // Security & Hardening
  encryptPasswords: boolean;
  disableDnsLookup: boolean;
  loggingSynchronous: boolean;
  execTimeoutMinutes: number;
  bannerMotd: string;
  saveConfig: boolean;
  customExtraCommands: string;
}

export interface ConfigurationProfile {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  config: CiscoConfig;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  formattedDate: string; // Persian / formatted string
  actionType: 
    | 'full_injection' 
    | 'backup' 
    | 'snmp_config' 
    | 'rstp_config' 
    | 'reload' 
    | 'factory_reset' 
    | 'profile_applied'
    | 'manual_command';
  targetSwitch: string;
  portName: string;
  summary: string;
  details: {
    ip?: string;
    ssh?: string;
    vlanPorts?: string;
    passwordsChanged?: boolean;
    snmp?: string;
    rstp?: string;
    profileName?: string;
    backupFileName?: string;
  };
  status: 'success' | 'failed' | 'aborted';
  rawOutput?: string;
}

export interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
  chipName?: string;
  serialNumber?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface InjectionStep {
  id: string;
  titleFa: string;
  titleEn: string;
  command: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  response?: string;
  delayMs?: number;
}
