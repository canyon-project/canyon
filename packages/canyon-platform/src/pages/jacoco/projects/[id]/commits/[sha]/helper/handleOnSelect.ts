import axios from 'axios';
function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}
export const handleOnSelect = async ({ path, projectID, sha }) => {
  const sourcecode = await axios
    .get(`/api/sourcecode`, {
      params: {
        projectID: `tripgl-${projectID}-auto`,
        sha: sha,
        filepath: 'implement-customer-management-service-biz/src/main/java/' + path + '.java',
      },
    })
    .then(({ data }) => data)
    .then(({ content }) => getDecode(content));
  return {
    sourcecode: sourcecode,
  };
};
