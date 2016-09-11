import snabbdom from 'snabbdom'
export {default as events} from 'snabbdom/modules/eventlisteners'
export {default as attrs} from 'snabbdom/modules/attributes'
export {default as clss} from 'snabbdom/modules/class'
import sh from 'snabbdom/h'
import hh from 'hyperscript-helpers'

export const init = snabbdom.init
export const h = hh(sh)
