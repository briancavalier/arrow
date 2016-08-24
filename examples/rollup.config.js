import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import flow from 'rollup-plugin-flow'

export default {
  plugins: [
    flow(),
    buble(),
    resolve(),
    commonjs({
      include: 'node_modules/**',
    })
  ],
  format: 'iife'
};
