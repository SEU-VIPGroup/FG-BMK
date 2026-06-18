/* ==========================================================================
   FG-BMK (TPAMI) project page — interaction logic
   Leaderboard tables + per-dataset charts adapted from the verified ICLR page;
   findings-chapter renderer, theme toggle, and chrome are new.
   ========================================================================== */

/* ----------------------------- Theme toggle ----------------------------- */
function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('fgbmk-theme', next); } catch (e) {}
  // Charts use theme-aware colors; re-render on switch.
  if (window.__chartsReady) rebuildCharts();
}
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('fgbmk-theme'); } catch (e) {}
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

/* ----------------------------- Data state ------------------------------ */
let machineData = null;
let hierarchicalData = null;
let attributeData = [];
let activeAttributeView = 'overview';
let activeHierarchicalView = 'overview';

const datasetNameMap = {
  cub: 'CUB-200', flowers: 'Flowers-102', dogs: 'Stanford Dogs', cars: 'Stanford Cars',
  aircrafts: 'FGVC Aircraft', products: 'Products-10K', food101: 'Food-101', clothes: 'DeepFashion',
  vegfru: 'VegFru', skincon: 'SkinCon', wine: 'Wine', inat2021: 'iNat2021'
};

const hierarchicalSubset = [
  { key: 'cub', name: 'CUB-200', interactive: true },
  { key: 'inat2021', name: 'iNat2021', interactive: true },
  { key: 'aircrafts', name: 'Aircraft', interactive: false },
  { key: 'clothes', name: 'Clothes', interactive: false },
  { key: 'flowers', name: 'Flowers', interactive: false },
  { key: 'food101', name: 'Food', interactive: false },
  { key: 'dogs', name: 'Dogs', interactive: false },
  { key: 'vegfru', name: 'VegFru', interactive: false }
];

/* --------------------------- Tab switching ----------------------------- */
function switchTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('is-active'));
  document.querySelectorAll('.eval-tab').forEach(t => t.classList.remove('is-active'));
  document.getElementById(tabId).classList.add('is-active');
  event.currentTarget.classList.add('is-active');

  const footnote = document.getElementById('leaderboard-footnote');
  if (!footnote) return;
  if (tabId === 'tab-classification') {
    footnote.textContent = 'Top-1 accuracy on fine-grained image classification — machine-oriented evaluation of visual-feature discriminability.';
    if (!machineData) initMachineTable('classification'); else renderMachineTable('classification');
  } else if (tabId === 'tab-attribute') {
    footnote.innerHTML = 'Attribute-recognition accuracy (human-oriented). Click the <i class="fas fa-chevron-right" style="font-size:0.7em"></i> on Color, Pattern, or Shape to drill into part-level results.';
    if (attributeData.length === 0) initAttributeTable(); else renderAttributeTable('overview');
  } else if (tabId === 'tab-hierarchical') {
    footnote.innerHTML = 'Hierarchical granularity recognition (human-oriented). Values are <b>Choice / Judgment</b> accuracy; click CUB-200 or iNat2021 to expand taxonomic levels.';
    if (!hierarchicalData) initHierarchicalTable(); else renderHierarchicalTable('overview');
  } else if (tabId === 'tab-retrieval') {
    footnote.textContent = 'mAP on fine-grained image retrieval — machine-oriented evaluation of visual-feature discriminability.';
    if (!machineData) initMachineTable('retrieval'); else renderMachineTable('retrieval');
  } else if (tabId === 'tab-knowledge') {
    footnote.innerHTML = 'Knowledge bias (human-oriented). Per-category true/false accuracy varies widely <i>within</i> a single dataset — the gap between the easiest and hardest categories reveals each model’s knowledge bias.';
    if (!kbInited) initKnowledge();
  }
}

