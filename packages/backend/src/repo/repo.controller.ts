import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RepoService } from './repo.service';

class CreateRepoDto {
  gitlab?: string;
  repoID?: string;
}

@Controller('api/repo')
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  @Post()
  async createRepo(@Body() dto: CreateRepoDto) {
    try {
      const result = await this.repoService.createFromGitlab(dto);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
