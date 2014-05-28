(function (angular, TLM) {
  "use strict";

  angular.module('fx.transitions.slides', ['fx.transitions.create'])

  .animation('.fx-slide-in-right', ['SlideTransition', function (SlideTransition) {
    var slide;

    var effect = {
      from: { transform: 'translateX(100%)'},
      to: { transform: 'translateX(0)'},
      duration: 0.5
    };

    return {
      enter: function (el, done) {
        el.css('position', 'absolute');

        slide = new TLM({onComplete: done});

        slide.from(el, effect.duration, effect.from)
             .to(el, effect.duration, effect.to);
      }

    };

    // return new SlideTransition(effect);
  }])

  .animation('.fx-fall-out', ['SlideTransition', function (SlideTransition) {
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
  }]);
}(angular, TimelineMax));