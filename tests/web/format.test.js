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

test('inputKey: "hdmi2" in shelf= means the TV source HDMI 2', () => {
  assert.deepEqual(Format.inputKey('hdmi2'), {id: 'source:HDMI:2', number: 2, label: 'HDMI 2'});
});
test('inputKey: "hdmi2:NVIDIA Shield" names the tile', () => {
  assert.deepEqual(Format.inputKey('hdmi2:NVIDIA Shield'), {id: 'source:HDMI:2', number: 2, label: 'NVIDIA Shield'});
});
test('inputKey: app keys and junk are not inputs', () => {
  assert.equal(Format.inputKey('netflix'), null);
  assert.equal(Format.inputKey('hdmi'), null);
  assert.equal(Format.inputKey('hdmi9'), null);
});

test('shelfChanged: a new shelf= in the config replaces the choice saved on the TV, once', () => {
  assert.equal(Format.shelfChanged(['hdmi2:NVIDIA Shield', 'netflix'], 'netflix,youtube'), true);
  assert.equal(Format.shelfChanged(['netflix', 'youtube'], 'netflix,youtube'), false);
});
test('shelfChanged: no shelf= in the config never resets anything', () => {
  assert.equal(Format.shelfChanged([], null), false);
  assert.equal(Format.shelfChanged(undefined, 'netflix'), false);
});
