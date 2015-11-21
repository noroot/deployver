
gulp    = require 'gulp'
concat  = require 'gulp-concat'

deployConfig =
  ssh: 'deploy@staging.server.tld'
  debug: true
  keep: 5
  paths:
    local: './'
    remote: '/tmp'

Deployver = require('deployver')(deployConfig)
  
gulp.task 'rollback', ->
  Deployver.rollback()

gulp.task 'deploy', ->
  Deployver.deploy()

gulp.task 'deploy-init', ->
  Deployver.init()

