// accordion.js - simple, robust accordion
document.addEventListener('click', function (e) {
    if (!e.target.matches('.accordion-header')) return;
  
    const header = e.target;
    const body = header.nextElementSibling;
    if (!body) return;
  
    // close other open bodies within same .accordion container
    const container = header.closest('.accordion');
    if (container) {
      container.querySelectorAll('.accordion-body').forEach(b => {
        if (b !== body) b.style.display = 'none';
      });
    }
  
    // toggle current
    body.style.display = (body.style.display === 'block') ? 'none' : 'block';
  });
  