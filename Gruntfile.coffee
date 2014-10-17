module.exports = (grunt) ->

  require('load-grunt-tasks') grunt

  grunt.registerTask 'default', ['build']

  grunt.registerTask 'build', [
    'vendor'
    'app'
    'ngtemplates'
    'cachebuster'
  ]

  grunt.registerTask 'validate', [
    'htmlangular'
  ]

  grunt.registerTask 'vendor', [
    'bower:install'
    'cssmin:vendor'
    'uglify:vendor'
  ]

  grunt.registerTask 'app', [
    'less'
    'coffee'
    'jshint'
    #'uglify:app'
    #'test'
  ]

  grunt.initConfig

    ngtemplates:
      kitin:
        cwd: 'templates'
        src: ['snippets/**/*.html'] # add partials/**/*.html after all script templates are moved to snippets
        dest: 'static/build/js/templates.js'
        options:
          prefix: '/'
          url: (url) ->
            return url.replace(/\.html$/, "")
          bootstrap: (module, script) ->
            return 'angular.module(\'kitin\').run([\'$templateCache\', function($templateCache) {\n' + script.replace(/\{%.+%\}/gi,'') + '}])' # removes python template stuff


    htmlangular:
      options: 
        relaxerror: [
          'Stray doctype.',
          'Non-space characters found without seeing a doctype first. Expected <!DOCTYPE html>.'
          'Element head is missing a required instance of child element title.'
          'Section lacks heading. Consider using h2-h6 elements to add identifying headings to all sections.'
        ]
        customtags: [
          'alert'
        ]
      files:
        src: ['templates/partials/**/*.html']

    bower:
      install:
        options:
          targetDir: 'static/vendor'
          cleanup: true
          layout: 'byComponent'

    #curl:
    #  fonts: ['http://www.fontsquirrel.com/fonts/Droid-Serif',
    #          'http://www.fontsquirrel.com/fonts/Open-Sans']

    less:
      maincss:
        files:
          "static/build/css/main.css": "static/less/main.less"
        options:
          sourceMap: true
          sourceMapFilename: 'static/build/css/main.css.map'
          sourceMapURL: 'main.css.map'
          #cleancss: true (disabled for less source maps to work properly)
      bootstrapcss:
        files:
          "static/build/css/bootstrap.css": "static/less/bootstrap.less"


    cssmin:
      vendor:
        options:
            target: 'static/build/css/vendor.min.css'
            relativeTo: '/'
        files:
          'static/build/css/vendor.min.css': [
            'static/vendor/*/{,css/}*.css'
          ]

    coffee:
      options:
        sourceMap: true
        sourceRoot: ''
      src:
        expand: true
        src: 'static/js/{,*/}*.coffee'
        ext: '.js'

    jshint:
      options:
        jshintrc: '.jshintrc'
      app: [
        'static/js/{,*/}*.js'
      ]

    uglify:
      options:
        preserveComments: 'some'
      app:
        files:
          'static/build/js/app.min.js': [
            'static/js/*.js',
            'static/js/**/*.js'
          ]
      vendor:
        options:
          sourceMap: 'static/build/js/vendor.min.js.map'
          sourceMappingURL: './vendor.min.js.map'
          sourceMapRoot: '/'
        files:
          'static/build/js/vendor.min.js': [
            'static/vendor/jquery/*.js'
            'static/vendor/angular/*.js'
            'static/vendor/angular-translate/*.js'
            'static/vendor/angular-translate-loader-url/*.js'
            'static/vendor/*/{,*/}*.js'
          ]

    cachebuster:
      build:
        options:
          formatter: (hashes) ->
            '<!-- IMPORTANT: generated file; do not edit! -->\n' +
            (for src, hash of hashes
              if src.match /\.js$/ then "<script src='/#{src}?v=#{hash}'></script>"
              else "<link rel='stylesheet' href='/#{src}?v=#{hash}' />").join("\n")
        # NOTE: Scripts also placed at top since this is a one-page app
        src: [
          'static/build/css/bootstrap.css'
          'static/build/css/vendor.min.css'
          'static/build/css/main.css'
          'static/build/js/*.min.js'
          'static/js/**/*.js'
          'static/js/{main,*locale*}.js'
          'static/build/js/templates.js'
        ]
        dest: 'templates/_media.html'

    watch:
      less:
        files: ['static/less/*.less']
        tasks: ['less']
      css:
        files: ['static/build/css/main.css']
        options: {livereload: true}
      coffee:
        files: ['<%= coffee.src.src %>']
        tasks: ['coffee']
      jshint:
        files: ['<%= jshint.app %>']
        tasks: ['jshint']
      cachebuster:
        files: ['<%= cachebuster.build.src %>']
        tasks: ['cachebuster']
      ngtemplates:
        files: ['templates/partials/**/*.html', 'templates/snippets/**/*.html']
        tasks: ['ngtemplates']


    clean: [
      'static/build'
    ]

