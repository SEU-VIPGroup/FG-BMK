window.HELP_IMPROVE_VIDEOJS = false;

// Machine Evaluation Data
let machineData = null;
let hierarchicalData = null;
let keyFindingsData = null;
let activeHierarchicalView = 'overview';

const datasetNameMap = {
  "cub": "CUB-200",
  "flowers": "FLOWERS 102",
  "dogs": "STANFORD DOGS",
  "cars": "STANFORD CARS",
  "aircrafts": "FGVC AIRCRAFT",
  "products": "PRODUCTS-10K",
  "food101": "FOOD-101",
  "clothes": "DEEPFASHION",
  "vegfru": "VEGFRU",
  "skincon": "SKINCON",
  "wine": "WINE",
  "inat2021": "INAT2021"
};

const hierarchicalSubset = [
  { key: 'cub', name: 'CUB-200', interactive: true },
  { key: 'inat2021', name: 'Inat2021', interactive: true }, // Map inat2021 to inat_details
  { key: 'aircrafts', name: 'Aircraft', interactive: false },
  { key: 'clothes', name: 'Clothes', interactive: false },
  { key: 'flowers', name: 'Flowers', interactive: false },
  { key: 'food101', name: 'Food', interactive: false },
  { key: 'dogs', name: 'Dogs', interactive: false },
  { key: 'vegfru', name: 'Vegfru', interactive: false }
];

// Evaluation Results Tab Switching
function switchTab(event, tabId) {
  // Hide all tab content
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => content.classList.remove('is-active'));

  // Deactivate all tabs
  const tabs = document.querySelectorAll('.eval-tab');
  tabs.forEach(tab => tab.classList.remove('is-active'));

  // Show selected tab content
  document.getElementById(tabId).classList.add('is-active');

  // Activate selected tab (works for both div and button)
  event.currentTarget.classList.add('is-active');

  // Update dynamic footnote
  const footnote = document.getElementById('leaderboard-footnote');
  
  const classificationText = 'Top-1 accuracy performance on fine-grained image classification tasks.';
  const attributeText = 'Accuracy performance on the Attribute Recognition task within the human-oriented evaluation.';
  const retrievalText = 'mAP (mean Average Precision) performance on fine-grained image retrieval tasks.';

  if (footnote) {
    if (tabId === 'tab-classification') {
      footnote.textContent = classificationText;
      if (!machineData) initMachineTable('classification');
      else renderMachineTable('classification');
    }
    else if (tabId === 'tab-attribute') {
      footnote.textContent = attributeText;
      if (attributeData.length === 0) initAttributeTable();
      else renderAttributeTable('overview');
    }
    else if (tabId === 'tab-hierarchical') {
      footnote.textContent = 'Hierarchical granularity recognition performance. The overview displays Species-level accuracy across all datasets; click on CUB-200 or iNat2021 to view detailed taxonomic breakdowns.';
      if (!hierarchicalData) initHierarchicalTable();
      else renderHierarchicalTable('overview');
    }
    else if (tabId === 'tab-retrieval') {
      footnote.textContent = retrievalText;
      if (!machineData) initMachineTable('retrieval');
      else renderMachineTable('retrieval');
    }
  }
}

// Global sort state per table
const sortStateMap = {};

function sortTable(tableId, colIndex) {
  // Initialization of sort state
  if (!sortStateMap[tableId]) sortStateMap[tableId] = { colIndex: -1, ascending: true };
  const state = sortStateMap[tableId];

  // Logic: NEW column -> Descending (for scores), SAME column -> Toggle
  if (state.colIndex === colIndex) {
    state.ascending = !state.ascending;
  } else {
    state.colIndex = colIndex;
    // Rank (0) and Model (1) default to Ascending, performance scores default to Descending
    state.ascending = (colIndex === 0 || colIndex === 1); 
  }

  // 1. Machine Tables (Classification / Retrieval)
  if ((tableId === 'table-classification' || tableId === 'table-retrieval') && machineData) {
    const type = tableId.replace('table-', '');
    const currentData = machineData[type];
    
    // Immutable Sort: Create a new copy then sort
    const sortedData = [...currentData].sort((a, b) => {
      if (colIndex === 0) return (a.originalIndex || 0) - (b.originalIndex || 0);
      if (colIndex === 1) return state.ascending ? a.model.localeCompare(b.model) : b.model.localeCompare(a.model);
      
      const datasetKeys = Object.keys(a.scores);
      const key = datasetKeys[colIndex - 2];
      const valA = a.scores[key] || 0;
      const valB = b.scores[key] || 0;
      return state.ascending ? valA - valB : valB - valA;
    });

    machineData[type] = sortedData; 
    renderMachineTable(type);
    updateSortIcons(tableId, colIndex, state.ascending);
    return;
  }

  // 2. Attribute Table
  if (tableId === 'table-attribute' && attributeData.length > 0) {
    const sortedData = [...attributeData].sort((a, b) => {
      if (colIndex === 0) return (a.originalIndex || 0) - (b.originalIndex || 0);
      if (colIndex === 1) return state.ascending ? a.model.localeCompare(b.model) : b.model.localeCompare(a.model);

      let valA, valB;
      if (activeAttributeView === 'overview') {
        const keys = ['color', 'pattern', 'shape', 'length', 'size'];
        const key = keys[colIndex - 2];
        valA = (a.overview && a.overview[key]) || 0;
        valB = (b.overview && b.overview[key]) || 0;
      } else {
        const subA = a[activeAttributeView] || {};
        const subB = b[activeAttributeView] || {};
        const keys = Object.keys(subA);
        const key = keys[colIndex - 2];
        valA = subA[key] || 0;
        valB = subB[key] || 0;
      }
      return state.ascending ? valA - valB : valB - valA;
    });

    attributeData = sortedData;
    renderAttributeTable(activeAttributeView);
    updateSortIcons(tableId, colIndex, state.ascending);
    return;
  }

  // 3. Hierarchical Table
  if (tableId === 'table-hierarchical' && hierarchicalData) {
    const currentViewKey = activeHierarchicalView === 'overview' ? 'overview' : activeHierarchicalView;
    const currentData = hierarchicalData[currentViewKey];
    if (!currentData) return;

    const sortedData = [...currentData].sort((a, b) => {
      if (colIndex === 0) return (a.originalIndex || 0) - (b.originalIndex || 0);
      if (colIndex === 1) return state.ascending ? a.model.localeCompare(b.model) : b.model.localeCompare(a.model);

      let valA, valB;
      const getVal = (item, key) => {
        let v = 0;
        if (activeHierarchicalView === 'overview') {
          v = (item.overview && item.overview[key] !== undefined) ? item.overview[key] : (item[key] || 0);
        } else {
          const scores = item.scores || item;
          v = scores[key] || 0;
        }
        // If it's the new dual-score object, use average for sorting
        if (typeof v === 'object' && v !== null) {
          return (v.choice + v.judgment) / 2;
        }
        return v;
      };

      if (activeHierarchicalView === 'overview') {
        const key = hierarchicalSubset[colIndex - 2].key;
        valA = getVal(a, key);
        valB = getVal(b, key);
      } else {
        const scoresA = a.scores || a;
        let keys = Object.keys(scoresA).filter(k => k !== 'model' && k !== 'badge' && k !== 'originalIndex');
        if (activeHierarchicalView === 'cub_details') {
          keys = keys.filter(k => ['Class', 'Genus', 'Species'].includes(k.charAt(0).toUpperCase() + k.slice(1)));
        }
        const key = keys[colIndex - 2];
        valA = getVal(a, key);
        valB = getVal(b, key);
      }
      return state.ascending ? valA - valB : valB - valA;
    });

    hierarchicalData[currentViewKey] = sortedData;
    renderHierarchicalTable(activeHierarchicalView);
    updateSortIcons(tableId, colIndex, state.ascending);
  }
}

