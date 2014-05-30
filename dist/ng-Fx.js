
(function(angular){
  "use strict";

  angular.module('fx.animations.assist', [])

  .factory('Assist', ['$filter', '$window', '$timeout', function ($filter, $window, $timeout){
    return {

      emit: function(element, animation, motion){
        var $scope = angular.element(element).scope();
        $scope.$emit(animation + ' ' +motion);
      },

      parseClassList: function(element){
        var ease,
            list    = element[0].classList,
            results = {trigger: false, duration: 0.3, ease: $window.Back};

        angular.forEach(list, function (className){
          if(className.slice(0,9) === 'fx-easing'){
            ease = className.slice(10);
            results.ease = $window[$filter('cap')(ease)] ? $window[$filter('cap')(ease)] : $window.Elastic;
          }
          if(className === 'fx-trigger'){
            results.trigger = true;
          }
          if(className.slice(0,8) === 'fx-speed'){
            results.duration = parseInt(className.slice(9))/1000;
          }
        });
        return results;
      },

      addTimer: function(options, element, end){
        var self = this;
        var time = options.stagger ? (options.duration * 3) * 1000 : options.duration * 1000;
        var timer = $timeout(function(){
          if(options.trigger){
            self.emit(element, options.animation, options.motion);
          }
          end();
        }, time);
        element.data(options.timeoutKey, timer);
      },

      removeTimer: function(element, timeoutKey, timer){
        $timeout.cancel(timer);
        element.removeData(timeoutKey);
      }
    };
  }])

  .filter('cap', [function(){
    return function (input){
      return input.charAt(0).toUpperCase() + input.slice(1);
    };
  }]);
}(angular));
(function (angular) {
  "use strict";
  var timeoutKey = '$$fxtimer';
  angular.module('fx.transitions.assist', [])

  .factory('TransAssist', function ($timeout) {
    function addTimer (el, time, done) {
      var timer = $timeout(function () {
        console.log('in timer');
        done();
      }, (time*1000) + 50);
      el.data(timeoutKey, timer);
    }

    function removeTimer (el) {
      var timer = el.data(timeoutKey);
      if (timer) {
        el.css('z-index', '-1');
        $timeout.cancel(timer);
        el.removeData(timeoutKey);
      }
    }

    return {
      addTimer: addTimer,
      removeTimer: removeTimer
    };
  });
}(angular));
(function(angular, TweenMax, TimelineMax){
  "use strict";
  var timeoutKey = '$$fxTimer';
  angular.module('fx.animations.create', ['fx.animations.assist'])

  .factory('FadeAnimation', ['$timeout', '$window', 'Assist', function ($timeout, $window, Assist){
    return function (effect){
      var inEffect        = effect.enter,
          outEffect       = effect.leave,
          outEffectLeave  = effect.inverse || effect.leave,
          fx_type         = effect.animation;

      this.enter = function(element, done){
        var options = Assist.parseClassList(element);
        options.motion = 'enter';
        options.animation = fx_type;
        options.timeoutKey = timeoutKey;
        Assist.addTimer(options, element, done);
        inEffect.ease = options.ease.easeOut;
        TweenMax.set(element, outEffect);
        TweenMax.to(element, options.duration, inEffect);
        return function (canceled){
          var timer = element.data(timeoutKey);
          if(canceled){
            if(timer){
              Assist.removeTimer(element, timeoutKey, timer);
            }
          }
        };
      };

      this.leave = function(element, done){
        var options = Assist.parseClassList(element);
        options.motion = 'leave';
        options.animation = fx_type;
        options.timeoutKey = timeoutKey;
        Assist.addTimer(options, element, done);
        outEffectLeave.ease = options.ease.easeIn;
        TweenMax.set(element, inEffect);
        TweenMax.to(element, options.duration, outEffectLeave);
        return function (canceled){
          var timer = element.data(timeoutKey);
          if(canceled){
            if(timer){
              Assist.removeTimer(element, timeoutKey, timer);
            }
          }
        };
      };

      this.move = this.enter;

      this.addClass = function(element, className, done){
        if(className === 'ng-hide'){
          var options = Assist.parseClassList(element);
          options.motion = 'enter';
          options.animation = fx_type;
          options.timeoutKey = timeoutKey;
          Assist.addTimer(options, element, done);
          TweenMax.to(element, options.duration, outEffectLeave);
          return function (canceled){
            if(canceled){
              var timer = element.data(timeoutKey);
              if(timer){
                Assist.removeTimer(element, timeoutKey, timer);
              }
            }
          };
        } else {
          done();
        }
      };

      this.removeClass = function(element, className, done){
        if(className === 'ng-hide'){
          var options = Assist.parseClassList(element);
          options.motion = 'leave';
          options.animation = fx_type;
          options.timeoutKey = timeoutKey;
          TweenMax.set(element, outEffect);
          TweenMax.to(element, options.duration, inEffect);
          return function (canceled){
            if(canceled){
              var timer = element.data(timeoutKey);
              if(timer){
                Assist.removeTimer(element, timeoutKey, timer);
              }
            }
          };
        } else {
          done();
        }
      };
    };
  }])

  .factory('BounceAnimation', ['$timeout', '$window', 'Assist', function ($timeout, $window, Assist){
    return function (effect){
      var start       = effect.first,
          mid         = effect.mid,
          third       = effect.third,
          end         = effect.end,
          fx_type     = effect.animation,
          startTime   = 0.1;


      this.enter = function(element, done){
        var options = Assist.parseClassList(element);
        options.motion = 'enter';
        options.animation = fx_type;
        options.timeoutKey = timeoutKey;
        options.stagger = true;
        Assist.addTimer(options, element, done);
        var enter = new TimelineMax();
        enter.to(element, 0.01, start);
        enter.to(element, options.duration, mid);
        enter.to(element, options.duration, third);
        enter.to(element, options.duration, end);
        return function (canceled){
          if(canceled){
            var timer = element.data(timeoutKey);
            if(timer){
              Assist.removeTimer(element, timeoutKey, timer);
            }
          }
        };
      };

      this.leave = function(element, done){
        var options = Assist.parseClassList(element);
        options.motion = 'leave';
        options.animation = fx_type;
        options.timeoutKey = timeoutKey;
        options.stagger = true;
        Assist.addTimer(options, element, done);
        var leave = new TimelineMax();
        leave.to(element, startTime, end);
        leave.to(element, options.duration, third);
        leave.to(element, options.duration, mid);
        leave.to(element, options.duration, start);
        return function (canceled){
          if(canceled){
            var timer = element.data(timeoutKey);
            if(timer){
              Assist.removeTimer(element, timeoutKey, timer);
            }
          }
        };
      };

      this.move = this.enter;

      this.addClass = function(element, className, done){
        if(className === 'ng-hide'){
          var options = Assist.parseClassList(element);
          options.motion = 'enter';
          options.animation = fx_type;
          options.timeoutKey = timeoutKey;
          Assist.addTimer(options, element, done);
          var bac = new TimelineMax();
          bac.to(element, startTime, end);
          bac.to(element, options.duration, third);
          bac.to(element, options.duration, mid);
          bac.to(element, options.duration, start);
          return function (canceled){
            if(canceled){
              var timer = element.data(timeoutKey);
              if(timer){
                Assist.removeTimer(element, timeoutKey, timer);
              }
            }
          };
        } else {
          done();
        }
      };

      this.removeClass = function(element, className, done){
        if(className === 'ng-hide'){
          var options = Assist.parseClassList(element);
          options.motion = 'leave';
          options.animation = fx_type;
          options.timeoutKey = timeoutKey;
          var rc = new TimelineMax();
          rc.to(element, startTime, start);
          rc.to(element, options.duration, mid);
          rc.to(element, options.duration, third);
          rc.to(element, options.duration, end);
          return function (canceled){
            if(canceled){
              var timer = element.data(timeoutKey);
              if(timer){
                Assist.removeTimer(element, timeoutKey, timer);
              }
            }
          };
        } else {
          done();
        }
      };
    };
  }])

  .factory('RotateAnimation', ['$timeout', '$window', 'Assist', function ($timeout, $window, Assist){
    return function (effect){
      var start       = effect.start,
          end         = effect.end,
          leaveEnd    = effect.inverse,
          fx_type     = effect.animation;

      this.enter = function(element, done){
        var options = Assist.parseClassList(element);
            options.motion = 'enter';
            options.animation = fx_type;
            options.timeoutKey = timeoutKey;

        end.ease = options.ease.easeOut;
        Assist.addTimer(options, element, done);
        TweenMax.set(element, start);
        TweenMax.to(element, options.duration, end);
        return function (canceled){
          if(canceled){
            var timer = element.data(timeoutKey);
            if(timer){
              Assist.removeTimer(element, timeoutKey, timer);
            }
          }
        };
      };

      this.leave = function(element, done){
        var options = Assist.parseClassList(element);
            options.motion = 'leave';
            options.animation = fx_type;
            options.timeoutKey = timeoutKey;

        leaveEnd.ease = options.ease.easeIn;
        Assist.addTimer(options, element, done);
        TweenMax.set(element, end);
        TweenMax.to(element, options.duration, leaveEnd);
        return function (canceled){
          if(canceled){
            var timer = element.data(timeoutKey);
            if(timer){
              Assist.removeTimer(element, timeoutKey, timer);
            }
          }
        };
      };

      this.move = this.enter;

      this.addClass = function(element, className, done){
        if(className === 'ng-hide'){
          var options = Assist.parseClassList(element);
          options.motion = 'enter';
          options.animation = fx_type;
          options.timeoutKey = timeoutKey;
          Assist.addTimer(options, element, done);
          TweenMax.set(element, end);
          TweenMax.to(element, options.duration, start);
          return function (canceled){
            if(canceled){
              var timer = element.data(timeoutKey);
              if(timer){
                Assist.removeTimer(element, timeoutKey, timer);
              }
            }
          };
        } else {
          done();
        }
      };

       this.removeClass = function(element, className, done){
        if(className === 'ng-hide'){
          var options = Assist.parseClassList(element);
          options.motion = 'enter';
          options.animation = fx_type;
          options.timeoutKey = timeoutKey;
          Assist.addTimer(options, element, done);
          TweenMax.set(element, start);
          TweenMax.to(element, options.duration, end);
          return function (canceled){
            if(canceled){
              var timer = element.data(timeoutKey);
              if(timer){
                Assist.removeTimer(element, timeoutKey, timer);
              }
            }
          };
        } else {
          done();
        }
      };
    };
  }])

  .factory('ZoomAnimation', ['$timeout', '$window', 'Assist', function ($timeout, $window, Assist){
    return function (effect){
      var start       = effect.start,
          end         = effect.end,
          fx_type     = effect.animation;

      this.enter = function(element, done){
        var options             = Assist.parseClassList(element);
            options.motion      = 'enter';
            options.animation   = fx_type;
            options.timeoutKey  = timeoutKey;
        end.ease = options.ease.easeOut;
        Assist.addTimer(options, element, done);
        TweenMax.set(element, start);
        TweenMax.to(element, options.duration, end);
        return function (canceled){
          if(canceled){
            var timer = element.data(timeoutKey);
            if(timer){
              Assist.removeTimer(element, timeoutKey, timer);
            }
          }
        };
      };

      this.leave = function(element, done){
        var options             = Assist.parseClassList(element);
            options.motion      = 'lave';
            options.animation   = fx_type;
            options.timeoutKey  = timeoutKey;

        start.ease = options.ease.easeIn;
        Assist.addTimer(options, element, done);
        TweenMax.set(element, end);
        TweenMax.to(element, options.duration, start);
        return function (canceled){
          if(canceled){
            var timer = element.data(timeoutKey);
            if(timer){
              Assist.removeTimer(element, timeoutKey, timer);
            }
          }
        };
      };

      this.move = this.enter;

      this.removeClass = function(element, className, done){
        if(className === 'ng-hide'){
          var options = Assist.parseClassList(element);
          options.motion = 'leave';
          options.animation = fx_type;
          options.timeoutKey = timeoutKey;
          Assist.addTimer(options, element, done);
          TweenMax.set(element, start);
          TweenMax.to(element, options.duration, end);
          return function (canceled){
            if(canceled){
              var timer = element.data(timeoutKey);
              if(timer){
                Assist.removeTimer(element, timeoutKey, timer);
              }
            }
          };
        } else {
          done();
        }
      };

      this.addClass = function(element, className, done){
        if(className === 'ng-hide'){
          var options = Assist.parseClassList(element);
          options.motion = 'enter';
          options.animation = fx_type;
          options.timeoutKey = timeoutKey;
          Assist.addTimer(options, element, done);
          TweenMax.set(element, end);
          TweenMax.to(element, options.duration, start);
          return function (canceled){
            if(canceled){
              var timer = element.data(timeoutKey);
              if(timer){
                Assist.removeTimer(element, timeoutKey, timer);
              }
            }
          };
        } else {
          done();
        }
      };
    };
  }])
  .factory('Flip3d', ['$window', function ($window){
    return function (effect){
      var axis = effect.axis;
      var flipType = 'fx-flip'+axis;
      this.addClass = function(el, className, done){
        var wrapper = angular.element(el.children()[0]);
        var myDone = function(){
          console.log('done');
          return done();
        };
        if(className === flipType){
          effect.transform.ease = $window.Bounce.easeOut;
          effect.transform.onComplete = myDone;
          TweenMax.to(wrapper, effect.duration, effect.transform);
        } else {
          done();
        }
      };

      this.removeClass = function(el, className, done){
        var wrapper = angular.element(el.children()[0]);
        var myDone = function(){
          console.log('done');
          return done();
        };
        if(className === flipType){
          effect.reset.ease = $window.Bounce.easeOut;
          effect.reset.onComplete = myDone;
          TweenMax.to(wrapper, effect.duration, effect.reset);
        } else {
          done();
        }
      };
    };
  }]);
}(angular, TweenMax, TimelineMax));


