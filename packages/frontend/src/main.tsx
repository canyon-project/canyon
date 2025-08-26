import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
import App from './App.tsx'

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:8080/graphql' }),
  cache: new InMemoryCache(),
})

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
)
