import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { ServerOptions } from 'socket.io';
import type { RedisClient } from 'libs/redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;
  private pubClient?: RedisClient;
  private subClient?: RedisClient;

  constructor(
    app: INestApplicationContext,
    private readonly redisClient: RedisClient,
  ) {
    super(app);
  }

  connectToRedis() {
    this.pubClient = this.redisClient.duplicate();
    this.subClient = this.redisClient.duplicate();
    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }

  async close() {
    await Promise.all([
      this.quitClient(this.pubClient),
      this.quitClient(this.subClient),
    ]);
  }

  private async quitClient(client?: RedisClient) {
    if (!client || client.status === 'end') {
      return;
    }

    try {
      await client.quit();
    } catch {
      client.disconnect();
    }
  }
}
