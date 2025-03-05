const gulp = require('gulp');
const { series, watch, src, dest } = gulp;
const sassCompiler = require('sass');
const gulpSass = require('gulp-sass')(sassCompiler);
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const postcss = require('gulp-postcss');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const browserSync = require('browser-sync').create();
const minimist = require('minimist');
const os = require('os');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const imageminGif = require('imagemin-gifsicle');
const imageminSvg = require('imagemin-svgo');
const cached = require('gulp-cached');
const rsync = require('gulp-rsync');
const rename = require('gulp-rename');

// コマンドラインオプションの設定
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
  video: {
    src: srcBase + '/video/**/*.{mp4,webm,ogg}',
    dist: distBase + '/video'
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

// Video タスク
const videoMin = () => {
  return src(paths.video.src)
    .pipe(
      plumber({ errorHandler: notify.onError('Error: <%= error.message %>') })
    )
    .pipe(cached('videoMin'))
    .pipe(dest(paths.video.dist))
    .pipe(browserSync.stream());
};

// SCSS コンパイルタスク
const compileSass = () => {
  return src(paths.sass.src)
    .pipe(plumber({ errorHandler: notify.onError('Sass Error: <%= error.message %>') }))
    .pipe(gulpSass({ outputStyle: 'compressed' }).on('error', gulpSass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(paths.sass.dist))
    .pipe(browserSync.stream());
};

// JS の結合・minify タスク
const minifyJs = () => {
  return src(paths.js.src)
    .pipe(plumber({ errorHandler: notify.onError('JS Error: <%= error.message %>') }))
    .pipe(concat('script.min.js'))
    .pipe(terser())
    .pipe(dest(paths.js.dist))
    .pipe(browserSync.stream());
};

// 画像圧縮タスク
const imageMin = () => {
  return src(paths.images.src)
    .pipe(require('gulp-newer')(paths.images.dist))
    .pipe(cached('images'))
    .pipe(plumber({ errorHandler: notify.onError('Image Error: <%= error.message %>') }))
    .pipe(imagemin([
      pngquant({ quality: [0.8, 1] }),
      mozjpeg({ quality: 85, progressive: true }),
      imageminGif({ interlaced: false, optimizationLevel: 3, colors: 180 }),
      imageminSvg()
    ]))
    .pipe(dest(paths.images.dist));
};

// BrowserSync タスク（ネットワーク上のIPアドレスを自動取得して外部アクセスを有効に）
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

// BrowserSync のリロード用関数
const reload = (done) => {
  browserSync.reload();
  done();
};

// ファイル監視タスク
const watchFiles = () => {
  watch(paths.sass.src, compileSass);
  watch(paths.js.src, minifyJs);
  watch(paths.images.src, series(imageMin, reload));
  watch(paths.video.src, series(videoMin, reload));
  watch(paths.php.src).on('change', browserSync.reload);
};


// 除外パターンの設定
const excludePatterns = ['.DS_Store', 'dev', 'node_modules', '.git'];

// テスト環境へのデプロイタスク
const deploytest = () => {
  return src(['../**', '!../dev/**', '!../node_modules/**', '!../.git/**'])
    .pipe(rsync({
      root: '../',
      hostname: 'xgvcdevelop',
      destination: '/home/gvcdevelop/gvcdevelop.xsrv.jp/public_html/sk-tire-service/wp-content/themes/sk-tire-service',
      ssh: true,
      archive: true,
      compress: true,
      recursive: true,
      clean: true,
      exclude: excludePatterns
    }));
};

// 本番環境へのデプロイタスク
const deployprod = () => {
  return src(['../**', '!../dev/**', '!../node_modules/**', '!../.git/**'])
    .pipe(rsync({
      root: '../',
      hostname: 'xserver2',
      destination: '/home/gvc2/sk-tire-service.com/public_html/wp-content/themes/sk-tire-service',
      ssh: true,
      archive: true,
      compress: true,
      recursive: true,
      clean: true,
      exclude: excludePatterns
    }));
};

// デフォルトタスク（SCSS, JS, 画像圧縮、BrowserSync、監視）
exports.default = series(compileSass, minifyJs, imageMin, videoMin, browserSyncTask, watchFiles);

// デプロイタスク（必要に応じて両方実行）
exports.deploy = series(deploytest, deployprod);
exports.deploytest = deploytest;
exports.deployprod = deployprod;

// 必要に応じて個別タスクもエクスポート可能
exports.compileSass = compileSass;
exports.minifyJs = minifyJs;
exports.imageMin = imageMin;
exports.watchFiles = watchFiles;
exports.browserSyncTask = browserSyncTask;
