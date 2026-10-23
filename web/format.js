/*
 * Number formatting for the ticker, with no Intl (old TV browsers): prices as "$81,512.34", the 24-hour change as
 * "▲ 2.1%" / "▼ 0.9%" with a direction for the colour. Plain ES5; also loads in Node for tests/web/.
 */
(function (root) {
  'use strict';

  function group(intPart) {
    var out = '';
    for (var i = intPart.length; i > 0; i -= 3) out = intPart.slice(Math.max(0, i - 3), i) + (out ? ',' + out : '');
    return out;
  }

  var Format = {
    /** True when config.properties' shelf= differs from the one the TV last applied (stored as a joined string). */
    shelfChanged: function (configShelf, storedSig) {
      if (!configShelf || !configShelf.length) return false;
      return configShelf.join(',') !== (storedSig || '');
    },
    /** A shelf= key naming an HDMI port, "hdmi2" or "hdmi2:NVIDIA Shield" → {id, number, label}; anything else → null. */
    inputKey: function (key) {
      var m = /^hdmi([1-4])(?::(.+))?$/i.exec(String(key || '').trim());
      if (!m) return null;
      var n = +m[1];
      return {id: 'source:HDMI:' + n, number: n, label: (m[2] || '').trim() || 'HDMI ' + n};
    },
    /** The class to paint with before any data arrives: 'night' when the last run ended at night, else ''. */
    initialTheme: function (stored) { return stored === 'night' ? 'night' : ''; },
    /** "$81,512.34": always two decimals, digits grouped in threes. NaN → "$—". */
    price: function (v, symbol) {
      symbol = symbol || '';
      if (typeof v !== 'number' || isNaN(v)) return symbol + '—';
      var s = v.toFixed(2), dot = s.indexOf('.');
      return symbol + group(s.slice(0, dot)) + s.slice(dot);
    },
    /** 24-hour change in percent → {text: "▲ 2.1%", dir: "up" | "down" | "flat"}. NaN → empty text. */
    change: function (pct) {
      if (typeof pct !== 'number' || isNaN(pct)) return {text: '', dir: 'flat'};
      var r = Math.round(Math.abs(pct) * 10) / 10;
      if (r === 0) return {text: '0.0%', dir: 'flat'};
      return pct > 0 ? {text: '▲ ' + r.toFixed(1) + '%', dir: 'up'} : {text: '▼ ' + r.toFixed(1) + '%', dir: 'down'};
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Format;
  else root.Format = Format;
})(this);
