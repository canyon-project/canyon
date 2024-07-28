import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
function removeEmptyValues(obj) {
  for (const key in obj) {
    if (
      obj[key] === undefined ||
      obj[key] === null ||
      obj[key] === "__null__"
    ) {
      delete obj[key];
    }
  }
  return obj;
}
@Injectable()
export class UpdateProjectService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(currentUser, projectID, otherData) {
    return this.prisma.project.update({
      where: {
        id: projectID,
      },
      data: removeEmptyValues(otherData),
    });
  }
}
