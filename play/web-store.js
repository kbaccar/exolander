// Explorer Pass on the website: bought on Gumroad, unlocked in the game with the license key
// Gumroad emails to the buyer. Plugs into the game's window.WWStore hook. No server needed:
// Gumroad's license API can be called from the browser.
(function () {
  var S = window.WW_SITE || {};
  if (!S.checkoutUrl || !S.gumroadProductId) return; // not set up yet: the pass is hidden
  var KEY = 'ww-pass-key', API = 'https://api.gumroad.com/v2/licenses/verify';

  function getKey() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function setKey(k) { try { localStorage.setItem(KEY, k); } catch (e) {} }

  // cb(ok, message)
  function verify(key, count, cb) {
    var body = new URLSearchParams({ product_id: S.gumroadProductId, license_key: key, increment_uses_count: count ? 'true' : 'false' });
    fetch(API, { method: 'POST', body: body }).then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (j) {
        if (!j || !j.success) { cb(false, 'This key was not recognised. Check it and try again (copy it from your Gumroad email).'); return; }
        var p = j.purchase || {};
        if (p.refunded || p.chargebacked || (p.disputed && !p.dispute_won)) { cb(false, 'This purchase was refunded, so the key no longer works.'); return; }
        if (count && S.maxUses && j.uses > S.maxUses) { cb(false, 'This key has been used on too many devices. Contact us if this is a mistake.'); return; }
        cb(true);
      })
      .catch(function () { cb(false, 'Could not reach the server. Check your connection and try again.'); });
  }

  // ---------- the pop-up ----------
  var css = document.createElement('style');
  css.textContent = '#wwpass{position:fixed;inset:0;z-index:60;background:rgba(3,5,8,.82);display:flex;align-items:center;justify-content:center;padding:16px;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#f4efe6}' +
    '#wwpass .bx{background:#0d131b;border:1px solid #2a3442;border-radius:16px;max-width:420px;width:100%;padding:22px;max-height:92vh;overflow:auto}' +
    '#wwpass h2{margin:0 0 6px;font-size:21px}#wwpass p{margin:6px 0;color:#c9c3b8}#wwpass .pr{font-size:28px;font-weight:700;color:#ffb347;margin:10px 0}' +
    '#wwpass a.buy,#wwpass button{display:block;width:100%;box-sizing:border-box;text-align:center;border:0;border-radius:10px;padding:12px;font-family:inherit;font-weight:600;font-size:16px;cursor:pointer;margin-top:10px;text-decoration:none}' +
    '#wwpass a.buy{background:#ffb347;color:#1a1206}#wwpass button.go{background:#2c6fd6;color:#fff}#wwpass button.x{background:transparent;color:#9aa4b2;font-weight:500}' +
    '#wwpass input{width:100%;box-sizing:border-box;margin-top:12px;padding:11px;border-radius:10px;border:1px solid #3a4656;background:#05080c;color:#f4efe6;font:15px ui-monospace,Menlo,monospace}' +
    '#wwpass .er{color:#ff8a7a;min-height:1.2em;font-size:14px}#wwpass hr{border:0;border-top:1px solid #222c38;margin:16px 0}';
  document.head.appendChild(css);

  function open(mode, done) {
    var old = document.getElementById('wwpass'); if (old) old.remove();
    var el = document.createElement('div'); el.id = 'wwpass';
    var price = S.price || '';
    el.innerHTML = '<div class="bx" role="dialog" aria-modal="true" aria-labelledby="wwpt">' +
      (mode === 'buy'
        ? '<h2 id="wwpt">Explorer Pass</h2><p>Unlock every walkable exoplanet in the NASA archive and remove ad breaks. One-time purchase, no subscription.</p>' +
          (price ? '<div class="pr">' + price + '</div>' : '') +
          '<a class="buy" href="' + S.checkoutUrl + '" target="_blank" rel="noopener">Buy on Gumroad</a>' +
          '<p style="font-size:13px">Secure checkout by Gumroad. You get a license key by email and on the receipt page. Come back here and paste it below.</p><hr>'
        : '<h2 id="wwpt">Restore your Explorer Pass</h2><p>Paste the license key from your Gumroad email to unlock the pass on this device.</p>') +
      '<input id="wwpk" placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX" autocomplete="off" spellcheck="false" aria-label="License key">' +
      '<div class="er" id="wwpe"></div><button class="go" id="wwpg">Unlock</button><button class="x" id="wwpx">Close</button></div>';
    document.body.appendChild(el);
    var inp = el.querySelector('#wwpk'), er = el.querySelector('#wwpe'), go = el.querySelector('#wwpg');
    function close(ok) { el.remove(); done(ok); }
    el.querySelector('#wwpx').onclick = function () { close(false); };
    el.onclick = function (e) { if (e.target === el) close(false); };
    function submit() {
      var k = inp.value.trim(); if (!k) { er.textContent = 'Paste your license key first.'; return; }
      go.disabled = true; go.textContent = 'Checking…'; er.textContent = '';
      verify(k, true, function (ok, msg) {
        go.disabled = false; go.textContent = 'Unlock';
        if (!ok) { er.textContent = msg; return; }
        setKey(k); close(true);
      });
    }
    go.onclick = submit;
    inp.onkeydown = function (e) { e.stopPropagation(); if (e.key === 'Enter') submit(); };
    inp.onkeyup = function (e) { e.stopPropagation(); };
  }

  window.WWStore = {
    price: S.price || null,
    buy: function (cb) { open('buy', function (ok) { cb(ok, ok ? null : 'cancelled'); }); },
    restore: function (cb) { open('restore', function (ok) { if (ok) { window.WWgrantPass && window.WWgrantPass(); cb && cb(); } }); }
  };

  // A key saved on this device unlocks the pass again (e.g. after progress was reset).
  window.addEventListener('load', function () {
    var k = getKey(); if (!k) return;
    verify(k, false, function (ok, msg) {
      if (ok) { window.WWgrantPass && window.WWgrantPass(); }
      else if (/refunded/.test(msg || '')) { setKey(''); }
    });
  });
})();
