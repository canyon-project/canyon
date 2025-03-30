import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../../packages/backend/*.gql',
  documents: ['src/**/*.graphql'],
  generates: {
    './src/graphql/gen/': {
      preset: 'client',
      presetConfig: {
        persistedDocuments: 'string',
      },
    },
  },
};

export default config;