(function (angular, TLM) {
  "use strict";
  var defaults = {
    duration: 0.5
  };

  angular.module('fx.transitions.create', ['fx.transitions.assist'])

  .factory('SlideTransition', ['TransAssist', function (TransAssist) {
    var slide,
        orignalCSS = {};

    return function (effect) {

      angular.extend(defaults, effect);

      if (effect.from) {
        this.enter = function (el, done) {
          orignalCSS.position = el.css('position');
          cssMixin(el);

          TransAssist.addTimer(el, effect.duration, done);

          slide = new TLM();

          slide.from(el, effect.duration, effect.from)
               .to(el, effect.duration, effect.to);
          return function (cancel) {
            if(cancel) {
              TransAssist.removeTimer(el);
            }
          };
        };

      } else if (!effect.from && effect.to) {
        this.leave = function (el, done) {

          cssMixin(el);

          TransAssist.addTimer(el, effect.duration, done);

          slide = new TLM();

          slide.to(el, effect.duration, effect.to);

          return function (cancel) {
            if(cancel) {
              TransAssist.removeTimer(el);
            }
          };
          // el.css('position', 'absolute');
          // el.css('z-index', '9999');

          // slide = new TLM({onComplete: finish(done)});

          // slide.from(el, effect.duration, effect.from)
          //      .to(el, effect.duration, effect.to);

          // el.css('z-index', '9999');
          // var page = new TLM({onComplete: finish(done)});
          // page.to(el, {transform: 'rotateZ(0deg)'})
          //     .to(el, 0.2, {transform: 'rotateZ(10deg)'})
          //     .to(el, 0.2, {transform: 'rotateZ(17deg)'})
          //     .to(el, 0.4, {transform: 'rotateZ(15deg)'})
          //     .to(el, 0.2, {transform: 'translateY(100%) rotateZ(17deg)'});
        };
      }
    };
  }]);

  function cssMixin (el) {
    el.css('position', 'absolute');
    // leave ? el.css('z-index', '9999') : void 0;
  }

}(angular, TimelineMax));

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Using Angular's '.animate', all fade animations are created with javaScript.

    @BounceAnimation
      Constructor function that returns a new animation object that has all
      required methods for ngAnimate ex: this.enter(), this.leave(), etc

    @effect
      The actual animation that will be applied to the element, staggered
       first: the style to applied to the element 1/4 through the animtion
       mid: style to be applied to to the element 2/4 through the animation
       third: style to be applied to the element 3/4 through the animation
       end: style to be applied to the element when it's complete
       animation: the name of the animtion for the eventing system
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

