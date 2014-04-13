angular.module('common.services.keys', [])
.service('keys', [  '$rootScope','$document',
function keysFactory($rootScope,  $document) {
  var map = {
    'A': 65,
    'B': 66,
    'C': 67,
    'D': 68,
    'E': 69,
    'F': 70,
    'G': 71,
    'H': 72,
    'I': 73,
    'J': 74,
    'K': 75,
    'L': 76,
    'M': 77,
    'N': 78,
    'O': 79,
    'P': 80,
    'Q': 81,
    'R': 82,
    'S': 83,
    'T': 84,
    'U': 85,
    'V': 86,
    'W': 87,
    'X': 88,
    'Y': 89,
    'Z': 90,
    'Enter': 13,
    'SHIFT': 16,
    'CTRL':  17,
    'ALT':   18,
    'Space': 32,
    '?':    191
  };

  for (var name in map) {
    new Key(name, map[name]);
  }

  function Key(name, code) {
    this.name = name;
    this.code = code;
    map[name] = Key[name] = this;
  }

  Key.fromCode = function fromCode(code) {
    for (var name in map) {
      if (map[name] && map[name].code === code) {
        return Key[name];
      }
    }
    return null;
  };

  function Cmb(key, meta) {
    this.key = key;

    if (arguments.length === 2) {
      this.ctrl  = _.contains(meta, Key.CTRL);
      this.alt   = _.contains(meta, Key.ALT);
      this.shift = _.contains(meta, Key.SHIFT);
    } else {
      this.ctrl  = false;
      this.alt   = false;
      this.shift = false;
    }
  }

  Cmb.fromKeys = function fromKeys(keysArr) {
    var key = keysArr[0];
    var meta = _.rest(keysArr);

    return new Cmb(key, meta);
  };

  Cmb.fromEvent = function fromEvent(evt) {
    var key = Key.fromCode(evt.keyCode);

    if (!key) {
      return null;
    }

    var meta = [];

    if (evt.ctrlKey) {
      meta.push(Key.CTRL);
    }
    if (evt.altKey) {
      meta.push(Key.ALT);
    }
    if (evt.shiftKey) {
      meta.push(Key.SHIFT);
    }

    if (meta.length) {
      return new Cmb(key, meta);
    } else {
      return new Cmb(key);
    }
  };

  Cmb.serialize = function serialize(cmb) {
    return JSON.stringify(cmb);
  };

  this.Key = Key;

  var bindings = [];
  var handlers = {};

  this.add = function add(name) {
    var binding = _.find(bindings, {name: name});
    var cmbs = _.chain(arguments)
                .rest()
                .map(wrapArray)
                .value();

    if (binding) {
      cmbs = _.union(binding.cmbs, cmbs);
      binding.cmbs = _.uniq(cmbs, Cmb.serialize);
    } else {
      bindings.push({
        name: name,
        cmbs: cmbs
      });
    }
  };

  function wrapArray(keys) {
    return Cmb.fromKeys(keys instanceof Array ? keys : [keys]);
  }

  this.on = function on(name, type, handler) {
    if (_.isFunction(type)) {
      handlers[name] = {
        type: 'keyup',
        handler: type
      };
    } else {
      handlers[name] = {
        type: type,
        handler: handler
      };
    }
  };

  this.off = function off(name) {
    delete handlers[name];
  };

  this.disabled = true;

  $document.on('keydown', handleKeydown);
  $document.on('keyup', handleKeydown);

  var that = this;

  function handleKeydown(evt) {
    if (evt.nodeName === 'INPUT') {
      return;
    }
    if (evt.nodeName === 'TEXTAREA') {
      return;
    }
    if (evt.nodeName === 'SELECT') {
      return;
    }
    if (that.disabled) {
      return;
    }

    var cmb = Cmb.fromEvent(evt);

    if (!cmb) {
      return;
    }

    var binding = _.find(bindings, extract);

    if (!binding) {
      return;
    }

    var handler = handlers[binding.name];

    if (!handler) {
      return;
    }

    $rootScope.$apply(function applyFn() {
      if (handler.type === evt.type) {
        handler.handler.call(null, evt);
      }
    });
    evt.preventDefault();
    evt.stopPropagation();

    function extract(binding) {
      return _.find(binding.cmbs, cmb);
    }
  }

  // this.on('say', function() {alert('Hello!!');});
  // this.add('say', Key.A, [Key.Enter, Key.SHIFT]);
  // if [A] or [SHIFT + Enter] pushed, invoke the say function.
}]);
