(function (angular, TLM) {
  "use strict";
  var defaults = {
    from: null,
    to: null,
    duration: 1
  };

  function finish (done) {
    console.log('finish');
    return done;
  }

  angular.module('fx.transitions.create', [])

  .factory('SlideTransition', [function () {
    var slide;

    return function (effect) {
      angular.extend(defaults, effect);

      this.enter = function (el, done) {
        el.css('position', 'absolute');

        slide = new TLM({onComplete: finish(done)});

        slide.from(el, effect.duration, effect.from)
             .to(el, effect.duration, effect.to);
      };

      this.leave = function (el, done) {
        // el.css('position', 'absolute');
        // el.css('z-index', '9999');

        // slide = new TLM({onComplete: finish(done)});

        // slide.from(el, effect.duration, effect.from)
        //      .to(el, effect.duration, effect.to);

        el.css('z-index', '9999');
        var page = new TLM({onComplete: finish(done)});
        page.to(el, {transform: 'rotateZ(0deg)'})
            .to(el, 0.2, {transform: 'rotateZ(10deg)'})
            .to(el, 0.2, {transform: 'rotateZ(17deg)'})
            .to(el, 0.4, {transform: 'rotateZ(15deg)'})
            .to(el, 0.2, {transform: 'translateY(100%) rotateZ(17deg)'});
      };
    };
  }]);
}(angular, TimelineMax));