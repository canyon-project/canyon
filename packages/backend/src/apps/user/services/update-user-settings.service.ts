import { Injectable } from '@nestjs/common';
import {PrismaService} from "../../../prisma/prisma.service";
import {userSettingZod} from "../user.zod";
// import { UserSettings } from '../userSettings';
// import { UserSettingsInput } from '../userSettingsInput';

@Injectable()
export class UpdateUserSettingsService {
  constructor(
    private readonly prisma: PrismaService
  ) {
  }
  // 当前用户 currentUser
  async invoke(currentUser,args) {
    console.log('currentUser',currentUser,'args',args)
    const xiancha = await this.prisma.user.findFirst({
      where:{
        id:currentUser
      }
    })

    return this.prisma.user.update({
      where: {
        id: currentUser
      },
      data: {
        settings: {
          ...userSettingZod.parse(xiancha?.settings),
          ...args
        }
      }
    }).then(r=>{
      console.log(r)
      if (r) {
        return userSettingZod.parse(r.settings)
      } else {
        return {
          theme:'auto',
          language: 'auto'
        }
      }
    })
  }
}
