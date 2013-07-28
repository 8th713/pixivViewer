/* global module:false */
module.exports = function(grunt) {
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
      assets: {
        expand: true,
        cwd: 'assets/',
        src: [ 'fonts/*', 'icons/*' ],
        dest: 'dist/'
      }
    },
    jade: {
      dev: {
        options: {
          pretty: true,
          data: {
            debug: false,
            name: '<%= pkg.name %>',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'dist/viewer.html': ['src/view/main.jade'],
          'dist/filter.html': ['src/view/filter.jade']
        }
      },
      production: {
        options: {
          data: {
            debug: false,
            name: '<%= pkg.name %>',
            version: '<%= pkg.version %>'
          }
        },
        files: {
          'dist/viewer.html': ['src/view/main.jade'],
          'dist/filter.html': ['src/view/filter.jade']
        }
      }
    },
    less: {
      dev: {
        options: {
          paths: ['src/less']
        },
        files: {
          'dist/style.css': ['src/less/style.less']
        }
      },
      production: {
        options: {
          paths: ['src/less'],
          yuicompress: true
        },
        files: {
          'dist/style.css': ['src/less/style.less']
        }
      }
    },
    concat: {
      options: {
        process: function(src, filepath) {
          return '// Source: ' + filepath + '\n' + src;
        }
      },
      libs: {
        options: {
          banner: '/* this file is generated by concat task of grunt.js */\n'
        },
        src: [
          'assets/vendor/lodash.min.js',
          'assets/vendor/angular.min.js'
        ],
        dest: 'dist/libs.js'
      },
      viewer: {
        src: [
          'src/js/viewer/bootstrap.js',
          'src/js/viewer/*/*.js'
        ],
        dest: 'dist/viewer.js'
      },
      sorter: {
        src: [
          'src/js/sorter/bootstrap.js'
        ],
        dest: 'dist/sorter.js'
      },
      filter: {
        src: [
          'src/js/filter/bootstrap.js'
        ],
        dest: 'dist/filter.js'
      }
    },
    uglify: {
      options: {
        preserveComments: false,
        beautify: {
          max_line_len: 128
        }
      },
      viewer: {
        src: [
          'src/js/viewer/bootstrap.js',
          'src/js/viewer/*/*.js'
        ],
        dest: 'dist/viewer.js'
      },
      sorter: {
        src: [
          'src/js/sorter/bootstrap.js'
        ],
        dest: 'dist/sorter.js'
      },
      filter: {
        src: [
          'src/js/filter/bootstrap.js'
        ],
        dest: 'dist/filter.js'
      }
    },
    regarde: {
      jade: {
        files: 'src/view/**/*.jade',
        tasks: ['jade:dev']
      },
      less: {
        files: 'src/less/**/*.less',
        tasks: ['less:dev']
      },
      viewer: {
        files: 'src/js/viewer/**/*.js',
        tasks: ['concat:viewer']
      },
      sorter: {
        files: 'src/js/sorter/**/*.js',
        tasks: ['concat:sorter']
      },
      filter: {
        files: 'src/js/filter/**/*.js',
        tasks: ['concat:filter']
      }
    },
    pack: {
      dev: {
        src: 'dist',
        dest: '<%= pkg.version %>',
        pem: '<%= pkg.name %>'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-regarde');

  grunt.registerMultiTask('pack', 'Creating a package', function () {
    var done = this.async();
    var dir = this.files[0].src[0];

    if (!grunt.file.isDir(dir)) {
      return;
    }

    var options = {
      cmd: 'packaging',
      args: [
        dir,
        this.files[0].dest,
        this.data.pem
      ]
    };

    grunt.util.spawn(options, done);
  });
  grunt.registerTask('build', ['copy', 'jade:dev', 'less:dev', 'concat']);
  grunt.registerTask('production', ['copy', 'jade:production', 'less:production', 'concat:libs', 'uglify', 'pack']);
  grunt.registerTask('default',    ['build', 'regarde']);
};
