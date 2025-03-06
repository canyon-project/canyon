import { Controller, Get, Query } from "@nestjs/common";
import { CodeService } from "./code.service";
import {Codechange2Service} from "./codechange2.service";

interface CodeResponse {
  oldContent: string;
  content: string;
  additions:number[];
  compareTarget: string;
}

@Controller("")
export class CodeController {
  constructor(
    private readonly sourcecodeService: CodeService,
    private readonly codechange2Service: Codechange2Service
  ) {}
  @Get("api/code")
  async code(@Query() query): Promise<CodeResponse> {
    const { projectID, sha, filepath } = query;


    const codechange = await this.codechange2Service.getCodechange(sha, filepath);
    const sourcecode = await this.sourcecodeService.getsourcecode(projectID, sha, filepath);


    if (codechange.compareTarget ===sha){
      return {
        compareTarget: codechange.compareTarget,
        oldContent: '',
        content: sourcecode.content,
        additions: codechange.additions,
      }
    } else {
      const oldSourcecode = await this.sourcecodeService.getsourcecode(projectID, codechange.compareTarget, filepath);
      return {
        compareTarget: codechange.compareTarget,
        oldContent: oldSourcecode.content,
        content: sourcecode.content,
        additions: codechange.additions,
      }
    }
  }
}
