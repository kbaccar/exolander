// ============================================================
//  Exolander website settings: the only file you need to edit.
// ============================================================
window.WWsite = true; // marks the public website build (hides the developer sandbox)
window.WW_SITE = {
  // --- Ads: Google AdSense "H5 Games Ads" ---
  // Your AdSense publisher ID, e.g. 'ca-pub-1234567890123456'. Leave '' to run without ads.
  adsenseClient: 'ca-pub-2366707334842855',
  // true = Google test ads (use while testing). Set to false once AdSense approved your site for H5 games.
  adTest: true,

  // --- Explorer Pass: sold on Gumroad (handles payment + EU VAT for you) ---
  // Gumroad product page, e.g. 'https://yourname.gumroad.com/l/worldwalk'. Leave '' to hide the pass.
  checkoutUrl: '',
  // Gumroad product ID (product › Content › License key module › "Use your product ID…")
  gumroadProductId: '',
  // Price shown in the game (set the real price in Gumroad).
  price: '€3.99',
  // A key works on this many browsers/devices before it's refused (stops keys being shared publicly).
  maxUses: 10
};
