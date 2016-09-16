const gulp = require('gulp'),
      tape = require('gulp-tape'),
      tap_colorize = require('tap-colorize'),
      nodemon = require('gulp-nodemon'),
      sequence = require('gulp-sequence');

const rollup = require('rollup'),
      buble = require('rollup-plugin-buble'),
      commonjs = require('rollup-plugin-commonjs'),
      node_resolve = require('rollup-plugin-node-resolve');

let cache = null;

gulp.task('bundle', rollupBundle);

gulp.task('test', () =>
  gulp.src('spec/*.js').pipe(tape({ reporter: tap_colorize() })));

gulp.task('build', sequence('bundle', 'test'));

gulp.task('dev', ['build'], () =>
  nodemon({
    script: 'sandbox.js',
    watch: ['sandbox.js', 'spec/*.js', 'src/**/*.js'],
    tasks: ['build']
  }));

function dev() { return sequence('bundle', 'test'); }

function rollupBundle() {

  return rollup.rollup({

    entry: 'src/index.js',

    external: ['immutable'],

    globals: { immutable: 'immutable' },

    cache: cache,

    plugins: [
      buble(),
      node_resolve({
        module: true,
        jsnext: true,
        main: true,
        browser: true
      }),
      commonjs({
        include: 'node_modules/**',
        namedExports: { immutable: ['Record', 'fromJS', 'Map', 'List'] }
      })
    ]

  }).then((bundle) => {

    cache = bundle;

    console.log('Bundling complete; writing to dist/');

    let es = bundle.write({
      dest: 'dist/bundle.es2015.js',
      format: 'es',
      // exports: 'named',
      moduleName: 'immuTree',
      sourceMap: true
    });

    let umd = bundle.write({
      dest: 'dist/bundle.umd.js',
      format: 'umd',
      // exports: 'named',
      globals: { immutable: 'immutable' },
      moduleName: 'immuTree',
      sourceMap: true
    });

    return Promise.all([es, umd]);

  }).then((bundles) => {
    
    console.log('Writing complete!');

    return bundles;

  }).catch((err) => {

    console.log(err.message, err.stack);
    return null;

  });

}