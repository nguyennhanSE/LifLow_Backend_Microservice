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

  get<TValue>(key: string, defaultValue: TValue): TValue {
    return this.configService.get<TValue>(key) ?? defaultValue;
  }
}
