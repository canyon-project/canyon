import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { QuerySnapshotDto } from './dto/query-snapshot.dto';
import { UpdateSnapshotDto } from './dto/update-snapshot.dto';
import { SnapshotService } from './snapshot.service';

@ApiTags('snapshot')
@Controller('api/snapshot')
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建快照' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() dto: CreateSnapshotDto) {
    return this.snapshotService.create(dto);
  }

  @Get('records')
  @ApiOperation({ summary: '快照记录列表（按 repoID、provider）' })
  @ApiResponse({ status: 200, description: '返回列表' })
  async list(@Query() query: QuerySnapshotDto) {
    const data = await this.snapshotService.findMany(
      query.repoID ?? '',
      query.provider ?? '',
    );
    return { data };
  }

  @Get(':id/download')
  @ApiOperation({ summary: '下载快照产物' })
  @ApiResponse({ status: 200, description: '返回 zip 文件' })
  @ApiResponse({ status: 404, description: '不存在' })
  @Header('Content-Type', 'application/zip')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { buffer, size } = await this.snapshotService.getArtifactBuffer(id);
    const filename = `snapshot-${id}.zip`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', String(size));
    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单条快照（不含产物）' })
  @ApiResponse({ status: 200, description: '返回详情' })
  @ApiResponse({ status: 404, description: '不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.snapshotService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新快照' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSnapshotDto,
  ) {
    return this.snapshotService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除快照' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.snapshotService.remove(id);
  }
}
