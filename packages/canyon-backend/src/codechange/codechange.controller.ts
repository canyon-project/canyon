import { Controller, Get, Query } from "@nestjs/common";
// import { Query } from '@nestjs/graphql';
import { CodechangeService } from "./codechange.service";

@Controller("")
export class CodechangeController {
  constructor(private readonly codechangeService: CodechangeService) {}
  @Get("api/codechange")
  getCodechange(@Query() query): Promise<any> {
    const { sha = "", filepath = "" } = query;
    return this.codechangeService.getCodechange(sha, filepath);
  }
}
