import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class DeleteProjectRecordService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(currentUser, projectID, sha) {
    console.log(currentUser, 'currentUser');
    const members = await this.prisma.project
      .findFirst({
        where: {
          id: projectID,
        },
      })
      .then((res) => res.members);
    console.log(members);

    if (
      // @ts-ignore
      !members.map((member) => member.userID).includes(String(currentUser.id))
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: '没有权限删除',
        },
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      return this.prisma.coverage
        .deleteMany({
          where: {
            projectID,
            sha,
          },
        })
        .then((res) => {
          return {
            count: res.count || 0,
          };
        });
    }
  }
}
