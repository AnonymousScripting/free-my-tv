// Ticker formatting for the LG/Samsung web app (web/format.js). Run: node --test tests/web/
const test = require('node:test');
const assert = require('node:assert/strict');
const Format = require('../../web/format.js');

test('price: dollars with thousands separators and cents, like Coinbase', () => {
  assert.equal(Format.price(81512.34, '$'), '$81,512.34');
});
test('price: small amounts keep two decimals', () => {
  assert.equal(Format.price(104.2, '$'), '$104.20');
});
test('price: whole thousands still show cents', () => {
  assert.equal(Format.price(2400, '$'), '$2,400.00');
});
test('price: seven figures group every three digits', () => {
  assert.equal(Format.price(1234567.891, '$'), '$1,234,567.89');
});
test('price: unknown value is a dash, not NaN', () => {
  assert.equal(Format.price(NaN, '$'), '$—');
});
test('change: up is a green triangle with one decimal', () => {
  assert.deepEqual(Format.change(2.134), {text: '▲ 2.1%', dir: 'up'});
});
test('change: down is a red triangle with the sign dropped', () => {
  assert.deepEqual(Format.change(-0.86), {text: '▼ 0.9%', dir: 'down'});
});
test('change: flat and unknown render as neutral', () => {
  assert.deepEqual(Format.change(0), {text: '0.0%', dir: 'flat'});
  assert.deepEqual(Format.change(NaN), {text: '', dir: 'flat'});
});

test('initialTheme: a remembered night paints dark before the first frame', () => {
  assert.equal(Format.initialTheme('night'), 'night');
});
test('initialTheme: anything else paints the default (day) and never throws', () => {
  assert.equal(Format.initialTheme('day'), '');
  assert.equal(Format.initialTheme(null), '');
  assert.equal(Format.initialTheme(undefined), '');
});
