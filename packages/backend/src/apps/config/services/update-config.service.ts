import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../../prisma.service';
import { UpdateConfigInput } from '../models/request/update-config.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UpdateConfigService {
  constructor(private prisma: PrismaService) {}

  async execute(input: UpdateConfigInput) {
    const existingConfig = await this.prisma.config.findFirst({
      where: { key: input.key },
    });

    if (existingConfig) {
      return this.prisma.config.update({
        where: { id: existingConfig.id },
        data: { value: input.value },
      });
    }

    return this.prisma.config.create({
      data: {
        key: input.key,
        value: input.value,
      },
    });
  }
}
