'use strict';

// The content stays readable without JavaScript. Controls are enabled here.
const nav = document.querySelector('#primary-nav');
const menu = document.querySelector('.menu-toggle');
const closeMenu = () => {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
};
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});

const papers = [...document.querySelectorAll('.publication')];
const filters = [...document.querySelectorAll('[data-filter]')];
const search = document.querySelector('#publication-search');
const status = document.querySelector('#publication-status');
const emptyState = document.querySelector('#no-results');
let activeFilter = 'all';
document.querySelector('.publication-controls').hidden = false;
status.hidden = false;

const filterPapers = () => {
  const query = search.value.toLocaleLowerCase().trim();
  let count = 0;
  papers.forEach(paper => {
    const visible = (activeFilter === 'all' || paper.dataset.type === activeFilter) && paper.textContent.toLocaleLowerCase().includes(query);
    paper.hidden = !visible;
    if (visible) count++;
  });
  filters.forEach(button => {
    const active = button.dataset.filter === activeFilter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  status.textContent = count === papers.length ? `Showing all ${count} publications` : `Showing ${count} of ${papers.length} publications`;
  emptyState.hidden = count !== 0;
};
filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filterPapers();
}));
search.addEventListener('input', filterPapers);
document.querySelector('#reset-filters').addEventListener('click', () => {
  activeFilter = 'all';
  search.value = '';
  filterPapers();
  search.focus();
});
document.querySelectorAll('[data-topic]').forEach(link => link.addEventListener('click', () => {
  activeFilter = 'all';
  search.value = link.dataset.topic;
  filterPapers();
}));

const dialog = document.querySelector('#citation-dialog');
const citationText = document.querySelector('#citation-text');
const copyStatus = document.querySelector('#copy-status');
papers.forEach(paper => {
  const button = paper.querySelector('.cite-button');
  button.hidden = false;
  button.setAttribute('aria-label', `Cite: ${paper.querySelector('h3').textContent}`);
  button.addEventListener('click', () => {
    const authors = paper.querySelector('.authors').textContent.trim();
    const title = paper.querySelector('h3').textContent.trim();
    const venue = [...paper.querySelectorAll('.publication-meta > span')].map(part => part.textContent.trim()).join(' · ');
    const link = paper.querySelector('.paper-link').href;
    citationText.value = `${authors}. “${title}.” ${venue}, ${paper.dataset.year}. ${link}`;
    copyStatus.textContent = '';
    dialog.showModal();
  });
});
document.querySelector('#close-citation').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
document.querySelector('#copy-citation').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(citationText.value);
    copyStatus.textContent = 'Citation copied.';
  } catch {
    citationText.focus();
    citationText.select();
    copyStatus.textContent = 'Select and copy the citation above.';
  }
});

if ('IntersectionObserver' in window) {
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}
document.querySelector('#copyright-year').textContent = new Date().getFullYear();
