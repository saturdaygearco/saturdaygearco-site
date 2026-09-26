// Send an optional GA4 event without delaying the retailer navigation.
document.addEventListener('click', function (event) {
  const link = event.target.closest('a[href]');
  if (!link) return;
  let url;
  try { url = new URL(link.href); } catch (_) { return; }
  if (!/(^|\.)amazon\.com$|(^|\.)amzn\.to$/.test(url.hostname)) return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'affiliate_click', {
      link_domain: url.hostname,
      link_url: url.origin + url.pathname,
      product_label: (link.textContent || link.getAttribute('aria-label') || '').trim().slice(0, 100)
    });
  }
});
