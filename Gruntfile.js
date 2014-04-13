module.exports = function(grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ["app"],
    copy: {
      manifest: {
        options: {
          processContent: function(content) {
            return grunt.template.process(content);
          }
        },
        src: ['src/manifest.json'],
        dest: 'app/manifest.json'
      },
      fonts: {
        src: ['assets/font-awesome/fonts/font-awesome.woff'],
        dest: 'app/fonts/font.woff'
      },
      icons: {
        expand: true,
        cwd: 'assets/',
        src: ['icons/*'],
        dest: 'app/'
      }
    },
    jade: {
      release: {
        options: {
          data: {
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'app/index.html': ['src/jade/index.jade']
        }
      }
    },
    less: {
      release: {
        files: {
          'app/styles.css': ['src/less/styles.less']
        }
      }
    },
    concat: {
      vendor: {
        files: {
          'app/js/vendor.js': [
            'components/lodash/dist/lodash.min.js',
            'components/angular/angular.js',
            'components/angular-animate/angular-animate.js'
          ]
        }
      },
      message: {
        files: {
          'app/js/message.js': ['src/js/message/**/*.js']
        }
      },
      common: {
        files: {
          'app/js/common.js': ['src/js/common/**/*.js']
        }
      },
      api: {
        files: {
          'app/js/api.js': ['src/js/api/**/*.js']
        }
      },
      viewer: {
        files: {
          'app/js/viewer.js': ['src/js/viewer/**/*.js']
        }
      },
      sorter: {
        files: {
          'app/js/sorter.js': ['src/js/sorter/**/*.js']
        }
      },
      popular: {
        files: {
          'app/js/popular.js': ['src/js/popular/**/*.js']
        }
      }
    },
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
      less: function () {
        return 'less';
      },
      js: function (filepath) {
        var matched = /^src\/js\/([^\/]+)\/.+$/.exec(filepath);

        if (matched) {
          return 'concat:' + matched[1];
        }
        return;
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

  grunt.registerTask('build',   ['clean', 'copy', 'jade', 'less', 'concat']);
  grunt.registerTask('release', ['build', 'crx']);
  grunt.registerTask('default', ['build', 'esteWatch']);
};