*/

(function(angular){
  "use strict";

  angular.module('fx.animations.bounces', ['fx.animations.create'])

  .animation('.fx-bounce-normal', ['BounceAnimation', function (BounceAnimation){
    var effect = {
      first: {opacity: 0, transform: 'scale(.3)'},
      mid: {opacity: 1, transform: 'scale(1.05)'},
      third: {transform: 'scale(.9)'},
      end: {opacity: 1, transform: 'scale(1)'},
      animation: 'bounce-normal'
    };

    return new BounceAnimation(effect);
  }])

  .animation('.fx-bounce-down', ['BounceAnimation', function (BounceAnimation){
    var effect = {
      first: {opacity: 0, transform: 'translateY(-2000px)'},
      mid: {opacity: 1, transform: 'translateY(30px)'},
      third: {transform: 'translateY(-10px)'},
      end: {transform: 'translateY(0)'},
      animation: 'bounce-down'
    };


    return new BounceAnimation(effect);
  }])

  .animation('.fx-bounce-left', ['BounceAnimation', function (BounceAnimation){
    var effect = {
      first: {opacity: 0,  transform: 'translateX(-2000px)'},
      mid: {opacity: 1, transform: 'translateX(30px)'},
      third: {transform: 'translateX(-10px)'},
      end: {transform: 'translateX(0)'},
      animation: 'bounce-left'
    };

    return new BounceAnimation(effect);
  }])

  .animation('.fx-bounce-up', ['BounceAnimation', function (BounceAnimation) {
    var effect = {
      first: {opacity: 0,   transform: 'translateY(2000px)'},
      mid: {opacity: 1, transform: 'translateY(-30px)'},
      third: {transform: 'translateY(10px)'},
      end: {transform: 'translateY(0)'},
      animation: 'bounce-up'
    };
    return new BounceAnimation(effect);
  }])

  .animation('.fx-bounce-right', ['BounceAnimation', function (BounceAnimation) {
    var effect = {
      first: {opacity: 0,   transform: 'translateX(2000px)'},
      mid: {opacity: 1, transform: 'translateX(-30px)'},
      third: {transform: 'translateX(10px)'},
      end: {transform: 'translateX(0)'},
      animation: 'bounce-right'
    };
    return new BounceAnimation(effect);
  }]);
}(angular));

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Using Angular's '.animate', all fade animations are created with javaScript.

    @FadeAnimation
      Constructor function that returns a new animation object that has all
      required methods for ngAnimate ex: this.enter(), this.leave(), etc

    @effect
      The actual animation that will be applied to the element
       enter: style to be applied when angular triggers the enter event
       leave: style to be applied when angular triggers the leave event
       inverse: style to be appiled to offset the enter event
       animation: the name of the animtion for the eventing system
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

