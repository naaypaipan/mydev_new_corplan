const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('build', () => {
  const src = ['./src/*.js', './src/*.jsx'];
  return gulp
    .src(src)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['es2015', 'react'],
      }),
    )
    .pipe(gulp.dest('./backend/public'));
});

exports.default = gulp;
