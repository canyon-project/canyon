import './useWorker.ts'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

const client = new ApolloClient({
  link: new HttpLink({ uri: '/graphql' }),
  cache: new InMemoryCache(),
})

createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
)
