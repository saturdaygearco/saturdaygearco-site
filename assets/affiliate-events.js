// Record Amazon referrals without changing the link or delaying navigation.
document.addEventListener('click', function (event) {
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  const link = target && target.closest('a[href]');
  if (!link) return;

  let destination;
  try { destination = new URL(link.href, window.location.href); } catch (_) { return; }
  if (!/(^|\.)(amazon\.com|amzn\.to)$/.test(destination.hostname)) return;
  if (typeof window.gtag !== 'function') return;

  const recommendation = link.closest('.product-pick, .buyer-card, .top-recommendations .card');
  const heading = recommendation && recommendation.querySelector('h3, h2');
  const section = link.closest('.affiliate-recommendations, .top-recommendations, #buying-shortlist, .related');
  const productName = (link.dataset.product || (heading && heading.textContent) ||
    link.getAttribute('aria-label') || link.textContent || '').trim().slice(0, 100);
  const placement = link.dataset.placement || (section && (
    section.id === 'buying-shortlist' ? 'comparison_section' :
    section.classList.contains('affiliate-recommendations') || section.classList.contains('top-recommendations') ? 'top_recommendation' : 'article_product'
  )) || 'article_product';

  window.gtag('event', 'affiliate_click', {
    page_path: window.location.pathname,
    product_name: productName,
    link_placement: placement,
    destination_url: destination.href,
    link_domain: destination.hostname
  });
});
