import {compressDataWithStream} from "./helpers/compressDataWithStream";
import {assemblyData} from "./helpers/assemblyData";

// 定义window.__coverage__数据

(async () => {
  /*
  /coverage/client适配

  可能性
  1. coverage file + formData的meta数据
  2. 压缩过和没压缩过的数据。
  3. 如果是其他端发送的话，也要支持纯json格式
   */

  /*
* note:
* 1. 需要延时添加，避免出现全局__coverage__未定义的情况
* 2. 考虑兼容性，如不支持CompressionStream的浏览器，使用只能使用json格式
* 3. 注意检测数据体积大小，浏览器版本做统计
* 4. 发送数据前，发送预检测请求，后续统计收发数据的成功率
* 5. 关注 https://developer.chrome.com/blog/fetch-later-api-origin-trial?hl=zh-cn
*
*
* */
  const timeout = 500
  async function collectCoverageData (timing) {
    const {coverage,projectID,sha,instrumentCwd,dsn} = assemblyData(window.__coverage__)
    const fd = new FormData()
    const blob = await compressDataWithStream(JSON.stringify(coverage))
    // 覆盖率数据
    fd.append('coverage', blob)
    // canyon数据
    fd.append('projectID', projectID)
    fd.append('sha', sha)
    fd.append('instrumentCwd', instrumentCwd)
    // 触发时机
    fd.append('timing', timing)
    // 要发探测数据，id客户端生成
    navigator.sendBeacon(
      dsn,
      fd,
    )
  }
  const timerHandler = () => {
    if (window.__coverage__){
      window.addEventListener('unload', () => {
        collectCoverageData('unload')
      })
      document.addEventListener('visibilitychange', () => {
        collectCoverageData('visibilitychange')
      })
    } else {
      console.log('canyon: no coverage data')
    }
  }
  setTimeout(timerHandler, timeout)
})()
