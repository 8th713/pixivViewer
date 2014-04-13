angular.module('common.directives.notification', [])
.service('notes', [  '$timeout',
function notesFactory($timeout) {
  this.data = [];

  this.add = function add(type, text) {
    var note = {
      type: type,
      text: text
    };

    this.data.push(note);

    var notes = this;
    note.promise = $timeout(function () {
      notes.remove(note);
    }, 10 * 1000);
  };

  this.remove = function remove(note) {
    var index = _.indexOf(this.data, note);

    if (index > -1) {
      this.data.splice(index, 1);
      $timeout.cancel(note.promise);
    }
  };

  this.log = function log(text) {
    this.add('log', text);
  };

  this.error = function error(text) {
    this.add('err', text);
  };
}])
.directive('notification', ['notes',
function notificationFactory(notes) {
  return {
    template: '<div ng-repeat="note in notes" ng-class="note.type" ng-click="close(note)">{{ note.text }}</div>',
    scope: {},
    link: function linkFn(scope) {
      scope.notes = notes.data;

      scope.close = function close(note) {
        notes.remove(note);
      };
    }
  };
}]);
