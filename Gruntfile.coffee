module.exports = (grunt) ->

  require('load-grunt-tasks') grunt

  grunt.registerTask 'default', ['build']

  grunt.registerTask 'build', [
    'vendor'
    'app'
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
        compress: true
      src:
        expand: true
        src:    'static/css/*.less'
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
            'static/js/*.js'
          ]
      vendor:
        options:
          sourceMap: 'static/build/js/vendor.min.js.map'
        files:
          'static/build/js/vendor.min.js': [
            'static/vendor/jquery/*.js'
            'static/vendor/angular/*.js'
            'static/vendor/*/{,*/}*.js'
          ]

    watch:
      less:
        files: ['<%= less.src.src %>']
        tasks: ['less']
      coffee:
        files: ['<%= coffee.src.src %>']
        tasks: ['coffee']

    clean: [
      'static/build'
    ]