*/


(function(angular){
  "use strict";

  angular.module('fx.animations.fades', ['fx.animations.create'])

  .animation('.fx-fade-normal', ['FadeAnimation', function (FadeAnimation){
    var effect = {
      enter: {opacity: 1},
      leave: {opacity: 0},
      animation: 'fade-normal'
    };
    return new FadeAnimation(effect);
  }])


  .animation('.fx-fade-down', ['FadeAnimation', function (FadeAnimation){
    var effect = {
      enter: {opacity: 1, transform: 'translateY(0)'},
      leave: {opacity: 0, transform: 'translateY(-20px)'},
      inverse: {opacity: 0, transform: 'translateY(20px)'},
      animation: 'fade-down'
    };
    return new FadeAnimation(effect);
  }])

  .animation('.fx-fade-down-big', ['FadeAnimation', function (FadeAnimation){
    var effect = {
      enter: {opacity: 1, transform: 'translateY(0)'},
      leave: {opacity: 0, transform: 'translateY(-2000px)'},
      inverse: {opacity: 0, transform: 'translateY(2000px)'},
      animation: 'fade-down-big'
    };
    return new FadeAnimation(effect);
  }])

  .animation('.fx-fade-left', ['FadeAnimation', function (FadeAnimation){
    var effect = {
      enter: {opacity: 1, transform: 'translateX(0)'},
      leave: {opacity: 0, transform: 'translateX(-20px)'},
      inverse: {opacity: 0, transform: 'translateX(20px)'},
      animation: 'fade-left'
    };
    return new FadeAnimation(effect);
  }])

  .animation('.fx-fade-left-big', ['FadeAnimation', function (FadeAnimation){
    var effect = {
      enter: {opacity: 1, transform: 'translateX(0)'},
      leave: {opacity: 0, transform: 'translateX(-2000px)'},
      inverse: {opacity: 0, transform: 'translateX(2000px)'},
      animation: 'fade-left-big'
    };

    return new FadeAnimation(effect);
  }])

  .animation('.fx-fade-right', ['FadeAnimation', function (FadeAnimation){
    var effect = {
      enter: {opacity: 1, transform: 'translateX(0)'},
      leave: {opacity: 0, transform:'translateX(20px)'},
      inverse: {opacity: 0, transform: 'translateX(-20px)'},
      animation: 'fade-right'
    };

    return new FadeAnimation(effect);
  }])

  .animation('.fx-fade-right-big', ['FadeAnimation', function (FadeAnimation){
    var effect = {
      enter: {opacity: 1, transform: 'translateX(0)'},
      leave: {opacity: 0, transform:'translateX(2000px)'},
      inverse: {opacity: 0, transform: 'translateX(-2000px)'},
      animation: 'fade-right-big'
    };

    return new FadeAnimation(effect);
  }])

  .animation('.fx-fade-up', ['FadeAnimation', function (FadeAnimation){
    var effect = {
      enter: {opacity: 1, transform: 'translateY(0)'},
      leave: {opacity: 0, transform:'translateY(20px)'},
      inverse: {opacity: 0, transform: 'translateY(-20px)'},
      animation: 'fade-up'
    };

    return new FadeAnimation(effect);
  }])

  .animation('.fx-fade-up-big', ['FadeAnimation', function (FadeAnimation){
    var effect = {
      enter: {opacity: 1, transform: 'translateY(0)'},
      leave: {opacity: 0, transform:'translateY(2000px)'},
      inverse: {opacity: 0, transform: 'translateY(-2000px)'},
      animation: 'fade-up-big'
    };

    return new FadeAnimation(effect);
  }]);
  // .animation('.fx-view-rotate', function () {
  //   return {
  //     enter: function (el, done) {
  //       var mydone = function (el) {
  //         el.css('z-index', 0);
  //         return done;
  //       };
  //       var page = new TimelineMax({onComplete: mydone(el)});
  //       page.from(el, 1.0, {transform: 'translateZ(0) scale(0.8)', opacity: '0.3'});
  //     },
  //     leave: function (el, done) {
        // el.css('z-index', '9999');
        // var page = new TimelineMax({onComplete: done});
        // page.to(el, {transform: 'rotateZ(0deg)'})
        //     .to(el, 0.2, {transform: 'rotateZ(10deg)'})
        //     .to(el, 0.2, {transform: 'rotateZ(17deg)'})
        //     .to(el, 0.4, {transform: 'rotateZ(15deg)'})
        //     .to(el, 0.2, {transform: 'translateY(100%) rotateZ(17deg)'})
  //     }
  //   }
  // });
}(angular));


