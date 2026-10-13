import { SerialPortInfo } from '../types/serial';

// Comprehensive USB Console & Serial Chipset Database
interface ChipEntry {
  vendorName: string;
  chipModel: string;
  notes?: string;
}

const KNOWN_SERIAL_DEVICES: Record<string, ChipEntry> = {
  // FTDI (Future Technology Devices International) - Very common in Cisco rollover cables
  '0403:6001': { vendorName: 'FTDI', chipModel: 'FT232R USB UART (Standard Cisco Rollover Cable)' },
  '0403:6010': { vendorName: 'FTDI', chipModel: 'FT2232C/D/H Dual USB-UART' },
  '0403:6011': { vendorName: 'FTDI', chipModel: 'FT4232H Quad High-Speed USB-UART' },
  '0403:6014': { vendorName: 'FTDI', chipModel: 'FT232H Single High-Speed USB-UART' },
  '0403:6015': { vendorName: 'FTDI', chipModel: 'FT-X Series (FT230X / FT231X) Full Speed USB' },
  '0403:':     { vendorName: 'FTDI', chipModel: 'FTDI USB-to-Serial Console Cable' },

  // Prolific Technology
  '067b:2303': { vendorName: 'Prolific', chipModel: 'PL2303 Classic USB-to-Serial Controller' },
  '067b:23a3': { vendorName: 'Prolific', chipModel: 'PL2303GC / GS / GT High-Speed Controller' },
  '067b:2304': { vendorName: 'Prolific', chipModel: 'PL2303RA USB-to-RS232 Controller' },
  '067b:0230': { vendorName: 'Prolific', chipModel: 'PL2303HX USB to Serial Bridge' },
  '067b:':     { vendorName: 'Prolific', chipModel: 'Prolific PL2303 Serial Adapter' },

  // Silicon Laboratories (CP210x)
  '10c4:ea60': { vendorName: 'Silicon Labs', chipModel: 'CP2102 / CP2104 / CP2109 USB-to-UART Bridge' },
  '10c4:ea61': { vendorName: 'Silicon Labs', chipModel: 'CP2103 USB-to-UART Bridge' },
  '10c4:ea70': { vendorName: 'Silicon Labs', chipModel: 'CP2105 Dual USB-to-UART Bridge' },
  '10c4:ea71': { vendorName: 'Silicon Labs', chipModel: 'CP2108 Quad USB-to-UART Bridge' },
  '10c4:':     { vendorName: 'Silicon Labs', chipModel: 'CP210x USB to UART Bridge' },

  // WCH (Jiangsu QinHeng) - Extremely common in cost-effective cables
  '1a86:7523': { vendorName: 'WCH (QinHeng)', chipModel: 'CH340 / CH340G / CH340C USB-to-Serial Converter' },
  '1a86:5523': { vendorName: 'WCH (QinHeng)', chipModel: 'CH341 / CH341A USB-to-Serial / Parallel' },
  '1a86:55d3': { vendorName: 'WCH (QinHeng)', chipModel: 'CH343 High-Speed USB to Serial' },
  '1a86:fe10': { vendorName: 'WCH (QinHeng)', chipModel: 'CH9102F / CH9102X High-Speed USB Serial' },
  '1a86:':     { vendorName: 'WCH (QinHeng)', chipModel: 'CH34x Series USB to Serial' },

  // Cisco Systems Native USB Console Cables
  '05a6:0008': { vendorName: 'Cisco Systems', chipModel: 'Cisco USB Console Cable Type A/B' },
  '05a6:0009': { vendorName: 'Cisco Systems', chipModel: 'Cisco Catalyst Integrated USB Console' },
  '05a6:000a': { vendorName: 'Cisco Systems', chipModel: 'Cisco Type-C High-Speed Console Interface' },
  '05a6:000b': { vendorName: 'Cisco Systems', chipModel: 'Cisco Management Console' },
  '05a6:':     { vendorName: 'Cisco Systems', chipModel: 'Cisco Native USB Console Port' },

  // Moxa
  '110a:1110': { vendorName: 'Moxa', chipModel: 'UPort 1110 1-Port RS-232 USB Adapter' },
  '110a:1150': { vendorName: 'Moxa', chipModel: 'UPort 1150 USB-to-Serial Converter' },
  '110a:':     { vendorName: 'Moxa', chipModel: 'Moxa Industrial USB-to-Serial' },

  // ATEN
  '0557:2008': { vendorName: 'ATEN', chipModel: 'UC232A USB-to-Serial RS-232 Adapter' },

  // STMicroelectronics Virtual COM
  '0483:5740': { vendorName: 'STMicroelectronics', chipModel: 'STM32 Virtual COM Port' },

  // Microchip / Atmel
  '04d8:000a': { vendorName: 'Microchip', chipModel: 'CDC RS-232 Emulation Demo' },
  '03eb:2404': { vendorName: 'Atmel', chipModel: 'SAM Virtual Serial Port' },
};

