// Collect all the animations into one master module. this module is the main module

(function(angular){
  "use strict";


  var routers = {
    'ui.router': false,
    'ngRoute': false
  };

  checkRouting();

  angular.module('fx.animates',
    ['fx.animations.fades',
      'fx.animations.bounces',
      'fx.animations.rotations',
      'fx.animations.zooms'
  /*  ,'fx.events.flips' */
      ]
  );

  angular.module('fx.transitions',
    [
      'fx.transitions.slides',
      'fx.transitions.specials'
    ]
  );

  angular.module('fx.directives',
    ['fx.directives.flips']
  );

  if (routers.ngRoute) {
    angular.module('fx.animations', ['fx.animates', 'fx.transitions','ngRoute'])
      .config(['$provide', function ($provide) {
        $provide.decorator('ngViewDirective', function ($delegate, $route, $animate, $anchorScroll) {
          var ngView;

          ngView = $delegate[0];

          ngView.compile = function () {
            return routeLink;
          };

          function routeLink (scope, $element, attr, ctrl, $transclude) {
            var currentScope,
                currentElement,
                previousElement,
                autoScrollExp = attr.autoscroll,
                onloadExp = attr.onload || '';

            scope.$on('$routeChangeSuccess', update);
            update();

            function cleanupLastView() {
              if(previousElement) {
                previousElement.remove();
                previousElement = null;
              }
              if(currentScope) {
                currentScope.$destroy();
                currentScope = null;
              }
              if(currentElement) {
                $animate.leave(currentElement, function() {
                  previousElement = null;
                });
                previousElement = currentElement;
                currentElement = null;
              }
            }

            function update() {
              var locals = $route.current && $route.current.locals,
                  template = locals && locals.$template,
                  enter = $route.current && $route.current.$$route.animation && $route.current.$$route.animation.enter,
                  leave = $route.current && $route.current.$$route.animation && $route.current.$$route.animation.leave,
                  ease = $route.current && $route.current.$$route.animation && $route.current.$$route.animation.ease;

              if (angular.isDefined(template)) {
                var newScope = scope.$new();
                var current = $route.current;

                var clone = $transclude(newScope, function(clone) {
                  // clone.hasClass
                  clone.addClass(enter);
                  clone.addClass(leave);
                  clone.addClass('fx-easing-'+ease);
                  $animate.enter(clone, null, currentElement || $element, function onNgViewEnter () {
                    if (angular.isDefined(autoScrollExp) &&
                      (!autoScrollExp || scope.$eval(autoScrollExp))) {
                      $anchorScroll();
                    }
                  });
                  cleanupLastView();
                });

                currentElement = clone;
                currentScope = current.scope = newScope;
                currentScope.$emit('$viewContentLoaded');
                currentScope.$eval(onloadExp);
              } else {
                cleanupLastView();
              }
            }
          }
          return $delegate;
        });
    }]);
  } else if (routers['ui.router']) {
    angular.module('fx.animations', ['fx.animates', 'fx.transitions', 'ui.router'])
      .config(['$provide', function ($provide) {
        $provide.decorator('uiViewDirective', function ($delegate, $injector, $state, $uiViewScroll) {
          function getService() {
            return ($injector.has) ? function(service) {
              return $injector.has(service) ? $injector.get(service) : null;
            } : function(service) {
              try {
                return $injector.get(service);
              } catch (e) {
                return null;
              }
            };
          }

          var service = getService(),
              $animator = service('$animator'),
              $animate = service('$animate');

          function getRenderer(attrs, scope) {
            var statics = function() {
              return {
                enter: function (element, target, cb) { target.after(element); cb(); },
                leave: function (element, cb) { element.remove(); cb(); }
              };
            };

            if ($animate) {
              return {
                enter: function(element, target, cb) { $animate.enter(element, null, target, cb); },
                leave: function(element, cb) { $animate.leave(element, cb); }
              };
            }

            if ($animator) {
              var animate = $animator && $animator(scope, attrs);

              return {
                enter: function(element, target, cb) {animate.enter(element, null, target); cb(); },
                leave: function(element, cb) { animate.leave(element); cb(); }
              };
            }

            return statics();
          }

          var uiView;

          uiView = $delegate[0];
          uiView.compile = function (tElement, tAttrs, $transclude) {
            return function uiLink (scope, $element, attrs) {
              var previousEl, currentEl, currentScope, latestLocals,
                  onloadExp     = attrs.onload || '',
                  autoScrollExp = attrs.autoscroll,
                  renderer      = getRenderer(attrs, scope);

              scope.$on('$stateChangeSuccess', function() {
                updateView(false);
              });
              scope.$on('$viewContentLoading', function() {
                updateView(false);
              });

              updateView(true);

              function cleanupLastView() {
                if (previousEl) {
                  previousEl.remove();
                  previousEl = null;
                }

                if (currentScope) {
                  currentScope.$destroy();
                  currentScope = null;
                }

                if (currentEl) {
                  renderer.leave(currentEl, function() {
                    previousEl = null;
                  });

                  previousEl = currentEl;
                  currentEl = null;
                }
              }

              function updateView(firstTime) {
                var newScope        = scope.$new(),
                    name            = currentEl && currentEl.data('$uiViewName'),
                    previousLocals  = name && $state.$current && $state.$current.locals[name],
                    enter           = $state.$current && $state.$current.animation && $state.$current.animation.enter,
                    leave           = $state.$current && $state.$current.animation && $state.$current.animation.leave,
                    ease            = $state.$current && $state.$current.animation && $state.$current.animation.ease;

                if (!firstTime && previousLocals === latestLocals) {return;} // nothing to do

                var clone = $transclude(newScope, function(clone) {
                  clone.addClass(enter);
                  clone.addClass(leave);
                  clone.addClass('fx-easing-'+ease);
                  renderer.enter(clone, $element, function onUiViewEnter() {
                    if (angular.isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
                      $uiViewScroll(clone);
                    }
                  });
                  cleanupLastView();
                });

                latestLocals = $state.$current.locals[clone.data('$uiViewName')];

                currentEl = clone;
                currentScope = newScope;
                currentScope.$emit('$viewContentLoaded');
                currentScope.$eval(onloadExp);
              }
            };
          };
          return $delegate;
        });
    }]);
  } else {
    angular.module('fx.animations', ['fx.animates', 'fx.transitions']);
  }



  function checkRouting () {
    var types = ['ui.router', 'ngRoute'];

    angular.forEach(types, function (type) {
      try {
        angular.module(type);
        routers[type] = true;
      } catch (err) {
        routers[type] = false;
      }
    });
  }
}(angular));