/* ------------------------------ Sorting -------------------------------- */
const sortStateMap = {};
function sortTable(tableId, colIndex) {
  if (!sortStateMap[tableId]) sortStateMap[tableId] = { colIndex: -1, ascending: true };
  const state = sortStateMap[tableId];
  if (state.colIndex === colIndex) state.ascending = !state.ascending;
  else { state.colIndex = colIndex; state.ascending = (colIndex === 0 || colIndex === 1); }

  if ((tableId === 'table-classification' || tableId === 'table-retrieval') && machineData) {
    const type = tableId.replace('table-', '');
    const sorted = [...machineData[type]].sort((a, b) => {
      if (colIndex === 0) return (a.originalIndex || 0) - (b.originalIndex || 0);
      if (colIndex === 1) return state.ascending ? a.model.localeCompare(b.model) : b.model.localeCompare(a.model);
      const key = Object.keys(a.scores)[colIndex - 2];
      return state.ascending ? (a.scores[key] || 0) - (b.scores[key] || 0) : (b.scores[key] || 0) - (a.scores[key] || 0);
    });
    machineData[type] = sorted; renderMachineTable(type); updateSortIcons(tableId, colIndex, state.ascending); return;
  }

  if (tableId === 'table-attribute' && attributeData.length) {
    const sorted = [...attributeData].sort((a, b) => {
      if (colIndex === 0) return (a.originalIndex || 0) - (b.originalIndex || 0);
      if (colIndex === 1) return state.ascending ? a.model.localeCompare(b.model) : b.model.localeCompare(a.model);
      let vA, vB;
      if (activeAttributeView === 'overview') {
        const key = ['color', 'pattern', 'shape', 'length', 'size'][colIndex - 2];
        vA = (a.overview && a.overview[key]) || 0; vB = (b.overview && b.overview[key]) || 0;
      } else {
        const sa = a[activeAttributeView] || {}, sb = b[activeAttributeView] || {};
        const key = Object.keys(sa)[colIndex - 2]; vA = sa[key] || 0; vB = sb[key] || 0;
      }
      return state.ascending ? vA - vB : vB - vA;
    });
    attributeData = sorted; renderAttributeTable(activeAttributeView); updateSortIcons(tableId, colIndex, state.ascending); return;
  }

  if (tableId === 'table-hierarchical' && hierarchicalData) {
    const viewKey = activeHierarchicalView;
    const current = viewKey === 'overview' ? (Array.isArray(hierarchicalData) ? hierarchicalData : hierarchicalData.overview) : hierarchicalData[viewKey];
    if (!current) return;
    const getVal = (item, key) => {
      let v = 0;
      if (viewKey === 'overview') v = (item.overview && item.overview[key] !== undefined) ? item.overview[key] : (item[key] || 0);
      else { const s = item.scores || item; v = s[key] || 0; }
      if (typeof v === 'object' && v !== null) return (v.choice + v.judgment) / 2;
      return v;
    };
    const sorted = [...current].sort((a, b) => {
      if (colIndex === 0) return (a.originalIndex || 0) - (b.originalIndex || 0);
      if (colIndex === 1) return state.ascending ? a.model.localeCompare(b.model) : b.model.localeCompare(a.model);
      let key;
      if (viewKey === 'overview') key = hierarchicalSubset[colIndex - 2].key;
      else {
        let keys = Object.keys(a.scores || a).filter(k => !['model', 'badge', 'originalIndex'].includes(k));
        if (viewKey === 'cub_details') keys = keys.filter(k => ['Class', 'Genus', 'Species'].includes(k.charAt(0).toUpperCase() + k.slice(1)));
        key = keys[colIndex - 2];
      }
      return state.ascending ? getVal(a, key) - getVal(b, key) : getVal(b, key) - getVal(a, key);
    });
    if (viewKey === 'overview') { if (Array.isArray(hierarchicalData)) hierarchicalData = sorted; else hierarchicalData.overview = sorted; }
    else hierarchicalData[viewKey] = sorted;
    renderHierarchicalTable(viewKey); updateSortIcons(tableId, colIndex, state.ascending);
  }
}

function updateSortIcons(tableId, colIndex, ascending) {
  const table = document.getElementById(tableId);
  table.querySelectorAll('thead th').forEach((th, i) => {
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;
    if (i === colIndex) { icon.innerHTML = ascending ? '▲' : '▼'; icon.classList.add('active'); }
    else { icon.innerHTML = '⇅'; icon.classList.remove('active'); }
  });
}

