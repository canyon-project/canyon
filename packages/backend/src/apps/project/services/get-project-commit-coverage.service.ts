import { Injectable } from '@nestjs/common';
import { GetProjectCommitCoverageResponseModel } from '../models/response/get-project-commit-coverage.response.model';

@Injectable()
export class GetProjectCommitCoverageService {
  async invoke(
    projectID: string,
    commitId: string,
  ): Promise<GetProjectCommitCoverageResponseModel[]> {
    // Mock数据
    return [{
      buildID: 'build_123',
      coverage: {
        e2eCoverage: 85.5,
        unitTestCoverage: 92.3
      },
      reports: [
        {
          reportID: 'report_1',
          type: 'manual',
          coveragePercentage: 92.3,
          cases: [
            {
              reportID: 'case_1',
              name: 'User Authentication Test',
              status: 'passed',
              successCount: 15,
              failureCount: 0,
              reportProvider: 'jest',
              type: 'manual'
            },
            {
              reportID: 'case_2',
              name: 'Data Validation Test',
              status: 'failed',
              successCount: 8,
              failureCount: 2,
              reportProvider: 'jest',
              type: 'manual'
            }
          ]
        },
        {
          reportID: 'report_2',
          type: 'automated',
          coveragePercentage: 85.5,
          cases: [
            {
              reportID: 'case_3',
              name: 'User Flow Test',
              status: 'passed',
              successCount: 10,
              failureCount: 0,
              reportProvider: 'cypress',
              type: 'manual'
            },
            {
              reportID: 'case_4',
              name: 'API Integration Test',
              status: 'passed',
              successCount: 12,
              failureCount: 0,
              reportProvider: 'cypress',
              type: 'manual'
            }
          ]
        }
      ]
    },
      {
        buildID: 'build_321',
        coverage: {
          e2eCoverage: 85.5,
          unitTestCoverage: 92.3
        },
        reports: [
          {
            reportID: 'report_1',
            type: 'manual',
            coveragePercentage: 92.3,
            cases: [
              {
                reportID: 'case_1',
                name: 'User Authentication Test',
                status: 'passed',
                successCount: 15,
                failureCount: 0,
                reportProvider: 'jest',
                type: 'manual'
              },
              {
                reportID: 'case_2',
                name: 'Data Validation Test',
                status: 'failed',
                successCount: 8,
                failureCount: 2,
                reportProvider: 'jest',
                type: 'manual'
              }
            ]
          },
          {
            reportID: 'report_2',
            type: 'automated',
            coveragePercentage: 85.5,
            cases: [
              {
                reportID: 'case_3',
                name: 'User Flow Test',
                status: 'passed',
                successCount: 10,
                failureCount: 0,
                reportProvider: 'cypress',
                type: 'manual'
              },
              {
                reportID: 'case_4',
                name: 'API Integration Test',
                status: 'passed',
                successCount: 12,
                failureCount: 0,
                reportProvider: 'cypress',
                type: 'manual'
              }
            ]
          }
        ]
      }];
  }
}
