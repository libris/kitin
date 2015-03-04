module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['app']);
  grunt.registerTask('all', ['vendor', 'app', 'validate']);
  grunt.registerTask('vendor', ['bower:install', 'cssmin:vendor', 'uglify:vendor']);
  grunt.registerTask('app', ['less', 'jshint', 'ngtemplates', 'cssmin:app', 'uglify:app', 'cachebuster']);
  grunt.registerTask('validate', ['htmlangular']);

  return grunt.initConfig({
    ngtemplates: {
      kitin: {
        cwd: 'templates',
        src: [
          'snippets/**/*.html',
          'dialogs/**/*.html'
        ],
        dest: 'static/build/js/app/templates.js',
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
          "static/build/css/app/main.css": "static/less/main.less"
        },
        options: {
          sourceMap: true,
          sourceMapFilename: 'static/build/css/app/main.css.map',
          sourceMapURL: 'main.css.map'
        }
      },
      bootstrapcss: {
        files: {
          "static/build/css/app/bootstrap.css": "static/less/bootstrap.less"
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
      },
      app: {
        options: {
          target: 'static/build/css/app.min.css',
          relativeTo: '/'
        },
        files: {
          'static/build/css/app.min.css': ['static/build/css/app/*.css']
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      app: ['static/js/{,*/}*.js', 'examples/translations/label_se.json']
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      app: {
        options: {
          mangle: false,
          sourceMap: 'static/build/js/app.min.js.map',
          sourceMappingURL: './app.min.js.map',
          sourceMapRoot: '/'
        },
        files: {
          'static/build/js/app.min.js': ['static/js/**/*.js', 'static/js/*.js', 'static/build/js/app/*.js']
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
      dev: {
        options: {formatter: createMediaFile},
        src: ['static/build/css/vendor.min.css', 'static/build/css/app/bootstrap.css', 'static/build/css/app/main.css', 'static/build/js/vendor.min.js', 'static/js/**/*.js', 'static/js/{main,*locale*}.js', '<%= ngtemplates.kitin.dest %>'],
        dest: 'templates/_media-dev.html'
      },
      prod: {
        options: {formatter: createMediaFile},
        src: ['static/build/css/*.min.css', 'static/build/js/vendor.min.js', 'static/build/js/app.min.js'],
        dest: 'templates/_media-prod.html'
      }
    },
    watch: {
      less: {
        files: ['static/less/*.less'],
        tasks: ['less']
      },
      css: {
        files: ['static/build/css/app/main.css'],
        options: {
          livereload: true
        }
      },
      jshint: {
        files: ['<%= jshint.app %>'],
        tasks: ['jshint'],
        options: {
          livereload: false
        }
      },
      cachebuster: {
        files: ['<%= cachebuster.dev.src %>'],
        tasks: ['cachebuster:dev']
      },
      ngtemplates: {
        files: ['templates/partials/**/*.html', 'templates/snippets/**/*.html', 'templates/dialogs/**/*.html'],
        tasks: ['ngtemplates']
      }
    },
    clean: ['static/build'],
    // Karma for unit testing
    karma: {
      unit: {
        configFile: 'test/js/config/karma.conf.js'
      }
    },
    // Protractor is now the preferred tool for e2e testing
    protractor: {
      // Options: https://www.npmjs.org/package/grunt-protractor-runner
      options: {
        configFile: "test/js/config/protractor.conf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false // If true, protractor will not use colors in its output.
      },
      search: {
        args: {
          suite: 'search'
        }
      },
      full: {
        args: {
          suite: 'full'
        }
      }
    }
  });
};

function createMediaFile(hashes) {
  var lines = [];
  for (var src in hashes) {
    var hash = hashes[src];
    if (src.match(/\.js$/)) {
      lines.push("<script src='/"+ src +"?v="+ hash +"'></script>");
    } else {
      lines.push("<link rel='stylesheet' href='/"+ src +"?v="+ hash +"' />");
    }
  }
  if(this.target === 'dev') {
    lines.push("<script src='//localhost:35729/livereload.js'></script>");
  }
  return '<!-- IMPORTANT: generated file; do not edit! -->\n' + lines.join("\n");
}
