'use strict';

var request = require('request');

module.exports = function (grunt) {
  var reloadPort = 35729, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'app.js'
      }
    },
    update_submodules: {
       default: {
           options: {
               // default command line parameters will be used: --init --recursive
           }
       }
    },
    bower: {
      install: {
         options: {
           targetDir: "public/components"
         }
      }
    },
    modernizr: {
      dist: {
          // [REQUIRED] Path to the build you're using for development.
          "devFile" : "public/js/modernizr-dev.js",

          // Path to save out the built file.
          "outputFile" : "public/components/modernizr/modernizr.js"
        }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: true //reloadPort
      },
      js: {
        files: [
          'app.js',
          'app/**/*.js',
          'app/**/**/*.js',
          'config/*.js',
        ],
        tasks: ['develop', 'bower', 'modernizr', 'delayed-livereload']
      },
      jade: {
        files: ['app/views/**/*.jade'],
        options: { livereload: true },
      },
    }
  });

  grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks("grunt-modernizr");
  grunt.loadNpmTasks( "grunt-update-submodules" );

  grunt.registerTask('test', 'run mocha', function () {
     var done = this.async();
     require('child_process').exec(
         './node_modules/.bin/mocha --timeout 5000 --reporter spec', function (err, stdout) {
           grunt.log.write(stdout);
           done(err);
      })
  })

  grunt.config.requires('watch.js.files');
  files = grunt.config('watch.js.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function(err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded)
            grunt.log.ok('Delayed live reload successful.');
          else
            grunt.log.error('Unable to make a delayed live reload.');
          done(reloaded);
        });
    }, 500);
  });

  grunt.registerTask('default', ['develop', 'update_submodules', 'bower', 'modernizr', 'watch']);
};