/**
 * Shared icon update logic
 */
function updateSortIcons(tableId, colIndex, ascending) {
  const table = document.getElementById(tableId);
  const ths = table.querySelectorAll('thead th');
  ths.forEach((th, i) => {
    const icon = th.querySelector('.sort-icon');
    if (icon) {
      if (i === colIndex) {
        icon.innerHTML = ascending ? '▲' : '▼';
        icon.style.opacity = '1';
        icon.style.color = '#2563eb';
      } else {
        icon.innerHTML = '⇅';
        icon.style.opacity = '0.5';
        icon.style.color = 'inherit';
      }
    }
  });
}

// --- Attribute Table Interactive Logic ---
let attributeData = [];
let activeAttributeView = 'overview';

async function initAttributeTable() {
  try {
    const response = await fetch('static/json/attributeData.json');
    attributeData = await response.json();
    
    // Store original index for rank reset
    attributeData.forEach((item, idx) => {
      item.originalIndex = idx;
    });

    renderAttributeTable('overview');
  } catch (err) {
    console.error('Failed to load attribute data:', err);
  }
}

function renderAttributeTable(view) {
  const thead = document.getElementById('attribute-thead');
  const tbody = document.getElementById('attribute-tbody');
  const backBtn = document.getElementById('attribute-back-btn-container');
  
  if (!thead || !tbody) return;

  activeAttributeView = view;
  backBtn.style.display = (view === 'overview') ? 'none' : 'flex';

  // 1. Render Headers
  let headerHtml = '<tr>';
    headerHtml += `<th class="rank-cell sticky-rank-col align-middle py-4 text-center select-none cursor-pointer active:bg-gray-100" onclick="sortTable('table-attribute', 0)" style="cursor: pointer;" title="Reset Order">#</th>`;
    headerHtml += `<th class="sticky-model-col sticky-shadow-right pl-8 align-middle py-4 text-left select-none cursor-pointer active:bg-gray-100" onclick="sortTable('table-attribute', 1)" style="cursor: pointer;">Model <span class="sort-icon">⇅</span></th>`;

    if (view === 'overview') {
      const categories = [
        { key: 'color', label: 'Color Acc', interactive: true },
        { key: 'pattern', label: 'Pattern Acc', interactive: true },
        { key: 'shape', label: 'Shape Acc', interactive: true },
        { key: 'length', label: 'Length Acc', interactive: false },
        { key: 'size', label: 'Size Acc', interactive: false }
      ];

      categories.forEach((cat, idx) => {
        headerHtml += `<th class="clickable-header align-middle py-4 text-center select-none cursor-pointer active:bg-gray-100" onclick="sortTable('table-attribute', ${idx + 2})">
          <div class="header-center-force gap-1.5 h-full">
            <span style="white-space: nowrap;">${cat.label}</span>
            <span class="sort-icon">⇅</span>
            ${cat.interactive ? `
              <span onclick="event.stopPropagation(); drillDown('${cat.key}');" class="drill-down-indicator text-blue-500 cursor-pointer" title="View Details">
                <i class="fas fa-chevron-right text-xs"></i>
              </span>` : ''}
          </div>
        </th>`;
      });


    } else {
      // Detailed Headers from first model's data
      const subKeys = Object.keys(attributeData[0][view]);
      subKeys.forEach((key, idx) => {
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
        headerHtml += `<th class="align-middle py-4 text-center select-none cursor-pointer active:bg-gray-100" onclick="sortTable('table-attribute', ${idx + 2})">
          <div class="header-center-force gap-1.5 h-full">
            <span style="white-space: nowrap;">${formattedKey}</span>
            <span class="sort-icon">⇅</span>
          </div>
        </th>`;
      });

    }
    headerHtml += '</tr>';
    thead.innerHTML = headerHtml;

    // 2. Render Body
    let bodyHtml = '';
    attributeData.forEach((model, idx) => {
      bodyHtml += '<tr>';
      bodyHtml += `<td class="rank-cell sticky-rank-col align-middle py-4 text-center">${idx + 1}</td>`;
      bodyHtml += `<td class="sticky-model-col sticky-shadow-right left-align model-cell align-middle py-4 truncate" title="${model.model}">
        <span class="model-name-bold pr-2">${model.model}</span>
        <span class="badge badge-${model.badge.toLowerCase().replace(/\s+/g, '-')}">${model.badge}</span>
      </td>`;



    
    if (view === 'overview') {
      const keys = ['color', 'pattern', 'shape', 'length', 'size'];
      keys.forEach(key => {
        const val = model.overview[key];
        const isBest = isGlobalBest(key, val, 'overview');
        bodyHtml += `<td class="tabular-nums align-middle py-4 text-center">
          <div class="score-chip chip-single ${isBest ? 'highlight-best' : ''}">
            <span class="score-main">${val.toFixed(2)}%</span>
          </div>
        </td>`;
      });
    } else {
      const subKeys = Object.keys(model[view]);
      subKeys.forEach(key => {
        const val = model[view][key];
        const isBest = isGlobalBest(key, val, view);
        bodyHtml += `<td class="tabular-nums px-4 align-middle py-4 text-center">
          <div class="score-chip chip-single ${isBest ? 'highlight-best' : ''}">
            <span class="score-main">${val.toFixed(2)}%</span>
          </div>
        </td>`;
      });
    }

    bodyHtml += '</tr>';
  });
  tbody.innerHTML = bodyHtml;
}

