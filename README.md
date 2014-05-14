depdep
======

Depdep is a dependency injection framework for Node. The goal of depdep is to simplify the set-up of functional and integration tests by making it easy to inject test doubles (mocks, stubs, spies, etc) into a fully-wired application.

Depdep has two functions, and they look like this:

    require("depdep").buildContext(factories, substitutions)
    require("depdep").buildLazyContext(factories, substitutions)


### Building objects with no dependencies

    var factories = {
      mom: function () { return new Mother() },
      dad: function () { return new Father() }
    }
    
    context = require("depdep").buildApplicationContext(factories)
    
    context.mom instanceof Mother // true
    context.dad instanceof Father // true
    

The factories object and the application context object have the same properties. In the factories object, the value of each property is a function. The return value of that function is stored in the application context.

### Building objects with dependencies

    var factories = {
      mom: function () { return new Mother() },
      dad: function () { return new Father() },
    
      son: function (that) {
        return new Son(that.mom, that.dad)
      }
    
      daughter: function (that) {
        return new Daughter(that.mom, that.dad)
      }
    }


Factory functions have the application context passed in as an argument. This way, each factory function can access whatever dependecies it needs to create its object.

Each factory function is called exactly once, so your objects can share dependencies. In the example above, the son and daughter share a mom and dad.

Depdep does not currently try to detect or prevent circular dependencies. If your factory functions have a circular dependency, something terrible will probably happen.

### Substituting dependencies

    var factories = {
      mom: function () { return new Mother() },
      dad: function () { return new Father() }
    }
    
    var substitutions = {
      mom: {
        message: "I am not your real mother."
      }
    }
    
    context = require("depdep").buildContext(factories, substitutions)
    context.mom instanceof Mother // false
    console.log(context.mom.message) // "I am not your real mother."

The substitutions argument is optional. It is intended to be used by your tests to replace application components with mocks or stubs.

In the substitutions object, the value of each property is an object. This object will be placed directly into the application context, instead of the product of the factory function. In this case, the factory function is never called.

### Lazy initialization

    var factories = {
      greeting: function () {
        console.log("Hello")
        return "Hello"
      },
      farewell: function () {
        console.log("Goodbye")
        return "Goodbye"
      }
    }

    require("depdep").buildContext(factories) // Prints "Hello" and "Goodbye"
                                              // Messages may be in either order

    require("depdep").buildLazyContext(factories) // No messages printed yet
    var message = factories.greeting // Prints "Hello"

When `buildContext` is called, it returns an application context with all of its member objects already initialized. Depdep has an alternative context building function, `buildLazyContext`, in which each member object is lazily initialized. That is, the factory function for an object is not called until a client attempts to retreive the object from the application context.

### An example

Below is an example of what a basic web server might look like when wired together with depdep. The developers could use the substitution mechanism to stub the filesystem or the HTTP server in their integration tests.

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

    var buildApplication = function (subs) {
      var context = require("depdep").buildContext(factories, subs)

      return {
        start: function (port) {
          context.server.listen(port)
        },
        
        stop: function () {
          context.server.close()
        }
      }
    }
