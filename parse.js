'use strict'

var Norma = require('norma')
var Eraro = require('eraro')
var Jsonic = require('jsonic')
var _ = require('lodash')

var errorMap = {
  add_pattern_syntax: 'Could not add action due to syntax error in pattern string:' +
  ' "<%=argstr%>": Line:<%=line%>, Column:<%=col%>; <%=syntax%>',
}

var eraro = Eraro({
  package: 'seneca',
  msgmap: errorMap,
  override: true
})

// string args override object args
module.exports = function (instance, args, normaspec, fixed) {
  args = Norma('{strargs:s? objargs:o? moreobjargs:o? ' + (normaspec || '') + '}', args)

  try {
    return _.extend(args, {
        pattern: _.extend({},
          // Precedence of arguments in add,act is left-to-right
          args.moreobjargs ? args.moreobjargs : {},
          args.objargs ? args.objargs : {},
          args.strargs ? Jsonic(args.strargs) : {},
          fixed || {})
        })
  }
  catch (e) {
    var col = (e.line === 1) ? e.column - 1 : e.column
    throw eraro('add_pattern_syntax', {
      argstr: args,
      syntax: e.message,
      line: e.line,
      col: col
    })
  }
}
