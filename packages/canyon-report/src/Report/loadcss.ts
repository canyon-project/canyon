// 这里 css 三部分，以===============分割
const cssCode = `
.box{
    border: 20px solid white;
    border-left: none;
    margin: 0;
    position: relative;
}

.box pre{
    position: relative;
    z-index: 2;
}

.box pre code.hljs{
    padding: 0 !important;
    background-color: unset !important;
}

.box pre code .hljs-tag{
    background-color: unset !important;
}

// ===============

html,body{
    margin: 0;
    padding: 0;
}
#canyon-report {
    font-family: Helvetica Neue, Helvetica, Arial;
    font-size: 14px;
    color: #333;
}

#canyon-report .small {
    font-size: 12px;
}

#canyon-report *,
#canyon-report *:after,
#canyon-report *:before {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
}

#canyon-report h1 {
    font-size: 20px;
    margin: 0;
}

#canyon-report h2 {
    font-size: 14px;
}

#canyon-report pre {
    // font: 12px/1.4 Consolas, "Liberation Mono", Menlo, Courier, monospace;
    margin: 0;
    padding: 0;
    -moz-tab-size: 2;
    -o-tab-size: 2;
    tab-size: 2;
}

#canyon-report a {
    color: #0074D9;
    text-decoration: none;
    cursor: pointer;
}

#canyon-report a:hover {
    text-decoration: underline;
}

#canyon-report .strong {
    font-weight: bold;
}

#canyon-report .space-top1 {
    padding: 10px 0 0 0;
}

#canyon-report .pad2y {
    padding: 20px 0;
}

#canyon-report .pad1y {
    padding: 10px 0;
}

#canyon-report .pad2x {
    padding: 0 20px;
}

#canyon-report .pad2 {
    padding: 20px;
}

#canyon-report .pad1 {
    padding: 10px;
}

#canyon-report .space-left2 {
    padding-left: 55px;
}

#canyon-report .space-right2 {
    padding-right: 20px;
}

#canyon-report .center {
    text-align: center;
}

#canyon-report .clearfix {
    display: block;
}

#canyon-report .clearfix:after {
    content: '';
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
}

#canyon-report .fl {
    float: left;
}

@media only screen and (max-width: 640px) {
    #canyon-report .col3 {
        width: 100%;
        max-width: 100%;
    }

    #canyon-report .hide-mobile {
        display: none !important;
    }

}

#canyon-report .quiet {
    color: #7f7f7f;
    color: rgba(0, 0, 0, 0.5);
}

#canyon-report .quiet a {
    opacity: 0.7;
}

#canyon-report .fraction {
    font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 10px;
    color: #555;
    background: #E8E8E8;
    padding: 4px 5px;
    border-radius: 3px;
    vertical-align: middle;
}

#canyon-report div.path a:link,
#canyon-report div.path a:visited {
    color: #333;
}

#canyon-report table.coverage {
    border-collapse: collapse;
    margin: 10px 0 0 0;
    padding: 0;
}

#canyon-report table.coverage td {
    margin: 0;
    padding: 0;
    vertical-align: top;
}

#canyon-report table.coverage td.line-count {
    text-align: right;
    padding: 0 5px 0 20px;
}

#canyon-report table.coverage td.line-coverage {
    text-align: right;
    padding-right: 10px;
    min-width: 20px;
}

#canyon-report table.coverage td span.cline-any {
    display: inline-block;
    padding: 0 5px;
    width: 100%;
}

#canyon-report .missing-if-branch {
    display: inline-block;
    margin-right: 5px;
    border-radius: 3px;
    position: relative;
    padding: 0 4px;
    background: #333;
    color: yellow;
}

#canyon-report .skip-if-branch {
    display: none;
    margin-right: 10px;
    position: relative;
    padding: 0 4px;
    background: #ccc;
    color: white;
}

#canyon-report .missing-if-branch .typ,
#canyon-report .skip-if-branch .typ {
    color: inherit !important;
}

#canyon-report .coverage-summary {
    border-collapse: collapse;
    width: 100%;
}

#canyon-report .coverage-summary tr {
    border-bottom: 1px solid #bbb;
}

#canyon-report .keyline-all {
    border: 1px solid #ddd;
}

#canyon-report .coverage-summary td,
#canyon-report .coverage-summary th {
    padding: 10px;
}

#canyon-report .coverage-summary tbody {
    border: 1px solid #bbb;
}

#canyon-report .coverage-summary td {
    border-right: 1px solid #bbb;
}

#canyon-report .coverage-summary td:last-child {
    border-right: none;
}

#canyon-report .coverage-summary th {
    text-align: left;
    font-weight: normal;
    white-space: nowrap;
}

#canyon-report .coverage-summary th.file {
    border-right: none !important;
}

#canyon-report .coverage-summary th.pic,
#canyon-report .coverage-summary th.abs,
#canyon-report .coverage-summary td.pct,
#canyon-report .coverage-summary td.abs {
    text-align: right;
}

#canyon-report .coverage-summary td.file {
    white-space: nowrap;
}

#canyon-report .coverage-summary td.pic {
    min-width: 120px !important;
}

#canyon-report .coverage-summary .sorter {
    height: 10px;
    width: 7px;
    display: inline-block;
    margin-left: 0.5em;
    /*background: url(sort-arrow-sprite.png) no-repeat scroll 0 0 transparent;*/
}

#canyon-report .coverage-summary .sorted .sorter {
    background-position: 0 -20px;
}

#canyon-report .coverage-summary .sorted-desc .sorter {
    background-position: 0 -10px;
}

#canyon-report .status-line {
    height: 10px;
}

#canyon-report .cbranch-no {
    background: yellow !important;
    color: #111;
}

#canyon-report .red.solid,
#canyon-report .status-line.low,
#canyon-report .low .cover-fill {
    background: #c21f39;
}

#canyon-report .low .chart {
    border: 1px solid #c21f39;
}

#canyon-report .highlighted,
#canyon-report .highlighted .cstat-no,
#canyon-report .highlighted .fstat-no,
#canyon-report .highlighted .cbranch-no {
    background: #C21F39 !important;
}

#canyon-report .cstat-no,
#canyon-report .fstat-no,
#canyon-report .cbranch-no,
#canyon-report .cbranch-no {
    background: #f6c6ce;
}

#canyon-report .low,
#canyon-report .cline-no {
    background: #fce1e5;
}

#canyon-report .high,
#canyon-report .cline-yes {
    background: #e6f5d0;
}

#canyon-report .cstat-yes {
    background: #a1d76a;
}

#canyon-report .status-line.high,
#canyon-report .high .cover-fill {
    background: #4d9221;
}

#canyon-report .high .chart {
    border: 1px solid #4d9221;
}

#canyon-report .status-line.medium,
#canyon-report .medium .cover-fill {
    background: #f9cd0b;
}

#canyon-report .medium .chart {
    border: 1px solid #f9cd0b;
}

#canyon-report .medium {
    background: #fff4c2;
}

#canyon-report .cstat-skip {
    background: #ddd;
    color: #111;
}

#canyon-report .fstat-skip {
    background: #ddd;
    color: #111 !important;
}

#canyon-report .cbranch-skip {
    background: #ddd !important;
    color: #111;
}

#canyon-report span.cline-neutral {
    background: #eaeaea;
}

#canyon-report .coverage-summary td.empty {
    opacity: .5;
    padding-top: 4px;
    padding-bottom: 4px;
    line-height: 1;
    color: #888;
}

#canyon-report .cover-fill,
#canyon-report .cover-empty {
    display: inline-block;
    height: 12px;
}

#canyon-report .chart {
    line-height: 0;
}

#canyon-report .cover-empty {
    background: white;
}

#canyon-report .cover-full {
    border-right: none !important;
}

#canyon-report pre.prettyprint {
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
}

#canyon-report .com {
    color: #999 !important;
}

#canyon-report .ignore-none {
    color: #999;
    font-weight: normal;
}

#canyon-report .wrapper {
    min-height: 100%;
    height: auto !important;
    height: 100%;
    margin: 0 auto -48px;
}

#canyon-report .footer,
#canyon-report .push {
    height: 48px;
}


// ========================

pre code.hljs {
  display: block;
  overflow-x: auto;
  padding: 1em
}
code.hljs {
  padding: 3px 5px
}

.hljs {
  color: #000;
  background: #fff
}
.hljs-subst,
.hljs-title {
  font-weight: normal;
  color: #000
}
.hljs-comment,
.hljs-quote {
  color: #808080;
  font-style: italic
}
.hljs-meta {
  color: #808000
}
.hljs-tag {
  background: #efefef
}
.hljs-section,
.hljs-name,
.hljs-literal,
.hljs-keyword,
.hljs-selector-tag,
.hljs-type,
.hljs-selector-id,
.hljs-selector-class {
  font-weight: bold;
  color: #000080
}
.hljs-attribute,
.hljs-number,
.hljs-regexp,
.hljs-link {
  font-weight: bold;
  color: #0000ff
}
.hljs-number,
.hljs-regexp,
.hljs-link {
  font-weight: normal
}
.hljs-string {
  color: #008000;
  font-weight: bold
}
.hljs-symbol,
.hljs-bullet,
.hljs-formula {
  color: #000;
  background: #d0eded;
  font-style: italic
}
.hljs-doctag {
  text-decoration: underline
}
.hljs-variable,
.hljs-template-variable {
  color: #660e7a
}
.hljs-addition {
  background: #baeeba
}
.hljs-deletion {
  background: #ffc8bd
}
.hljs-emphasis {
  font-style: italic
}
.hljs-strong {
  font-weight: bold
}

// ========================

`;
export const loadCssCode = () => {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(cssCode));
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(style);
};
