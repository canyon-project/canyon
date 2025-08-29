import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: "../../packages/backend/*.gql",
  documents: ['src/**/*.graphql'],
  generates: {
    './src/helpers/backend/gen/': {
      preset: 'client',
      presetConfig: {
        persistedDocuments: 'string',
      },
      config: {
        useTypeImports: true,
      },
    },
  },
};

export default config;
