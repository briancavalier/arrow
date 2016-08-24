import buble from 'rollup-plugin-buble'
import flow from 'rollup-plugin-flow'

export default {
  entry: 'src/index.js',
  dest: 'dist/arrow.js',
  format: 'umd',
  moduleName: 'arrow',
  sourceMap: true,
  plugins: [
    flow(),
    buble()
  ]
}