// --- Machine Evaluation Table Logic ---
async function initMachineTable(initialType) {
  try {
    const response = await fetch('static/json/machineEvaluationData.json');
    machineData = await response.json();
    
    // Prepare data (store original index)
    Object.keys(machineData).forEach(type => {
      machineData[type].forEach((item, idx) => {
        item.originalIndex = idx;
      });
    });

    renderMachineTable(initialType);
  } catch (err) {
    console.error('Failed to load machine evaluation data:', err);
  }
}

function renderMachineTable(type) {
  const data = machineData[type];
  const thead = document.getElementById(`${type}-thead`);
  const tbody = document.getElementById(`${type}-tbody`);
  const tableId = `table-${type}`;
  
  if (!thead || !tbody || !data) return;

  // 1. Render Headers
  const firstItem = data[0];
  const datasetKeys = Object.keys(firstItem.scores);

  let headerHtml = '<tr>';
  headerHtml += `<th class="rank-cell sticky-rank-col align-middle py-4 text-center select-none cursor-pointer active:bg-gray-100" onclick="sortTable('${tableId}', 0)" style="cursor: pointer;" title="Reset Order">#</th>`;
  headerHtml += `<th class="sticky-model-col sticky-shadow-right pl-8 align-middle py-4 text-left select-none cursor-pointer active:bg-gray-100" onclick="sortTable('${tableId}', 1)" style="cursor: pointer;">Model <span class="sort-icon">⇅</span></th>`;

  datasetKeys.forEach((key, idx) => {
    const displayName = datasetNameMap[key] || key.toUpperCase();
    headerHtml += `<th class="clickable-header align-middle py-4 text-center select-none cursor-pointer active:bg-gray-100" onclick="sortTable('${tableId}', ${idx + 2})">
      <div class="header-center-force gap-1.5 h-full">
        <span style="white-space: nowrap;">${displayName}</span>
        <span class="sort-icon">⇅</span>
      </div>
    </th>`;
  });

  headerHtml += '</tr>';
  thead.innerHTML = headerHtml;

  // 2. Render Body
  let bodyHtml = '';
  data.forEach((item, idx) => {
    bodyHtml += `<tr>`;
    bodyHtml += `<td class="rank-cell sticky-rank-col align-middle py-4 text-center">${idx + 1}</td>`;
    bodyHtml += `<td class="sticky-model-col sticky-shadow-right left-align model-cell align-middle py-4 truncate" title="${item.model}">
      <span style="font-weight: 700;">${item.model}</span>
      <span class="badge badge-${item.badge.toLowerCase().replace(/\s+/g, '-')}">${item.badge}</span>
    </td>`;


    datasetKeys.forEach(key => {
      const val = item.scores[key];
      const isBest = isMachineBest(type, key, val);
      bodyHtml += `<td class="tabular-nums align-middle py-4 text-center">
        <div class="score-chip chip-single ${isBest ? 'highlight-best' : ''}">
          <span class="score-main">${val.toFixed(2)}%</span>
        </div>
      </td>`;
    });

  bodyHtml += '</tr>';
  });
  tbody.innerHTML = bodyHtml;
}


function isMachineBest(type, key, value) {
  let max = 0;
  machineData[type].forEach(item => {
    const val = item.scores[key] || 0;
    if (val > max) max = val;
  });
  return value >= max && max > 0;
}

