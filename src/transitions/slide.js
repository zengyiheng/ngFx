(function (angular) {
  "use strict";

  angular.module('fx.transitions.slides', ['fx.transitions.create'])

  .animation('.fx-view-slide-right', ['SlideTransition', function (SlideTransition) {
    var effect = {
      from: { transform: 'translateX(100%)'},
      to: { transform: 'translateX(0)'},
      duration: 0.5
    };

    return new SlideTransition(effect);
  }]);
}(angular));