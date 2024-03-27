import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class CoveragedataController {
  constructor(private prisma: PrismaService) {}

  @Post('/coverage-data')
  async createCd(@Body() body: any) {
    return await this.prisma.coverageData
      .create({
        data: {
          compresseddata: body.compresseddata,
        },
      })
      .then((res) => ({
        insertedId: res.id,
      }));
  }

  @Get('/coverage-data/:id')
  async getCd(@Param('id') id: string) {
    return await this.prisma.coverageData.findFirst({
      where: {
        id: id,
      },
    });
  }

  @Delete('/coverage-data/:id')
  async deleteCd(@Param('id') id: string) {
    return await this.prisma.coverageData.delete({
      where: {
        id: id,
      },
    });
  }
}
