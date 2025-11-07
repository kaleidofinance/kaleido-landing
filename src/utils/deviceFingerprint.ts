import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface DeviceInfo {
  fingerprint: string;
  platform: string;
  userAgent: string;
  screenResolution: string;
  timeZone: string;
  language: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  ipAddress?: string;
}

export async function getDeviceFingerprint(): Promise<DeviceInfo> {
  // Load FingerprintJS
  const fp = await FingerprintJS.load();
  const result = await fp.get();

  return {
    fingerprint: result.visitorId,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || 0
  };
}

export function isBotBehavior(deviceInfo: DeviceInfo): boolean {
  // More lenient bot detection
  const suspiciousFlags = [
    // Only check for very obvious automation signs
    !deviceInfo.hardwareConcurrency && !deviceInfo.deviceMemory, // Missing hardware info
    deviceInfo.userAgent.includes('Headless'), // Headless browser
    deviceInfo.userAgent.includes('Selenium'), // Selenium
    deviceInfo.userAgent.includes('Phantom'), // PhantomJS
    deviceInfo.platform === 'Android' && !deviceInfo.userAgent.includes('Mobile'), // Fake mobile
  ];

  // Require multiple flags to trigger
  return suspiciousFlags.filter(Boolean).length >= 3;
}