function isHierarchicalBest(key, value, view) {
  let max = 0;
  let data = hierarchicalData[view];
  if (!data) return false;

  const currentVal = (typeof value === 'object' && value !== null) ? (value.choice + value.judgment) / 2 : (value || 0);

  data.forEach(m => {
    let valRaw = 0;
    if (view === 'overview') {
      if (m.overview && m.overview[key] !== undefined) valRaw = m.overview[key];
      else if (m[key] !== undefined) valRaw = m[key];
    } else {
      const scores = m.scores || m;
      valRaw = scores[key] || 0;
    }

    const val = (typeof valRaw === 'object' && valRaw !== null) ? (valRaw.choice + valRaw.judgment) / 2 : (valRaw || 0);
    if (val > max) max = val;
  });
  return currentVal >= max && max > 0;
}

function drillDown(view) {
  // Clear any existing sort state for the attribute table when switching views
  sortStateMap['table-attribute'] = { colIndex: -1, ascending: true };
  renderAttributeTable(view);
  
  // Smooth scroll to table top if needed
  document.getElementById('leaderboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function backToOverview(tab = 'attribute') {
  if (tab === 'attribute') {
    sortStateMap['table-attribute'] = { colIndex: -1, ascending: true };
    renderAttributeTable('overview');
  } else if (tab === 'hierarchical') {
    sortStateMap['table-hierarchical'] = { colIndex: -1, ascending: true };
    renderHierarchicalTable('overview');
  }
}

// --- Hierarchical Table Interactive Logic ---
async function initHierarchicalTable() {
  try {
    const response = await fetch('static/json/hierarchicalData.json');
    hierarchicalData = await response.json();
    
    // Support plural data if it's an object with keys
    const data = Array.isArray(hierarchicalData) ? hierarchicalData : hierarchicalData.overview;
    
    // Store original index
    data.forEach((item, idx) => {
      item.originalIndex = idx;
    });

    renderHierarchicalTable('overview');
  } catch (err) {
    console.error('Failed to load hierarchical data:', err);
    // Silent fail or show error in table
  }
}

function renderHierarchicalTable(view) {
  const thead = document.getElementById('hierarchical-thead');
  const tbody = document.getElementById('hierarchical-tbody');
  const backBtn = document.getElementById('hierarchical-back-btn-container');
  
  if (!thead || !tbody || !hierarchicalData) return;

  activeHierarchicalView = view;
  backBtn.style.display = (view === 'overview') ? 'none' : 'flex';

  // Define data subset based on view
  let data;
  if (view === 'overview') {
    data = Array.isArray(hierarchicalData) ? hierarchicalData : hierarchicalData.overview;
  } else {
    data = hierarchicalData[view];
  }

  if (!data) return;

  // Update subtitle/info if needed
  const footnote = document.getElementById('leaderboard-footnote');
  if (view === 'overview' && footnote) {
    footnote.innerHTML = 'Hierarchical granularity recognition performance. Values are shown as <b>Choice / Judgment</b> accuracy. The overview displays Species-level accuracy across all datasets.';
  }

  // 1. Render Headers
  let headerHtml = '<tr>';
  headerHtml += `<th class="rank-cell sticky-rank-col align-middle py-4 text-center select-none cursor-pointer active:bg-gray-100" onclick="sortTable('table-hierarchical', 0)" style="cursor: pointer;" title="Reset Order">#</th>`;
  headerHtml += `<th class="sticky-model-col sticky-shadow-right pl-8 align-middle py-4 text-left select-none cursor-pointer active:bg-gray-100" onclick="sortTable('table-hierarchical', 1)" style="cursor: pointer;">Model <span class="sort-icon">⇅</span></th>`;

  if (view === 'overview') {
    hierarchicalSubset.forEach((ds, idx) => {
      const drillKey = ds.key === 'cub' ? 'cub_details' : 'inat_details';
      headerHtml += `<th class="clickable-header align-middle py-4 text-center select-none cursor-pointer active:bg-gray-100" onclick="sortTable('table-hierarchical', ${idx + 2})">
        <div class="header-center-force gap-1.5 h-full">
          <span style="white-space: nowrap;">${ds.name}</span>
          <span class="sort-icon">⇅</span>
          ${ds.interactive ? `
            <span onclick="event.stopPropagation(); drillDownHierarchical('${drillKey}');" class="drill-down-indicator text-blue-500 cursor-pointer" title="View Details">
              <i class="fas fa-chevron-right text-xs"></i>
            </span>` : ''}
        </div>
      </th>`;
    });


  } else {
    // Detailed Headers (Taxonomic levels)
    let subKeys = Object.keys(data[0].scores || data[0]).filter(k => k !== 'model' && k !== 'badge' && k !== 'originalIndex');
    
    // ONLY restrict for CUB-200, show EVERYTHING for others (like INAT2021)
    if (view === 'cub_details') {
      const cubAllowed = ['Class', 'Genus', 'Species'];
      subKeys = subKeys.filter(k => cubAllowed.includes(k.charAt(0).toUpperCase() + k.slice(1)));
    }

    subKeys.forEach((key, idx) => {
      const displayName = key.charAt(0).toUpperCase() + key.slice(1);
      headerHtml += `<th class="clickable-header align-middle py-4 text-center select-none cursor-pointer active:bg-gray-100" onclick="sortTable('table-hierarchical', ${idx + 2})">
        <div class="header-center-force gap-1.5 h-full">
          <span style="white-space: nowrap;">${displayName}</span>
          <span class="sort-icon">⇅</span>
        </div>
      </th>`;
    });



  }
  headerHtml += '</tr>';
  thead.innerHTML = headerHtml;

  // 2. Render Body
  let bodyHtml = '';
  data.forEach((model, idx) => {
    bodyHtml += '<tr>';
    bodyHtml += `<td class="rank-cell sticky-rank-col align-middle py-4 text-center">${idx + 1}</td>`;
    bodyHtml += `<td class="sticky-model-col sticky-shadow-right left-align model-cell align-middle py-4 truncate" title="${model.model}">
      <span class="model-name-bold pr-2">${model.model}</span>
      <span class="badge badge-${(model.badge || 'vlm').toLowerCase().replace(/\s+/g, '-')}">${model.badge || 'VLM'}</span>
    </td>`;


    
    if (view === 'overview') {
      hierarchicalSubset.forEach(ds => {
        let valRaw = null;
        if (model.overview && model.overview[ds.key] !== undefined) valRaw = model.overview[ds.key];
        else if (model[ds.key] !== undefined) valRaw = model[ds.key];

        let displayVal = "-";
        let isBest = false;
        if (valRaw !== null) {
          if (typeof valRaw === 'object') {
            displayVal = `<span class="score-choice">${valRaw.choice.toFixed(2)}%</span> / <span class="score-judgment">${valRaw.judgment.toFixed(2)}%</span>`;
            isBest = isHierarchicalBest(ds.key, valRaw, view);
          } else {
            displayVal = valRaw.toFixed(2) + "%";
            isBest = isHierarchicalBest(ds.key, valRaw, view);
          }
        }
        bodyHtml += `<td class="tabular-nums align-middle py-4 text-center">
          <div class="score-chip chip-dual ${isBest ? 'highlight-best' : ''}">
            ${displayVal}
          </div>
        </td>`;
      });

    } else {
      const scores = model.scores || model;
      let detailKeys = Object.keys(scores).filter(k => k !== 'model' && k !== 'badge' && k !== 'originalIndex');
      
      // ONLY restrict for CUB-200, show EVERYTHING for others (like INAT2021)
      if (view === 'cub_details') {
        const cubAllowed = ['Class', 'Genus', 'Species'];
        detailKeys = detailKeys.filter(k => cubAllowed.includes(k.charAt(0).toUpperCase() + k.slice(1)));
      }

      detailKeys.forEach(key => {

        const valRaw = scores[key];
        let displayVal = "-";
        let isBest = false;
        if (valRaw !== null && valRaw !== undefined) {
          if (typeof valRaw === 'object') {
            displayVal = `<span class="score-choice">${valRaw.choice.toFixed(2)}%</span> / <span class="score-judgment">${valRaw.judgment.toFixed(2)}%</span>`;
            isBest = isHierarchicalBest(key, valRaw, view);
          } else {
            displayVal = typeof valRaw === 'number' ? valRaw.toFixed(2) + '%' : valRaw;
            isBest = typeof valRaw === 'number' ? isHierarchicalBest(key, valRaw, view) : false;
          }
        }
        bodyHtml += `<td class="tabular-nums align-middle py-4 text-center">
          <div class="score-chip chip-dual ${isBest ? 'highlight-best' : ''}">
            ${displayVal}
          </div>
        </td>`;
      });
    }
    bodyHtml += '</tr>';
  });
  tbody.innerHTML = bodyHtml;
}

function drillDownHierarchical(view) {
  sortStateMap['table-hierarchical'] = { colIndex: -1, ascending: true };
  renderHierarchicalTable(view);
  document.getElementById('leaderboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Helper to find if a value is the best in its column
 */
function isGlobalBest(key, value, view) {
  let max = 0;
  attributeData.forEach(m => {
    const val = (view === 'overview') ? m.overview[key] : m[view][key];
    if (val > max) max = val;
  });
  return value === max && max > 0;
}


// More Works Dropdown Functionality
function toggleMoreWorks() {
  const dropdown = document.getElementById('moreWorksDropdown');
  const button = document.querySelector('.more-works-btn');

  if (dropdown.classList.contains('show')) {
    dropdown.classList.remove('show');
    button.classList.remove('active');
  } else {
    dropdown.classList.add('show');
    button.classList.add('active');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
  const container = document.querySelector('.more-works-container');
  const dropdown = document.getElementById('moreWorksDropdown');
  const button = document.querySelector('.more-works-btn');

  if (container && !container.contains(event.target)) {
    dropdown.classList.remove('show');
    button.classList.remove('active');
  }
});

// Close dropdown on escape key
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    dropdown.classList.remove('show');
    button.classList.remove('active');
  }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
  const bibtexElement = document.getElementById('bibtex-code');
  const button = document.querySelector('.copy-bibtex-btn');
  const copyText = button.querySelector('.copy-text');

  if (bibtexElement) {
    navigator.clipboard.writeText(bibtexElement.textContent).then(function () {
      // Success feedback
      button.classList.add('copied');
      copyText.textContent = 'Cop';

      setTimeout(function () {
        button.classList.remove('copied');
        copyText.textContent = 'Copy';
      }, 2000);
    }).catch(function (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = bibtexElement.textContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      button.classList.add('copied');
      copyText.textContent = 'Cop';
      setTimeout(function () {
        button.classList.remove('copied');
        copyText.textContent = 'Copy';
      }, 2000);
    });
  }
}

// Scroll to top functionality with improved performance
// Scroll to top functionality with native smooth behavior
// Optimized Scroll-to-Top with immediate feedback
function scrollToTop() {
  // Immediate visual feedback on the button
  const scrollButton = document.querySelector('.scroll-to-top');
  if (scrollButton) {
    scrollButton.classList.add('active');
    setTimeout(() => scrollButton.classList.remove('active'), 200);
  }

  // Instantaneous return to top as requested
  window.scrollTo({
    top: 0,
    behavior: 'auto'
  });
}

// Throttled scroll listener
let isScrolling = false;
window.addEventListener('scroll', function () {
  if (!isScrolling) {
    window.requestAnimationFrame(function () {
      const scrollButton = document.querySelector('.scroll-to-top');
      if (scrollButton) {
        if (window.pageYOffset > 300) {
          scrollButton.classList.add('visible');
        } else {
          scrollButton.classList.remove('visible');
        }
      }
      isScrolling = false;
    });
    isScrolling = true;
  }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
  const carouselVideos = document.querySelectorAll('.results-carousel video');

  if (carouselVideos.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        // Video is in view, play it
        video.play().catch(e => {
          // Autoplay failed, probably due to browser policy
          console.log('Autoplay prevented:', e);
        });
      } else {
        // Video is out of view, pause it
        video.pause();
      }
    });
  }, {
    threshold: 0.5 // Trigger when 50% of the video is visible
  });

  carouselVideos.forEach(video => {
    observer.observe(video);
  });
}