interface WebSerialPort {
  open(options: {
    baudRate: number;
    dataBits?: number;
    stopBits?: number;
    parity?: 'none' | 'even' | 'odd';
    bufferSize?: number;
    flowControl?: 'none' | 'hardware';
  }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  getInfo?(): { usbVendorId?: number; usbProductId?: number };
}

export type SerialDataListener = (data: string) => void;
export type SerialDisconnectListener = () => void;

class SerialManager {
  private port: WebSerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private keepReading = false;
  private isSimulated = false;
  private simulatedPrompt = 'Switch>';
  private dataListeners: Set<SerialDataListener> = new Set();
  private disconnectListeners: Set<SerialDisconnectListener> = new Set();

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public getChipDescription(vendorId?: number, productId?: number): string {
    if (!vendorId) {
      return 'Generic Serial / RS-232 Console Cable';
    }

    const vidHex = vendorId.toString(16).toLowerCase().padStart(4, '0');
    const pidHex = productId ? productId.toString(16).toLowerCase().padStart(4, '0') : '';

    // 1. Try exact VID:PID lookup
    if (pidHex && KNOWN_SERIAL_DEVICES[`${vidHex}:${pidHex}`]) {
      const entry = KNOWN_SERIAL_DEVICES[`${vidHex}:${pidHex}`];
      return `${entry.vendorName} - ${entry.chipModel} [VID: 0x${vidHex.toUpperCase()}, PID: 0x${pidHex.toUpperCase()}]`;
    }

    // 2. Try VID lookup
    if (KNOWN_SERIAL_DEVICES[`${vidHex}:`]) {
      const entry = KNOWN_SERIAL_DEVICES[`${vidHex}:`];
      return `${entry.vendorName} (${entry.chipModel}) [VID: 0x${vidHex.toUpperCase()}${pidHex ? `, PID: 0x${pidHex.toUpperCase()}` : ''}]`;
    }

    return `USB Serial Adapter [VID: 0x${vidHex.toUpperCase()}${pidHex ? `, PID: 0x${pidHex.toUpperCase()}` : ''}]`;
  }

  public async requestAndConnect(baudRate = 9600): Promise<SerialPortInfo> {
    if (this.isSimulated) {
      return {
        usbVendorId: 0x0403,
        usbProductId: 0x6001,
        chipName: 'FTDI FT232R USB UART (Standard Cisco Rollover Cable - شبیه‌ساز)',
      };
    }

    if (!this.isSupported()) {
      throw new Error(
        'مرورگر شما از Web Serial API پشتیبانی نمی‌کند. لطفاً از Google Chrome، Microsoft Edge یا Opera استفاده کنید.'
      );
    }

    try {
      const serial = (navigator as unknown as { serial: { requestPort: () => Promise<WebSerialPort> } }).serial;
      this.port = await serial.requestPort();

      await this.port.open({
        baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      });

      const info = this.port.getInfo ? this.port.getInfo() : {};
      const portInfo: SerialPortInfo = {
        usbVendorId: info.usbVendorId,
        usbProductId: info.usbProductId,
        chipName: this.getChipDescription(info.usbVendorId, info.usbProductId),
      };

      this.startReading();
      return portInfo;
    } catch (err: unknown) {
      this.port = null;
      throw err;
    }
  }

