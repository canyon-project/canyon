import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class UserController {
  constructor(private readonly prismaService: PrismaService) {}
  @UseGuards(JwtAuthGuard)
  @Get('/api/user')
  getHello(@Request() req): Promise<any> {
    return this.prismaService.user.findFirst({
      where: {
        id: req.user.id,
      },
    });
  }
}
