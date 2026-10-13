import { CiscoConfig } from '../types/serial';

export const DEFAULT_CONFIG: CiscoConfig = {
  hostname: 'SW-LOHESABZ-01',
  domainName: 'lohesabz.ir',
  enableSecret: 'Loh@Sabz#2026',
  adminUsername: 'admin_lsz',
  adminPassword: 'LSZ@StrongAdmin2026',
  vlan1Mode: 'static',
  vlan1Ip: '192.168.1.10',
  vlan1Subnet: '255.255.255.0',
  defaultGateway: '192.168.1.1',
  // VLAN 1 Port Assignment
  enablePortRangeVlan1: true,
  vlan1PortRange: 'FastEthernet0/1 - 24',
  // SSH & RSA
  rsaKeySize: 2048,
  sshVersion: '2',
  sshTimeout: 60,
  sshRetries: 3,
  lineVtyCount: '0 15',
  // SNMP Protocol
  enableSnmp: true,
  snmpCommunity: 'LSZ-SNMP-2026',
  snmpPermission: 'RO',
  snmpNmsIp: '192.168.1.50',
  snmpLocation: 'Loh-e Sabz-e Jonoob DataCenter',
  snmpContact: 'Koorosh Afshar (09120760865)',
  // RSTP (Rapid Spanning Tree Protocol)
  enableRstp: true,
  enablePortfastBpduguard: true,
  // Security & Hardening
  encryptPasswords: true,
  disableDnsLookup: true,
  loggingSynchronous: true,
  execTimeoutMinutes: 10,
  bannerMotd: 'COMPANY: LOH-E SABZ-E JONOOB - AUTHORIZED ACCESS ONLY',
  saveConfig: true,
  customExtraCommands: '',
};

/**
 * Generates the clean list of Cisco commands to inject sequentially
 */
export function generateCiscoCommandList(config: CiscoConfig): string[] {
  const commands: string[] = [];

  // 1. Enter global configuration mode
  commands.push('configure terminal');

  // 2. Hostname
  if (config.hostname.trim()) {
    commands.push(`hostname ${config.hostname.trim()}`);
  }

  // 3. DNS Lookup suppression
  if (config.disableDnsLookup) {
    commands.push('no ip domain-lookup');
  }

  // 4. Domain Name (Required for crypto key)
  if (config.domainName.trim()) {
    commands.push(`ip domain-name ${config.domainName.trim()}`);
  }

  // 5. Password Encryption
  if (config.encryptPasswords) {
    commands.push('service password-encryption');
  }

  // 6. Enable Secret
  if (config.enableSecret.trim()) {
    commands.push(`enable secret ${config.enableSecret.trim()}`);
  }

  // 7. Local Admin User
  if (config.adminUsername.trim() && config.adminPassword.trim()) {
    commands.push(`username ${config.adminUsername.trim()} privilege 15 secret ${config.adminPassword.trim()}`);
  }

  // 8. RSTP (Rapid Spanning Tree Protocol)
  if (config.enableRstp) {
    commands.push('spanning-tree mode rapid-pvst');
    if (config.enablePortfastBpduguard) {
      commands.push('spanning-tree portfast default');
      commands.push('spanning-tree portfast bpduguard default');
    }
  }

  // 9. Assign Switch Ports to VLAN 1 (Access mode)
  if (config.enablePortRangeVlan1 && config.vlan1PortRange.trim()) {
    commands.push(`interface range ${config.vlan1PortRange.trim()}`);
    commands.push('switchport mode access');
    commands.push('switchport access vlan 1');
    if (config.enablePortfastBpduguard) {
      commands.push('spanning-tree portfast');
    }
    commands.push('no shutdown');
    commands.push('exit');
  }

  // 10. VLAN 1 Management SVI Interface Configuration (IP or DHCP)
  commands.push('interface Vlan1');
  if (config.vlan1Mode === 'dhcp') {
    commands.push('ip address dhcp');
  } else {
    commands.push(`ip address ${config.vlan1Ip.trim()} ${config.vlan1Subnet.trim()}`);
  }
  commands.push('no shutdown');
  commands.push('exit');

  // 11. Default Gateway (if static mode and provided)
  if (config.vlan1Mode === 'static' && config.defaultGateway.trim()) {
    commands.push(`ip default-gateway ${config.defaultGateway.trim()}`);
  }

  // 12. SNMP Protocol Activation
  if (config.enableSnmp && config.snmpCommunity.trim()) {
    commands.push(`snmp-server community ${config.snmpCommunity.trim()} ${config.snmpPermission}`);
    if (config.snmpNmsIp.trim()) {
      commands.push(`snmp-server host ${config.snmpNmsIp.trim()} version 2c ${config.snmpCommunity.trim()}`);
    }
    commands.push('snmp-server enable traps');
    if (config.snmpLocation.trim()) {
      commands.push(`snmp-server location ${config.snmpLocation.trim()}`);
    }
    if (config.snmpContact.trim()) {
      commands.push(`snmp-server contact ${config.snmpContact.trim()}`);
    }
  }

  // 13. Crypto Key Generation for SSH
  commands.push(`crypto key generate rsa general-keys modulus ${config.rsaKeySize}`);

  // 14. SSH Settings
  commands.push(`ip ssh version ${config.sshVersion}`);
  commands.push(`ip ssh time-out ${config.sshTimeout}`);
  commands.push(`ip ssh authentication-retries ${config.sshRetries}`);

  // 15. Line VTY Configuration (SSH only, no telnet)
  commands.push(`line vty ${config.lineVtyCount}`);
  commands.push('transport input ssh');
  commands.push('login local');
  if (config.loggingSynchronous) {
    commands.push('logging synchronous');
  }
  commands.push(`exec-timeout ${config.execTimeoutMinutes} 0`);
  commands.push('exit');

  // 16. Line Console 0 Hardening
  commands.push('line console 0');
  if (config.loggingSynchronous) {
    commands.push('logging synchronous');
  }
  commands.push(`exec-timeout ${config.execTimeoutMinutes} 0`);
  commands.push('login local');
  commands.push('exit');

  // 17. Banner MOTD
  if (config.bannerMotd.trim()) {
    commands.push(`banner motd #${config.bannerMotd.trim()}#`);
  }

  // 18. Custom extra commands if provided
  if (config.customExtraCommands.trim()) {
    const lines = config.customExtraCommands
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('!'));
    commands.push(...lines);
  }

  // 19. Exit configuration mode
  commands.push('end');

  // 20. Save running configuration to startup configuration
  if (config.saveConfig) {
    commands.push('write memory');
  }

  return commands;
}

