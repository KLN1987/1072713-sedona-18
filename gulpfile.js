"use strict";

var gulp = require("gulp");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var plumber = require("gulp-plumber");
var svgstore = require("gulp-svgstore");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var del = require("del");
var uglify = require("gulp-uglify");
var server = require("browser-sync").create();

gulp.task("clean", function () {
  return del("build");
});

gulp.task("copy", function () {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
     /* "source/img/**",*/
      /*"source/js/**",*/
      "source/*.ico"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
  });

gulp.task("images", function() {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false}
        ]
      })
    ]))
    .pipe(gulp.dest("build/img"));
  });

gulp.task("webp", function() {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 80}))
    .pipe(gulp.dest("build/img"));
});

gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"));
});

gulp.task("sprite", function() {
  return gulp.src("source/img/{icon-video-*.svg,htmlacademy.svg}")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("js", function () {
  return gulp.src("source/js/*.js")
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min"
     })
    )
    .pipe(gulp.dest("build/js"))
});

gulp.task("server", function () {
  server.init({
    server: "build/"
  });
    gulp.watch("source/less/**/*.less", gulp.series("css"));
    gulp.watch("source/img/{icon-video-*.svg,htmlacademy.svg}", gulp.series("sprite", "html", "refresh"));
    gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series("clean", "copy", "images", "webp", "css", "sprite", "js", "html"));
gulp.task("start", gulp.series("build", "server"));
