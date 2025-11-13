import '@ant-design/v5-patch-for-react-19';
import './i18n.ts';
import './useWorker.ts';
import './index.css';
import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { ApolloProvider } from '@apollo/client/react';
import { message } from 'antd';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message: msg, locations, path }) => {
      console.error(
        `[GraphQL error]: msg: ${msg}, Location: ${locations}, Path: ${path}`,
      );
      message.error(`[GraphQL error]: msg: ${msg}, Path: ${path}`);
    });
  } else {
    message.error(`[Network error]:${error}`);
  }
});
const httpLink = new HttpLink({ uri: '/graphql' });

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
);
