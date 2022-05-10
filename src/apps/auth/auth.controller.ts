import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import axios from 'axios'
import { UserService } from './user.service'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // user
  @UseGuards(JwtAuthGuard)
  @Get('/user')
  async getUserinfo(@Request() request: { user: { id: number } }) {
    console.log(request.user.id)

    return this.authService.getUserinfo({ userId: request.user.id })
  }

  @Post('/oauth/token')
  async oauthToken(
    @Request() request: { user: { id: number } },
    @Body() params: any,
  ) {
    return this.authService.oauthToken(params)
  }
}
