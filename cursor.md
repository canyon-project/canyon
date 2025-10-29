## 架构
- 这个项目是pnpm多仓库模式，packages/frontend是vite前端，有antd、tailwind，packages/backend是nestjs后端
- 前后端交互是用的graphql，新增一个接口的方式是，在backend里加一个graphql，然后生成运行backend项目生成新的packages/backend/schema.gql，然后在packages/frontend/src/helpers/backend/gql里新增graphql文件，然后前端文件夹运行codegen生成，然后用生成的代码