"use strict";

// gulpfile.js
const gulp = require("gulp");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const babel = require("babelify");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const browserSync = require("browser-sync");
const reload = browserSync.reload;
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const historyApiFallback = require("connect-history-api-fallback");

gulp.task("styles", () => {
  return gulp
    .src("./dev/styles/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(concat("style.css"))
    .pipe(gulp.dest("./public/styles"));
});

gulp.task("js", () => {
  browserify("dev/scripts/main.js", {
    debug: true
  })
    .transform("babelify", {
      sourceMaps: true,
      presets: ["es2015"]
    })
    .bundle()
    .on(
      "error",
      notify.onError({
        message: "Error: <%= error.message %>",
        title: "Error in JS 💀"
      })
    )
    .pipe(source("main.js"))
    .pipe(buffer())
    .pipe(gulp.dest("public/scripts"))
    .pipe(
      reload({
        stream: true
      })
    );
});

gulp.task("bs", () => {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    middleware: [historyApiFallback()]
  });
});

gulp.task("default", ["js", "bs", "styles"], () => {
  gulp.watch("dev/**/*.js", ["js"]);
  gulp.watch("dev/**/*.scss", ["styles"]);
  gulp.watch("./index.html", reload);
  gulp.watch("./public/styles/style.css", reload);
});
