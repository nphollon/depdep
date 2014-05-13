var factories = {
  server: function (that) {
    return require("http").createServer(that.router)
  },

  router: function (that) {
    return require("./router").build(that.routes)
  },

  routes: function (that) {
    var get = that.routeFactory.get
    return {
      "/": get("public/index.html"),
      "/index.css": get("public/index.css"),
      "/index.js": get("public/index.js")
    }
  },

  routeFactory: function (that) {
    return require("./routeFactory").build(that.fileSystem)
  },

  fileSystem: function (that) {
    return require("fs")
  }
}

var buildApplication = function (substitutions) {
  var context = require("depdep").buildApplicationContext(defaultFactories, substitutions)

  return {
    start: function (port) {
      context.server.listen(port)
    },
    
    stop: function () {
      context.server.close()
    }
  }
}
