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

          TransAssist.addTimer(el, done);

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

          TransAssist.addTimer(el, done);

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