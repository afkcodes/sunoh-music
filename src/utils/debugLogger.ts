
interface LogEntry {
  timestamp: string;
  type: string;
  data: any;
}

class DebugLogger {
  private static instance: DebugLogger;
  private logs: LogEntry[] = [];
  private maxLogs = 500;
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  private constructor() { }

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  log(type: string, data: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type,
      data,
    };
    this.logs = [entry, ...this.logs].slice(0, this.maxLogs);
    this.notify();

    // Also log to console for development convenience
    console.log(`[DEBUG] ${type}:`, JSON.stringify(data));
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clear() {
    this.logs = [];
    this.notify();
  }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.logs));
  }
}

export const debugLogger = DebugLogger.getInstance();
