module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['vendor', 'app', 'ngtemplates', 'cachebuster']);
  grunt.registerTask('templates', ['ngtemplates']);
  grunt.registerTask('validate', ['htmlangular']);
  grunt.registerTask('vendor', ['bower:install', 'cssmin:vendor', 'uglify:vendor']);
  grunt.registerTask('app', ['less', 'coffee', 'jshint']);
  return grunt.initConfig({
    ngtemplates: {
      kitin: {
        cwd: 'templates',
        src: ['snippets/**/*.html'],
        dest: 'static/build/js/templates.js',
        options: {
          prefix: '/',
          url: function(url) {
            return url.replace(/\.html$/, "");
          },
          bootstrap: function(module, script) {
            return 'angular.module(\'kitin\').run([\'$templateCache\', function($templateCache) {\n' + script.replace(/\{%.+%\}/gi, '') + '}])';
          }
        }
      }
    },
    htmlangular: {
      options: {
        relaxerror: [
          'Stray doctype.', 
          'Non-space characters found without seeing a doctype first. Expected <!DOCTYPE html>.', 
          'Element head is missing a required instance of child element title.', 
          'Section lacks heading. Consider using h2-h6 elements to add identifying headings to all sections.', 
          'Comments seen before doctype. Internet Explorer will go into the quirks mode.'
        ],
        customtags: [
          'alert', 
          'kitin-*'
        ],
        wrapping: {
          'tr': '<table>{0}</table>',
          'td': '<table><tr>{0}</tr></table>'
        }
      },
      files: {
        src: ['templates/**/*.html']
      }
    },
    bower: {
      install: {
        options: {
          targetDir: 'static/vendor',
          cleanup: true,
          layout: 'byComponent'
        }
      }
    },
    less: {
      maincss: {
        files: {
          "static/build/css/main.css": "static/less/main.less"
        },
        options: {
          sourceMap: true,
          sourceMapFilename: 'static/build/css/main.css.map',
          sourceMapURL: 'main.css.map'
        }
      },
      bootstrapcss: {
        files: {
          "static/build/css/bootstrap.css": "static/less/bootstrap.less"
        }
      }
    },
    cssmin: {
      vendor: {
        options: {
          target: 'static/build/css/vendor.min.css',
          relativeTo: '/'
        },
        files: {
          'static/build/css/vendor.min.css': ['static/vendor/*/{,css/}*.css']
        }
      }
    },
    coffee: {
      options: {
        sourceMap: true,
        sourceRoot: ''
      },
      src: {
        expand: true,
        src: 'static/js/{,*/}*.coffee',
        ext: '.js'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      app: ['static/js/{,*/}*.js']
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      app: {
        files: {
          'static/build/js/app.min.js': ['static/js/*.js', 'static/js/**/*.js']
        }
      },
      vendor: {
        options: {
          sourceMap: 'static/build/js/vendor.min.js.map',
          sourceMappingURL: './vendor.min.js.map',
          sourceMapRoot: '/'
        },
        files: {
          'static/build/js/vendor.min.js': ['static/vendor/xhr-xdr-adapter/*.js', 'static/vendor/jquery/*.js', 'static/vendor/angular/*.js', 'static/vendor/angular-translate/*.js', 'static/vendor/angular-translate-loader-url/*.js', 'static/vendor/*/{,*/}*.js']
        }
      }
    },
    cachebuster: {
      build: {
        options: {
          formatter: function(hashes) {
            var hash, src;
            return '<!-- IMPORTANT: generated file; do not edit! -->\n' + ((function() {
              var _results;
              _results = [];
              for (src in hashes) {
                hash = hashes[src];
                if (src.match(/\.js$/)) {
                  _results.push("<script src='/" + src + "?v=" + hash + "'></script>");
                } else {
                  _results.push("<link rel='stylesheet' href='/" + src + "?v=" + hash + "' />");
                }
              }
              return _results;
            })()).join("\n");
          }
        },
        src: ['static/build/css/bootstrap.css', 'static/build/css/vendor.min.css', 'static/build/css/main.css', 'static/build/js/*.min.js', 'static/js/**/*.js', 'static/js/{main,*locale*}.js', 'static/build/js/templates.js'],
        dest: 'templates/_media.html'
      }
    },
    watch: {
      less: {
        files: ['static/less/*.less'],
        tasks: ['less']
      },
      css: {
        files: ['static/build/css/main.css'],
        options: {
          livereload: true
        }
      },
      coffee: {
        files: ['<%= coffee.src.src %>'],
        tasks: ['coffee']
      },
      jshint: {
        files: ['<%= jshint.app %>'],
        tasks: ['jshint']
      },
      cachebuster: {
        files: ['<%= cachebuster.build.src %>'],
        tasks: ['cachebuster']
      },
      ngtemplates: {
        files: ['templates/partials/**/*.html', 'templates/snippets/**/*.html'],
        tasks: ['ngtemplates']
      }
    },
    clean: ['static/build']
  });
};
