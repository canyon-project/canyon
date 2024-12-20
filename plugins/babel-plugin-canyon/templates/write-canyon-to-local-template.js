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

    if (globalObj.isDocumentAddVisibilitychangeWriteCanyonToLocal) {
    } else {
      globalObj.isDocumentAddVisibilitychangeWriteCanyonToLocal = true
      if (globalObj.document && globalObj.document.addEventListener) {
        if (globalObj.writeCanyonToLocal) {
          globalObj.manualWriteCanyonToLocal = function () {
            globalObj.writeCanyonToLocal(JSON.stringify({
              coverage: globalObj.__coverage__,
              canyon: globalObj.__canyon__ || (Object.keys(globalObj.__coverage__).length>0?Object.values(globalObj.__coverage__)[0]:undefined)
            }))
          }
        }
        globalObj.document.addEventListener('visibilitychange', function () {
          if (globalObj.document.visibilityState === 'hidden') {
            if (globalObj.writeCanyonToLocal) {
              globalObj.writeCanyonToLocal(JSON.stringify({
                coverage: globalObj.__coverage__,
                canyon: globalObj.__canyon__ || (Object.keys(globalObj.__coverage__).length>0?Object.values(globalObj.__coverage__)[0]:undefined)
              }))
            } else {
              console.log('writeCanyonToLocal is not defined')
            }
          }
        });
      }
    }

    // **end***
  }
})()