$(document).ready(function () {
  // Check for click events on the navbar burger icon

  var options = {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
  }

  // Initialize all div with carousel class
  var carousels = bulmaCarousel.attach('.carousel', options);

  bulmaSlider.attach();

  // Setup video autoplay for carousel
  setupVideoCarouselAutoplay();

  // Initialize original order for evaluation tables
  document.querySelectorAll('.evaluation-table tbody').forEach(tbody => {
    Array.from(tbody.querySelectorAll('tr')).forEach((row, index) => {
      row.dataset.originalIndex = index;
    });
  });

  // Initialize Leaderboard Data (Attribute by default)
  initAttributeTable();
  initMachineTable('classification');
  initHierarchicalTable();

  // Initialize Key Findings
  initKeyFindings();

  // Initialize Per-Dataset Charts
  initCharts();
  switchView('cls');

  // Initialize QA Showcase
  const firstTabBtn = document.querySelector('.qa-tab-btn');
  if (firstTabBtn) switchQATab(0, firstTabBtn);
})

// --- Per-Dataset Results Chart Logic ---
// Morandi / Muted Academic Palette
const modelColors = [
  '#94a3b8', // EVA-CLIP (Slate)
  '#0d9488', // CoCa (Teal)
  '#4f46e5', // DINOv2 (Indigo - Emphasis)
  '#f59e0b', // BEiT3 (Amber)
  '#f43f5e', // LLaVA (Rose)
  '#8b5cf6', // InternVL (Violet)
  '#10b981'  // Qwen (Emerald)
];
const modelNames = ['EVA-CLIP', 'CoCa', 'DINOv2', 'BEiT3', 'LLaVA', 'InternVL', 'Qwen'];

