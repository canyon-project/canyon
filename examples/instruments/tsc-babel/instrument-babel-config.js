module.exports = {
  plugins: [
    'istanbul',
    [
      'canyon',
      {
        ci:true
      }
    ]
  ]
}
