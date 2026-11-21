/*
 * Google Analytics 4 bootstrap (measurement ID G-RVBB8Q0CW5, public by design).
 *
 * - Lives in its own same-origin file so the site's Content-Security-Policy needs no inline-script exceptions.
 * - Only the production site sends data; localhost and preview deployments get a no-op gtag, so
 *   development and review sessions never pollute the real reports. Add a custom domain to
 *   PRODUCTION_HOSTS if you ever attach one.
 * - gtag() calls made before the library arrives are queued in dataLayer; the library itself is
 *   fetched after the page has loaded so it never competes with the app for startup bandwidth.
 */
(function () {
  var MEASUREMENT_ID = "G-RVBB8Q0CW5";
  var PRODUCTION_HOSTS = ["hike-sneaker-store.vercel.app"];

  window.dataLayer = window.dataLayer || [];

  if (PRODUCTION_HOSTS.indexOf(window.location.hostname) === -1) {
    window.gtag = function () {};
    return;
  }

  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);

  function load() {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
    document.head.appendChild(s);
  }
  if (document.readyState === "complete") load();
  else window.addEventListener("load", load);
})();
