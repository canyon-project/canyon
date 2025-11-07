import '@ant-design/v5-patch-for-react-19';
import './i18n.ts';
// import './useWorker.ts';
// import { createRoot } from 'react-dom/client';
import './index.css';
import {
  ApolloClient,
  CombinedGraphQLErrors,
  from,
  // ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { ApolloProvider } from '@apollo/client/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

// const httpLink = ``

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      );
    });
  } else {
    console.error('[Network error]:', error);
  }
});
const httpLink = new HttpLink({ uri: '/graphql' });

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
);
