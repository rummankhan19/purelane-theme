/* Keyboard pause for the reviews marquee. Scoped per section instance. */
(function () {
  function bind(root) {
    (root || document).querySelectorAll('[data-pl-reviews]').forEach(function (sec) {
      var btn = sec.querySelector('[data-pl-rev-toggle]');
      var rail = sec.querySelector('.pl-revrail');
      if (!btn || !rail || btn.dataset.bound) return;
      btn.dataset.bound = '1';
      var pauseText = btn.textContent.trim();
      btn.addEventListener('click', function () {
        var paused = rail.classList.toggle('is-paused');
        btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
        btn.textContent = paused ? pauseText.replace(/^Pause/i, 'Play') : pauseText;
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { bind(); });
  else bind();
  document.addEventListener('shopify:section:load', function (e) { bind(e.target); });
})();
