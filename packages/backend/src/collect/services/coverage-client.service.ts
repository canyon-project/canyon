import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';

@Injectable()
export class CoverageClientService {
  constructor(private readonly prisma: PrismaService) {}

  async invoke(reporter: string, coverageClientDto: CoverageClientDto) {
    return this.prisma.log.create({
      data: {
        // @ts-expect-error
        content: coverageClientDto,
      },
    });
  }
}
