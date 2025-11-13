import * as os from 'node:os';
import { Controller, Get, Req } from '@nestjs/common';

function parseBrowser(ua: string | undefined): string {
  const s = ua || '';
  const edge = s.match(/Edg\/(\d+\.?\d*)/);
  if (edge) return `Edge ${edge[1]}`;
  const chrome = s.match(/Chrome\/(\d+\.?\d*)/);
  if (chrome && !s.includes('OPR/') && !s.includes('Edg/'))
    return `Chrome ${chrome[1]}`;
  const ff = s.match(/Firefox\/(\d+\.?\d*)/);
  if (ff) return `Firefox ${ff[1]}`;
  const safari = s.match(/Version\/(\d+\.?\d*).*Safari/);
  if (safari && s.includes('Safari') && !s.includes('Chrome'))
    return `Safari ${safari[1]}`;
  return 'Unknown Browser';
}

@Controller('api/runtime')
export class RuntimeController {
  @Get()
  runtime(@Req() req: any) {
    const ua = req?.headers?.['user-agent'] as string | undefined;
    return {
      timestamp: new Date().toISOString(),
      server: {
        node: process.version,
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
        uptimeSec: Math.floor(process.uptime()),
        pid: process.pid,
      },
      client: {
        userAgent: ua || '',
        browser: parseBrowser(ua),
      },
    };
  }
}
