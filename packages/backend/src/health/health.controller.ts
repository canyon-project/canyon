import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/auth/public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Public()
@Controller('vi/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }
}
