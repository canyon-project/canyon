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




        // 点击它打开一个全屏弹窗

        // 插入一个div
        const modal = document.createElement('div');
        modal.innerHTML = '全屏弹窗';
        document.body.appendChild(modal);
        // 添加样式
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.top = 0;
        modal.style.left = 0;
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.color = 'white';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = 9998;

        // 点击关闭按钮关闭弹窗
        const close = document.createElement('div');

        close.innerHTML = '关闭';
        modal.appendChild(close);
        // 添加样式
        close.style.position = 'absolute';
        close.style.top = '20px';
        close.style.right = '20px';
        close.style.padding = '10px';
        close.style.backgroundColor = 'red';
        close.style.color = 'white';
        close.style.border = 'none';
        close.style.cursor = 'pointer';


        // 点击关闭按钮关闭弹窗
        close.addEventListener('click', () => {
          modal.style.display = 'none';
        });

        let clickCount = 0;
        let clickTimeout;
        document.addEventListener('click', () => {
          clickCount++;

          if (clickCount === 1) {
            // 开始1秒计时
            clickTimeout = setTimeout(() => {
              // 1秒结束，重置计数
              clickCount = 0;
            }, 1000);
          }

          if (clickCount >= 5) {
            // 1秒内点击超过6次，触发痰喘
            clearTimeout(clickTimeout); // 清除计时器
            clickCount = 0; // 重置计数

            modal.style.display = 'flex';
          }
        });


      //



      }
    }

    // **end***
  }
})()
