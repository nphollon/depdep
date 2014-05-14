describe("The dependency manger", function () {
  "use strict";
  
  var depdep = require("../src/depdep")

  var dummy = function () {
    return function () {}
  }

  var defaultFoo, defaultBar, mockFoo

  beforeEach(function () {
    defaultFoo = dummy()
    defaultBar = dummy()
    mockFoo = dummy()
  })

  describe("Stubbing a top-level object", function () {
    var factories

    beforeEach(function () {
      factories = {
        foo: function () { return defaultFoo },
        bar: function () { return defaultBar }
      }      
    })

    it("should call factory function if nothing is substituted", function () {
      var expectedContext = {
        foo: defaultFoo,
        bar: defaultBar
      }

      var actualContext = depdep.buildContext(factories)

      expect(actualContext).toEqual(expectedContext)
    })

    it("should add substitute object to context if one exists", function () {
      var subs = {
        foo: mockFoo
      }

      var expectedContext = {
        foo: mockFoo,
        bar: defaultBar
      }

      var actualContext = depdep.buildContext(factories, subs)
      expect(actualContext).toEqual(expectedContext)
    })

    it("should not modify the substitutions argument", function () {
      var subs = {
        foo: mockFoo
      }

      depdep.buildContext(factories, subs)
      expect(subs.bar).toBe(undefined)
    })
  })

  describe("Stubbing a dependency", function () {
    var factories

    beforeEach(function () {
      factories = {
        foo: function () { return defaultFoo },
        bar: function (that) {
          return { foobar: that.foo }
        }
      }
    })

    it("should inject default foo into bar factory if nothing is substituted", function () {
      var expectedContext = {
        foo: defaultFoo,
        bar: { foobar: defaultFoo }
      }

      var actualContext = depdep.buildContext(factories)

      expect(actualContext).toEqual(expectedContext)
    })

    it("should inject substitute foo into bar factory if one exists", function () {
      var subs = {
        foo: mockFoo
      }

      var expectedContext = {
        foo: mockFoo,
        bar: { foobar: mockFoo }
      }

      var actualContext = depdep.buildContext(factories, subs)

      expect(actualContext).toEqual(expectedContext)
    })
  })

  describe("Diamond dependencies", function () {
    var factories

    beforeEach(function () {
      factories = {
        foo: function () { return defaultFoo },
        bar: function (that) {
          return { foobar: that.foo }
        },
        baz: function (that) {
          return { foobaz: that.foo }
        },
        qux: function (that) {
          return [ that.bar, that.baz ]
        }
      }
    })

    it("should only construct foo once", function () {
      spyOn(factories, "foo").and.callThrough()

      var expectedContext = {
        foo: defaultFoo,
        bar: { foobar: defaultFoo },
        baz: { foobaz: defaultFoo },
        qux: [ { foobar: defaultFoo }, { foobaz: defaultFoo } ]
      }

      var actualContext = depdep.buildContext(factories)

      expect(actualContext).toEqual(expectedContext)
      expect(factories.foo.calls.count()).toBe(1)
    })
  })

  describe("lazy context", function () {
    var factories, context

    beforeEach(function () {
      factories = {
        foo: function () {},
        bar: function () {}
      }
      spyOn(factories, "foo")
      spyOn(factories, "bar")

      context = depdep.buildLazyContext(factories)
    })

    it("should not build any dependencies immediately", function () {
      expect(factories.foo).not.toHaveBeenCalled()
      expect(factories.bar).not.toHaveBeenCalled()
    })

    it("should build dependency when it is accessed", function () {
      context.foo
      expect(factories.foo).toHaveBeenCalled()
      expect(factories.bar).not.toHaveBeenCalled()
    })
  })
})