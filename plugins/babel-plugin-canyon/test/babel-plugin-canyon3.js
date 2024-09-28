/* eslint-env mocha */

import * as babel from '@babel/core'
import makeVisitor from '../src'
// import path from 'path'

require('chai').should()

describe('babel-plugin-istanbul', function () {
  context('Babel plugin config', function () {
    it('should instrument file if shouldSkip returns false', function () {
      var result = babel.transformFileSync('./fixtures/plugin-should-cover.js', {
        babelrc: false,
        configFile: false,
        plugins: [
            'istanbul',
          [makeVisitor, {
            include: ['fixtures/plugin-should-cover.js']
          }]
        ]
      })
      // console.log(result.code)
    })

    it('should instrument file if shouldSkip returns false11223', function () {
      var result = babel.transformFileSync('./fixtures/should-cover.js', {
        babelrc: false,
        configFile: false,
        plugins: [
          'istanbul',
          [makeVisitor, {
            include: ['fixtures/should-cover.js']
          }]
        ]
      })
      // console.log(result.code)
    })
  })
})
