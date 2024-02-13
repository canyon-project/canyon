// 这里 css 三部分，以===============分割
const cssCode = `

`;
export const loadCssCode = () => {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(cssCode));
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(style);
};
