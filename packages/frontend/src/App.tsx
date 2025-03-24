// import GlobalProvider from '@/providers/GlobalProvider.tsx';
import { useRoutes } from 'react-router-dom';

import routes from '~react-pages';
import {Suspense} from "react";
console.log(routes,'routes')
const App = () => {
  return (
    <Suspense>
      <>{useRoutes(routes)}</>
    </Suspense>
  );
};

export default App;
