/* ---------- DATOS DE LA CARTA ----------
   Sacados del PDF oficial "Menú Temático de Café Pixel" (subido a Scribd,
   scribd.com/document/751321042/CARTA-CAFE-PIXEL, verificado 09-09-2026)
   más un precio cruzado con un artículo de prensa (FMDOS, sobre el
   Woowafflet). La carta real tiene más de 50 opciones — acá se muestra
   una selección representativa; el botón "ver PDF completo" en la
   sección Carta linkea al documento real. */
const MENU = {
  cafesTematicos: {
    label: 'Cafés Temáticos',
    groups: [{ items: [
      { n: 'Planta Caramel Pipe', d: 'Café temático inspirado en Mario', p: 4690 },
      { n: 'Oreo Ball', p: 4790 },
      { n: 'Cloud Dream Land', p: 4790 },
      { n: 'Choco Ball', p: 4790 },
    ]}]
  },
  postresTematicos: {
    label: 'Postres Temáticos',
    groups: [{ items: [
      { n: 'Panna Gengar', d: 'Panna cotta temática Pokémon', p: 4290 },
      { n: 'Koopa Shell', d: 'Inspirado en el caparazón de Bowser', p: 4290 },
      { n: 'Woowafflet', d: 'Waffle de vainilla con plátano, frutillas, crema chantilly y salsa de chocolate', p: 5390 },
    ]}]
  },
  bebidas: {
    label: 'Bebidas Frías',
    groups: [{ items: [
      { n: 'Malteada Eevee', d: 'También disponible como Impactrueno (Pikachu)', p: 5390 },
    ]}]
  },
  cafeTradicional: {
    label: 'Café Tradicional',
    groups: [{ items: [
      { n: 'Espresso doble', p: 2100 },
      { n: 'Americano', p: 2490 },
      { n: 'Capuccino', p: 3190 },
      { n: 'Mocca', p: 3390 },
    ]}]
  }
};

const money = n => n ? '$' + n.toLocaleString('es-CL') : 'Consultar';

const tabsEl = document.getElementById('menuTabs');
const panelsEl = document.getElementById('menuPanels');
const catKeys = Object.keys(MENU);

catKeys.forEach((key, i) => {
  const tab = document.createElement('button');
  tab.className = 'menu-tab' + (i===0 ? ' active':'');
  tab.textContent = MENU[key].label;
  tab.addEventListener('click', () => showTab(key));
  tab.dataset.key = key;
  tabsEl.appendChild(tab);

  const panel = document.createElement('div');
  panel.className = 'menu-panel' + (i===0 ? ' active':'');
  panel.id = 'panel-' + key;

  MENU[key].groups.forEach(group => {
    if(group.title){
      const h = document.createElement('div');
      h.className = 'menu-group-title';
      h.textContent = group.title;
      panel.appendChild(h);
    }
    const grid = document.createElement('div');
    grid.className = 'menu-grid';
    group.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'menu-item';
      row.addEventListener('click', () => openModal(item));

      if(item.img){
        const photo = document.createElement('div');
        photo.className = 'menu-item-photo';
        const photoImg = document.createElement('img');
        photoImg.src = item.img;
        photoImg.alt = item.n;
        photo.appendChild(photoImg);
        row.appendChild(photo);
      }

      const textWrap = document.createElement('div');
      textWrap.className = 'menu-item-text';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = item.n;
      textWrap.appendChild(nameSpan);

      if(item.v){
        const vegTag = document.createElement('span');
        vegTag.className = 'veg-tag';
        vegTag.textContent = 'VEG';
        textWrap.appendChild(vegTag);
      }

      if(item.d){
        const descDiv = document.createElement('div');
        descDiv.className = 'desc';
        descDiv.textContent = item.d;
        textWrap.appendChild(descDiv);
      }

      const priceDiv = document.createElement('div');
      priceDiv.className = 'price mono';
      priceDiv.textContent = money(item.p);

      row.appendChild(textWrap);
      row.appendChild(priceDiv);
      grid.appendChild(row);
    });
    panel.appendChild(grid);
  });
  panelsEl.appendChild(panel);
});

function showTab(key){
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.toggle('active', t.dataset.key === key));
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + key));
}

/* ---------- MODAL PRODUCTO ---------- */
let currentItem = null;
function openModal(item){
  currentItem = item;
  document.getElementById('modalName').textContent = item.n;
  document.getElementById('modalPrice').textContent = money(item.p);
  document.getElementById('modalDesc').textContent = item.d || 'Preparado real de la carta de Café Pixel.';
  const photoWrap = document.getElementById('modalPhoto');
  if(item.img){
    photoWrap.innerHTML = '';
    const photoImg = document.createElement('img');
    photoImg.src = item.img;
    photoImg.alt = item.n;
    photoWrap.appendChild(photoImg);
    photoWrap.style.display = 'block';
  } else {
    photoWrap.style.display = 'none';
  }
  toggleModal(true);
}
document.getElementById('modalAddBtn').addEventListener('click', () => {
  addToCart(currentItem);
  toggleModal(false);
  toggleCart(true);
});
function toggleModal(open){ document.getElementById('modalOverlay').classList.toggle('open', open); }

