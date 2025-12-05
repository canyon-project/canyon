import {annotateBranches, annotateFunctions, annotateStatements} from "./lib/annotate.ts";
import { coreFn } from "./lib/coreFn.ts";
import {lineNumbers} from "./lib/lineNumbers.ts";

// console.log('加载spa完成')

// @ts-ignore
window.CanyonReportSpa = {initCanyonSpa}

// console.log(window.CanyonReportSpa)

export function initCanyonSpa(dom, options) {
    const { 
      coverage, 
      content,
      diff, 
      theme, 
      height,
      // 装饰器显示控制，默认全部显示
      showDecorations = {
        statements: true,  // 显示语句装饰器
        functions: true,   // 显示函数装饰器
        branches: true,    // 显示分支装饰器
      }
    } = options;

    const addLines = diff||[]

  const { lines, rows } = coreFn(coverage, content);

  // Calculate coverage for added lines
  let tableContainer: HTMLDivElement | null = null;
  if (addLines.length > 0 && coverage.s && coverage.statementMap) {
    const addedLinesSet = new Set(addLines);
    const relatedStatements: Array<{
      Status: string;
      Location: string;
      'Changed Lines': string;
      'Hit Count': string;
    }> = [];
    
    // Find all statements related to added lines
    Object.entries(coverage.statementMap).forEach(([stId, meta]: any) => {
      const startLine = meta.start.line;
      const endLine = meta.end.line;
      const startCol = meta.start.column;
      const endCol = meta.end.column;
      
      // Check if statement intersects with added lines
      const relatedLines: number[] = [];
      for (let line = startLine; line <= endLine; line++) {
        if (addedLinesSet.has(line)) {
          relatedLines.push(line);
        }
      }
      
      if (relatedLines.length > 0) {
        const count = coverage.s[stId] || 0;
        const covered = count > 0;
        
        // Format location
        const locationDisplay = endLine > startLine
          ? `${startLine}:${startCol + 1} - ${endLine}:${endCol + 1}`
          : `${startLine}:${startCol + 1}`;
        
        // Format related lines
        const relatedLinesDisplay = relatedLines.join(', ');
        
        relatedStatements.push({
          Status: covered ? '✓ Covered' : '✗ Not Covered',
          Location: locationDisplay,
          'Changed Lines': relatedLinesDisplay,
          'Hit Count': covered ? `${count}x` : 'Not covered',
        });
      }
    });
    
    // Sort by line number
    relatedStatements.sort((a, b) => {
      const aLine = parseInt(a.Location.split(':')[0]);
      const bLine = parseInt(b.Location.split(':')[0]);
      return aLine - bLine;
    });
    
    // Calculate coverage
    const coveredCount = relatedStatements.filter(s => s.Status.includes('✓')).length;
    const totalCount = relatedStatements.length;
    const coveragePercent = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;
    
    // Create table container
    tableContainer = document.createElement('div');
    tableContainer.style.cssText = `
      padding: 16px;
      background: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
      border-bottom: 1px solid ${theme === 'dark' ? '#3c3c3c' : '#e0e0e0'};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: auto;
      max-height: 300px;
    `;
    
    // Add title
    const title = document.createElement('div');
    title.style.cssText = `
      font-weight: bold;
      font-size: 14px;
      color: ${theme === 'dark' ? '#4fc3f7' : '#007acc'};
      margin-bottom: 12px;
    `;
    title.textContent = `Changed Code Statements (${totalCount}) - Coverage: ${coveragePercent}% (${coveredCount}/${totalCount})`;
    tableContainer.appendChild(title);
    
    if (relatedStatements.length > 0) {
      // Create table
      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      `;
      
      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['Status', 'Location', 'Changed Lines', 'Hit Count'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.cssText = `
          text-align: left;
          padding: 8px;
          border-bottom: 2px solid ${theme === 'dark' ? '#3c3c3c' : '#e0e0e0'};
          background: ${theme === 'dark' ? '#252526' : '#f5f5f5'};
          color: ${theme === 'dark' ? '#cccccc' : '#333333'};
          font-weight: 600;
        `;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create table body
      const tbody = document.createElement('tbody');
      relatedStatements.forEach((statement, index) => {
        const row = document.createElement('tr');
        row.style.cssText = `
          background: ${index % 2 === 0 
            ? (theme === 'dark' ? '#1e1e1e' : '#ffffff') 
            : (theme === 'dark' ? '#252526' : '#f9f9f9')};
        `;
        
        Object.values(statement).forEach((value, colIndex) => {
          const td = document.createElement('td');
          td.textContent = value;
          td.style.cssText = `
            padding: 8px;
            border-bottom: 1px solid ${theme === 'dark' ? '#3c3c3c' : '#e0e0e0'};
            color: ${colIndex === 0 
              ? (value.includes('✓') ? '#4caf50' : '#f44336')
              : (theme === 'dark' ? '#cccccc' : '#333333')};
          `;
          row.appendChild(td);
        });
        
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      tableContainer.appendChild(table);
    } else {
      const emptyMsg = document.createElement('div');
      emptyMsg.textContent = 'No changed code statements';
      emptyMsg.style.cssText = `
        color: ${theme === 'dark' ? '#858585' : '#666666'};
        font-style: italic;
      `;
      tableContainer.appendChild(emptyMsg);
    }
  }

  const linesState = (() => {
    return lines.map((line, index) => {
      return {
        lineNumber: index + 1,
        change: addLines.includes(index + 1),
        hit: line.executionNumber,
      };
    });
  })()

  const lineNumbersMinChars = (() => {
    const maxHit = Math.max(...linesState.map((line) => line.hit));
    return maxHit.toString().length + 8;
  })()


  if (!dom) {
        throw new Error("Container element not found");
    }
    
    // 清空 dom 容器并设置样式
    dom.innerHTML = '';
    dom.style.height = height||'calc(100vh - 240px)';
    dom.style.position = 'relative';
    
    // 如果有表格，创建可折叠的抽屉
    if (tableContainer) {
      const coveredCount = tableContainer.textContent?.match(/(\d+)\/(\d+)/)?.[1] || '0';
      const totalCount = tableContainer.textContent?.match(/(\d+)\/(\d+)/)?.[2] || '0';
      const coveragePercent = tableContainer.textContent?.match(/(\d+)%/)?.[1] || '0';
      
      // Create toggle button (always visible)
      const toggleButton = document.createElement('button');
      toggleButton.innerHTML = `
        <span style="margin-right: 8px;">📊</span>
        <span>Changed Code Coverage: ${coveragePercent}% (${coveredCount}/${totalCount})</span>
        <span id="arrow" style="margin-left: 8px; transition: transform 0.3s ease;">▼</span>
      `;
      toggleButton.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        padding: 8px 16px;
        background: ${theme === 'dark' ? '#252526' : '#f5f5f5'};
        border: none;
        border-bottom: 1px solid ${theme === 'dark' ? '#3c3c3c' : '#e0e0e0'};
        color: ${theme === 'dark' ? '#cccccc' : '#333333'};
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        cursor: pointer;
        text-align: left;
        display: flex;
        align-items: center;
        z-index: 1001;
        transition: background 0.2s ease;
      `;
      
      // 创建抽屉内容容器（默认隐藏）
      const drawerContent = document.createElement('div');
      drawerContent.style.cssText = `
        position: absolute;
        top: 33px;
        left: 0;
        right: 0;
        max-height: 0;
        overflow: hidden;
        background: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
        border-bottom: 1px solid ${theme === 'dark' ? '#3c3c3c' : '#e0e0e0'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 1000;
        transition: max-height 0.3s ease;
      `;
      
      // 调整表格容器样式
      tableContainer.style.cssText = `
        padding: 16px;
        background: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: auto;
        max-height: 300px;
      `;
      
      drawerContent.appendChild(tableContainer);
      
      // 鼠标悬停效果
      toggleButton.addEventListener('mouseenter', () => {
        toggleButton.style.background = theme === 'dark' ? '#2d2d30' : '#e8e8e8';
      });
      toggleButton.addEventListener('mouseleave', () => {
        toggleButton.style.background = theme === 'dark' ? '#252526' : '#f5f5f5';
      });
      
      // 切换抽屉状态
      let isOpen = false;
      toggleButton.addEventListener('click', () => {
        isOpen = !isOpen;
        const arrow = toggleButton.querySelector('#arrow');
        if (isOpen) {
          drawerContent.style.maxHeight = '350px';
          if (arrow) arrow.textContent = '▲';
        } else {
          drawerContent.style.maxHeight = '0';
          if (arrow) arrow.textContent = '▼';
        }
      });
      
      dom.appendChild(toggleButton);
      dom.appendChild(drawerContent);
    }
    
    // 创建 Monaco 编辑器容器（留出顶部按钮空间）
    const editorContainer = document.createElement('div');
    editorContainer.style.cssText = `
      position: absolute;
      top: ${tableContainer ? '33px' : '0'};
      left: 0;
      right: 0;
      bottom: 0;
    `;
    dom.appendChild(editorContainer);
    
    // 默认配置
    const defaultOptions = {
        value: content,
        language: 'javascript',
        theme: theme==='dark'?'vs-dark':'vs',
        lineHeight: 18,
        lineNumbers: (lineNumber) => {
            return lineNumbers(
                lineNumber,
                linesState,
                false,
            );
        },
        lineNumbersMinChars: lineNumbersMinChars,
        readOnly: true,
        folding: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        showUnused: false,
        fontSize: 12,
        fontFamily: "IBMPlexMono",
        scrollbar: {
            // handleMouseWheel: false,
        },
        contextmenu: false,
        automaticLayout: true, // 启用自动布局
    };

    // 加载Monaco Editor资源
    if (window.monaco && window.monaco.editor) {
        // 如果已经加载，直接创建编辑器
        const editor = window.monaco.editor.create(editorContainer, defaultOptions);

      const decorations = (()=>{

        const all = []
        
        // 根据参数决定是否添加对应的装饰器
        if (showDecorations.statements) {
          const annotateStatementsList = annotateStatements(coverage, content);
          all.push(...annotateStatementsList);
        }
        
        if (showDecorations.functions) {
        const annotateFunctionsList = annotateFunctions(coverage, content);
          all.push(...annotateFunctionsList);
        }
        
        if (showDecorations.branches) {
        const annotateBranchesList = annotateBranches(coverage, content);
          all.push(...annotateBranchesList);
        }

        const arr = []
        for (let i = 0; i < all.length; i++) {
          const {startLine,
            startCol,
            endLine,
            endCol,
            // type,
          } = all[i]
          if (all[i].type==='S'||all[i].type==='F') {
            arr.push({
              range: new window.monaco.Range(startLine, startCol, endLine, endCol), // 第3行第5列前插入
              options: {
                isWholeLine: false,
                inlineClassName: 'content-class-no-found',
                hoverMessage: { value:all[i].type==='S' ? "statement not covered" : "function not covered" }
              },
            })
          } else if (all[i].type==='B'){
            arr.push({
              range: new window.monaco.Range(startLine, startCol, endLine, endCol), // 第3行第5列前插入
              options: {
                isWholeLine: false,
                inlineClassName: 'content-class-no-found-branch',
                hoverMessage: { value: "branch not covered" }
              },
            })
          } else if (all[i].type==='I'){
            arr.push({
              range: new window.monaco.Range(startLine, startCol, startLine, startCol), // 第3行第5列前插入
              options: {
                beforeContentClassName: 'insert-i-decoration',
                stickiness: window.monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
              }
            })
          } else if (all[i].type==='E'){
            arr.push({
              range: new window.monaco.Range(startLine, startCol, startLine, startCol), // 第3行第5列前插入
              options: {
                beforeContentClassName: 'insert-e-decoration',
                stickiness: window.monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
              }
            })
          }
        }
        return arr
      })()

      // console.log(decorations,'decorations')

        if (editor) {
            editor?.deltaDecorations?.(
                [], // oldDecorations 每次清空上次标记的
              decorations
            );
        }
    }
}
