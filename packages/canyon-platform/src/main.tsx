import './index.css';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// 创建一个http link来发送GraphQL请求
const httpLink = createHttpLink({
  uri: '/graphql', // 你的GraphQL API的URL
  headers: {
    Authorization: `Bearer ` + (localStorage.getItem('token') || ''),
  },
});

// 创建Apollo Client实例
const client = new ApolloClient({
  link: httpLink, // 将error link和http link组合起来
  cache: new InMemoryCache(),
});

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </StrictMode>,
  );
}
