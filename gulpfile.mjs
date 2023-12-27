import gulp from 'gulp';
const { src, dest, series, parallel, watch } = gulp;
import gulpIf from 'gulp-if';
import webpackStream from 'webpack-stream';
import webpackConfig from './webpack.config.mjs';

import posthtml  from "gulp-posthtml";
import include  from "posthtml-include";
import postcss  from "gulp-postcss";
import autoprefixer  from "autoprefixer";
import cmq from "@lipemat/css-mqpacker";

import scssResets from 'scss-resets';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import sourcemaps from 'gulp-sourcemaps';

import svgmin from 'gulp-svgmin';
import spriter from "gulp-svgstore";
import rename from "gulp-rename";
import htmlmin from "gulp-html-minify";

import { deleteAsync } from 'del';

import browser_sync from "browser-sync";
const browserSync = browser_sync.create();

function html() {
  return src("source/*.html")
    .pipe(htmlmin())
    .pipe(posthtml([include()]))
    .pipe(dest("dist"));
}

function css() {
  return src("source/scss/style.scss")
    .pipe(gulpIf(!process.env.NODE_ENV, sourcemaps.init()))
    .pipe(sass({ includePaths: scssResets.includePaths }))
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(postcss([cmq({ sort: true }), autoprefixer()]))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulpIf(!process.env.NODE_ENV, sourcemaps.write()))
    .pipe(dest("dist/css"))
    .pipe(browserSync.stream());
}

function js() {
  return src("source/js/*.js")
  .pipe(webpackStream(webpackConfig))
  .pipe(dest("./dist/js"));
}

function sprite() {
  return src(["dist/img/icon-*.svg"])
    .pipe(svgmin({
      plugins: [
        { removeDimensions: true }
      ]
    }))
    .pipe(spriter({ inlineSvg: true }))
    .pipe(rename("sprite.svg"))
    .pipe(dest("dist/img"));
}

function copy() {
  return src(["source/fonts/**/*", "source/img/**/*"], { base: "source" })
    .pipe(dest("./dist"));
}

function server() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });

  watch("source/*.html", series(html, refreshPage));
  watch("source/scss/**/*", css);
  watch("source/js/**/*", series(js, refreshPage));
}

function refreshPage(done) {
  browserSync.reload();
  done();
}

export function clean() {
  return deleteAsync(['dist']);
}

export const build = series(clean, copy, parallel(sprite, css, js), html);
export default series(build, server);
