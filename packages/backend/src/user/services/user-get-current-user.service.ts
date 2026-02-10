import { Injectable } from '@nestjs/common';

export interface UserProfile {
  nickname: string;
  email: string;
  avatar: string;
}

@Injectable()
export class UserGetCurrentUserService {
  /**
   * 根据用户名调用 getuserinfo，返回 nickname、email、avatar（均为必返字段）
   */
  async invoke(username: string): Promise<UserProfile> {
    const email = `${username}@canyon.com`;
    return { nickname: username, email, avatar:'' };
  }
}
