import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async getHealth() {
    const database = await this.getDatabaseStatus();

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      app: this.config.getOrThrow<string>('app.name'),
      environment: this.config.getOrThrow<string>('app.nodeEnv'),
      uptimeSeconds: Math.round(process.uptime()),
      dependencies: {
        database,
        redis: 'configured'
      }
    };
  }

  private async getDatabaseStatus() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch {
      return 'down';
    }
  }
}
