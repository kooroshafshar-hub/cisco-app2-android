import { CiscoConfig, InjectionStep } from '../types/serial';
import { generateCiscoCommandList } from './configGenerator';
import { serialManager } from './serialService';

export interface InjectionProgressCallback {
  (progress: {
    currentStepIndex: number;
    totalSteps: number;
    percent: number;
    currentCommand: string;
    statusText: string;
    isFinished: boolean;
    hasError: boolean;
  }): void;
}

export class InjectionEngine {
  private abortRequested = false;

  public async runInjection(
    config: CiscoConfig,
    pacingMs = 200,
    onProgress?: InjectionProgressCallback
  ): Promise<{ success: boolean; log: string }> {
    this.abortRequested = false;
    let fullSessionLog = '';

    const appendLog = (msg: string) => {
      fullSessionLog += msg + '\n';
    };

    const commands = generateCiscoCommandList(config);
    const totalSteps = commands.length + 3; // + Wakeup, Bypass dialog, Enable

    const update = (stepIndex: number, cmd: string, statusText: string, finished = false, err = false) => {
      if (onProgress) {
        onProgress({
          currentStepIndex: stepIndex,
          totalSteps,
          percent: Math.min(100, Math.round((stepIndex / totalSteps) * 100)),
          currentCommand: cmd,
          statusText,
          isFinished: finished,
          hasError: err,
        });
      }
    };

    try {
      // Step 0: Wake up console
      update(0, '<Enter>', 'در حال برقراری ارتباط با کنسول و ارسال سیگنال بیدارباش...');
      await serialManager.send('\r\n');
      await this.sleep(350);
      await serialManager.send('\r\n');
      await this.sleep(400);

      if (this.abortRequested) return { success: false, log: fullSessionLog };

      // Step 1: Bypass initial dialog if any
      update(1, 'no', 'بررسی پرامپت اولیه و رد کردن Initial Configuration Dialog...');
      await serialManager.send('no\r\n');
      await this.sleep(300);

      // Step 2: Ensure Enable Privileged Mode
      update(2, 'enable', 'ورود به حالت Privileged EXEC (دستور enable)...');
      await serialManager.send('enable\r\n');
      await this.sleep(300);

      // Step 3+: Sequentially inject each command
      for (let i = 0; i < commands.length; i++) {
        if (this.abortRequested) {
          appendLog('تزریق توسط کاربر متوقف شد.');
          update(i + 3, commands[i], 'تزریق متوقف شد.', true, true);
          return { success: false, log: fullSessionLog };
        }

        const cmd = commands[i];
        const stepNum = i + 3;
        const displayMsg = `در حال ارسال: ${cmd}`;

        update(stepNum, cmd, displayMsg);
        appendLog(`[${stepNum}/${totalSteps}] >> ${cmd}`);

        // Send command
        await serialManager.sendLine(cmd);

        // If crypto key command, it might take a bit longer or prompt replacement
        if (cmd.includes('crypto key generate rsa')) {
          await this.sleep(800);
          // Send 'yes' in case switch asks: Do you really want to replace them? [yes/no]:
          // Or enter if it asks for modulus
          await serialManager.send('yes\r\n');
          await this.sleep(400);
        } else if (cmd === 'write memory' || cmd.includes('copy running-config')) {
          // Saving config takes ~1.5 - 2s on Cisco flash/NVRAM
          await this.sleep(1200);
        } else {
          await this.sleep(pacingMs);
        }
      }

      // Final wake-up enter
      await serialManager.send('\r\n');
      await this.sleep(200);

      update(totalSteps, 'DONE', 'عملیات با موفقیت انجام شد! کانفیگ تزریق و ذخیره گردید.', true, false);
      appendLog('تزریق کانفیگ با موفقیت به پایان رسید.');

      return { success: true, log: fullSessionLog };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      appendLog(`خطا در هنگام تزریق: ${errorMsg}`);
      update(totalSteps, 'ERROR', `خطا: ${errorMsg}`, true, true);
      return { success: false, log: fullSessionLog };
    }
  }

  public abort() {
    this.abortRequested = true;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const injectionEngine = new InjectionEngine();
