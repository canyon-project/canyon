import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Project } from '../project.model';
import { percent } from '../../utils/utils';
import { getProjectByID } from 'src/adapter/gitlab.adapter';
// import { getProjectByID } from '../adapter/gitlab.adapter';
function parseGitLabUrl(gitLabUrl) {
  // 匹配 GitLab URL 的正则表达式
  const gitLabRegex = /^(?:https?:\/\/)?([^\/]+)\/(.+)$/;

  // 尝试匹配正则表达式
  const match = gitLabUrl.match(gitLabRegex);

  if (match) {
    // 提取匹配的组和仓库名
    const groupAndRepo = match[2].split('/');
    const groupName = groupAndRepo.slice(0, -1).join('/');
    const repositoryName = groupAndRepo.slice(-1)[0];
    return { groupName, repositoryName };
  } else {
    // 如果没有匹配到，返回 null
    return { groupName: null, repositoryName: null };
  }
}

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}
  async checkProjectUrl(user, projectUrl) {
    let project = '';
    if (isNaN(Number(projectUrl))) {
      project = `${parseGitLabUrl(projectUrl).groupName}%2F${
        parseGitLabUrl(projectUrl).repositoryName
      }`;
    } else {
      project = projectUrl;
    }

    const { path_with_namespace, name, id, description } = await getProjectByID(
      project,
      'accessToken',
    );

    return {
      id: String(id),
      pathWithNamespace: path_with_namespace,
      name: name,
      description: description,
    };
  }

  async createProject(user, projectID) {
    const { accessToken } = await this.prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });
    const { path_with_namespace, description, name, bu } = await getProjectByID(
      projectID,
      accessToken,
    );
    return this.prisma.project.create({
      data: {
        id: String(projectID),
        pathWithNamespace: path_with_namespace,
        name: name,
        description: description || '',
        bu: bu || '默认',
        coverage: '',
        tag: '',
        defaultBranch: '-',
      },
    });
  }

  async deleteProject(user, projectID) {
    return this.prisma.project.delete({
      where: {
        id: projectID,
      },
    });
  }

  async updateProject(
    user,
    projectID,
    description,
    tag,
    coverage,
    defaultBranch,
  ) {
    function removeEmptyValues(obj) {
      for (const key in obj) {
        if (
          obj[key] === undefined ||
          obj[key] === null ||
          obj[key] === '__null__'
        ) {
          delete obj[key];
        }
      }
      return obj;
    }
    return this.prisma.project.update({
      where: {
        id: projectID,
      },
      data: removeEmptyValues({
        description: description,
        tag: tag,
        coverage: coverage,
        defaultBranch: defaultBranch,
      }),
    });
  }

  async getProjectByID(projectID): Promise<Project> {
    const branchOptions = await this.prisma.coverage
      .groupBy({
        by: ['branch'],
        where: {
          projectID: projectID,
        },
      })
      .then((res) => res.map((item) => item.branch));
    return this.prisma.project
      .findFirst({
        where: {
          id: projectID,
        },
      })
      .then(
        ({
          id,
          name,
          pathWithNamespace,
          description,
          bu,
          createdAt,
          coverage,
          tag,
          defaultBranch,
        }) => {
          return {
            id,
            name,
            pathWithNamespace,
            description,
            createdAt,
            bu: bu,
            reportTimes: 0,
            lastReportTime: new Date(),
            maxCoverage: 0,
            tag,
            coverage,
            defaultBranch,
            branchOptions,
          };
        },
      );
  }

  async getProjectsBuOptions() {
    return this.prisma.project
      .groupBy({
        by: ['bu'],
        _count: true,
      })
      .then((res) => {
        return res.map((item) => {
          return {
            bu: item.bu,
            count: item._count,
          };
        });
      });
  }
}
