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
      if (globalObj.__canyon__ && globalObj.__coverage__) {

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
                    <div>Interval Report: </div>
                    <input type="checkbox" class="canyon-form-value-auto"/>
                </div>
                <div class="__canyon__form_wrap">
                    <div>Report ID: </div>
                    <input style="width: 240px" class="canyon-form-value-reportid" type="text"/>
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
            background: rgba(0,0,0,0.9);
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
            padding-top: 45px;
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
        }
        .canyon-form-value-reportid{
            color: #333;
        }
        /* 设置未选中样式 */
        .canyon-form-value-auto {
            position: relative;
            width: 15px;
            height: 15px;
            line-height: 15px;
            border: 1px solid #949494;
            /* 取消默认样式 */
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        /* 设置选中样式 */
        .canyon-form-value-auto:checked {
            background-color: deepskyblue;
        }
        .canyon-form-value-auto:checked::after {
            content: "✓";
            position: absolute;
            top: 0;
            width: 15px;
            height: 15px;
            color: #fff;
            text-align: center;
        }`
          document.head.appendChild(style)

          //   逻辑开始
          //

          const canyon = globalObj.__canyon__
          const coverage = globalObj.__coverage__

          // 步骤一：连点3次打开弹窗+检查页面变量合法性
          let clickCount = 0;
          let clickTimeout;
          document.addEventListener('click', () => {
            clickCount++;

            if (clickCount === 1) {
              // 开始1秒计时
              clickTimeout = setTimeout(() => {
                // 1秒结束，重置计数
                clickCount = 0;
              }, 500);
            }

            if (clickCount >= 3) {
              // 1秒内点击超过6次，触发弹窗
              clearTimeout(clickTimeout); // 清除计时器
              clickCount = 0; // 重置计数

              //   检查参数
              if (globalObj.__canyon__ && globalObj.__coverage__) {
                document.querySelector('.__canyon__modal').style.display = 'block'
              } else {
                alert('window.__canyon__ or window.__coverage__ is not defined')
              }
            }
          });

//   点击关闭按钮关闭弹窗
          document.querySelector('.__canyon__close').addEventListener('click', () => {
            document.querySelector('.__canyon__modal').style.display = 'none'
          })


          document.querySelector('.canyon-form-value-projectid').innerHTML = canyon.projectID
          document.querySelector('.canyon-form-value-sha').innerHTML = canyon.sha
          document.querySelector('.canyon-form-value-branch').innerHTML = canyon.branch
          document.querySelector('.canyon-form-value-dsn').innerHTML = canyon.dsn
          document.querySelector('.canyon-form-value-coverage').innerHTML = String(Object.keys(coverage).length)
          document.querySelector('.canyon-form-value-auto').checked = Boolean(localStorage.getItem('canyon-auto'))
          document.querySelector('.canyon-form-value-reportid').value = localStorage.getItem('canyon-reportid') || ''


          document.querySelector('.canyon-form-value-auto').addEventListener('change',function () {
            if (this.checked === true){
              localStorage.setItem('canyon-auto','true')
            }else{
              localStorage.removeItem('canyon-auto')
            }
          })

          document.querySelector('.canyon-form-value-reportid').addEventListener('change',function () {
            localStorage.setItem('canyon-reportid',this.value)
          })


          const uploadPromise = ()=>{
            return fetch(canyon.dsn, {
              method: 'post',
              body: JSON.stringify({
                ...canyon,
                reportID: document.querySelector('.canyon-form-value-reportid').value,
                coverage: globalObj.__coverage__
              }),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${canyon.reporter}`
              }
            })
          }


          setInterval(()=>{
            if (document.querySelector('.canyon-form-value-auto').checked === true){
              uploadPromise()
            }
          },2000)

//   添加事件

          document.querySelector('.__canyon__btn_upload').addEventListener('click', function () {

            // 状态置为上传中

            document.querySelector('.__canyon__result').innerHTML = 'Uploading...'

            uploadPromise().then(res=>{
              return res.json()
            })
              .then((res) => {
                if (res.statusCode > 300) {
                  document.querySelector('.__canyon__result').innerHTML = JSON.stringify(res);
                } else {
                  document.querySelector('.__canyon__result').innerHTML = 'Upload Success!';
                }
              })
              .catch((err) => {
                alert(String(err));
                document.querySelector('.__canyon__result').innerHTML = 'Upload Failed!';
              });
          })
          document.querySelector('.__canyon__btn_refresh').addEventListener('click',function () {
            document.querySelector('.__canyon__result').innerHTML = 'Please upload coverage'
          })

          // 逻辑结束
        }
      }
    }

    // **end***
  }
})()
