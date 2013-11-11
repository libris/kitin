module.exports = (grunt) ->

  require('load-grunt-tasks') grunt

  grunt.registerTask 'default', ['build']

  grunt.registerTask 'build', [
    'vendor'
    'app'
    'cachebuster'
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
      options:
        sourceMap: true
        sourceMapFilename: 'static/css/main.css.map'       
        cleancss: true
      src:
        expand: true
        src:    'static/css/main.less'
        ext:    '.css'

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
          'static/build/*/*.min.css'
          'static/css/main.css'
          'static/build/*/*.min.js'
          'static/js/**/*.js'
          'static/js/{main,*locale*}.js'
        ]
        dest: 'templates/_media.html'

    watch:
      less:
        files: ['<%= less.src.src %>']
        tasks: ['less']
      coffee:
        files: ['<%= coffee.src.src %>']
        tasks: ['coffee']
      jshint:
        files: ['<%= jshint.app %>']
        tasks: ['jshint']
      cachebuster:
        files: ['<%= cachebuster.build.src %>']
        tasks: ['cachebuster']

    clean: [
      'static/build'
    ]

