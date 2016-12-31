var Deployver, concat, deployConfig, gulp;

gulp = require('gulp');

concat = require('gulp-concat');

deployConfig = {
  ssh: 'deploy@staging.server.tld',
  debug: true,
  keep: 5,
  paths: {
    local: './',
    remote: '/tmp'
  }
};

Deployver = require('deployver')(deployConfig);

gulp.task('rollback', function() {
  return Deployver.rollback();
});

gulp.task('deploy', function() {
  return Deployver.deploy();
});

gulp.task('deploy-init', function() {
  return Deployver.init();
});
