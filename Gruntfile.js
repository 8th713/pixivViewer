module.exports = function(grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  var concat = {
    options: {
      process: function(src, filepath) {
        return '// Source: ' + filepath + '\n' + src;
      },
      preserveComments: false
    },
    libs: {
      options: {
        process: false,
        banner: '/* this file is generated by concat task of grunt.js */\n'
      },
      src: [
        'assets/vendor/lodash.min.js',
        'assets/vendor/angular.min.js'
      ],
      dest: 'dist/libs.js'
    },
    viewer: {
      src: 'src/js/viewer/**/*.js',
      dest: 'dist/viewer.js'
    },
    sorter: {
      src: 'src/js/sorter/bootstrap.js',
      dest: 'dist/sorter.js'
    },
    filter: {
      src: 'src/js/filter/bootstrap.js',
      dest: 'dist/filter.js'
    },
    inject: {
      src: 'src/js/inject/*.js',
      dest: 'dist/inject.js'
    }
  };
  var uglify = grunt.util._.omit(concat, 'libs');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      manifest: {
        options: {
          processContent: function(content) {
            return grunt.template.process(content);
          }
        },
        src: ['src/manifest.json'],
        dest: 'dist/manifest.json'
      },
      fonts: {
        src: ['assets/fontello/font/fontello.woff'],
        dest: 'dist/fonts/font.woff'
      },
      icons: {
        expand: true,
        cwd: 'assets/',
        src: ['icons/*'],
        dest: 'dist/'
      }
    },
    jade: {
      viewer: {
        options: {
          data: {
            version: '<%= pkg.version %>'
          }
        },
        src: 'src/view/main.jade',
        dest: 'dist/viewer.html'
      },
      filter: {
        src: 'src/view/filter.jade',
        dest: 'dist/filter.html'
      }
    },
    less: {
      release: {
        options: {
          yuicompress: true
        },
        files: {
          'dist/style.css': ['src/less/style.less']
        }
      }
    },
    concat: concat,
    uglify: uglify,
    esteWatch: {
      options: {
        dirs: ['src/**/'],
        livereload: {
          enabled: false
        }
      },
      json: function () {
        return 'copy:manifest';
      },
      jade: function () {
        return 'jade';
      },
      js: function (filepath) {
        var matched = /^src\/js\/([^\/]+)\/.+$/.exec(filepath);

        if (matched) {
          return 'concat:' + matched[1];
        }
        return;
      },
      less: function () {
        return 'less';
      }
    },
    crx: {
      release: {
        options: {
          pem: 'pixivViewer.pem'
        },
        files: {
          'pixivViewer.crx': 'dist/',
          '<%= pkg.version %>.crx': 'dist/'
        }
      }
    }
  });

  grunt.registerTask('pre',     ['copy', 'jade', 'less']);
  grunt.registerTask('build',   ['pre', 'concat']);
  grunt.registerTask('min',     ['pre', 'concat:libs', 'uglify']);
  grunt.registerTask('release', ['min', 'crx']);
  grunt.registerTask('default', ['build', 'esteWatch']);
};
