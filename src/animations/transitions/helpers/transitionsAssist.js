(function (angular) {
  "use strict";
  var timeoutKey = '$$fxtimer';
  angular.module('fx.transitions.assist', [])

  .factory('TransAssist', function ($timeout) {
    function addTimer (el, done) {
      var timer = $timeout(function () {
        console.log('in timer');
        done();
      }, 600);
      el.data(timeoutKey, timer);
    }

    function removeTimer (el) {
      var timer = el.data(timeoutKey);
      if (timer) {
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