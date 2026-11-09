// Web ads for Exolander: Google H5 Games Ads (Ad Placement API).
// Rewarded ads and ad breaks, plugged into the game's window.WWAds hook.
(function () {
  var S = window.WW_SITE || {};
  if (!S.adsenseClient) return; // no AdSense ID yet: the game runs without ads
  var blocked = false;
  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(S.adsenseClient);
  tag.setAttribute('data-ad-client', S.adsenseClient);
  tag.setAttribute('data-ad-frequency-hint', '180s');
  if (S.adTest) tag.setAttribute('data-adbreak-test', 'on');
  tag.crossOrigin = 'anonymous';
  tag.onerror = function () { blocked = true; };
  document.head.appendChild(tag);
  window.adsbygoogle = window.adsbygoogle || [];
  var adBreak = window.adBreak = window.adConfig = function (o) { window.adsbygoogle.push(o); };
  window.adConfig({ preloadAdBreaks: 'on', sound: 'on' });

  function hush() { window.WWaudio && window.WWaudio(false); }
  function wake() { window.WWaudio && window.WWaudio(true); }

  window.WWAds = {
    // cb(true) = reward earned. If no ad is available (none in stock, ad blocker), the player
    // still gets the reward: nobody is punished for an empty ad slot.
    rewarded: function (cb) {
      if (blocked) { cb(true); return; }
      var done = false, started = false;
      function fin(ok, err) { if (done) return; done = true; wake(); cb(ok, err); }
      var guard = setTimeout(function () { if (!started) fin(true); }, 6000);
      adBreak({
        type: 'reward', name: 'reward',
        beforeAd: function () { started = true; hush(); },
        afterAd: wake,
        beforeReward: function (showAdFn) { started = true; showAdFn(); },
        adDismissed: function () { clearTimeout(guard); fin(false, 'closed'); },
        adViewed: function () { clearTimeout(guard); fin(true); },
        adBreakDone: function (p) {
          clearTimeout(guard);
          var st = p && p.breakStatus;
          if (st === 'dismissed') fin(false, 'closed'); else fin(true);
        }
      });
    },
    // Ad break between landings (the game already limits these to one every 3 minutes,
    // never in the first 3 landings, never with the Explorer Pass).
    interstitial: function (cb) {
      if (blocked) { cb(); return; }
      var done = false, started = false;
      function fin() { if (done) return; done = true; wake(); cb(); }
      var guard = setTimeout(function () { if (!started) fin(); }, 4000);
      adBreak({
        type: 'next', name: 'between-landings',
        beforeAd: function () { started = true; hush(); },
        afterAd: wake,
        adBreakDone: function () { clearTimeout(guard); fin(); }
      });
    }
  };
})();
