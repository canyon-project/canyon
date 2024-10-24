module.exports = {
  jsc:{
    "transform": {
      "react": {
        "runtime": "automatic"
      }
    },
    experimental:{
      plugins:[
        ['swc-plugin-coverage-instrument',{}],
        ['swc-plugin-canyon',{}],
      ]
    }
  }
}
