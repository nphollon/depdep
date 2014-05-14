"use strict";

exports.buildLazyContext = function (factories, substitutions) {
  var context = {}
  var objects = {}
  var prebuilt = substitutions || {}

  var getObject = function (name) {
    return prebuilt[name] || factories[name].call(null, context)
  }

  var defineLazyInitializer = function (name) {
    Object.defineProperty(context, name, {
      enumerable: true,
      get: function () {
        if (!objects.hasOwnProperty(name)) {
          objects[name] = getObject(name)
        }
        return objects[name]
      }
    })
  }

  Object.keys(factories).forEach(defineLazyInitializer)

  return context
}

exports.buildContext = function (factories, substitutions) {
  var context = this.buildLazyContext(factories, substitutions)

  Object.keys(context).forEach(function (name) {
    context[name]
  })

  return context
}
