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

  // 计算新增行关联的语句及其覆盖状态，并在控制台打印表格
  if (addLines.length > 0 && coverage.s && coverage.statementMap) {
    const addedLinesSet = new Set(addLines);
    const relatedStatements: Array<{
      状态: string;
      定位: string;
      关联变更行: string;
      执行次数: string;
    }> = [];
    
    // 找出所有新增行关联的语句
    Object.entries(coverage.statementMap).forEach(([stId, meta]: any) => {
      const startLine = meta.start.line;
      const endLine = meta.end.line;
      const startCol = meta.start.column;
      const endCol = meta.end.column;
      
      // 检查语句是否与新增行有交集，并收集所有关联的变更行号
      const relatedLines: number[] = [];
      for (let line = startLine; line <= endLine; line++) {
        if (addedLinesSet.has(line)) {
          relatedLines.push(line);
        }
      }
      
      if (relatedLines.length > 0) {
        const count = coverage.s[stId] || 0;
        const covered = count > 0;
        
        // 格式化定位信息
        const locationDisplay = endLine > startLine
          ? `${startLine}:${startCol + 1} - ${endLine}:${endCol + 1}`
          : `${startLine}:${startCol + 1}`;
        
        // 格式化关联变更行
        const relatedLinesDisplay = relatedLines.join(', ');
        
        relatedStatements.push({
          状态: covered ? '✓ 已覆盖' : '✗ 未覆盖',
          定位: locationDisplay,
          关联变更行: relatedLinesDisplay,
          执行次数: covered ? `${count} 次` : '未覆盖',
        });
      }
    });
    
    // 按行号排序
    relatedStatements.sort((a, b) => {
      const aLine = parseInt(a.定位.split(':')[0]);
      const bLine = parseInt(b.定位.split(':')[0]);
      return aLine - bLine;
    });
    
    // 计算覆盖率
    const coveredCount = relatedStatements.filter(s => s.状态.includes('✓')).length;
    const totalCount = relatedStatements.length;
    const coveragePercent = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;
    
    // 在控制台打印表格
    console.log(`\n%c新增代码语句 (${totalCount}个) - 覆盖率: ${coveragePercent}% (${coveredCount}/${totalCount})`, 
      'font-weight: bold; font-size: 14px; color: #007acc;');
    if (relatedStatements.length > 0) {
      console.table(relatedStatements);
    } else {
      console.log('暂无新增代码语句');
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
    dom.style.height = height||'calc(100vh - 240px)'; // 设置容器高度
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
        const editor = window.monaco.editor.create(dom, defaultOptions);

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
