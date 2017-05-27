import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve'

export default {
  plugins: [
    buble(),
    resolve({
      module: true,
      jsnext: true
    })
  ],
  format: 'iife'
};
