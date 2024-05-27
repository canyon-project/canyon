function extractFileContents(inputString) {
  const regex = /# path=(.*)\n([\s\S]*?)<<<<<< EOF/g;
  const fileContents = [];
  let match;

  while ((match = regex.exec(inputString)) !== null) {
    const [, filePath, fileContent] = match;
    fileContents.push({ filePath, fileContent });
  }

  return fileContents;
}
// safeJSONParse
export function safeJSONParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return {};
  }
}
export function uploadAnalyze(filecontent) {
  const [filenameList, filecontentList] = filecontent.split('<<<<<< network');
  const filenameListFinal = filenameList.split('\n').filter((item) => item);
  const filecontentListFinal = extractFileContents(filecontentList);

  if (
    filecontentListFinal.find((item) => {
      return item.filePath.includes('jacoco.xml');
    })
  ) {
    return {
      type: 'java',
      coverage: filecontentListFinal.find((item) => {
        return item.filePath.includes('jacoco.xml');
      })?.fileContent,
      filenameList: filenameListFinal,
    };
  }

  return {
    type: 'javascript',
    coverage: safeJSONParse(
      filecontentListFinal.find((item) => {
        return item.filePath.includes('coverage/coverage-final.json');
      })?.fileContent,
    ),
    filenameList: filenameListFinal,
  };
}
