var isProd = false;
var gulp = require('gulp'),
    fs = require('fs'),
    del = require('del'),
    watch = require('gulp-watch'),
    watchify = require('watchify'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    gutil = require('gulp-util'),
    babelify = require('babelify'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    //sass = require('gulp-sass'),
    streamify = require('gulp-streamify'),
    runSequence = require('run-sequence'),
    license = require('gulp-license'),
    replace = require('gulp-replace'),
    bump = require('gulp-bump'),
    vulcanize = require('gulp-vulcanize'),
    base64 = require('gulp-base64'),
    minifyInline = require('gulp-minify-inline'),
    less = require('gulp-less'),
    jade = require('gulp-jade'),
    rename = require('gulp-rename'),
    uglifycss = require('gulp-uglifycss'),
    path = require('path');

var version = null;

function createBundle(url) {
  return browserify({
    entries: [url],
    debug: !isProd
  }).transform(babelify);
}

function watchBundles() {
  var bundleKeys = Object.keys(bundles);
  var watch = null;
  var key = null;
  for (var b = 0; b < bundleKeys.length; b++) {
    key = bundleKeys[b];
    buildBundle(key);
    watch = watchify(bundles[key].bundle);
    watch.on('update', buildBundle.bind(this, key));
  }
}

function buildBundle(bundleName) {

  var job = bundles[bundleName];
  var bundle = job.bundle;
  var name = job.name;
  var dest = job.dest || './dist/scripts';

  var b = bundle.bundle()
      .on('log', gutil.log.bind(gutil, 'Browserify Log'))
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(name));

  if (isProd) {
    b = b.pipe(streamify(uglify()));
  }

  return b.pipe(license('Apache', {
      organization: 'Google Inc. All rights reserved.'
    }))
    .pipe(gulp.dest(dest));
}

var bundles = {
    /*
  'core': {
    url: './src/scripts/guitartuner-core.js',
    name: 'guitartuner-core.js',
    bundle: null
  },

  'audio-processor': {
    url: './src/elements/audio-processor/audio-processor.js',
    name: 'audio-processor.js',
    dest: './dist/elements/audio-processor',
    bundle: null
  },

  'audio-visualizer': {
    url: './src/elements/audio-visualizer/audio-visualizer.js',
    name: 'audio-visualizer.js',
    dest: './dist/elements/audio-visualizer',
    bundle: null
  },

  'tuning-instructions': {
    url: './src/elements/tuning-instructions/tuning-instructions.js',
    name: 'tuning-instructions.js',
    dest: './dist/elements/tuning-instructions',
    bundle: null
  }
  */
};

/** Clean */
gulp.task('clean', function(done) {
  del(['dist'], done);
});

/** Styles */
gulp.task('styles', function() {
  return gulp.src('./src/styles/*.scss')
      .pipe(sass())
      .pipe(minifycss())
      .pipe(license('Apache', {
        organization: 'Google Inc. All rights reserved.'
      }))
      .pipe(gulp.dest('./dist/styles'));
});

/** My **/
gulp.task('less', function () {
    gulp.src(['**/*.less', '!node_modules/**'], { base: "./" })
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        //.pipe(minifyCSS())
        .pipe(gulp.dest('.'));
});

gulp.task('jade', function(a) {
	try{
    return  gulp.src('**/*.pre.jade')
                .pipe(jade({
					//locals: YOUR_LOCALS
                }))
            .pipe(gulp.dest('.'))
            .on('error', swallowError);
	}catch(e){
        console.log('jade:error:' + e.toString());
    }
});

gulp.task('jade-watch', function(a) {
	return  gulp.watch('sites/**/*.pre.jade', ['jade']);
});

function swallowError (error) {
  // If you want details of the error in the console
  console.log(error.toString());
  this.emit('end');
}

gulp.task('mywatch', function () {
    console.log('mywhatch is initialized');
    gulp.watch('**/*pre.jade').on("change", function(file) {
        console.log('file change!')
        if (file.type != "changed") return;
        console.log(file)

        try {

            if (path.basename(file.path) == "layout.pre.jade") {
                var dir = path.dirname(file.path);
                gulp.src(dir + '/*.pre.jade').pipe(jade()).pipe(gulp.dest(dir))
                return;
            }
            gulp
                .src(file.path)
                .pipe(jade({
                    //locals: YOUR_LOCALS
                })).on('error', function(err) {
                      console.log('--- JADE ERROR --- ' + err);
                })
                .pipe(gulp.dest(path.dirname(file.path)));
        }catch(e){
            console.log('mywatch: error:' , e);
        }
    });

    gulp.watch('**/*.less').on("change", function(file) { // { base: "./" }
        if (file.type != "changed") return;
        console.log(file, path.basename(file.path));

        gulp.src(file.path)
            .pipe(less({
                paths: [path.join(__dirname, 'less', 'includes')]
            }))
            //.pipe(minifyCSS())
            .pipe(gulp.dest(path.dirname(file.path)))

            .pipe(rename(path.basename(file.path, '.less') + '.min.css'))
            .pipe(uglifycss())
            //.pipe(uglify())
            .pipe(gulp.dest(path.dirname(file.path)));
    });

    gulp.watch('**/*.less', ['less']);
});

/** Scripts */
gulp.task('scripts', function() {
  var bundleKeys = Object.keys(bundles);
  for (var b = 0; b < bundleKeys.length; b++) {
    buildBundle(bundleKeys[b]);
  }
});

/** Vulcanize */
gulp.task('vulcanize-and-minify', function() {

  return gulp.src('./dist/elements/**/*.html')
    .pipe(vulcanize({
      inlineScripts: true,
      inlineCss: true,
      stripExcludes: false,
      excludes: [path.resolve('./dist/third_party/polymer.html')]
    }))
    .pipe(base64())
    .pipe(minifyInline())
    .pipe(gulp.dest('./dist/elements'));

});

/** Watches */
gulp.task('watch', function() {
  gulp.watch('./src/**/*.scss', ['styles']);
  gulp.watch('./src/*.*', ['root']);
  gulp.watch('./src/**/*.html', ['html']);
  gulp.watch('./src/images/**/*.*', ['images']);
  gulp.watch('./src/third_party/**/*.*', ['third_party']);
  gulp.watch('./src/scripts/sw.js', ['serviceworker']);

  watchBundles();
});

gulp.task('getversion', function() {
  version = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
});

/** Main tasks */

(function () {
  var bundleKeys = Object.keys(bundles);
  var key = null;
  for (var b = 0; b < bundleKeys.length; b++) {
    key = bundleKeys[b];
    bundles[key].bundle = createBundle(bundles[key].url);
  }
})();

var allTasks = ['less' /*'styles' */, 'scripts'];

gulp.task('bump', function() {
  return gulp.src('./package.json')
    .pipe(bump({type:'patch'}))
    .pipe(gulp.dest('./'));
});

gulp.task('default', function() {
  isProd = true;
  return runSequence('clean', 'bump', 'getversion', allTasks,
        'vulcanize-and-minify');
});

gulp.task('dev', function() {
  return runSequence('clean', 'getversion', allTasks, 'mywatch' /* 'watch' */);
});