  public startSimulation(): SerialPortInfo {
    this.isSimulated = true;
    this.simulatedPrompt = 'Switch>';
    setTimeout(() => {
      this.emitData(
        '\r\n\r\n--- Cisco Catalyst Switch Console Connected (Loh-e Sabz-e Jonoob Lab Simulator) ---\r\n\r\nSwitch>'
      );
    }, 300);
    return {
      usbVendorId: 0x0403,
      usbProductId: 0x6001,
      chipName: 'FTDI FT232R USB-to-Serial (Cisco Console Cable - شبیه‌ساز فعال)',
    };
  }

  private async startReading() {
    if (!this.port || !this.port.readable) return;
    this.keepReading = true;

    try {
      while (this.port.readable && this.keepReading) {
        this.reader = this.port.readable.getReader();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        try {
          while (true) {
            const { value, done } = await this.reader.read();
            if (done) break;
            if (value) {
              const text = decoder.decode(value, { stream: true });
              this.emitData(text);
            }
          }
        } catch (readErr) {
          console.warn('Serial read notice:', readErr);
        } finally {
          this.reader.releaseLock();
          this.reader = null;
        }
      }
    } catch (err) {
      console.warn('Serial reader loop terminated:', err);
    } finally {
      this.emitDisconnect();
    }
  }

