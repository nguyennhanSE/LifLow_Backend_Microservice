
import { Injectable, Logger } from '@nestjs/common';

type LogLevel = 'log' | 'error' | 'warn' | 'debug';

@Injectable()
export class AppLogger {
  private readonly debugLog: boolean;

  constructor(private readonly logger: Logger) {
    this.debugLog = process.env.DEBUG_LOG !== 'false';
    this.logger.log(
      `Debug logging is ${this.debugLog ? 'ENABLED' : 'DISABLED'}.`,
      AppLogger.name,
    );
  }

  public error(message: unknown, ...optionalParams: unknown[]): void {
    this.logMessage('error', message, ...optionalParams);
  }

  public warn(message: unknown, ...optionalParams: unknown[]): void {
    this.logMessage('warn', message, ...optionalParams);
  }

  public log(message: unknown, ...optionalParams: unknown[]): void {
    this.logMessage('log', message, ...optionalParams);
  }

  public debug(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.debugLog) {
      return;
    }

    this.logMessage('debug', message, ...optionalParams);
  }

  private logMessage(
    level: LogLevel,
    message: unknown,
    ...optionalParams: unknown[]
  ): void {
    const context = this.extractContext(optionalParams);
    const finalMessage = this.formatMessage(message);

    if (level === 'error') {
      const trace = this.extractTrace(message, optionalParams);
      this.logger.error(finalMessage, trace, context);
      return;
    }
    if (context) {
      this.logger[level](finalMessage, ...optionalParams, context);
      return;
    }

    this.logger[level](finalMessage, ...optionalParams);
  }

  private extractContext(optionalParams: unknown[]): string | undefined {
    const lastParam = optionalParams.at(-1);
    if (typeof lastParam !== 'string') {
      return undefined;
    }

    optionalParams.pop();
    return lastParam;
  }

  private formatMessage(message: unknown): string {
    if (message instanceof Error) {
      return message.message;
    }

    if (typeof message === 'string') {
      return message;
    }

    return JSON.stringify(message);
  }

  private extractTrace(
    message: unknown,
    optionalParams: unknown[],
  ): string | undefined {
    if (message instanceof Error) {
      return message.stack;
    }

    const errorParam = optionalParams.find(
      (param): param is Error => param instanceof Error,
    );

    return errorParam?.stack;
  }
}
