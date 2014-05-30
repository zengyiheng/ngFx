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