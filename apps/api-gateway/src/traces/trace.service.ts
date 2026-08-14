import { Injectable } from '@nestjs/common';
import { AppLogger } from 'libs/common/logger';
import {
  CreateTraceInput,
  TraceRepository,
  UpdateTraceStatusInput,
} from './repositories/trace.repository';

export type StartTraceInput = CreateTraceInput;

export type FinishTraceInput = UpdateTraceStatusInput;

@Injectable()
export class TraceService {
  private readonly context = TraceService.name;

  constructor(
    private readonly traceRepository: TraceRepository,
    private readonly logger: AppLogger,
  ) {}

  async startTrace(input: StartTraceInput): Promise<string> {
    try {
      const trace = await this.traceRepository.createTrace(input);

      return trace.traceId;
    } catch (error) {
      this.logTraceError('Failed to start trace', error);

      return `trace-untracked-${Date.now()}`;
    }
  }

  async finishTrace(input: FinishTraceInput): Promise<void> {
    try {
      await this.traceRepository.updateTraceStatus(input);
    } catch (error) {
      this.logTraceError('Failed to finish trace', error);
    }
  }

  private logTraceError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    this.logger.error(
      `[${this.context}] ${message}: ${errorMessage}`,
      error instanceof Error ? error : undefined,
      this.context,
    );
  }
}
