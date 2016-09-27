'use strict';

var assert = require('assert');
var argv = require('yargs-parser')(process.argv.slice(2));
var matcher = argv.mm ? require('multimatch') : require('..');

function match(arr, pattern, expected, options) {
  var actual = matcher(arr, pattern, options);
  assert.deepEqual(actual.sort(), expected.sort());
}

describe('nanomatch', function() {
  it('should return an array of matches for a literal string', function() {
    match(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], '(a/b)', ['a/b']);
    match(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], 'a/b', ['a/b']);
  });

  it('should return an array of matches for an array of literal strings', function() {
    match(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], ['(a/b)', 'a/c'], ['a/b', 'a/c']);
    match(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], ['a/b', 'b/b'], ['a/b', 'b/b']);
  });

  it('should support regex logical or', function() {
    match(['a/a', 'a/b', 'a/c'], ['a/(a|c)'], ['a/a', 'a/c']);
    match(['a/a', 'a/b', 'a/c'], ['a/(a|b|c)', 'a/b'], ['a/a', 'a/b', 'a/c']);
  });

  it('should support regex ranges', function() {
    match(['a/a', 'a/b', 'a/c'], 'a/[b-c]', ['a/b', 'a/c']);
    match(['a/a', 'a/b', 'a/c', 'a/x/y', 'a/x'], 'a/[a-z]', ['a/a', 'a/b', 'a/c', 'a/x']);
  });

  it('should support single globs (*)', function() {
    var fixture = ['a', 'b', 'a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a', 'x/y', 'z/z'];
    match(fixture, ['*'], ['a', 'b']);
    match(fixture, ['*/*'], ['a/a', 'a/b', 'a/c', 'a/x', 'x/y', 'z/z']);
    match(fixture, ['*/*/*'], ['a/a/a', 'a/a/b']);
    match(fixture, ['*/*/*/*'], ['a/a/a/a']);
    match(fixture, ['*/*/*/*/*'], ['a/a/a/a/a']);
    match(fixture, ['a/*'], ['a/a', 'a/b', 'a/c', 'a/x']);
    match(fixture, ['a/*/*'], ['a/a/a', 'a/a/b']);
    match(fixture, ['a/*/*/*'], ['a/a/a/a']);
    match(fixture, ['a/*/*/*/*'], ['a/a/a/a/a']);
    match(fixture, ['a/*/a'], ['a/a/a']);
    match(fixture, ['a/*/b'], ['a/a/b']);
  });

  it('should support globstars (**)', function() {
    var fixture = ['a/a', 'a/b', 'a/c', 'a/x', 'a/x/y', 'a/x/y/z'];
    match(fixture, ['a/**'], fixture);
    match(fixture, ['a/**/*'], fixture);
    match(fixture, ['a/**/**/*'], fixture);
  });

  it('should support negation patterns', function() {
    match(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], ['!a/b'],  ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
    match(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], ['*/*', '!a/b', '!*/c'],  ['a/a', 'b/a', 'b/b']);
    match(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], ['!a/b', '!*/c'],  ['a/a', 'b/a', 'b/b']);
    match(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], ['!a/b', '!a/c'],  ['a/a', 'b/a', 'b/b', 'b/c']);
    match(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], ['!a/(b)'], ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
    match(['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'], ['!(a/b)'], ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
  });
});