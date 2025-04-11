import { Editor } from '@monaco-editor/react';

const AdminPage = () => {
  return (
    <div>
      <Editor language={'json'} height={'100vh'} theme={'nightOwl'} />
    </div>
  );
};

export default AdminPage;