/*
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Using Angular's '.animate', all fade animations are created with javaScript.

    @BounceAnimation
      Constructor function that returns a new animation object that has all
      required methods for ngAnimate ex: this.enter(), this.leave(), etc

    @effect
      The actual animation that will be applied to the element, staggered
       first: the style to applied to the element 1/4 through the animtion
       mid: style to be applied to to the element 2/4 through the animation
       third: style to be applied to the element 3/4 through the animation
       end: style to be applied to the element when it's complete
       animation: the name of the animtion for the eventing system
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

*/

(function(angular){
  "use strict";

  angular.module('fx.animations.rotations', ['fx.animations.create'])

  .animation('.fx-rotate-counterclock', ['RotateAnimation', function(RotateAnimation){
    var effect = {
      start: {opacity: 0, transformOrigin: 'center center', transform: 'rotate(-200deg)'},
      end: {opacity: 1, transformOrigin: 'center center', transform: 'rotate(0)'},
      inverse: {opacity: 0, transformOrigin: 'center center', transform: 'rotate(200deg)'},
      animation: 'rotate-counterclock'
    };
    return new RotateAnimation(effect);
  }])

  .animation('.fx-rotate-clock', ['RotateAnimation', function(RotateAnimation){
    var effect = {
      start: {opacity: 0, transformOrigin: 'center center', transform: 'rotate(200deg)'},
      end: {opacity: 1, transformOrigin: 'center center', transform: 'rotate(0)'},
      inverse: {opacity: 0, transformOrigin: 'center center', transform: 'rotate(-200deg)'},
      animation: 'rotate-clock'
    };
    return new RotateAnimation(effect);
  }])
  .animation('.fx-rotate-clock-left', ['RotateAnimation', function(RotateAnimation){
    var effect = {
      start: {opacity: 0, transformOrigin: 'left bottom', transform: 'rotate(-90deg)'},
      end: {opacity: 1, transformOrigin: 'left bottom', transform: 'rotate(0)'},
      inverse: {opacity: 0, transformOrigin: 'left bottom', transform: 'rotate(90deg)'},
      animation: 'rotate-clock-left'
    };
    return new RotateAnimation(effect);
  }])
  .animation('.fx-rotate-counterclock-right', ['RotateAnimation', function(RotateAnimation){
    var effect = {
      start: {opacity: 0, transformOrigin: 'right bottom', transform: 'rotate(90deg)'},
      end: {opacity: 1, transformOrigin: 'right bottom', transform: 'rotate(0)'},
      inverse: {opacity: 0, transformOrigin: 'right bottom', transform: 'rotate(-90deg)'},
      animation: 'rotate-counterclock-right'
    };
    return new RotateAnimation(effect);
  }])
  .animation('.fx-rotate-counterclock-up', ['RotateAnimation', function(RotateAnimation){
    var effect = {
      start: {opacity: 0, transformOrigin: 'left bottom', transform: 'rotate(90deg)'},
      end: {opacity: 1, transformOrigin: 'left bottom', transform: 'rotate(0)'},
      inverse: {opacity: 0, transformOrigin: 'left bottom', transform: 'rotate(-90deg)'},
      animation: 'rotate-counterclock-up'
    };
    return new RotateAnimation(effect);
  }])
  .animation('.fx-rotate-clock-up', ['RotateAnimation', function(RotateAnimation){
    var effect = {
      start: {opacity: 0, transformOrigin: 'right bottom', transform: 'rotate(-90deg)'},
      end: {opacity: 1, transformOrigin: 'right bottom', transform: 'rotate(0)'},
      inverse: {opacity: 0, transformOrigin: 'right bottom', transform: 'rotate(90deg)'},
      animation: 'rotate-clock-up'
    };
    return new RotateAnimation(effect);
  }]);

}(angular));
(function(angular){
  "use strict";

  angular.module('fx.animations.zooms', ['fx.animations.create'])

  .animation('.fx-zoom-normal', ['ZoomAnimation', function (ZoomAnimation){
    var effect = {
      start: {opacity: 0, transform: 'scale(.3)'},
      end: {opacity: 1, transform: 'scale(1)'},
      animation: 'zoom-normal'
    };

    return new ZoomAnimation(effect);
  }])

  .animation('.fx-zoom-down', ['ZoomAnimation', function (ZoomAnimation){
    var effect = {
      start: {opacity: 0, transform: 'scale(.1) translateY(-2000px)'},
      end: {opacity: 1, transform: 'scale(1) translateY(0)'},
      animation: 'zoom-down'
    };

    return new ZoomAnimation(effect);
  }])

  .animation('.fx-zoom-up', ['ZoomAnimation', function (ZoomAnimation){
    var effect = {
      start: {opacity: 0, transform: "scale(.1) translateY(2000px)"},
      end: {opacity: 1, transform: "scale(1) translateY(0)"},
      animation: 'zoom-up'
    };

    return new ZoomAnimation(effect);
  }])

  .animation('.fx-zoom-right', ['ZoomAnimation', function (ZoomAnimation){
    var effect = {
      start: {opacity: 0, transform: 'scale(.1) translateX(2000px)'},
      end: {opacity: 1, transform: 'scale(1) translateX(0)'},
      animation: 'zoom-right'
    };

    return new ZoomAnimation(effect);
  }])

  .animation('.fx-zoom-left', ['ZoomAnimation', function (ZoomAnimation){
    var effect = {
      start: {opacity: 0, transform: 'scale(.1) translateX(-2000px)'},
      end: {opacity: 1, transform: 'scale(1) translateX(0)'},
      animation: 'zoom-left'
    };

    return new ZoomAnimation(effect);
  }]);
}(angular));
(function (angular, TLM) {
  "use strict";

  angular.module('fx.transitions.slides', ['fx.transitions.create'])

  .animation('.fx-slide-in-left', ['SlideTransition', function (SlideTransition) {

    var effect = {
      from: { transform: 'translateZ(0) translateX(100%)'},
      to: { transform: 'translateX(0)'},
      duration: 0.5
    };

    return new SlideTransition(effect);
  }])
  .animation('.fx-slide-out-left', ['SlideTransition', function (SlideTransition) {

    var effect = {
      to: { transform: 'translateZ(0) translateX(-100%)'},
      duration: 0.5
    };

    return new SlideTransition(effect);
  }])
  .animation('.fx-slide-in-right', ['SlideTransition', function (SlideTransition) {

    var effect = {
      from: { transform: 'translateZ(0) translateX(-100%)'},
      to: { transform: 'translateX(0)'},
      duration: 0.5
    };

    return new SlideTransition(effect);

  }])
  .animation('.fx-slide-out-right', ['SlideTransition', function (SlideTransition) {

    var effect = {
      to: { transform: 'translateZ(0) translateX(100%)'},
      duration: 0.5
    };

    return new SlideTransition(effect);
  }])
  .animation('.fx-slide-in-down', ['SlideTransition', function (SlideTransition) {

    var effect = {
      from: { transform: 'translateZ(0) translateY(-100%)'},
      to: { transform: 'translateX(0)'},
      duration: 0.5
    };

    return new SlideTransition(effect);
  }])
  .animation('.fx-slide-out-down', ['SlideTransition', function (SlideTransition) {

    var effect = {
      to: { transform: 'translateZ(0) translateY(100%)'},
      duration: 0.5
    };

    return new SlideTransition(effect);
  }])
  .animation('.fx-slide-in-up', ['SlideTransition', function (SlideTransition) {

    var effect = {
      from: { transform: 'translateZ(0) translateY(100%)'},
      to: { transform: 'translateX(0)'},
      duration: 0.5
    };

    return new SlideTransition(effect);
  }])
  .animation('.fx-slide-out-up', ['SlideTransition', function (SlideTransition) {

    var effect = {
      to: { transform: 'translateZ(0) translateY(-100%)'},
      duration: 0.5
    };

    return new SlideTransition(effect);
  }]);
}(angular, TimelineMax));
(function  (angular, TLM) {
  "use strict";

  angular.module('fx.transitions.specials', [])

  .animation('.fx-fall-out', function () {
    // var effect = {
    //   from: {}
    // };


    return {
      leave: function (el, done) {
        el.css('z-index', '9999');
        var page = new TLM({onComplete: done});
        page.to(el, {transform: 'rotateZ(0deg)'})
            .to(el, 0.1, {transform: 'rotateZ(10deg)'})
            .to(el, 0.3, {transform: 'rotateZ(17deg)'})
            .to(el, 0.5, {transform: 'rotateZ(15deg)'})
            .to(el, 0.2, {transform: 'translateY(100%) rotateZ(17deg)'});
      }
    };
    // return new SlideTransition(effect);
  });
}(angular, TimelineMax));
(function (angular) {
  "use strict";
  angular.module('fx.events.flip', ['fx.animations.create'])

  .animation('.fx-flipY', ['Flip3d' ,function (Flip3d){
    var effect = {
      transform: {transform:'rotate3d(0,1,0,180deg)'},
      reset: {transform:'rotateY(0)'},
      axis: 'Y',
      duration: 0.8
    };
    return new Flip3d(effect);
  }])

  .animation('.fx-flipX', ['Flip3d' ,function (Flip3d){
    var effect = {
      transform: {transform:'rotate3d(1,0,0,180deg)'},
      reset: {transform:'rotateX(0)'},
      axis: 'X',
      duration: 0.8
    };
    return new Flip3d(effect);
  }])

  .animation('.fx-flipZ', ['Flip3d' ,function (Flip3d){
    var effect = {
      transform: {transform:'rotate3d(0,0,1,180deg)'},
      reset: {transform:'rotateZ(0)'},
      axis: 'Z',
      duration: 0.8
    };
    return new Flip3d(effect);
  }]);
}(angular));
(function(angular, TweenMax){
  "use strict";
  angular.module('fx.directives.flips', [])

  .directive('fxFlip', ['$animate', function($animate){
    function postlink(scope, el, attr){
      var front,
          back,
          wrapper = angular.element(el.children()[0]),
          events = attr.fxFlip.split(' '),
          axis = attr.axis.toUpperCase();

      angular.forEach(el.children().children(), function(child){
        child = angular.element(child);
        if(child.hasClass('fx-front')){front = child;}
        if(child.hasClass('fx-back')) {back = child;}
      });

      back.css({position: 'absolute', width: '100%', height: '100%'});
      front.css({position: 'absolute', width: '100%', height: '100%'});

      TweenMax.set(el, {perspective: 800, border: 'solid 2px black'});
      TweenMax.set(wrapper, {transformStyle: 'preserve-3d', width: '100%', height: '100%'});
      TweenMax.set(back, {transform: 'rotate3d(0,1,0,-180deg)'});
      TweenMax.set([back, front], {backfaceVisibility: 'hidden'});

      angular.forEach(events, function(event){
        el.bind(event, function(){
          if(el.hasClass('fx-flip'+axis)){
            $animate.removeClass(el, 'fx-flip'+axis);
          } else {
            $animate.addClass(el, 'fx-flip'+axis);
          }
        });
      });
    }
    return {
      replace: true,
      transclude: true,
      scope: true,
      template:
        '<div ng-transclude></div>',
      link: postlink
    };
  }]);
}(angular, TweenMax));
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
                  leave = $route.current && $route.current.$$route.animation && $route.current.$$route.animation.leave;

              if (angular.isDefined(template)) {
                var newScope = scope.$new();
                var current = $route.current;

                var clone = $transclude(newScope, function(clone) {
                  // clone.hasClass
                  clone.addClass(enter);
                  clone.addClass(leave);
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
                    leave           = $state.$current && $state.$current.animation && $state.$current.animation.leave;

                if (!firstTime && previousLocals === latestLocals) return; // nothing to do

                var clone = $transclude(newScope, function(clone) {
                  clone.addClass(enter);
                  clone.addClass(leave);
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