// Classification Top-1 Accuracy (%) — FILL IN exact values from paper Figure 5
const clsData = {
  "chart-cub": [
    88.95,
    79.89,
    91.65,
    82.67,
    79.54,
    89.92,
    80.08
  ],
  "chart-dogs": [
    87.69,
    81.24,
    90.5,
    80.07,
    80.73,
    89.09,
    77.02
  ],
  "chart-cars": [
    94.3,
    92.36,
    91.72,
    88.43,
    87.56,
    93.34,
    90.67
  ],
  "chart-aircraft": [
    70.27,
    63.4,
    78.88,
    50.47,
    62.46,
    79.05,
    51.15
  ],
  "chart-flowers": [
    99.45,
    98.46,
    99.69,
    95.59,
    98.04,
    99.41,
    97.43
  ],
  "chart-inat": [
    64.7,
    40.59,
    77.07,
    43.55,
    39.77,
    57.9,
    38.9
  ],
  "chart-food": [
    95.67,
    92.38,
    95.12,
    89.13,
    94.53,
    96.07,
    88.9
  ],
  "chart-clothes": [
    72.03,
    71.45,
    66.7,
    65.45,
    68.69,
    71.12,
    69.37
  ],
  "chart-vegfru": [
    94.73,
    91.08,
    96.44,
    85.84,
    90.72,
    95.57,
    86.98
  ],
  "chart-products": [
    65.05,
    39.12,
    58.88,
    49.21,
    51.31,
    58.03,
    54.33
  ],
  "chart-skincon": [
    94.49,
    86.7,
    94.79,
    86.42,
    81.29,
    94.53,
    73.9
  ],
  "chart-wine": [
    92.53,
    90.72,
    96.36,
    88.85,
    93.98,
    94.07,
    90.7
  ]
};

const retriData = {
  "chart-cub": [
    90.33,
    77.38,
    91.95,
    84.06,
    75.63,
    91.47,
    74.8
  ],
  "chart-dogs": [
    89.47,
    79.46,
    91.72,
    82.96,
    77.43,
    92.33,
    74.16
  ],
  "chart-cars": [
    95.11,
    88.44,
    89.53,
    88.77,
    85.49,
    92.47,
    86.64
  ],
  "chart-aircraft": [
    77.81,
    69.46,
    81.07,
    57.64,
    63.56,
    79.86,
    50.66
  ],
  "chart-flowers": [
    99.6,
    96.88,
    99.7,
    95.98,
    96.24,
    99.66,
    95.11
  ],
  "chart-inat": [
    38.65,
    36.88,
    40.58,
    31.83,
    34.79,
    42.97,
    35.67
  ],
  "chart-food": [
    95.09,
    85.79,
    92.48,
    86.27,
    87.55,
    96.17,
    81.77
  ],
  "chart-clothes": [
    73.69,
    69.55,
    69.53,
    66.4,
    67.86,
    70.68,
    68.78
  ],
  "chart-vegfru": [
    93.77,
    85.54,
    95.06,
    83.89,
    79.04,
    95.88,
    78.06
  ],
  "chart-products": [
    48.05,
    32.94,
    30.05,
    37.36,
    30.85,
    44.08,
    29.29
  ],
  "chart-skincon": [
    67.32,
    60.23,
    62.49,
    62.48,
    61.44,
    64.86,
    60.51
  ],
  "chart-wine": [
    70.66,
    65.4,
    78.77,
    68.5,
    65.19,
    71.61,
    62.84
  ]
};

