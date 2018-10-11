import gulp from 'gulp'
import gulpif from 'gulp-if'
import { colors, log } from 'gulp-util'
import livereload from 'gulp-livereload'
import jsonTransform from 'gulp-json-transform'
import plumber from 'gulp-plumber'
import applyBrowserPrefixesFor from './lib/applyBrowserPrefixesFor'
import applyEnvPrefixesFor from './lib/applyEnvPrefixesFor'
import args from './lib/args'

gulp.task('manifest', () => {
  return gulp.src('app/manifest.json')
    .pipe(plumber({
      errorHandler: error => {
        if (error) {
          log('manifest:', colors.red('Invalid manifest.json'))
        }
      }
    }))
    .pipe(
      jsonTransform(
        (data, opts) => [
          applyBrowserPrefixesFor(args.vendor),
          applyEnvPrefixesFor(args.production ? 'prod' : 'dev')
        ].reduce((acc, e) => e(acc), data),
        2 /* whitespace */
      )
    )
    .pipe(gulp.dest(`dist/${args.vendor}`))
    .pipe(gulpif(args.watch, livereload()))
})
