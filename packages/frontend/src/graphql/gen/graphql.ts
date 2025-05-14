/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type CaseModel = {
  __typename?: 'CaseModel';
  failureCount: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  reportID: Scalars['String']['output'];
  reportProvider: Scalars['String']['output'];
  status: Scalars['String']['output'];
  successCount: Scalars['Float']['output'];
  type: Scalars['String']['output'];
};

export type CommitModel = {
  __typename?: 'CommitModel';
  branches: Array<Scalars['String']['output']>;
  commitCreatedAt: Scalars['DateTime']['output'];
  commitMessage: Scalars['String']['output'];
  coverage?: Maybe<Scalars['Float']['output']>;
  sha: Scalars['String']['output'];
};

export type ConfigRecord = {
  __typename?: 'ConfigRecord';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  key: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  value: Scalars['String']['output'];
};

export type CoverageMetricsModel = {
  __typename?: 'CoverageMetricsModel';
  e2eCoverage: Scalars['Float']['output'];
  unitTestCoverage: Scalars['Float']['output'];
};

export type CoverageRecordsModel = {
  __typename?: 'CoverageRecordsModel';
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GetCoveragesResponseModel = {
  __typename?: 'GetCoveragesResponseModel';
  data: Array<CoverageRecordsModel>;
  total: Scalars['Float']['output'];
};

export type GetProjectCommitCoverageResponseModel = {
  __typename?: 'GetProjectCommitCoverageResponseModel';
  buildID: Scalars['String']['output'];
  coverage: CoverageMetricsModel;
  reports: Array<ReportModel>;
};

export type GetProjectCommitsResponseModel = {
  __typename?: 'GetProjectCommitsResponseModel';
  data: Array<CommitModel>;
  total: Scalars['Float']['output'];
};

export type GetProjectsResponseModel = {
  __typename?: 'GetProjectsResponseModel';
  data: Array<ProjectRecordsModel>;
  total: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  updateConfig: ConfigRecord;
  updateUserSettings: UpdateUserSettingsResponseModel;
};


export type MutationUpdateConfigArgs = {
  input: UpdateConfigInput;
};


export type MutationUpdateUserSettingsArgs = {
  language?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectRecordsModel = {
  __typename?: 'ProjectRecordsModel';
  branchOptions: Array<Scalars['String']['output']>;
  bu: Scalars['String']['output'];
  coverage: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  defaultBranch: Scalars['String']['output'];
  description: Scalars['String']['output'];
  favored: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  lastReportTime: Scalars['DateTime']['output'];
  maxCoverage: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  pathWithNamespace: Scalars['String']['output'];
  reportTimes: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  configs: Array<ConfigRecord>;
  /** 获取Coverage列表 */
  getCoverages: GetCoveragesResponseModel;
  /** 获取项目提交覆盖率 */
  getProjectCommitCoverage: Array<GetProjectCommitCoverageResponseModel>;
  /** 获取项目提交记录 */
  getProjectCommits: GetProjectCommitsResponseModel;
  /** 获取Project */
  getProjects: GetProjectsResponseModel;
  /** 提供执行此查询的用户的详细信息（通过授权 Bearer 标头） */
  me: UserModel;
};


export type QueryGetCoveragesArgs = {
  current: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};


export type QueryGetProjectCommitCoverageArgs = {
  projectID: Scalars['ID']['input'];
  sha: Scalars['String']['input'];
};


export type QueryGetProjectCommitsArgs = {
  branch?: InputMaybe<Scalars['String']['input']>;
  current: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  projectID: Scalars['ID']['input'];
};


export type QueryGetProjectsArgs = {
  bu: Array<Scalars['String']['input']>;
  current: Scalars['Int']['input'];
  favorOnly: Scalars['Boolean']['input'];
  field: Scalars['String']['input'];
  keyword: Scalars['String']['input'];
  order: Scalars['String']['input'];
  pageSize: Scalars['Int']['input'];
};

export type ReportModel = {
  __typename?: 'ReportModel';
  cases: Array<CaseModel>;
  coveragePercentage: Scalars['Float']['output'];
  reportID: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type UpdateConfigInput = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type UpdateUserSettingsResponseModel = {
  __typename?: 'UpdateUserSettingsResponseModel';
  language: Scalars['String']['output'];
  theme: Scalars['String']['output'];
};

export type UserModel = {
  __typename?: 'UserModel';
  avatar: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  favor: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  nickname: Scalars['String']['output'];
  password: Scalars['String']['output'];
  settings: UserSettingsModel;
  username: Scalars['String']['output'];
};

export type UserSettingsModel = {
  __typename?: 'UserSettingsModel';
  language: Scalars['String']['output'];
  theme: Scalars['String']['output'];
};

export type UpdateConfigMutationVariables = Exact<{
  input: UpdateConfigInput;
}>;


export type UpdateConfigMutation = { __typename?: 'Mutation', updateConfig: { __typename?: 'ConfigRecord', id: string, key: string, value: string } };

export type UpdateUserSettingsMutationVariables = Exact<{
  theme?: InputMaybe<Scalars['String']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateUserSettingsMutation = { __typename?: 'Mutation', updateUserSettings: { __typename?: 'UpdateUserSettingsResponseModel', theme: string, language: string } };

export type GetProjectCommitCoverageQueryVariables = Exact<{
  projectID: Scalars['ID']['input'];
  sha: Scalars['String']['input'];
}>;


export type GetProjectCommitCoverageQuery = { __typename?: 'Query', getProjectCommitCoverage: Array<{ __typename?: 'GetProjectCommitCoverageResponseModel', buildID: string, coverage: { __typename?: 'CoverageMetricsModel', e2eCoverage: number, unitTestCoverage: number }, reports: Array<{ __typename?: 'ReportModel', reportID: string, type: string, coveragePercentage: number, cases: Array<{ __typename?: 'CaseModel', reportID: string, name: string, status: string, successCount: number, failureCount: number, reportProvider: string, type: string }> }> }> };

export type GetProjectCommitsQueryVariables = Exact<{
  projectID: Scalars['ID']['input'];
  branch?: InputMaybe<Scalars['String']['input']>;
  current: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
}>;


export type GetProjectCommitsQuery = { __typename?: 'Query', getProjectCommits: { __typename?: 'GetProjectCommitsResponseModel', total: number, data: Array<{ __typename?: 'CommitModel', sha: string, commitMessage: string, commitCreatedAt: any, branches: Array<string>, coverage?: number | null }> } };

export type GetProjectsQueryVariables = Exact<{
  current: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  keyword: Scalars['String']['input'];
  bu: Array<Scalars['String']['input']> | Scalars['String']['input'];
  field: Scalars['String']['input'];
  order: Scalars['String']['input'];
  favorOnly: Scalars['Boolean']['input'];
}>;


export type GetProjectsQuery = { __typename?: 'Query', getProjects: { __typename?: 'GetProjectsResponseModel', total: number, data: Array<{ __typename?: 'ProjectRecordsModel', id: string, pathWithNamespace: string, description: string, bu: string, reportTimes: number, lastReportTime: any, maxCoverage: number, favored: boolean }> } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'UserModel', id: string, username: string, password: string, nickname: string, avatar: string, email: string, settings: { __typename?: 'UserSettingsModel', theme: string, language: string } } };


export const UpdateConfigDocument = {"__meta__":{"hash":"d6da2eb946c72055c0604cdbd55b8db4a88d5582"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateConfig"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateConfigInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<UpdateConfigMutation, UpdateConfigMutationVariables>;
export const UpdateUserSettingsDocument = {"__meta__":{"hash":"9dbe00936d1b64f960e68079bcba1340205b364b"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"theme"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"language"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"theme"},"value":{"kind":"Variable","name":{"kind":"Name","value":"theme"}}},{"kind":"Argument","name":{"kind":"Name","value":"language"},"value":{"kind":"Variable","name":{"kind":"Name","value":"language"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"theme"}},{"kind":"Field","name":{"kind":"Name","value":"language"}}]}}]}}]} as unknown as DocumentNode<UpdateUserSettingsMutation, UpdateUserSettingsMutationVariables>;
export const GetProjectCommitCoverageDocument = {"__meta__":{"hash":"179e28124560fea2c19024bf14e2aae077098175"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProjectCommitCoverage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sha"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProjectCommitCoverage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectID"}}},{"kind":"Argument","name":{"kind":"Name","value":"sha"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sha"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"buildID"}},{"kind":"Field","name":{"kind":"Name","value":"coverage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"e2eCoverage"}},{"kind":"Field","name":{"kind":"Name","value":"unitTestCoverage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportID"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"coveragePercentage"}},{"kind":"Field","name":{"kind":"Name","value":"cases"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportID"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"successCount"}},{"kind":"Field","name":{"kind":"Name","value":"failureCount"}},{"kind":"Field","name":{"kind":"Name","value":"reportProvider"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetProjectCommitCoverageQuery, GetProjectCommitCoverageQueryVariables>;
export const GetProjectCommitsDocument = {"__meta__":{"hash":"456155ae55ca0174d02bff1cd8d1e184e0c801e5"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProjectCommits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"branch"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"current"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProjectCommits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectID"}}},{"kind":"Argument","name":{"kind":"Name","value":"branch"},"value":{"kind":"Variable","name":{"kind":"Name","value":"branch"}}},{"kind":"Argument","name":{"kind":"Name","value":"current"},"value":{"kind":"Variable","name":{"kind":"Name","value":"current"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sha"}},{"kind":"Field","name":{"kind":"Name","value":"commitMessage"}},{"kind":"Field","name":{"kind":"Name","value":"commitCreatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"branches"}},{"kind":"Field","name":{"kind":"Name","value":"coverage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<GetProjectCommitsQuery, GetProjectCommitsQueryVariables>;
export const GetProjectsDocument = {"__meta__":{"hash":"e876539daa68e6380e0d5882d6bf375a73b2186c"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"current"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bu"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"field"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"favorOnly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"current"},"value":{"kind":"Variable","name":{"kind":"Name","value":"current"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"bu"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bu"}}},{"kind":"Argument","name":{"kind":"Name","value":"field"},"value":{"kind":"Variable","name":{"kind":"Name","value":"field"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}},{"kind":"Argument","name":{"kind":"Name","value":"favorOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"favorOnly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pathWithNamespace"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"bu"}},{"kind":"Field","name":{"kind":"Name","value":"reportTimes"}},{"kind":"Field","name":{"kind":"Name","value":"lastReportTime"}},{"kind":"Field","name":{"kind":"Name","value":"maxCoverage"}},{"kind":"Field","name":{"kind":"Name","value":"favored"}}]}}]}}]}}]} as unknown as DocumentNode<GetProjectsQuery, GetProjectsQueryVariables>;
export const MeDocument = {"__meta__":{"hash":"6b1957d6e6fc59a4a1e1171a202834bc02831943"},"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"password"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"theme"}},{"kind":"Field","name":{"kind":"Name","value":"language"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;