document.documentElement.classList.add('js');
  const gnb = document.getElementById('gnb');
  const onScroll = () => gnb.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  const mtg = document.querySelector('.menu-toggle');
  if (mtg) mtg.addEventListener('click', () => {
    const open = gnb.classList.toggle('open');
    mtg.setAttribute('aria-expanded', String(open));
  });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    setTimeout(() => els.forEach(el => el.classList.add('in')), 2500);
  }
