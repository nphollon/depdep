"use strict";

var copyProperties = function (to, from) {
  if (from) {
    Object.keys(from).forEach(function (key) {
      to[key] = from[key]
    })
  }
}

var buildShadow = function (factories, objects) {
  var shadow = {}

  var getOrBuild = function (name) {
    return function () {
      if (!objects.hasOwnProperty(name)) {
        objects[name] = factories[name].call(null, shadow)
      }
      return objects[name]
    }
  }

  var defineShadowProperty = function (name) {
    Object.defineProperty(shadow, name, {
      enumerable: true,
      get: getOrBuild(name)
    })
  }

  Object.keys(factories).forEach(defineShadowProperty)

  return shadow
}

exports.buildApplicationContext = function (factories, substitutions) {
  var objects = {}
  var shadow = buildShadow(factories, objects)

  copyProperties(objects, substitutions)
  copyProperties(objects, shadow)

  return objects
}
