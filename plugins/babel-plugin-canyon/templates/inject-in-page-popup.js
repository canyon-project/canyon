(function () {
  var globalObj = undefined;
  try {
    globalObj = new Function('return this')();
  } catch (e) {
    if (typeof window !== "undefined") {
      globalObj = window;
    } else if (typeof global !== "undefined") {
      globalObj = global;
    } else {
      //   do nothing
    }
  }
  if (globalObj){

    //   ***start***

    if (globalObj.ssssssssssssss) {
    } else {
      globalObj.ssssssssssssss = true
      if (globalObj.document && globalObj.document.addEventListener) {


      // 逻辑


      //   插入一个div
      var div = document.createElement('div');

      div.innerHTML = `<div class="__canyon__modal">
    <div class="__canyon__header">

    </div>

    <div class="__canyon__content">
        <div class="__canyon__segment">
            <div class="__canyon__title">
                Data
            </div>

            <div class="__canyon__segment_content">
                <div style="margin-bottom: 10px;display:flex;gap: 5px">
                    <div>Project ID:</div>
                    <div class="canyon-form-value-projectid"></div>
                </div>
                <div style="margin-bottom: 10px;display:flex;gap: 5px">
                    <div>Project ID:</div>
                    <div class="canyon-form-value-projectid"></div>
                </div>
                <div style="margin-bottom: 10px;display:flex;gap: 5px">
                    <div>Project ID:</div>
                    <div class="canyon-form-value-projectid"></div>
                </div>
            </div>
        </div>

        <div class="__canyon__segment">
            <div class="__canyon__title">
                Action
            </div>

            <div class="__canyon__segment_content">
                <div class="__canyon__btn" style="margin-bottom: 10px">Upload</div>
                <div class="__canyon__btn" style="background-color: white;color: #333">Refresh</div>
            </div>
        </div>

        <div class="__canyon__segment">
            <div class="__canyon__title">
                Result
            </div>

            <div class="__canyon__segment_content">
                <div class="result" style="display: flex;align-items:center;justify-content: center;border: 1px solid white;padding-bottom: 30px;padding-top: 30px">
                    Please upload coverage
                </div>
            </div>
        </div>
    </div>
</div>`

        document.body.appendChild(div);

        //   插入一个style
        var style = document.createElement('style');
        style.innerHTML = `        .__canyon__modal{
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
        }`
        document.head.appendChild(style);

      //



      }
    }

    // **end***
  }
})()