  public async send(text: string): Promise<void> {
    if (this.isSimulated) {
      this.handleSimulatedInput(text);
      return;
    }

    if (!this.port || !this.port.writable) {
      throw new Error('Port is not connected');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    this.writer = this.port.writable.getWriter();
    try {
      await this.writer.write(data);
    } finally {
      this.writer.releaseLock();
      this.writer = null;
    }
  }

  public async sendLine(line: string): Promise<void> {
    await this.send(line + '\r\n');
  }

  public async sendBreak(): Promise<void> {
    if (this.isSimulated) {
      this.emitData('^C\r\n' + this.simulatedPrompt);
      return;
    }
    await this.send('\x03');
  }

  private handleSimulatedInput(input: string) {
    const trimmed = input.trim();
    this.emitData(input); // echo back

    setTimeout(() => {
      if (trimmed === '') {
        this.emitData('\r\n' + this.simulatedPrompt);
      } else if (trimmed === 'enable' || trimmed === 'en') {
        this.simulatedPrompt = 'Switch#';
        this.emitData('\r\n' + this.simulatedPrompt);
      } else if (trimmed === 'configure terminal' || trimmed === 'conf t') {
        this.simulatedPrompt = 'Switch(config)#';
        this.emitData('\r\nEnter configuration commands, one per line.  End with CNTL/Z.\r\n' + this.simulatedPrompt);
      } else if (trimmed.startsWith('hostname ')) {
        const name = trimmed.split(' ')[1] || 'Switch';
        this.simulatedPrompt = `${name}(config)#`;
        this.emitData('\r\n' + this.simulatedPrompt);
      } else if (trimmed.startsWith('interface range')) {
        this.simulatedPrompt = 'Switch(config-if-range)#';
        this.emitData('\r\n' + this.simulatedPrompt);
      } else if (trimmed.startsWith('interface Vlan1') || trimmed.startsWith('interface vlan 1')) {
        this.simulatedPrompt = 'Switch(config-if)#';
        this.emitData('\r\n' + this.simulatedPrompt);
      } else if (trimmed.startsWith('crypto key generate rsa')) {
        this.emitData(
          '\r\nThe name for the keys will be: SW-LOHESABZ.lohesabz.ir\r\n% Generating 2048 bit RSA keys, keys will be non-exportable...\r\n[OK] (elapsed time was 1 seconds)\r\n\r\n' +
            this.simulatedPrompt
        );
      } else if (trimmed.startsWith('line vty') || trimmed.startsWith('line con')) {
        this.simulatedPrompt = 'Switch(config-line)#';
        this.emitData('\r\n' + this.simulatedPrompt);
      } else if (trimmed === 'exit') {
        this.simulatedPrompt = 'Switch(config)#';
        this.emitData('\r\n' + this.simulatedPrompt);
      } else if (trimmed === 'end') {
        this.simulatedPrompt = 'Switch#';
        this.emitData('\r\n%SYS-5-CONFIG_I: Configured from console by console\r\n' + this.simulatedPrompt);
      } else if (trimmed === 'write memory' || trimmed === 'wr' || trimmed === 'copy run start') {
        this.emitData('\r\nBuilding configuration...\r\n[OK]\r\n' + this.simulatedPrompt);
      } else if (trimmed === 'show running-config' || trimmed === 'sh run') {
        this.emitData(
          `\r\nBuilding configuration...\r\n\r\nCurrent configuration : 1850 bytes\r\n!\r\nversion 15.2\r\nno service pad\r\nservice timestamps debug datetime msec\r\nservice timestamps log datetime msec\r\nservice password-encryption\r\n!\r\nhostname SW-LOHESABZ\r\n!\r\nspanning-tree mode rapid-pvst\r\nspanning-tree extend system-id\r\n!\r\ninterface Vlan1\r\n ip address 192.168.1.10 255.255.255.0\r\n no shutdown\r\n!\r\nip default-gateway 192.168.1.1\r\nip domain-name lohesabz.ir\r\nip ssh version 2\r\n!\r\nsnmp-server community LSZ-NMS-2026 RO\r\nsnmp-server host 192.168.1.50 version 2c LSZ-NMS-2026\r\n!\r\nline con 0\r\n logging synchronous\r\n login local\r\nline vty 0 15\r\n transport input ssh\r\n login local\r\n!\r\nend\r\n` +
            this.simulatedPrompt
        );
      } else if (trimmed === 'reload') {
        this.emitData('\r\nProceed with reload? [confirm]');
      } else if (trimmed === 'write erase' || trimmed === 'erase startup-config') {
        this.emitData('\r\nErasing the nvram filesystem will remove all configuration files! Continue? [confirm]');
      } else if (trimmed === 'delete flash:vlan.dat') {
        this.emitData('\r\nDelete filename [vlan.dat]? [confirm]');
      } else if (trimmed === '[confirm]' || trimmed === 'y' || trimmed === 'yes') {
        this.emitData('\r\n[OK]\r\nErase of nvram: complete\r\n' + this.simulatedPrompt);
      } else {
        this.emitData('\r\n' + this.simulatedPrompt);
      }
    }, 100);
  }

  public async disconnect(): Promise<void> {
    this.keepReading = false;
    this.isSimulated = false;

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (e) {
        console.warn('Reader cancel err:', e);
      }
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (e) {
        console.warn('Port close err:', e);
      }
      this.port = null;
    }

    this.emitDisconnect();
  }

  public onData(listener: SerialDataListener): () => void {
    this.dataListeners.add(listener);
    return () => this.dataListeners.delete(listener);
  }

  public onDisconnect(listener: SerialDisconnectListener): () => void {
    this.disconnectListeners.add(listener);
    return () => this.disconnectListeners.delete(listener);
  }

  private emitData(data: string) {
    this.dataListeners.forEach(listener => {
      try {
        listener(data);
      } catch (e) {
        console.error('Data listener error:', e);
      }
    });
  }

  private emitDisconnect() {
    this.disconnectListeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('Disconnect listener error:', e);
      }
    });
  }
}

export const serialManager = new SerialManager();
