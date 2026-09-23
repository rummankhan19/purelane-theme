/*
  Scroll reveal for any element with .pl-rv.
  Replaces the prototype's single page-wide observer: this one re-scans when
  the theme editor adds, re-renders or reorders a section, so new sections
  never get stuck at opacity 0.
*/
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null;

  function reveal(el) { el.classList.add('is-in'); }

  function scan(root) {
    var els = (root || document).querySelectorAll('.pl-rv:not(.is-in)');
    if (reduce || !('IntersectionObserver' in window) || (window.Shopify && window.Shopify.designMode)) {
      Array.prototype.forEach.call(els, reveal);
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { scan(); });
  } else {
    scan();
  }
  document.addEventListener('shopify:section:load', function (e) { scan(e.target); });
  document.addEventListener('shopify:section:reorder', function () { scan(); });
})();
