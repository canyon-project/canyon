import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Project } from '../project.model';
import { getProjectByID } from 'src/adapter/gitlab.adapter';
import { projectMembers, projectTags } from '../project.zod';

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
      description: description || '',
    };
  }

  async createProject(user, projectID, language) {
    // console.log(projectID.split('-'))
    const { path_with_namespace, description, name, bu } = await getProjectByID(
      projectID.split('-')[1],
      'accessToken',
    );
    return this.prisma.project.create({
      data: {
        id: String(projectID),
        pathWithNamespace: path_with_namespace,
        name: name,
        description: description || '',
        bu: bu || '默认',
        coverage: '',
        defaultBranch: '-',
        tags: [],
        members: [],
        language: language,
        instrumentCwd: '',
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
          defaultBranch,
          tags,
          language,
          members,
          instrumentCwd,
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
            coverage,
            defaultBranch,
            branchOptions,
            favored: false,
            language,
            instrumentCwd,
            tags: projectTags.parse(tags).map(({ id, name, link, color }) => ({
              id,
              name,
              link,
              color,
            })),
            members: projectMembers.parse(members).map(({ userID, role }) => ({
              userID,
              role,
            })),
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
