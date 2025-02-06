const gulp = require('gulp');
const { series, watch } = gulp;
const sassCompiler = require('sass'); // Dart Sass を読み込み
const gulpSass = require('gulp-sass')(sassCompiler); // gulp-sass に Dart Sass を渡す
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const browserSync = require('browser-sync').create();
const minimist = require('minimist');
const os = require('os');
const terser = require('gulp-terser');
const concat = require('gulp-concat');

const options = minimist(process.argv.slice(2), {
  string: 'path',
  default: { path: 'sitedomain.local' }
});

// 出力フォルダの設定
const srcBase = './src';
const distBase = './../assets';

const paths = {
  images: {
    src: srcBase + '/images/**/*.{jpg,jpeg,png,gif,svg}',
    dist: distBase + '/images'
  },
  sass: {
    src: srcBase + '/sass/**/*.scss',
    dist: distBase + '/css'
  },
  js: {
    src: srcBase + '/js/**/*.js',
    dist: distBase + '/js'
  },
  php: {
    src: '../**/*.php'
  }
};

// SCSS コンパイルタスク
const compileSass = () => {
  return gulp.src(paths.sass.src)
    .pipe(plumber({ errorHandler: notify.onError('Sass Error: <%= error.message %>') }))
    .pipe(gulpSass({ outputStyle: 'expanded' }).on('error', gulpSass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(paths.sass.dist))
    .pipe(browserSync.stream());
};

// JS の結合・minify タスク
const minifyJs = () => {
  return gulp.src(paths.js.src)
    .pipe(plumber({ errorHandler: notify.onError('JS Error: <%= error.message %>') }))
    .pipe(concat('script.min.js'))
    .pipe(terser())
    .pipe(gulp.dest(paths.js.dist))
    .pipe(browserSync.stream());
};

// BrowserSync タスク（ネットワーク上の IP アドレスを自動取得して外部アクセスを有効に）
const browserSyncTask = (done) => {
  const interfaces = os.networkInterfaces();
  let ipAddress;

  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        ipAddress = alias.address;
        break;
      }
    }
    if (ipAddress) break;
  }

  browserSync.init({
    host: ipAddress,
    open: 'external',
    notify: false,
    proxy: { target: options.path },
    logLevel: 'silent'
  });
  done();
};

// ファイル監視タスク
const watchFiles = () => {
  watch(paths.sass.src, compileSass);
  watch(paths.js.src, minifyJs)
  watch(paths.images.src).on('change', browserSync.reload);
  watch(paths.php.src).on('change', browserSync.reload);
};

// デフォルトタスク：まず Sass と JS を処理し、BrowserSync を起動、その後ファイルを監視
exports.default = series(compileSass, minifyJs, browserSyncTask, watchFiles);