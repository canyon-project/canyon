/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation UpdateConfig($input: UpdateConfigInput!) {\n  updateConfig(input: $input) {\n    id\n    key\n    value\n  }\n}": typeof types.UpdateConfigDocument,
    "mutation UpdateUserSettings($theme: String, $language: String) {\n  updateUserSettings(theme: $theme, language: $language) {\n    theme\n    language\n  }\n}": typeof types.UpdateUserSettingsDocument,
    "query GetProjectCommitCoverage($projectID: ID!, $sha: String!) {\n  getProjectCommitCoverage(projectID: $projectID, sha: $sha) {\n    buildID\n    coverage {\n      e2eCoverage\n      unitTestCoverage\n    }\n    reports {\n      reportID\n      type\n      coveragePercentage\n      cases {\n        reportID\n        name\n        status\n        successCount\n        failureCount\n        reportProvider\n        type\n      }\n    }\n  }\n}": typeof types.GetProjectCommitCoverageDocument,
    "query GetProjectCommits($projectID: ID!, $branch: String, $current: Int!, $pageSize: Int!) {\n  getProjectCommits(\n    projectID: $projectID\n    branch: $branch\n    current: $current\n    pageSize: $pageSize\n  ) {\n    data {\n      sha\n      commitMessage\n      commitCreatedAt\n      branches\n      coverage\n    }\n    total\n  }\n}": typeof types.GetProjectCommitsDocument,
    "query GetProjects($current: Int!, $pageSize: Int!, $keyword: String!, $bu: [String!]!, $field: String!, $order: String!, $favorOnly: Boolean!) {\n  getProjects(\n    current: $current\n    pageSize: $pageSize\n    keyword: $keyword\n    bu: $bu\n    field: $field\n    order: $order\n    favorOnly: $favorOnly\n  ) {\n    total\n    data {\n      id\n      pathWithNamespace\n      description\n      bu\n      reportTimes\n      lastReportTime\n      maxCoverage\n      favored\n    }\n  }\n}": typeof types.GetProjectsDocument,
    "query Me {\n  me {\n    id\n    username\n    password\n    nickname\n    avatar\n    email\n    settings {\n      theme\n      language\n    }\n  }\n}": typeof types.MeDocument,
};
const documents: Documents = {
    "mutation UpdateConfig($input: UpdateConfigInput!) {\n  updateConfig(input: $input) {\n    id\n    key\n    value\n  }\n}": types.UpdateConfigDocument,
    "mutation UpdateUserSettings($theme: String, $language: String) {\n  updateUserSettings(theme: $theme, language: $language) {\n    theme\n    language\n  }\n}": types.UpdateUserSettingsDocument,
    "query GetProjectCommitCoverage($projectID: ID!, $sha: String!) {\n  getProjectCommitCoverage(projectID: $projectID, sha: $sha) {\n    buildID\n    coverage {\n      e2eCoverage\n      unitTestCoverage\n    }\n    reports {\n      reportID\n      type\n      coveragePercentage\n      cases {\n        reportID\n        name\n        status\n        successCount\n        failureCount\n        reportProvider\n        type\n      }\n    }\n  }\n}": types.GetProjectCommitCoverageDocument,
    "query GetProjectCommits($projectID: ID!, $branch: String, $current: Int!, $pageSize: Int!) {\n  getProjectCommits(\n    projectID: $projectID\n    branch: $branch\n    current: $current\n    pageSize: $pageSize\n  ) {\n    data {\n      sha\n      commitMessage\n      commitCreatedAt\n      branches\n      coverage\n    }\n    total\n  }\n}": types.GetProjectCommitsDocument,
    "query GetProjects($current: Int!, $pageSize: Int!, $keyword: String!, $bu: [String!]!, $field: String!, $order: String!, $favorOnly: Boolean!) {\n  getProjects(\n    current: $current\n    pageSize: $pageSize\n    keyword: $keyword\n    bu: $bu\n    field: $field\n    order: $order\n    favorOnly: $favorOnly\n  ) {\n    total\n    data {\n      id\n      pathWithNamespace\n      description\n      bu\n      reportTimes\n      lastReportTime\n      maxCoverage\n      favored\n    }\n  }\n}": types.GetProjectsDocument,
    "query Me {\n  me {\n    id\n    username\n    password\n    nickname\n    avatar\n    email\n    settings {\n      theme\n      language\n    }\n  }\n}": types.MeDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateConfig($input: UpdateConfigInput!) {\n  updateConfig(input: $input) {\n    id\n    key\n    value\n  }\n}"): (typeof documents)["mutation UpdateConfig($input: UpdateConfigInput!) {\n  updateConfig(input: $input) {\n    id\n    key\n    value\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateUserSettings($theme: String, $language: String) {\n  updateUserSettings(theme: $theme, language: $language) {\n    theme\n    language\n  }\n}"): (typeof documents)["mutation UpdateUserSettings($theme: String, $language: String) {\n  updateUserSettings(theme: $theme, language: $language) {\n    theme\n    language\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetProjectCommitCoverage($projectID: ID!, $sha: String!) {\n  getProjectCommitCoverage(projectID: $projectID, sha: $sha) {\n    buildID\n    coverage {\n      e2eCoverage\n      unitTestCoverage\n    }\n    reports {\n      reportID\n      type\n      coveragePercentage\n      cases {\n        reportID\n        name\n        status\n        successCount\n        failureCount\n        reportProvider\n        type\n      }\n    }\n  }\n}"): (typeof documents)["query GetProjectCommitCoverage($projectID: ID!, $sha: String!) {\n  getProjectCommitCoverage(projectID: $projectID, sha: $sha) {\n    buildID\n    coverage {\n      e2eCoverage\n      unitTestCoverage\n    }\n    reports {\n      reportID\n      type\n      coveragePercentage\n      cases {\n        reportID\n        name\n        status\n        successCount\n        failureCount\n        reportProvider\n        type\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetProjectCommits($projectID: ID!, $branch: String, $current: Int!, $pageSize: Int!) {\n  getProjectCommits(\n    projectID: $projectID\n    branch: $branch\n    current: $current\n    pageSize: $pageSize\n  ) {\n    data {\n      sha\n      commitMessage\n      commitCreatedAt\n      branches\n      coverage\n    }\n    total\n  }\n}"): (typeof documents)["query GetProjectCommits($projectID: ID!, $branch: String, $current: Int!, $pageSize: Int!) {\n  getProjectCommits(\n    projectID: $projectID\n    branch: $branch\n    current: $current\n    pageSize: $pageSize\n  ) {\n    data {\n      sha\n      commitMessage\n      commitCreatedAt\n      branches\n      coverage\n    }\n    total\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetProjects($current: Int!, $pageSize: Int!, $keyword: String!, $bu: [String!]!, $field: String!, $order: String!, $favorOnly: Boolean!) {\n  getProjects(\n    current: $current\n    pageSize: $pageSize\n    keyword: $keyword\n    bu: $bu\n    field: $field\n    order: $order\n    favorOnly: $favorOnly\n  ) {\n    total\n    data {\n      id\n      pathWithNamespace\n      description\n      bu\n      reportTimes\n      lastReportTime\n      maxCoverage\n      favored\n    }\n  }\n}"): (typeof documents)["query GetProjects($current: Int!, $pageSize: Int!, $keyword: String!, $bu: [String!]!, $field: String!, $order: String!, $favorOnly: Boolean!) {\n  getProjects(\n    current: $current\n    pageSize: $pageSize\n    keyword: $keyword\n    bu: $bu\n    field: $field\n    order: $order\n    favorOnly: $favorOnly\n  ) {\n    total\n    data {\n      id\n      pathWithNamespace\n      description\n      bu\n      reportTimes\n      lastReportTime\n      maxCoverage\n      favored\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Me {\n  me {\n    id\n    username\n    password\n    nickname\n    avatar\n    email\n    settings {\n      theme\n      language\n    }\n  }\n}"): (typeof documents)["query Me {\n  me {\n    id\n    username\n    password\n    nickname\n    avatar\n    email\n    settings {\n      theme\n      language\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;