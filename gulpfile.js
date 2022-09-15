import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
import htmlmin from 'gulp-htmlmin';
import libsquoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgo';
import {deleteAsync} from 'del';

// Styles

const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('source/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//Html
const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));
}
// Script

const scripts = () => {
  return gulp.src('source/js/*.js')
  .pipe(terser())
.pipe(gulp.dest('build/js'));
}

// Images

const images = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(libsquoosh())
  .pipe(gulp.dest('build/img'));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/img'));
}

//Webp
const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(
    libsquoosh({
      webp: {}
    })
  )
  .pipe(gulp.dest('build/img'));
}

//SVG
const svg = async () => {
  gulp.src('source/img/svg/*.svg')
  .pipe(svgo())
  .pipe(gulp.dest('build/img/svg'));
}

//Copy
const copy = (done) => {
gulp.src([
  'source/fonts/*.{woff2,woff}',
  'source/*.ico',
],
{
  base: 'source'
}
)
.pipe(gulp.dest('build'))
done();
}

//Clean

export const clean = () => deleteAsync('./build');

// Reload

const reload = (done) => {
  browser.reload();
  done();
  }
// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
  }

//Build
export const build = gulp.series (
  clean,
  copy,
  images,
  gulp.parallel(
    styles,
    scripts,
    html,
    svg,
    createWebp
));

//Default

export default gulp.series (
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    createWebp
  ),
gulp.series(
  server, watcher
));
