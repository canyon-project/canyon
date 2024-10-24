(function () {
  var globalObj = undefined
  try {
    globalObj = new Function('return this')()
  } catch (e) {
    if (typeof window !== 'undefined') {
      globalObj = window
    } else if (typeof global !== 'undefined') {
      globalObj = global
    } else {
      //   do nothing
    }
  }
  if (globalObj) {

    //   ***start***

    if (globalObj.ssssssssssssss) {
    } else {
      if (window.__canyon__ && window.__coverage__) {

        globalObj.ssssssssssssss = true
        if (globalObj.document && globalObj.document.addEventListener) {

          // 逻辑

          //   插入一个div
          var div = document.createElement('div')

          div.innerHTML = `<div class="__canyon__modal">
    <div class="__canyon__header">
        <div class="__canyon__close-wrap">
            <div class="__canyon__close" style="">x</div>
        </div>
    </div>

    <div class="__canyon__content">
        <div class="__canyon__segment">
            <div class="__canyon__title">
                Data
            </div>

            <div class="__canyon__segment_content">
                <div class="__canyon__form_wrap">
                    <div>Project ID:</div>
                    <div class="canyon-form-value-projectid"></div>
                </div>
                <div class="__canyon__form_wrap">
                    <div>SHA:</div>
                    <div class="canyon-form-value-sha"></div>
                </div>
                <div class="__canyon__form_wrap">
                    <div>Branch:</div>
                    <div class="canyon-form-value-branch"></div>
                </div>
                <div class="__canyon__form_wrap">
                    <div>DSN: </div>
                    <div style="word-break: break-all" class="canyon-form-value-dsn"></div>
                </div>
                <div class="__canyon__form_wrap">
                    <div>Coverage: </div>
                    <div class="canyon-form-value-coverage"></div>
                </div>
            </div>
        </div>

        <div class="__canyon__segment">
            <div class="__canyon__title">
                Action
            </div>

            <div class="__canyon__segment_content">
                <div class="__canyon__btn __canyon__btn_upload" style="margin-bottom: 10px">Upload</div>
                <div class="__canyon__btn __canyon__btn_refresh" style="background-color: white;color: #333">Refresh</div>
            </div>
        </div>

        <div class="__canyon__segment">
            <div class="__canyon__title">
                Result
            </div>

            <div class="__canyon__segment_content">
                <div class="__canyon__result" style="display: flex;align-items:center;justify-content: center;border: 1px solid white;padding-bottom: 30px;padding-top: 30px">
                    Please upload coverage
                </div>
            </div>
        </div>
    </div>
</div>`

          document.body.appendChild(div)

          //   插入一个style
          var style = document.createElement('style')
          style.innerHTML = `.__canyon__modal{
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            font-size: 12px;
            color: white;
        }
        .__canyon__segment{
            margin-bottom: 20px;
        }
        .__canyon__content{
            padding: 10px;
        }
        .__canyon__title{
            font-size: 16px;
            font-weight: bolder;
            border-bottom: 1px solid white;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }

        .__canyon__btn{
            background-color: #1890ff;
            color: white;
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            text-align: center;
        }
        .__canyon__close-wrap{
            display: flex;
            justify-content: flex-end;
            padding-top: 30px;
            padding-right: 10px
        }
        .__canyon__close{
            border: 1px solid white;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        .__canyon__form_wrap{
            margin-bottom: 10px;
            display:flex;
            gap: 5px
        }`
          document.head.appendChild(style)

          //   逻辑开始
          //

          const canyon = window.__canyon__
          const coverage = window.__coverage__

          // 步骤一：连点5次打开弹窗+检查页面变量合法性
          let clickCount = 0
          let clickTimeout
          document.addEventListener('click', () => {
            clickCount++

            if (clickCount === 1) {
              // 开始1秒计时
              clickTimeout = setTimeout(() => {
                // 1秒结束，重置计数
                clickCount = 0
              }, 1000)
            }

            if (clickCount >= 5) {
              // 1秒内点击超过6次，触发弹窗
              clearTimeout(clickTimeout) // 清除计时器
              clickCount = 0 // 重置计数

              //   检查参数
              if (window.__canyon__ && window.__coverage__) {
                document.querySelector('.__canyon__modal').style.display = 'block'
              } else {
                alert('window.__canyon__ or window.__coverage__ is not defined')
              }
            }
          })

//   点击关闭按钮关闭弹窗
          document.querySelector('.__canyon__close').addEventListener('click', () => {
            document.querySelector('.__canyon__modal').style.display = 'none'
          })

          document.querySelector('.canyon-form-value-projectid').innerHTML = canyon.projectID
          document.querySelector('.canyon-form-value-sha').innerHTML = canyon.sha
          document.querySelector('.canyon-form-value-branch').innerHTML = canyon.branch
          document.querySelector('.canyon-form-value-dsn').innerHTML = canyon.dsn
          document.querySelector('.canyon-form-value-coverage').innerHTML = String(Object.keys(coverage).length)

//   添加事件

          document.querySelector('.__canyon__btn_upload').addEventListener('click', function () {

            // 状态置为上传中

            document.querySelector('.__canyon__result').innerHTML = 'Uploading...'

            fetch(canyon.dsn, {
              method: 'post',
              body: JSON.stringify({
                ...canyon,
                coverage: window.__coverage__
              }),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${canyon.reporter}`
              }
            }).then(res => {
              return res.json()
            })
              .then((res) => {
                if (res.statusCode > 300) {
                  document.querySelector('.__canyon__result').innerHTML = JSON.stringify(res)
                } else {
                  document.querySelector('.__canyon__result').innerHTML = 'Upload Success!'
                }
              })
              .catch((err) => {
                alert(String(err))
                document.querySelector('.__canyon__result').innerHTML = 'Upload Failed!'
              })
          })
          document.querySelector('.__canyon__btn_refresh').addEventListener('click', function () {
            document.querySelector('.__canyon__result').innerHTML = 'Please upload coverage'
          })
        }
      }
    }

    // **end***
  }
})()
