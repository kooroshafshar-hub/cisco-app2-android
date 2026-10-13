import { ConfigurationProfile, CiscoConfig } from '../types/serial';
import { DEFAULT_CONFIG } from './configGenerator';

const STORAGE_KEY = 'cisco_profiles_lohesabz';

export const INITIAL_PROFILES: ConfigurationProfile[] = [
  {
    id: 'lsz-standard-24p',
    name: 'لوح سبز جنوب - سوئیچ دسترسی ۲۴ پورت (استاندارد)',
    description: 'پیکربندی استاندارد سوئیچ‌های ۲۴ پورت با IP استاتیک، SSH امن، RSTP و پورت‌های Fa0/1 تا 24 روی VLAN 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
    config: {
      ...DEFAULT_CONFIG,
      hostname: 'SW-LSZ-ACC-01',
      vlan1Ip: '192.168.1.10',
      vlan1Subnet: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      enablePortRangeVlan1: true,
      vlan1PortRange: 'FastEthernet0/1 - 24',
      enableSnmp: true,
      snmpCommunity: 'LSZ-SNMP-2026',
      snmpPermission: 'RO',
      snmpNmsIp: '192.168.1.50',
      enableRstp: true,
    },
  },
  {
    id: 'lsz-dist-48p',
    name: 'لوح سبز جنوب - سوئیچ توزیع ۴۸ پورت گیگابیت',
    description: 'پیکربندی سوئیچ‌های ۴۸ پورت با پورت‌های Gi1/0/1 تا 48 روی VLAN 1، حفاظت BPDUguard و کلید RSA 2048',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: false,
    config: {
      ...DEFAULT_CONFIG,
      hostname: 'SW-LSZ-DIST-48P',
      vlan1Ip: '192.168.1.15',
      vlan1Subnet: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      enablePortRangeVlan1: true,
      vlan1PortRange: 'GigabitEthernet1/0/1 - 48',
      enableSnmp: true,
      snmpCommunity: 'LSZ-SNMP-2026',
      enableRstp: true,
      enablePortfastBpduguard: true,
    },
  },
  {
    id: 'lsz-dhcp-client',
    name: 'لوح سبز جنوب - سوئیچ با دریافت IP از DHCP',
    description: 'پیکربندی خودکار با ip address dhcp روی VLAN 1، بدون نیاز به تنظیم IP دستی، فعال‌سازی کامل SSH',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: false,
    config: {
      ...DEFAULT_CONFIG,
      hostname: 'SW-LSZ-DHCP-01',
      vlan1Mode: 'dhcp',
      enablePortRangeVlan1: true,
      vlan1PortRange: 'FastEthernet0/1 - 24',
      enableSnmp: true,
      enableRstp: true,
    },
  },
];

export function getStoredProfiles(): ConfigurationProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROFILES));
      return INITIAL_PROFILES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROFILES;
  } catch (err) {
    console.error('Error reading profiles:', err);
    return INITIAL_PROFILES;
  }
}

export function saveProfile(profile: ConfigurationProfile): ConfigurationProfile[] {
  const profiles = getStoredProfiles();
  const existingIdx = profiles.findIndex(p => p.id === profile.id);

  let updatedList: ConfigurationProfile[];
  if (existingIdx >= 0) {
    updatedList = [...profiles];
    updatedList[existingIdx] = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updatedList = [
      {
        ...profile,
        id: profile.id || `profile-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...profiles,
    ];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  return updatedList;
}

export function deleteProfile(id: string): ConfigurationProfile[] {
  const profiles = getStoredProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

export function exportProfilesJson(): string {
  const profiles = getStoredProfiles();
  return JSON.stringify(profiles, null, 2);
}

export function importProfilesJson(jsonStr: string): ConfigurationProfile[] {
  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    throw new Error('فایل پروفایل معتبر نیست (باید آرایه JSON باشد)');
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  return parsed;
}