/* ----------------------------- Helpers --------------------------------- */
function badgeHtml(badge) {
  const b = (badge || 'VLM');
  return `<span class="badge badge-${b.toLowerCase().replace(/\s+/g, '-')}">${b}</span>`;
}
// Mean of a scores object (dual {choice,judgment} values count as their average).
// Used to rank models by overall performance for each task's default order.
function avgScore(scores) {
  const vals = Object.keys(scores || {}).map(k => {
    const v = scores[k];
    if (v && typeof v === 'object') return (v.choice + v.judgment) / 2;
    return typeof v === 'number' ? v : null;
  }).filter(v => v !== null);
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
}
function headTh(tableId, idx, label, drillKey) {
  return `<th class="clickable-header" onclick="sortTable('${tableId}', ${idx + 2})">
      <div class="th-inner"><span>${label}</span><span class="sort-icon">⇅</span>${drillKey ? `<span class="drill-down-indicator" onclick="event.stopPropagation(); ${drillKey}" title="View details"><i class="fas fa-chevron-right"></i></span>` : ''}</div>
    </th>`;
}

/* ------------------------- Machine tables ------------------------------ */
function initMachineTable(initialType) {
  try {
    machineData = JSON.parse(JSON.stringify(window.FGBMK_DATA.machine));
    Object.keys(machineData).forEach(t => {
      machineData[t].sort((a, b) => avgScore(b.scores) - avgScore(a.scores));
      machineData[t].forEach((it, i) => it.originalIndex = i);
    });
    renderMachineTable(initialType);
  } catch (e) { console.error('machine data', e); }
}
function isMachineBest(type, key, value) {
  let max = 0; machineData[type].forEach(it => { const v = it.scores[key] || 0; if (v > max) max = v; });
  return value >= max && max > 0;
}
function renderMachineTable(type) {
  const data = machineData[type];
  const thead = document.getElementById(`${type}-thead`);
  const tbody = document.getElementById(`${type}-tbody`);
  if (!thead || !tbody || !data) return;
  const tableId = `table-${type}`;
  const keys = Object.keys(data[0].scores);
  let h = '<tr>';
  h += `<th class="rank-col" onclick="sortTable('${tableId}',0)" title="Reset order">#</th>`;
  h += `<th class="model-col" onclick="sortTable('${tableId}',1)"><div class="th-inner th-left">Model <span class="sort-icon">⇅</span></div></th>`;
  keys.forEach((k, i) => h += headTh(tableId, i, datasetNameMap[k] || k));
  h += '</tr>'; thead.innerHTML = h;
  let b = '';
  data.forEach((it, idx) => {
    b += `<tr><td class="rank-col">${idx + 1}</td><td class="model-col"><span class="model-name-bold">${it.model}</span> ${badgeHtml(it.badge)}</td>`;
    keys.forEach(k => {
      const v = it.scores[k];
      b += `<td><span class="score-chip ${isMachineBest(type, k, v) ? 'is-best' : ''}">${v.toFixed(2)}</span></td>`;
    });
    b += '</tr>';
  });
  tbody.innerHTML = b;
}

