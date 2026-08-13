import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  getOrThrow<TValue>(key: string): TValue {
    const value = this.configService.get<TValue>(key);

    if (value === undefined || value === null || value === '') {
      throw new Error(`Missing configuration value: ${key}`);
    }

    return value;
  }

  get<TValue>(key: string): TValue | undefined;
  get<TValue>(key: string, defaultValue: TValue): TValue;
  get<TValue>(key: string, defaultValue?: TValue): TValue | undefined {
    const value = this.configService.get<TValue>(key);
    return value ?? defaultValue;
  }
}