let charts = {};
let currentView = 'cls';

function createChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  // Set global defaults for academic feel
  Chart.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
  Chart.defaults.color = '#64748b';

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: modelNames,
      datasets: [{
        label: 'Performance (%)',
        data: data,
        backgroundColor: modelColors.map(c => c + 'dd'), // Muted transparency
        hoverBackgroundColor: modelColors, // Solid on hover
        borderRadius: 0,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      onHover: (event, chartElement) => {
        event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
      },
      plugins: {
        legend: {
          display: false // Hidden redundant individual legends
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#ffffff',
          titleColor: '#1e293b',
          bodyColor: '#4f46e5', // Brand color for value
          bodyFont: { size: 13, weight: 'bold' },
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          usePointStyle: true,
          boxPadding: 6,
          callbacks: {
            label: (context) => ` ${context.dataset.label}: ${context.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          border: { display: false },
          grid: {
            color: '#e2e8f0',
            tickLength: 0,
            drawTicks: false,
            borderDash: [4, 4] // Dashed lines
          },
          ticks: {
            font: { size: 11 },
            color: '#94a3b8',
            stepSize: 20,
            callback: value => value + '%'
          }
        },
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: {
            display: false // Hide x-axis labels as they are redundant with legend
          }
        }
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      }
    }
  });
}

function initCharts() {
  const data = currentView === 'cls' ? clsData : retriData;
  Object.keys(data).forEach(id => {
    let chart = createChart(id, data[id]);
    if (chart) charts[id] = chart;
  });
}

function switchView(view) {
  currentView = view;
  const data = view === 'cls' ? clsData : retriData;
  Object.keys(charts).forEach(id => {
    if (charts[id]) {
      charts[id].data.datasets[0].data = data[id];
      charts[id].update('none');
    }
  });

  // Toggle Pill-tab styles using Tailwind classes
  const btnCls = document.getElementById('btn-cls');
  const btnRetri = document.getElementById('btn-retri');
  if (btnCls && btnRetri) {
    const activeClasses = ['bg-gray-900', 'text-white', 'shadow', 'is-active'];
    const inactiveClasses = ['text-gray-600', 'hover:text-gray-900'];

    if (view === 'cls') {
      btnCls.classList.add(...activeClasses);
      btnCls.classList.remove(...inactiveClasses);
      btnRetri.classList.add(...inactiveClasses);
      btnRetri.classList.remove(...activeClasses);
    } else {
      btnRetri.classList.add(...activeClasses);
      btnRetri.classList.remove(...inactiveClasses);
      btnCls.classList.add(...inactiveClasses);
      btnCls.classList.remove(...activeClasses);
    }
  }
}


// Interactive QA Showcase Task Data
const qaTasks = [
  {
    title: "The original VL problem: Attribute Recognition",
    images: ["static/images/pic1.png"],
    content: `
      <div class="qa-q">Q: What is the eye color of the bird in this image? Choose one answer from the following list: [blue, black, ..., red, rufous]</div>
      <div class="qa-ans">GT: black</div>
      <div class="qa-q" style="margin-top: 1.5rem;">Q: Is the eye color of the bird in this image black?</div>
      <div class="qa-ans">GT: True</div>
    `
  },
  {
    title: "The original VL problem: Knowledge Bias Estimation",
    images: ["static/images/pic2.png"],
    content: `
      <div class="qa-q">Q_P: From your observation, is the species of the dog shown a Chihuahua?</div>
      <div class="qa-ans">GT: Yes</div>
      <div class="qa-q" style="margin-top: 1.5rem;">Q_N: Does this dog belong to the species known as japanese spaniel?</div>
      <div class="qa-ans">GT: No</div>
    `
  },
  {
    title: "The original VL problem: Hierarchical Granularity Recognition",
    images: ["static/images/pic3.png"],
    content: `
      <div class="qa-q">Class: Is the class of the object aves?</div>
      <div class="qa-ans">GT: True</div>
      <div class="qa-q" style="margin-top: 1.5rem;">Genus: What is the genus of the object? [auklet, cormorant, bunting, towhee]</div>
      <div class="qa-ans">GT: towhee</div>
      <div class="qa-q" style="margin-top: 1.5rem;">Species: What is the species of the object?</div>
    `
  },
  {
    title: "The visual feature problem: Image Retrieval & Classification",
    images: ["static/images/image_retrieval.png", "static/images/image_classification.png"],
    content: `
      <div class="qa-q">Instead of relying on language generation, this paradigm directly evaluates the discriminability of visual features.</div>
      <div class="qa-q" style="margin-top: 1.5rem;"><span style="color: #fbbf24; font-weight: 700;">Task 1: Image Retrieval (mAP)</span><br>Goal: Retrieve images belonging to multiple subordinate categories of a meta-category based on visual feature similarity.</div>
      <div class="qa-q" style="margin-top: 1rem;"><span style="color: #fbbf24; font-weight: 700;">Task 2: Image Classification (Top-1 Acc)</span><br>Goal: Recognize images into fine-grained categories, either within a single meta-category or across multiple meta-categories.</div>
    `
  }
];

function switchQATab(index, btn) {
    const task = qaTasks[index];
    if (!task) return;

    // Update Image Container
    const imgContainer = document.querySelector('.qa-image-side');
    if (imgContainer) {
        // Toggle dual mode class
        if (task.images.length > 1) {
            imgContainer.classList.add('is-dual');
        } else {
            imgContainer.classList.remove('is-dual');
        }

        // Reconstruct images with transition
        imgContainer.innerHTML = '';
        task.images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = "Task Example";
            img.style.opacity = '0.3';
            imgContainer.appendChild(img);
            
            // Fade in effect
            setTimeout(() => {
                img.style.opacity = '1';
            }, 50);
        });
    }

    // Update Title & Content with fade out/in
    const titleEl = document.getElementById('qa-display-title');
    const contentEl = document.getElementById('qa-display-content');
    
    if (titleEl) titleEl.innerText = task.title;
    if (contentEl) {
        contentEl.style.opacity = '0';
        setTimeout(() => {
            contentEl.innerHTML = task.content;
            contentEl.style.opacity = '1';
        }, 150);
    }

    // Update Button State
    const btns = document.querySelectorAll('.qa-tab-btn');
    btns.forEach(b => b.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');
}
// --- Key Findings Expansion Logic ---
async function initKeyFindings() {
  try {
    const response = await fetch('static/json/keyFindingsData.json');
    keyFindingsData = await response.json();
    renderKeyFindings();
  } catch (err) {
    console.error('Failed to load key findings data:', err);
  }
}

function renderKeyFindings() {
  const humanList = document.getElementById('human-findings-list');
  const machineList = document.getElementById('machine-findings-list');
  
  if (!humanList || !machineList || !keyFindingsData) return;

  // Render Human Oriented
  humanList.innerHTML = keyFindingsData.humanOriented.map(finding => `
    <div class="finding-card abstract-box" id="card-${finding.id}" onclick="toggleFinding('${finding.id}')">
      <div class="finding-icon-wrap" style="background: ${getFindingIconBg(finding.id)}; color: ${getFindingIconColor(finding.id)};">
        <i class="${getFindingIcon(finding.id)}"></i>
      </div>
      <div class="finding-content" style="flex-grow: 1; padding-right: 1.5rem;">
        <h4 style="font-weight: 700; font-size: 1.1rem; color: #1e293b; margin: 0 0 0.5rem 0; line-height: 1.4;">${finding.title}</h4>
        <p style="font-size: 0.95rem; color: #475569; line-height: 1.6; margin: 0;">${finding.summary}</p>
        
        <div class="finding-detail-container">
          <div class="finding-detail-content">
            <p class="finding-detail-inner">${finding.detail}</p>
          </div>
        </div>
      </div>
      <div class="finding-expand-btn">
        <i class="fas fa-chevron-down"></i>
      </div>
    </div>
  `).join('');

  // Render Machine Oriented
  machineList.innerHTML = keyFindingsData.machineOriented.map(finding => `
    <div class="finding-card abstract-box" id="card-${finding.id}" onclick="toggleFinding('${finding.id}')">
      <div class="finding-icon-wrap" style="background: ${getFindingIconBg(finding.id)}; color: ${getFindingIconColor(finding.id)};">
        <i class="${getFindingIcon(finding.id)}"></i>
      </div>
      <div class="finding-content" style="flex-grow: 1; padding-right: 1.5rem;">
        <h4 style="font-weight: 700; font-size: 1.1rem; color: #1e293b; margin: 0 0 0.5rem 0; line-height: 1.4;">${finding.title}</h4>
        <p style="font-size: 0.95rem; color: #475569; line-height: 1.6; margin: 0;">${finding.summary}</p>
        
        <div class="finding-detail-container">
          <div class="finding-detail-content">
            <p class="finding-detail-inner">${finding.detail}</p>
          </div>
        </div>
      </div>
      <div class="finding-expand-btn">
        <i class="fas fa-chevron-down"></i>
      </div>
    </div>
  `).join('');
}

function toggleFinding(id) {
  const card = document.getElementById(`card-${id}`);
  if (!card) return;
  
  // Optional: Accordion behavior (close others)
  // document.querySelectorAll('.finding-card').forEach(c => {
  //   if (c.id !== `card-${id}`) c.classList.remove('is-expanded');
  // });

  card.classList.toggle('is-expanded');
}

function getFindingIcon(id) {
  const icons = {
    'h1': 'fas fa-search',
    'h2': 'fas fa-palette',
    'h3': 'fas fa-brain',
    'h4': 'fas fa-graduation-cap',
    'm1': 'fas fa-layer-group',
    'm2': 'fas fa-link-slash',
    'm3': 'fas fa-expand-arrows-alt',
    'm4': 'fas fa-shield-virus'
  };
  return icons[id] || 'fas fa-info-circle';
}

function getFindingIconBg(id) {
  const bgs = {
    'h1': '#eff6ff', 'h2': '#eef2ff', 'h3': '#f5f3ff', 'h4': '#fff7ed',
    'm1': '#ecfdf5', 'm2': '#f0fdf4', 'm3': '#fffbeb', 'm4': '#fef2f2'
  };
  return bgs[id] || '#f3f4f6';
}

function getFindingIconColor(id) {
  const colors = {
    'h1': '#2563eb', 'h2': '#4f46e5', 'h3': '#7c3aed', 'h4': '#ea580c',
    'm1': '#059669', 'm2': '#16a34a', 'm3': '#d97706', 'm4': '#dc2626'
  };
  return colors[id] || '#64748b';
}
