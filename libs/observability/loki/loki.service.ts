import { Injectable } from '@nestjs/common';
import { AppLogger } from 'libs/common/logger';
import { AppConfigService } from 'libs/config';
import type { LokiLogData } from 'libs/observability/loki/types/loki.type';

@Injectable()
export class LokiService {
  private readonly context = LokiService.name;

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: AppLogger,
  ) {}

  async push(log: LokiLogData): Promise<void> {
    const baseUrl = this.configService.get<string>(
      'observability.loki.baseUrl',
      'http://localhost:3100',
    );
    const timestampNs = String(new Date(log.occurredAt).getTime() * 1_000_000);

    const response = await fetch(`${baseUrl}/loki/api/v1/push`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        streams: [
          {
            stream: {
                trace : log.traceId ?? 'n/a',
                requestId: log.requestId ?? 'n/a',
                service: log.serviceName,
                requestPattern: log.requestPattern ?? 'unknown',
                requestStatus: log.requestStatus ?? 'unknown',
            },
            values: [[timestampNs, JSON.stringify(log)]],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Loki push failed with status ${response.status}`);
    }

    this.logger.debug(
      `[${this.context}] Pushed request log ${log.requestId ?? 'n/a'} to Loki`,
      this.context,
    );
  }
}