/* ---------- CARRITO ---------- */
let cart = [];
function addToCart(item){
  const existing = cart.find(c => c.n === item.n);
  if(existing){ existing.qty++; } else { cart.push({...item, qty:1}); }
  renderCart();
}
function changeQty(name, delta){
  const line = cart.find(c => c.n === name);
  if(!line) return;
  line.qty += delta;
  if(line.qty <= 0) cart = cart.filter(c => c.n !== name);
  renderCart();
}
function renderCart(){
  const linesEl = document.getElementById('cartLines');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartCount');
  const totalQty = cart.reduce((s,c) => s + c.qty, 0);
  countEl.textContent = totalQty;
  if(cart.length === 0){
    linesEl.innerHTML = '<p class="cart-empty">Todavía no agregaste nada.</p>';
    totalEl.textContent = '$0';
    return;
  }
  linesEl.innerHTML = '';
  let total = 0;
  cart.forEach(line => {
    total += (line.p || 0) * line.qty;
    const div = document.createElement('div');
    div.className = 'cart-line';
    div.innerHTML = `
      <div>
        <div class="name">${line.n}</div>
        <div class="qty-ctrl">
          <button class="qty-btn" data-name="${line.n}" data-delta="-1">−</button>
          <span class="mono">${line.qty}</span>
          <button class="qty-btn" data-name="${line.n}" data-delta="1">+</button>
        </div>
      </div>
      <div class="price mono">${money(line.p)}</div>
    `;
    linesEl.appendChild(div);
  });
  totalEl.textContent = money(total);
  linesEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.name, parseInt(btn.dataset.delta)));
  });
}
document.getElementById('cartBtn').addEventListener('click', () => toggleCart(true));
document.getElementById('cartCloseBtn').addEventListener('click', () => toggleCart(false));
function toggleCart(open){ document.getElementById('cartOverlay').classList.toggle('open', open); }

document.getElementById('modalCloseBtn').addEventListener('click', () => toggleModal(false));
[document.getElementById('cartOverlay'), document.getElementById('modalOverlay')].forEach(ov => {
  ov.addEventListener('click', (e) => { if(e.target === ov) ov.classList.remove('open'); });
});

/* ---------- NAV MÓVIL Y NAVEGACIÓN POR PESTAÑAS ---------- */
document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

const panels = document.querySelectorAll('.tab-panel');
function goToTab(tabId){
  panels.forEach(p => p.classList.toggle('active', p.dataset.tabPanel === tabId));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.tab === tabId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('navLinks').classList.remove('open');
  initScrollReveal();
}

document.querySelectorAll('[data-tab]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    goToTab(el.dataset.tab);
  });
});

/* ---------- INDICADOR ABIERTO/CERRADO EN VIVO
   Horario oficial verificado en la bio de Instagram (@cafepixel.cl) el
   09-09-2026, coincide con portalpanorama.cl:
   Lunes CERRADO · Martes a viernes 14:15-21:30 · Sábado y domingo 11:30-21:30 ---------- */
function getTodayHours(){
  const day = new Date().getDay(); // 0=domingo ... 6=sábado
  if(day === 1) return null; // lunes cerrado
  if(day >= 2 && day <= 5) return [14*60+15, 21*60+30];
  return [11*60+30, 21*60+30]; // sábado y domingo
}
function updateOpenStatus(dotId, textId){
  const dot = document.getElementById(dotId);
  const text = document.getElementById(textId);
  if(!dot || !text) return;
  const now = new Date();
  const minutes = now.getHours()*60 + now.getMinutes();
  const hours = getTodayHours();
  const isOpen = hours && minutes >= hours[0] && minutes < hours[1];
  text.textContent = isOpen ? 'Abierto ahora' : 'Cerrado ahora';
  dot.classList.toggle('closed', !isOpen);
}
updateOpenStatus('statusDot', 'statusText');
updateOpenStatus('statusDot2', 'statusText2');

/* ---------- SCROLL REVEAL (entrada ordenada al hacer scroll) ----------
   Solo agrega/observa animación de entrada — la navegación sigue siendo
   100% por pestañas (SPA), esto NO es sticky-scroll. Incluye red de
   seguridad por si IntersectionObserver no dispara a tiempo. */
function initScrollReveal(){
  const els = document.querySelectorAll('.reveal:not(.revealed)');
  if(!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el, i) => {
    el.style.transitionDelay = (Math.min(i % 6, 6) * 60) + 'ms';
    io.observe(el);
  });
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => el.classList.add('revealed'));
  }, 1200);
}
initScrollReveal();

/* ---------- PANTALLA DE CARGA (rápida, <1s) ---------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
  }, 350);
});
