import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import * as TestExclude from "test-exclude";
@Injectable()
export class TestExcludeService {
  constructor(private readonly prisma: PrismaService) {}

  async invoke(projectID, coverage) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectID,
      },
    });

    let matchRule: any = {}; // Default value

    try {
      // Attempt to parse project?.coverage
      matchRule = JSON.parse(project?.coverage || "{}");
    } catch (error) {
      // console.error('Error parsing coverage:', error);
      // Log the error or handle it as needed
      // You can also return an empty object or any default value
    }
    const exclude = new TestExclude({
      cwd: "~",
      include: matchRule.include,
      exclude: (matchRule.exclude || []).concat(["var/*", "builds/*"]),
      extension: matchRule.extensions,
    });

    const filterCoverage = {};

    for (const filterCoverageKey of Object.keys(coverage)) {
      if (exclude.shouldInstrument(filterCoverageKey)) {
        filterCoverage[filterCoverageKey] = coverage[filterCoverageKey];
      }
    }
    return Object.keys(filterCoverage).length > 0 ? filterCoverage : coverage;
  }
}
