'use strict';

module.exports = function (grunt) {
  var path = require('path');
  var fs = require('fs');
  var cp = require('child_process');
  var localAppData = process.env.LOCALAPPDATA;
  var chrome = path.resolve(localAppData, 'Google/Chrome/Application/chrome.exe');

  function getPemFilePath(name) {
    if (grunt.file.exists(name + '.pem')) {
      return name + '.pem';
    }
    return false;
  }

  function rename(target, name) {
    var oldName = target + '.pem';
    var newName = name + '.pem';

    fs.renameSync(oldName, newName);
    grunt.log.ok('created file: ' + newName);
  }

  function copy(target, name) {
    var oldName = target + '.crx';
    var newName = name + '.crx';

    grunt.file.copy(oldName, newName);
    grunt.log.ok('created file: ' + newName);
  }

  grunt.registerMultiTask('packaging', 'Creating a package', function () {
    var that = this;
    var done = that.async();

    that.files.some(function (file) {
      if (!grunt.file.isDir(file.src[0])) {
        grunt.log.error(target + ' is not directory.');
        done();
        return false;
      }

      var target = path.resolve(file.src[0]);
      var dest = file.dest ? path.resolve(file.dest) : target;
      var pemPath = getPemFilePath(dest);
      var options = that.options({alias: []});

      var args = [
        '--pack-extension=' + target
      ];

      if (pemPath) {
        args.push('--pack-extension-key=' + pemPath);
      }

      function callback(err) {
        if (err) {
          done(err);
          return;
        }

        if (!pemPath) {
          rename(target, dest);
        }

        options.alias.forEach(function (alias) {
          copy(target, path.resolve(alias));
        });

        if (target !== dest) {
          copy(target, dest);
          grunt.file.delete(target + '.crx');
        }

        done();
      }

      cp.execFile(chrome, args, {}, callback);
      return false;
    });
  });
};