/**
 * Returns formatted text of Cisco configuration suitable for review or copy/download
 */
export function generateFullConfigText(config: CiscoConfig): string {
  const commands = generateCiscoCommandList(config);
  return `! =========================================================
! شرکت لوح سبز جنوب | پیکربندی اولیه سوئیچ سیسکو
! تهیه کننده: کورش افشار (09120760865)
! Target: Hostname ${config.hostname} | Management VLAN 1
! Generated on: ${new Date().toISOString()}
! =========================================================
!
enable
${commands.join('\n')}
!
! Verification recommendations:
! show ip interface brief
! show ip ssh
! show spanning-tree summary
! show snmp
! =========================================================
`;
}

/**
 * Generates standalone Python script
 */
export function generatePythonScript(config: CiscoConfig, portName = 'COM3'): string {
  const commands = generateCiscoCommandList(config);
  const cmdsJson = JSON.stringify(commands, null, 2);

  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
شرکت لوح سبز جنوب - اسکریپت تزریق خودکار کانفیگ سوئیچ سیسکو
تهیه کننده: کورش افشار | 09120760865
Requirements: pip install pyserial
Usage: python cisco_autoconfig.py [PORT]
"""

import sys
import time
import serial

PORT = sys.argv[1] if len(sys.argv) > 1 else "${portName}"
BAUD = 9600
COMMANDS = ${cmdsJson}

def main():
    print(f"Connecting to Cisco Switch Console on {PORT} at {BAUD} baud...")
    try:
        ser = serial.Serial(PORT, BAUD, timeout=1)
    except Exception as e:
        print(f"Error opening port: {e}")
        return

    time.sleep(1)
    ser.write(b"\\r\\n\\r\\n")
    time.sleep(0.5)
    ser.write(b"enable\\r\\n")
    time.sleep(0.5)

    for idx, cmd in enumerate(COMMANDS, 1):
        print(f"[{idx}/{len(COMMANDS)}] >> {cmd}")
        ser.write((cmd + "\\r\\n").encode('ascii', errors='ignore'))
        time.sleep(0.2)
        while ser.in_waiting:
            print(ser.read(ser.in_waiting).decode('latin-1', errors='ignore'), end="")

    print("\\n[OK] Configuration injection completed successfully!")
    ser.close()

if __name__ == '__main__':
    main()
`;
}
