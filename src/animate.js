// Collect all the animations into one master module. this module is the main module

(function(angular){
  "use strict";
  angular.module('fx.animates',
    ['fx.animations.fades',
      'fx.animations.bounces',
      'fx.animations.rotations',
      'fx.animations.zooms',
      'fx.events.flip'
      ]
  );

  angular.module('fx.transitions',
    [
      'fx.transitions.slides'
    ]
  );

  angular.module('fx.directives',
    ['fx.directives.flips']
  );

  angular.module('fx.animations', ['fx.animates','fx.directives', 'fx.transitions', 'ngRoute'])

    .config(['$provide', function ($provide) {
      $provide.decorator('ngViewDirective', function ($delegate, $route, $animate, $anchorScroll) {
        var compile, ngView;

        ngView = $delegate[0];
        compile = ngView.compile;

        ngView.compile = function () {
          return myLink;
        };

        function myLink (scope, $element, attr, ctrl, $transclude) {
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
                  leave = $route.current && $route.current.$$route.animation && $route.current.$$route.animation.leave;


              if (angular.isDefined(template)) {
                var newScope = scope.$new();
                var current = $route.current;

                var clone = $transclude(newScope, function(clone) {
                  clone.addClass(enter);
                  clone.addClass(leave);
                  $animate.enter(clone, null, currentElement || $element, function onNgViewEnter () {
                    if (angular.isDefined(autoScrollExp)
                      && (!autoScrollExp || scope.$eval(autoScrollExp))) {
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
}(angular));

