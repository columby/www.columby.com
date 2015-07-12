/***
 *
 * Build:
 *   build:development   --> Minified version with config for staging site (dev.columby.com)
 *   build:production    --> Minified version with config for production site (www.columby.com)
 *
 * Serve:
 *   serve:local         --> Uses local development files + local api
 *   serve:development   --> Uses local development files + development api
 *   serve:staging       --> Uses local built for staging files + development api
 *   serve:production    --> Uses local Build for staging files + production api
 *
 ***/

'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express       : 'grunt-express-server',
    useminPrepare : 'grunt-usemin',
    ngtemplates   : 'grunt-angular-templates',
    cdnify        : 'grunt-google-cdn',
    protractor    : 'grunt-protractor-runner',
    injector      : 'grunt-asset-injector',
    buildcontrol  : 'grunt-build-control',
    replace       : 'grunt-replace',
    htmlangular   : 'grunt-html-angular-validate',
    nggettext_extract: 'grunt-angular-gettext',
    nggettext_compile: 'grunt-angular-gettext',
    bump          : 'grunt-bump'
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);


  // Define the configuration for all the tasks
  grunt.initConfig({

    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        commit: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false,
        prereleaseName: false,
        regExp: false
      }
    },


    nggettext_extract: {
      pot: {
        files: {
          '<%= yeoman.client %>/translations/po/template.pot': ['<%= yeoman.client %>/views/**/*.html']
        }
      },
    },

    nggettext_compile: {
      all: {
        files: {
          '<%= yeoman.client %>/app/translations/translations.js': ['<%= yeoman.client %>/translations/po/*.po']
        }
      },
    },


    // Replace configuration settings
    replace: {
      local: {
        options: {
          patterns: [{
            json: grunt.file.readJSON('./client/config/local.json')
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['./client/config/config.js'],
          dest: '<%= yeoman.client %>/app/'
        }]
      },

      staging: {
        options: {
          patterns: [{
            json: grunt.file.readJSON('./client/config/development.json')
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['./client/config/config.js'],
          dest: '<%= yeoman.client %>/app/'
        }]
      },

      production: {
        options: {
          patterns: [{
            json: grunt.file.readJSON('./client/config/production.json')
          }]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['./client/config/config.js'],
          dest: '<%= yeoman.client %>/app/'
        }]
      }
    },

    // Project settings
    pkg: grunt.file.readJSON('package.json'),
    yeoman: {
      // configurable paths
      client: require('./bower.json').appPath || 'client',
      dist: 'dist'
    },
    express: {
      options: {
        port: 9000
      },
      development: {
        options: {
          script: 'server/server.js',
          debug: true
        }
      },
      dist: {
        options: {
          script: 'dist/server/server.js'
        }
      },
    },
    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },
    watch: {
      injectJS: {
        files: [
          '<%= yeoman.client %>/app/**/*.js',
          '!<%= yeoman.client %>/app/**/*.spec.js',
          '!<%= yeoman.client %>/app/**/*.mock.js',
          '!<%= yeoman.client %>/app/app.js'],
        tasks: ['injector:scripts']
      },
      injectCss: {
        files: [
          '<%= yeoman.client %>/assets/**/*.css'
        ],
        tasks: ['injector:css']
      },
      injectLess: {
        files: [
          '<%= yeoman.client %>/assets/**/*.less'],
        tasks: ['injector:less']
      },
      less: {
        files: [
          '<%= yeoman.client %>/assets/**/*.less'],
        tasks: ['less', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.client %>}/assets/**/*.css',
          '{.tmp,<%= yeoman.client %>}/app/**/*.html',
          '{.tmp,<%= yeoman.client %>}/app/**/*.js',
          '!{.tmp,<%= yeoman.client %>}{app,components}/**/*.spec.js',
          '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js',
          '<%= yeoman.client %>/assets/img/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        options: {
          livereload: 1139
        }
      },
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: 1339,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '<%= yeoman.client %>/.jshintrc',
        reporter: require('jshint-stylish')
      },
      server: {
        options: {
          jshintrc: 'server/.jshintrc'
        },
        src: [
          'server/**/*.js',
          '!server/**/*.spec.js'
        ]
      },
      all: [
        '<%= yeoman.client %>/{app,components}/**/*.js',
        '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
        '!<%= yeoman.client %>/{app,components}/**/*.mock.js'
      ],
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '!<%= yeoman.dist %>/.openshift',
            '!<%= yeoman.dist %>/Procfile'
          ]
        }]
      },
      server: '.tmp'
    },


    htmlangular: {
      options: {
        // Task-specific options go here.
        tmplext: '.html',
        customtags: [
          'top-nav',
          'left-bar',
          'right-bar',
          'client-footer',
          'progressbar'
        ],
        customattrs: [
          'text-angular',
          'progressbar'
        ]
      },
      files: {
        src: ['<%= yeoman.client %>/views/**/*.html']
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 2 versions', 'ie >= 9']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      target: {
        src: '<%= yeoman.client %>/index.html',
        ignorePath: '<%= yeoman.client %>/',
        exclude: [/bootstrap-sass-official/, /bootstrap.js/, '/json3/', '/es5-shim/']
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/public/{,*/}*.js',
            '<%= yeoman.dist %>/public/{,*/}*.css',
            '<%= yeoman.dist %>/public/assets/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/public/assets/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.client %>/index.html'],
      options: {
        dest: '<%= yeoman.dist %>/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/public/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/public/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/public/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>/public',
          '<%= yeoman.dist %>/public/assets/img'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(assets\/img\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/img/',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/public/assets/img'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/img/',
          src: '**/*.svg',
          dest: '<%= yeoman.dist %>/public/assets/img'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: '*/**.js',
          dest: '.tmp/concat'
        }]
      }
    },

    // Package all the html partials into a single javascript payload
    ngtemplates: {
      options: {
        // This should be the name of your apps angular module
        module: 'columbyApp',
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        usemin: 'app/app.js'
      },
      main: {
        cwd: '<%= yeoman.client %>',
        src: ['{app,components,views}/**/*.html'],
        dest: '.tmp/templates.js'
      },
      tmp: {
        cwd: '.tmp',
        src: ['{app,components,views}/**/*.html'],
        dest: '.tmp/tmp-templates.js'
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/public/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>',
          dest: '<%= yeoman.dist %>/public',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'assets/img/{,*/}*.{webp}',
            'assets/fonts/**/*',
            'index.html'
          ]
        }, {
          expand: true,
          cwd: '.tmp/img',
          dest: '<%= yeoman.dist %>/public/assets/img',
          src: ['generated/*']
        }, {
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server/**/*'
          ]
        }, {
          // Copy font-awesome fonts
          expand: true,
          flatten: 'true',
          cwd: '<%= yeoman.client %>',
          src: ['bower_components/font-awesome/fonts/*.*'],
          dest: '<%= yeoman.dist %>/public/fonts'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.client %>',
        dest: '.tmp/',
        src: ['{app,components}/**/*.css']
      }
    },

    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        connectCommits: false,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      heroku: {
        options: {
          remote: 'heroku',
          branch: 'master'
        }
      },
      openshift: {
        options: {
          remote: 'openshift',
          branch: 'master'
        }
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'less',
      ],
      dist: [
        'less',
        'imagemin',
        'svgmin'
      ]
    },

    env: {
      production: {
        NODE_ENV: 'production'
      },
      staging: {
        NODE_ENV: 'staging'
      },
      development: {
        NODE_ENV: 'development'
      },
    },

    // Compiles Less to CSS
    less: {
      options: {
        paths: [
          '<%= yeoman.client %>/bower_components',
          '<%= yeoman.client %>/app',
          '<%= yeoman.client %>/components'
        ]
      },
      server: {
        files: {
          '.tmp/app/app.css': '<%= yeoman.client %>/assets/styles/app.less'
        }
      }
    },

    injector: {
      options: {},
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
          transform: function (filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
            ['{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
              '!{.tmp,<%= yeoman.client %>}/app/app.js',
              '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.spec.js',
              '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js']
          ]
        }
      },

      // Inject component less into app.less
      less: {
        options: {
          transform: function (filePath) {
            filePath = filePath.replace('/client/assets/styles/', '');
            filePath = filePath.replace('/client/components/', '');
            return '@import \'' + filePath + '\';';
          },
          starttag: '// injector',
          endtag: '// endinjector'
        },
        files: {
          '<%= yeoman.client %>/assets/styles/app.less': [
            '<%= yeoman.client %>/assets/styles/**/*.less',
            '!<%= yeoman.client %>/assets/styles/app.less',
          ]
        }
      },

      // Inject component css into index.html
      css: {
        options: {
          transform: function (filePath) {
            filePath = filePath.replace('/client/assets/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
            '<%= yeoman.client %>/assets/styles/**/*.css'
          ]
        }
      }
    }


  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });


  // grunt.registerTask('default', [
  //   'serve:development'
  // ]);
  grunt.registerTask('build', [
    'build:production'
  ]);

  grunt.registerTask('bump', [
    'bump'
  ]);

  grunt.registerTask('build:development', [
    'clean:dist',
    'replace:staging',
    'injector:less',
    'nggettext_compile',
    'concurrent:dist',
    'injector',
    'wiredep',
    'useminPrepare',
    'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  // Build a production version
  grunt.registerTask('build:production', [
    // Delete all files dist directory
    'clean:dist',
    // Replace configuration settings for production environment
    'replace:production',
    // Inject all .less files into app.less
    'injector:less',
    // Compile translation files
    'nggettext_compile',
    // convert less, images, svg
    'concurrent:dist',
    // Inject scripts, css into index.html, less into app.less
    'injector',
    // inject bower components js and css into index.html
    'wiredep',
    // configuration for combination of css, js files
    'useminPrepare',
    //
    'autoprefixer',
    // Create angular view templates
    'ngtemplates',
    // create combination files
    'concat',

    'ngAnnotate',
    // Copy files to dist folder
    'copy:dist',

    'cdnify',
    // add app css files (vendor and app)
    'cssmin',
    // minify css and js
    'uglify',
    // Rename files
    'rev',
    // Update refrences
    'usemin'
  ]);

  // Serve development files with local API
  grunt.registerTask('serve:local', [
    'clean:server',
    'env:development',
    'replace:local',
    'injector:less',
    'concurrent:server',
    'injector',
    'wiredep',
    'autoprefixer',
    'express:development',
    'wait',
    'open',
    'watch'
  ]);

  // Serve development files with staging API
  grunt.registerTask('serve:development', [
    'clean:server',
    'env:development',
    'replace:staging',
    'injector:less',
    'concurrent:server',
    'injector',
    'wiredep',
    'autoprefixer',
    'express:development',
    'wait',
    'open',
    'watch'
  ]);

  // Serve minified production version with staging API
  grunt.registerTask('serve:staging', [
    'build:development',
    'env:staging',
    'express:dist',
    'wait',
    'open',
    'express-keepalive'
  ]);

  // Serve minified production version with production API
  grunt.registerTask('serve:production', [
    'build:production',
    'env:production',
    'express:dist',
    'wait',
    'open',
    'express-keepalive'
  ]);
};
