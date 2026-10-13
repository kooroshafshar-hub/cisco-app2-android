/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CiscoConfig, ConnectionStatus, SerialPortInfo } from './types/serial';
import { DEFAULT_CONFIG } from './utils/configGenerator';
import { serialManager } from './utils/serialService';
import { injectionEngine } from './utils/injectionEngine';
import { recordAuditLog } from './utils/auditLogger';
import { Header } from './components/Header';
import { ConnectionCard } from './components/ConnectionCard';
import { ConfigForm } from './components/ConfigForm';
import { TerminalView } from './components/TerminalView';
import { InjectionModal } from './components/InjectionModal';
import { ExportTools } from './components/ExportTools';
import { QuickHelpModal } from './components/QuickHelpModal';
import { ProfileManager } from './components/ProfileManager';
import { AuditLogModal } from './components/AuditLogModal';
import { SwitchOperationsModal } from './components/SwitchOperationsModal';
import { Footer } from './components/Footer';
import { Terminal, Settings } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<CiscoConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [portInfo, setPortInfo] = useState<SerialPortInfo | null>(null);
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [language, setLanguage] = useState<'fa' | 'en'>('fa');
  const [terminalLogs, setTerminalLogs] = useState<string>('');
  const [pacingMs, setPacingMs] = useState<number>(180);
  const [activeViewTab, setActiveViewTab] = useState<'config' | 'terminal' | 'tools'>('config');

  // Modals state
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isProfilesOpen, setIsProfilesOpen] = useState<boolean>(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState<boolean>(false);
  const [isOperationsOpen, setIsOperationsOpen] = useState<boolean>(false);

  // Injection state
  const [isInjectingModalOpen, setIsInjectingModalOpen] = useState<boolean>(false);
  const [injectionProgress, setInjectionProgress] = useState({
    currentStepIndex: 0,
    totalSteps: 1,
    percent: 0,
    currentCommand: '',
    statusText: '',
    isFinished: false,
    hasError: false,
  });

  const isWebSerialSupported = serialManager.isSupported();

  // Attach serial stream listeners
  useEffect(() => {
    const unsubData = serialManager.onData((incomingChunk) => {
      setTerminalLogs((prev) => {
        const next = prev + incomingChunk;
        return next.length > 25000 ? next.slice(-20000) : next;
      });
    });

    const unsubDisconnect = serialManager.onDisconnect(() => {
      setStatus('disconnected');
      setPortInfo(null);
    });

    return () => {
      unsubData();
      unsubDisconnect();
    };
  }, []);

  // Connect to physical port or start simulation
  const handleConnect = async () => {
    if (isSimulated) {
      const info = serialManager.startSimulation();
      setPortInfo(info);
      setStatus('connected');
      return;
    }

    try {
      setStatus('connecting');
      const info = await serialManager.requestAndConnect(baudRate);
      setPortInfo(info);
      setStatus('connected');
    } catch (err: unknown) {
      console.error('Serial connection error:', err);
      setStatus('error');
      setTimeout(() => setStatus('disconnected'), 3000);
    }
  };

  const handleDisconnect = async () => {
    await serialManager.disconnect();
    setStatus('disconnected');
    setPortInfo(null);
  };

  const handleToggleSimulation = () => {
    if (status === 'connected') {
      serialManager.disconnect();
    }
    const nextSimState = !isSimulated;
    setIsSimulated(nextSimState);
    if (nextSimState) {
      const info = serialManager.startSimulation();
      setPortInfo(info);
      setStatus('connected');
    } else {
      setStatus('disconnected');
      setPortInfo(null);
    }
  };

  const handleSendEnter = async () => {
    try {
      await serialManager.send('\r\n');
    } catch (e) {
      console.warn('Send enter err:', e);
    }
  };

  const handleSendBreak = async () => {
    try {
      await serialManager.sendBreak();
    } catch (e) {
      console.warn('Send break err:', e);
    }
  };

  const handleSendCommand = async (cmd: string) => {
    try {
      if (cmd === '') {
        await serialManager.send('\r\n');
      } else {
        await serialManager.sendLine(cmd);
      }
    } catch (e) {
      console.warn('Send command err:', e);
    }
  };

  const handleClearTerminal = () => {
    setTerminalLogs('');
  };

  // Launch Injection Flow
  const handleStartInjection = async (targetCfg?: CiscoConfig, profileName?: string) => {
    const activeCfg = targetCfg || config;

    // If not connected, connect or simulate
    if (status !== 'connected') {
      if (!isWebSerialSupported && !isSimulated) {
        setIsSimulated(true);
        const info = serialManager.startSimulation();
        setPortInfo(info);
        setStatus('connected');
      } else {
        try {
          await handleConnect();
        } catch {
          return;
        }
      }
    }

    setIsInjectingModalOpen(true);
    setInjectionProgress({
      currentStepIndex: 0,
      totalSteps: 1,
      percent: 0,
      currentCommand: 'Init',
      statusText: language === 'fa' ? 'شروع فرآیند تزریق به سوئیچ...' : 'Initializing...',
      isFinished: false,
      hasError: false,
    });

    const result = await injectionEngine.runInjection(
      activeCfg,
      pacingMs,
      (progress) => {
        setInjectionProgress(progress);
      }
    );

    // Record Audit Log upon completion
    if (result.success) {
      recordAuditLog({
        actionType: 'full_injection',
        targetSwitch: activeCfg.hostname,
        portName: portInfo?.chipName || 'Console Port',
        summary: `تزریق موفق کانفیگ ${profileName ? `(پروفایل: ${profileName})` : ''} به سوئیچ ${activeCfg.hostname} شامل IP، رمزها، SSH، پورت‌های VLAN 1، SNMP و RSTP`,
        details: {
          ip: activeCfg.vlan1Mode === 'dhcp' ? 'DHCP Client' : `${activeCfg.vlan1Ip} / ${activeCfg.vlan1Subnet}`,
          ssh: `SSH v${activeCfg.sshVersion} (${activeCfg.rsaKeySize}b RSA)`,
          vlanPorts: activeCfg.enablePortRangeVlan1 ? activeCfg.vlan1PortRange : 'VLAN 1 Default',
          passwordsChanged: true,
          snmp: activeCfg.enableSnmp ? `${activeCfg.snmpCommunity} (${activeCfg.snmpPermission})` : 'غیرفعال',
          rstp: activeCfg.enableRstp ? 'فعال (rapid-pvst)' : 'غیرفعال',
          profileName,
        },
        status: 'success',
        rawOutput: result.log,
      });
    }
  };

  const handleAbortInjection = () => {
    injectionEngine.abort();
  };

  // Direct profile apply handlers
  const handleApplyProfile = (loadedConfig: CiscoConfig, profileName: string) => {
    setConfig(loadedConfig);
  };

  const handleInjectProfileDirect = (loadedConfig: CiscoConfig, profileName: string) => {
    setConfig(loadedConfig);
    handleStartInjection(loadedConfig, profileName);
  };

  return (
    <div 
      dir={language === 'fa' ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200"
    >
      {/* Top Header with Corporate Branding */}
      <Header
        status={status}
        portInfo={portInfo}
        baudRate={baudRate}
        isSimulated={isSimulated}
        isWebSerialSupported={isWebSerialSupported}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
        onToggleSimulation={handleToggleSimulation}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenProfiles={() => setIsProfilesOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenOperations={() => setIsOperationsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Connection Control Card */}
        <ConnectionCard
          status={status}
          portInfo={portInfo}
          baudRate={baudRate}
          onBaudRateChange={setBaudRate}
          isWebSerialSupported={isWebSerialSupported}
          isSimulated={isSimulated}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onSendEnter={handleSendEnter}
          onSendBreak={handleSendBreak}
          onClearTerminal={handleClearTerminal}
          language={language}
        />

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveViewTab('config')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeViewTab === 'config' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? 'فرم تنظیمات' : 'Config Form'}</span>
          </button>
          <button
            onClick={() => setActiveViewTab('terminal')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeViewTab === 'terminal' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? 'ترمینال زنده' : 'Live Terminal'}</span>
          </button>
        </div>

        {/* Two-Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Desktop 7 cols): Form & Settings */}
          <div className={`lg:col-span-7 space-y-6 ${activeViewTab === 'terminal' ? 'hidden lg:block' : 'block'}`}>
            <ConfigForm
              config={config}
              onChange={setConfig}
              onInject={() => handleStartInjection()}
              isConnected={status === 'connected'}
              language={language}
            />

            {/* Export and Documentation Tools */}
            <ExportTools config={config} language={language} />
          </div>

          {/* Right Column (Desktop 5 cols): Real-Time Terminal Stream & Status */}
          <div className={`lg:col-span-5 sticky top-20 space-y-4 ${activeViewTab === 'config' ? 'hidden lg:block' : 'block'}`}>
            <TerminalView
              logs={terminalLogs}
              onSendCommand={handleSendCommand}
              onClear={handleClearTerminal}
              status={status}
              language={language}
            />
          </div>
        </div>
      </main>

      {/* Profile Manager Modal */}
      <ProfileManager
        isOpen={isProfilesOpen}
        onClose={() => setIsProfilesOpen(false)}
        currentConfig={config}
        onApplyProfile={handleApplyProfile}
        onInjectProfileDirect={handleInjectProfileDirect}
        isConnected={status === 'connected'}
        language={language}
      />

      {/* Audit Logs Modal */}
      <AuditLogModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        language={language}
      />

      {/* Switch Maintenance Operations Modal (Backup, Reboot, Factory Reset) */}
      <SwitchOperationsModal
        isOpen={isOperationsOpen}
        onClose={() => setIsOperationsOpen(false)}
        config={config}
        portInfo={portInfo}
        isConnected={status === 'connected'}
        language={language}
      />

      {/* Progress & Live Injection Modal */}
      <InjectionModal
        isOpen={isInjectingModalOpen}
        onClose={() => setIsInjectingModalOpen(false)}
        onAbort={handleAbortInjection}
        percent={injectionProgress.percent}
        currentStepIndex={injectionProgress.currentStepIndex}
        totalSteps={injectionProgress.totalSteps}
        currentCommand={injectionProgress.currentCommand}
        statusText={injectionProgress.statusText}
        isFinished={injectionProgress.isFinished}
        hasError={injectionProgress.hasError}
        config={config}
        pacingMs={pacingMs}
        onPacingChange={setPacingMs}
        language={language}
      />

      {/* Quick Help Modal */}
      <QuickHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        language={language}
      />

      {/* Dedicated Footer with Koorosh Afshar and Loh-e Sabz-e Jonoob */}
      <Footer language={language} />
    </div>
  );
}
