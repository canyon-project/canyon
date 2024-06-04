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
  if (path.includes('#')) {
    const sourcecode = await axios
      .get(`/api/sourcecode`, {
        params: {
          projectID: `tripgl-${projectID}-auto`,
          sha: sha,
          filepath: path.split('#')[0],
          mode: 'blurred',
        },
      })
      .then(({ data }) => data)
      .then(({ content }) => getDecode(content));

    // console.log(sourcecode, 'sourcecode????');
    return {
      sourcecode: sourcecode,
    };
  } else {
    const sourcecode = await new Promise((resolve, reject) => {
      resolve('');
    });
    return {
      sourcecode: sourcecode,
    };
    // return {
    //   sourcecode: '',
    // };
  }
};
