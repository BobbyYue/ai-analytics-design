(function () {
  'use strict';
  document.documentElement.classList.add('js-ready');
  const navButton = document.getElementById('nav-toggle');
  const aside = document.getElementById('toc');
  navButton.addEventListener('click', function () {
    const open = navButton.getAttribute('aria-expanded') !== 'true';
    navButton.setAttribute('aria-expanded', String(open));
    aside.classList.toggle('open', open);
  });
  document.querySelectorAll('nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      navButton.setAttribute('aria-expanded', 'false');
      aside.classList.remove('open');
    });
  });
  document.getElementById('print').addEventListener('click', () => window.print());
  const demoButtons = Array.from(document.querySelectorAll('[data-case]'));
  function renderCase(name) {
    if (!window.TeachingDemo) return;
    const result = TeachingDemo.evaluate(name);
    demoButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.case === name)));
    document.getElementById('demo-result').classList.toggle('pass', result.allowNextStep);
    document.getElementById('demo-title').textContent = result.title;
    document.getElementById('demo-calculation').textContent = result.calculation;
    const list = document.getElementById('demo-reasons');
    list.replaceChildren(...result.reasons.map(text => {
      const item = document.createElement('li'); item.textContent = text; return item;
    }));
    document.getElementById('demo-next').textContent = result.next;
  }
  demoButtons.forEach(b => b.addEventListener('click', () => renderCase(b.dataset.case)));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) document.querySelectorAll('nav a').forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, {rootMargin: '-10% 0px -65% 0px'});
    document.querySelectorAll('main > section').forEach(e => observer.observe(e));
  }
  let closed = [], selected = 'missing';
  window.addEventListener('beforeprint', function () {
    closed = Array.from(document.querySelectorAll('details:not([open])'));
    closed.forEach(e => e.open = true);
    selected = document.querySelector('[data-case][aria-pressed="true"]').dataset.case;
    renderCase('missing');
  });
  window.addEventListener('afterprint', function () {
    closed.forEach(e => e.open = false);
    renderCase(selected);
  });
})();
