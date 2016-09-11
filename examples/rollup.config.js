import babel from 'rollup-plugin-babel'
import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import flow from 'rollup-plugin-flow'

export default {
  plugins: [
    flow(),
    babel({
      babelrc: false,
      plugins: [
        ['functional-composition', {
          from: '/Users/brian/Projects/arrow'
        }]
      ]
    }),
    buble(),
    resolve(),
    commonjs({
      include: 'node_modules/**',
    })
  ],
  format: 'iife'
};
