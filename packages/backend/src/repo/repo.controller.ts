import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRepoDto } from './dto/create-repo.dto';
import { QueryRepoDto } from './dto/query-repo.dto';
import { UpdateRepoDto } from './dto/update-repo.dto';
import { RepoService } from './repo.service';

@ApiTags('repo')
@Controller('api/repos')
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建仓库' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createRepoDto: CreateRepoDto) {
    return this.repoService.create(createRepoDto);
  }

  @Get('check')
  @ApiOperation({ summary: '检查仓库（拉取 repoID、pathWithNamespace、描述）' })
  @ApiResponse({ status: 200, description: '返回仓库信息' })
  @ApiResponse({ status: 400, description: '配置缺失或请求失败' })
  checkRepo(
    @Query('repoID') repoID: string,
    @Query('provider') provider: string,
  ) {
    return this.repoService.checkRepo(provider, repoID ?? '');
  }

  @Get('bu')
  @ApiOperation({ summary: '获取所有不同的 Bu 值' })
  @ApiResponse({ status: 200, description: '返回所有 Bu 列表' })
  findAllBu() {
    return this.repoService.findAllBu();
  }

  @Get()
  @ApiOperation({ summary: '获取所有仓库列表' })
  @ApiResponse({ status: 200, description: '返回仓库列表' })
  findAll(@Query() queryDto: QueryRepoDto) {
    return this.repoService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 获取仓库详情' })
  @ApiResponse({ status: 200, description: '返回仓库详情' })
  @ApiResponse({ status: 404, description: '仓库不存在' })
  findOne(@Param('id') id: string) {
    return this.repoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新仓库信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '仓库不存在' })
  update(@Param('id') id: string, @Body() updateRepoDto: UpdateRepoDto) {
    return this.repoService.update(id, updateRepoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除仓库' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '仓库不存在' })
  remove(@Param('id') id: string) {
    return this.repoService.remove(id);
  }
}