/* ------------------------- Attribute table ----------------------------- */
function initAttributeTable() {
  try {
    attributeData = JSON.parse(JSON.stringify(window.FGBMK_DATA.attribute));
    attributeData.sort((a, b) => avgScore(b.overview) - avgScore(a.overview));
    attributeData.forEach((it, i) => it.originalIndex = i);
    renderAttributeTable('overview');
  } catch (e) { console.error('attribute data', e); }
}
function isAttrBest(key, value, view) {
  let max = 0; attributeData.forEach(m => { const v = view === 'overview' ? m.overview[key] : (m[view] ? m[view][key] : 0); if (v > max) max = v; });
  return value === max && max > 0;
}
function renderAttributeTable(view) {
  const thead = document.getElementById('attribute-thead');
  const tbody = document.getElementById('attribute-tbody');
  const back = document.getElementById('attribute-back');
  if (!thead || !tbody) return;
  activeAttributeView = view;
  if (back) back.style.display = view === 'overview' ? 'none' : 'inline-flex';
  let h = '<tr>';
  h += `<th class="rank-col" onclick="sortTable('table-attribute',0)" title="Reset order">#</th>`;
  h += `<th class="model-col" onclick="sortTable('table-attribute',1)"><div class="th-inner th-left">Model <span class="sort-icon">⇅</span></div></th>`;
  if (view === 'overview') {
    [['color', 'Color'], ['pattern', 'Pattern'], ['shape', 'Shape'], ['length', 'Length'], ['size', 'Size']].forEach((c, i) => {
      const drill = ['color', 'pattern', 'shape'].includes(c[0]) ? `drillDownAttr('${c[0]}')` : null;
      h += headTh('table-attribute', i, c[1], drill);
    });
  } else {
    Object.keys(attributeData[0][view]).forEach((k, i) => {
      const label = (k.charAt(0).toUpperCase() + k.slice(1)).replace(/_/g, ' ');
      h += headTh('table-attribute', i, label);
    });
  }
  h += '</tr>'; thead.innerHTML = h;
  let b = '';
  attributeData.forEach((m, idx) => {
    b += `<tr><td class="rank-col">${idx + 1}</td><td class="model-col"><span class="model-name-bold">${m.model}</span> ${badgeHtml(m.badge)}</td>`;
    const keys = view === 'overview' ? ['color', 'pattern', 'shape', 'length', 'size'] : Object.keys(m[view]);
    keys.forEach(k => {
      const v = view === 'overview' ? m.overview[k] : m[view][k];
      b += `<td><span class="score-chip ${isAttrBest(k, v, view) ? 'is-best' : ''}">${v.toFixed(2)}</span></td>`;
    });
    b += '</tr>';
  });
  tbody.innerHTML = b;
}
function drillDownAttr(view) {
  sortStateMap['table-attribute'] = { colIndex: -1, ascending: true };
  renderAttributeTable(view);
  document.getElementById('leaderboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ------------------------ Hierarchical table --------------------------- */
function initHierarchicalTable() {
  try {
    hierarchicalData = JSON.parse(JSON.stringify(window.FGBMK_DATA.hierarchical));
    const d = Array.isArray(hierarchicalData) ? hierarchicalData : hierarchicalData.overview;
    const hierAvg = (m) => {
      const obj = {};
      hierarchicalSubset.forEach(ds => {
        const raw = (m.overview && m.overview[ds.key] !== undefined) ? m.overview[ds.key] : m[ds.key];
        if (raw !== undefined && raw !== null) obj[ds.key] = raw;
      });
      return avgScore(obj);
    };
    d.sort((a, b) => hierAvg(b) - hierAvg(a));
    d.forEach((it, i) => it.originalIndex = i);
    renderHierarchicalTable('overview');
  } catch (e) { console.error('hierarchical data', e); }
}
function isHierBest(key, value, view) {
  let max = 0; const data = view === 'overview' ? (Array.isArray(hierarchicalData) ? hierarchicalData : hierarchicalData.overview) : hierarchicalData[view];
  if (!data) return false;
  const cur = (typeof value === 'object' && value) ? (value.choice + value.judgment) / 2 : (value || 0);
  data.forEach(m => {
    let raw = 0;
    if (view === 'overview') raw = (m.overview && m.overview[key] !== undefined) ? m.overview[key] : (m[key] || 0);
    else { const s = m.scores || m; raw = s[key] || 0; }
    const v = (typeof raw === 'object' && raw) ? (raw.choice + raw.judgment) / 2 : (raw || 0);
    if (v > max) max = v;
  });
  return cur >= max && max > 0;
}
function renderHierarchicalTable(view) {
  const thead = document.getElementById('hierarchical-thead');
  const tbody = document.getElementById('hierarchical-tbody');
  const back = document.getElementById('hierarchical-back');
  if (!thead || !tbody || !hierarchicalData) return;
  activeHierarchicalView = view;
  if (back) back.style.display = view === 'overview' ? 'none' : 'inline-flex';
  let data = view === 'overview' ? (Array.isArray(hierarchicalData) ? hierarchicalData : hierarchicalData.overview) : hierarchicalData[view];
  if (!data) return;
  let h = '<tr>';
  h += `<th class="rank-col" onclick="sortTable('table-hierarchical',0)" title="Reset order">#</th>`;
  h += `<th class="model-col" onclick="sortTable('table-hierarchical',1)"><div class="th-inner th-left">Model <span class="sort-icon">⇅</span></div></th>`;
  if (view === 'overview') {
    hierarchicalSubset.forEach((ds, i) => {
      const drillKey = ds.key === 'cub' ? 'cub_details' : 'inat_details';
      const drill = ds.interactive ? `drillDownHier('${drillKey}')` : null;
      h += headTh('table-hierarchical', i, ds.name, drill);
    });
  } else {
    let keys = Object.keys(data[0].scores || data[0]).filter(k => !['model', 'badge', 'originalIndex'].includes(k));
    if (view === 'cub_details') keys = keys.filter(k => ['Class', 'Genus', 'Species'].includes(k.charAt(0).toUpperCase() + k.slice(1)));
    keys.forEach((k, i) => h += headTh('table-hierarchical', i, k.charAt(0).toUpperCase() + k.slice(1)));
  }
  h += '</tr>'; thead.innerHTML = h;
  const cell = (raw, key) => {
    if (raw === null || raw === undefined) return `<td><span class="score-chip">-</span></td>`;
    let disp, best;
    if (typeof raw === 'object') { disp = `<span class="sc-choice">${raw.choice.toFixed(1)}</span><span class="sc-sep">/</span><span class="sc-judge">${raw.judgment.toFixed(1)}</span>`; best = isHierBest(key, raw, view); }
    else if (typeof raw === 'number') { disp = raw.toFixed(2); best = isHierBest(key, raw, view); }
    else { disp = raw; best = false; }
    return `<td><span class="score-chip chip-dual ${best ? 'is-best' : ''}">${disp}</span></td>`;
  };
  let b = '';
  data.forEach((m, idx) => {
    b += `<tr><td class="rank-col">${idx + 1}</td><td class="model-col"><span class="model-name-bold">${m.model}</span> ${badgeHtml(m.badge)}</td>`;
    if (view === 'overview') {
      hierarchicalSubset.forEach(ds => {
        let raw = (m.overview && m.overview[ds.key] !== undefined) ? m.overview[ds.key] : (m[ds.key] !== undefined ? m[ds.key] : null);
        b += cell(raw, ds.key);
      });
    } else {
      const s = m.scores || m;
      let keys = Object.keys(s).filter(k => !['model', 'badge', 'originalIndex'].includes(k));
      if (view === 'cub_details') keys = keys.filter(k => ['Class', 'Genus', 'Species'].includes(k.charAt(0).toUpperCase() + k.slice(1)));
      keys.forEach(k => b += cell(s[k], k));
    }
    b += '</tr>';
  });
  tbody.innerHTML = b;
}
function drillDownHier(view) {
  sortStateMap['table-hierarchical'] = { colIndex: -1, ascending: true };
  renderHierarchicalTable(view);
  document.getElementById('leaderboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function backToOverview(tab) {
  sortStateMap[`table-${tab}`] = { colIndex: -1, ascending: true };
  if (tab === 'attribute') renderAttributeTable('overview');
  else renderHierarchicalTable('overview');
}

/* ------------------------ Findings chapters ---------------------------- */
function initFindings() {
  try {
    renderFindings(window.FGBMK_DATA.findingsChapters.chapters);
  } catch (e) { console.error('findings data', e); }
}
function renderFindings(chapters) {
  const root = document.getElementById('findings-root');
  if (!root) return;
  root.innerHTML = chapters.map(ch => `
    <div class="chapter accent-${ch.accent}">
      <div class="chapter-head">
        <div class="chapter-numeral">${ch.numeral}</div>
        <div class="chapter-meta">
          <div class="chapter-stage">${ch.stage} &middot; ${ch.question}</div>
          <h3 class="chapter-title">${ch.title}</h3>
        </div>
      </div>
      <div class="finding-cards">
        ${ch.findings.map(f => `
          <div class="finding-card" id="card-${f.id}" onclick="toggleFinding('${f.id}')">
            <div class="fc-num">${String(f.n).padStart(2, '0')}</div>
            <div class="fc-body">
              <h4 class="fc-title">${f.title}</h4>
              <p class="fc-summary">${f.summary}</p>
              <div class="fc-detail"><p>${f.detail}</p></div>
            </div>
            <div class="fc-toggle"><i class="fas fa-plus"></i></div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}
function toggleFinding(id) {
  const card = document.getElementById(`card-${id}`);
  if (card) card.classList.toggle('is-open');
}

/* ------------------------ Knowledge bias (dumbbell) -------------------- */
let kbInited = false;
let activeKbDataset = null;
function initKnowledge() {
  const kb = window.FGBMK_DATA && window.FGBMK_DATA.knowledgeBias;
  const subtabs = document.getElementById('kb-subtabs');
  if (!kb || !subtabs) return;
  subtabs.innerHTML = kb.datasets.map((d, i) =>
    `<button class="kb-subtab${i === 0 ? ' is-active' : ''}" data-ds="${d.key}" onclick="selectKbDataset('${d.key}', this)">${d.name}</button>`
  ).join('');
  kbInited = true;
  selectKbDataset(kb.datasets[0].key);
}
function selectKbDataset(key, btn) {
  activeKbDataset = key;
  document.querySelectorAll('#kb-subtabs .kb-subtab').forEach(b => b.classList.toggle('is-active', b.dataset.ds === key));
  renderKnowledge(key);
}
function renderKnowledge(key) {
  const kb = window.FGBMK_DATA.knowledgeBias;
  const panel = document.getElementById('kb-panel');
  const rows = (kb.data[key] || []).slice().sort((a, b) => b.overall - a.overall);
  if (!panel) return;
  const minStd = Math.min(...rows.map(r => r.std));
  const clamp = v => Math.max(0, Math.min(100, v));
  panel.innerHTML = rows.map(r => {
    const w = clamp(r.worst.acc), b = clamp(r.best.acc), m = clamp(r.overall);
    const left = w, width = Math.max(0.5, b - w);
    const consistent = r.std === minStd;
    return `
    <div class="kb-row">
      <div class="kb-left">
        <div class="kb-model"><span class="model-name-bold">${r.model}</span> ${badgeHtml(r.badge)}</div>
        <div class="kb-overall">${r.overall.toFixed(1)}<span>%</span><small>Overall</small></div>
      </div>
      <div class="kb-right">
        <div class="kb-track">
          <div class="kb-band" style="left:${left}%; width:${width}%;"></div>
          <div class="kb-mean" style="left:${m}%;" title="Overall ${r.overall.toFixed(1)}%"></div>
          <div class="kb-dot kb-dot-worst" style="left:${w}%;" title="Hardest ${r.worst.acc.toFixed(1)}%"></div>
          <div class="kb-dot kb-dot-best" style="left:${b}%;" title="Easiest ${r.best.acc.toFixed(1)}%"></div>
        </div>
        <div class="kb-meta">
          <span>Hardest: <span class="kb-hard">${r.worst.cat}</span> · ${r.worst.acc.toFixed(1)}%</span>
          <span>Easiest: ${r.best.cat} · ${r.best.acc.toFixed(1)}%</span>
          <span class="kb-chip">spread ${(r.best.acc - r.worst.acc).toFixed(0)} pts</span>
          <span class="kb-chip${consistent ? ' kb-tag-consistent' : ''}">σ ${r.std.toFixed(1)}${consistent ? ' · most consistent' : ''}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* --------------------------- Per-dataset charts ------------------------ */
const modelNames = ['EVA-CLIP', 'CoCa', 'DINOv2', 'BEiT3', 'LLaVA', 'InternVL', 'Qwen'];
const modelColors = ['#60a5fa', '#0d9488', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6', '#34d399'];
const clsData = {
  'chart-cub': [88.95, 79.89, 91.65, 82.67, 79.54, 89.92, 80.08],
  'chart-dogs': [87.69, 81.24, 90.5, 80.07, 80.73, 89.09, 77.02],
  'chart-cars': [94.3, 92.36, 91.72, 88.43, 87.56, 93.34, 90.67],
  'chart-aircraft': [70.27, 63.4, 78.88, 50.47, 62.46, 79.05, 51.15],
  'chart-flowers': [99.45, 98.46, 99.69, 95.59, 98.04, 99.41, 97.43],
  'chart-inat': [64.7, 40.59, 77.07, 43.55, 39.77, 57.9, 38.9],
  'chart-food': [95.67, 92.38, 95.12, 89.13, 94.53, 96.07, 88.9],
  'chart-clothes': [72.03, 71.45, 66.7, 65.45, 68.69, 71.12, 69.37],
  'chart-vegfru': [94.73, 91.08, 96.44, 85.84, 90.72, 95.57, 86.98],
  'chart-products': [65.05, 39.12, 58.88, 49.21, 51.31, 58.03, 54.33],
  'chart-skincon': [94.49, 86.7, 94.79, 86.42, 81.29, 94.53, 73.9],
  'chart-wine': [92.53, 90.72, 96.36, 88.85, 93.98, 94.07, 90.7]
};
const retriData = {
  'chart-cub': [90.33, 77.38, 91.95, 84.06, 75.63, 91.47, 74.8],
  'chart-dogs': [89.47, 79.46, 91.72, 82.96, 77.43, 92.33, 74.16],
  'chart-cars': [95.11, 88.44, 89.53, 88.77, 85.49, 92.47, 86.64],
  'chart-aircraft': [77.81, 69.46, 81.07, 57.64, 63.56, 79.86, 50.66],
  'chart-flowers': [99.6, 96.88, 99.7, 95.98, 96.24, 99.66, 95.11],
  'chart-inat': [38.65, 36.88, 40.58, 31.83, 34.79, 42.97, 35.67],
  'chart-food': [95.09, 85.79, 92.48, 86.27, 87.55, 96.17, 81.77],
  'chart-clothes': [73.69, 69.55, 69.53, 66.4, 67.86, 70.68, 68.78],
  'chart-vegfru': [93.77, 85.54, 95.06, 83.89, 79.04, 95.88, 78.06],
  'chart-products': [48.05, 32.94, 30.05, 37.36, 30.85, 44.08, 29.29],
  'chart-skincon': [67.32, 60.23, 62.49, 62.48, 61.44, 64.86, 60.51],
  'chart-wine': [70.66, 65.4, 78.77, 68.5, 65.19, 71.61, 62.84]
};
let charts = {};
let currentView = 'cls';
function themeColors() {
  const dark = document.documentElement.getAttribute('data-theme') !== 'light';
  return {
    grid: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
    tick: dark ? '#9ca3af' : '#94a3b8',
    tooltipBg: dark ? '#1e2130' : '#ffffff',
    tooltipTitle: dark ? '#e8e6e3' : '#1e293b',
    tooltipBody: dark ? '#93bbfd' : '#4f46e5',
    tooltipBorder: dark ? '#2d3040' : '#e2e8f0'
  };
}
function createChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const tc = themeColors();
  Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif";
  Chart.defaults.color = tc.tick;
  return new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels: modelNames, datasets: [{ data, backgroundColor: modelColors.map(c => c + 'cc'), hoverBackgroundColor: modelColors, borderRadius: 3, borderSkipped: false, barPercentage: 0.7, categoryPercentage: 0.82 }] },
    options: {
      responsive: true, maintainAspectRatio: true,
      onHover: (e, el) => { e.native.target.style.cursor = el[0] ? 'pointer' : 'default'; },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tc.tooltipBg, titleColor: tc.tooltipTitle, bodyColor: tc.tooltipBody,
          bodyFont: { size: 13, weight: 'bold' }, borderColor: tc.tooltipBorder, borderWidth: 1,
          padding: 10, cornerRadius: 8, displayColors: true, usePointStyle: true, boxPadding: 5,
          callbacks: { title: (items) => modelNames[items[0].dataIndex], label: (ctx) => ` ${ctx.parsed.y}%` }
        }
      },
      scales: {
        y: { beginAtZero: true, max: 100, border: { display: false }, grid: { color: tc.grid, drawTicks: false, borderDash: [4, 4] }, ticks: { font: { size: 10 }, color: tc.tick, stepSize: 25, callback: v => v + '%' } },
        x: { border: { display: false }, grid: { display: false }, ticks: { display: false } }
      },
      animation: { duration: 700, easing: 'easeOutQuart' }
    }
  });
}
function initCharts() {
  const data = currentView === 'cls' ? clsData : retriData;
  Object.keys(data).forEach(id => { const c = createChart(id, data[id]); if (c) charts[id] = c; });
  window.__chartsReady = true;
}
function rebuildCharts() {
  Object.values(charts).forEach(c => c.destroy());
  charts = {}; initCharts();
}
function switchView(view) {
  currentView = view;
  const data = view === 'cls' ? clsData : retriData;
  Object.keys(charts).forEach(id => { charts[id].data.datasets[0].data = data[id]; charts[id].update('none'); });
  document.getElementById('btn-cls').classList.toggle('is-active', view === 'cls');
  document.getElementById('btn-retri').classList.toggle('is-active', view === 'retri');
}

/* ------------------------------ Chrome --------------------------------- */
function copyBibTeX() {
  const el = document.getElementById('bibtex-code');
  const btn = document.querySelector('.bibtex-copy');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim()).then(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Copied';
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  const top = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
    if (top) top.classList.toggle('visible', window.scrollY > 500);
  });

  initAttributeTable();
  initMachineTable('classification');
  initHierarchicalTable();
  initFindings();
  if (window.Chart) { initCharts(); switchView('cls'); }
  else window.addEventListener('load', () => { if (window.Chart) { initCharts(); switchView('cls'); } });

  // Reveal-on-scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
});
