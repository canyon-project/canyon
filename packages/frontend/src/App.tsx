// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css';

import { useQuery } from '@apollo/client/react';
import { RepoDocument } from '@/helpers/backend/gen/graphql.ts';

function App() {
  // const [count, setCount] = useState(0)
  const { data } = useQuery(RepoDocument, {
    variables: {
      collectionID: 's',
    },
  });
  return (
    <>
      <div>{JSON.stringify(data || {})}</div>
    </>
  );
}

export default App;
