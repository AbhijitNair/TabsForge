// app.js - TabsForge main application logic (Neutralinojs)

let paths = [];

// --- Bat generation ---

function generateBatContent(paths) {
  if (paths.length === 0) {
    return '@echo off\nwt --window new';
  }

  const tabEntries = paths.map(
    (p) => `new-tab --startingDirectory "${p}"`
  );

  const wtCommand = 'wt --window new ' + tabEntries.join(' ^; ');
  return '@echo off\n' + wtCommand;
}

// --- Persistence ---

function getPersistenceFilePath() {
  return NL_PATH + '/paths.json';
}

async function loadPaths() {
  try {
    const content = await Neutralino.filesystem.readFile(getPersistenceFilePath());
    const data = JSON.parse(content);
    if (!Array.isArray(data)) return [];
    return data;
  } catch (err) {
    return [];
  }
}

async function savePaths(pathsArray) {
  try {
    await Neutralino.filesystem.writeFile(
      getPersistenceFilePath(),
      JSON.stringify(pathsArray, null, 2)
    );
  } catch (err) {
    console.error('Failed to save paths:', err);
  }
}

// --- State operations ---

function addPath(newPath) {
  paths.push(newPath);
  persist();
  render();
}

function removePath(index) {
  paths.splice(index, 1);
  persist();
  render();
}

function insertPathAt(index, newPath) {
  paths.splice(index + 1, 0, newPath);
  persist();
  render();
}

function reorderPath(fromIndex, toIndex) {
  const [moved] = paths.splice(fromIndex, 1);
  paths.splice(toIndex, 0, moved);
  persist();
  render();
}

function clearAll() {
  paths = [];
  persist();
  render();
}

function persist() {
  savePaths(paths);
}

async function createBatFile() {
  const content = generateBatContent(paths);
  let entry = await Neutralino.os.showSaveDialog('Save .bat file', {
    filters: [
      { name: 'Batch Files', extensions: ['bat'] }
    ]
  });
  if (entry) {
    if (!entry.toLowerCase().endsWith('.bat')) {
      entry += '.bat';
    }
    await Neutralino.filesystem.writeFile(entry, content);
  }
}

// --- Rendering ---

function render() {
  const listEl = document.getElementById('path-list');
  listEl.innerHTML = '';

  paths.forEach((p, index) => {
    const row = document.createElement('div');
    row.className = 'path-entry';
    row.dataset.index = index;

    // Drag handle
    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.textContent = '≡';
    handle.draggable = true;
    row.appendChild(handle);

    // Path text
    const pathText = document.createElement('span');
    pathText.className = 'path-text';
    pathText.textContent = p;
    row.appendChild(pathText);

    // Plus button (inline insert)
    const plusBtn = document.createElement('button');
    plusBtn.className = 'plus-btn';
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', () => showInlineInput(index));
    row.appendChild(plusBtn);

    // Minus button (remove)
    const minusBtn = document.createElement('button');
    minusBtn.className = 'minus-btn';
    minusBtn.textContent = '−';
    minusBtn.addEventListener('click', () => removePath(index));
    row.appendChild(minusBtn);

    listEl.appendChild(row);
  });

  // Resize window to fit content
  // Disabled - using fixed window size with scrollable path list
}

// --- Inline insertion UI ---

function showInlineInput(index) {
  const existing = document.querySelector('.inline-input-row');
  if (existing) existing.remove();

  const listEl = document.getElementById('path-list');
  const rows = listEl.querySelectorAll('.path-entry');

  const inputRow = document.createElement('div');
  inputRow.className = 'inline-input-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'inline-input';
  input.placeholder = 'Enter directory path...';
  inputRow.appendChild(input);

  const targetRow = rows[index];
  if (targetRow && targetRow.nextSibling) {
    listEl.insertBefore(inputRow, targetRow.nextSibling);
  } else {
    listEl.appendChild(inputRow);
  }

  input.focus();

  function submit() {
    const value = input.value.trim();
    if (value) {
      insertPathAt(index, value);
    }
    inputRow.remove();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submit();
    } else if (e.key === 'Escape') {
      inputRow.remove();
    }
  });

  input.addEventListener('blur', () => {
    submit();
  });
}

// --- Drag-and-drop ---

let dragSourceIndex = null;

document.getElementById('path-list').addEventListener('dragstart', (e) => {
  const row = e.target.closest('.path-entry');
  if (!row) return;
  dragSourceIndex = parseInt(row.dataset.index, 10);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragSourceIndex.toString());
  row.classList.add('dragging');
});

document.getElementById('path-list').addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const row = e.target.closest('.path-entry');
  if (row) {
    document.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
    row.classList.add('drag-over');
  }
});

document.getElementById('path-list').addEventListener('dragleave', (e) => {
  const row = e.target.closest('.path-entry');
  if (row) {
    row.classList.remove('drag-over');
  }
});

document.getElementById('path-list').addEventListener('drop', (e) => {
  e.preventDefault();
  document.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
  document.querySelectorAll('.dragging').forEach((el) => el.classList.remove('dragging'));

  const row = e.target.closest('.path-entry');
  if (!row) return;

  const toIndex = parseInt(row.dataset.index, 10);
  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

  if (fromIndex !== toIndex) {
    reorderPath(fromIndex, toIndex);
  }
});

document.getElementById('path-list').addEventListener('dragend', () => {
  document.querySelectorAll('.dragging').forEach((el) => el.classList.remove('dragging'));
  document.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
  dragSourceIndex = null;
});

// --- Event wiring ---

document.getElementById('path-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const input = document.getElementById('path-input');
    const value = input.value.trim();
    if (value) {
      addPath(value);
      input.value = '';
    }
  }
});

document.getElementById('clear-all-btn').addEventListener('click', () => {
  clearAll();
});

document.getElementById('create-bat-btn').addEventListener('click', () => {
  createBatFile();
});

// --- Init ---

Neutralino.init();

Neutralino.events.on('ready', async () => {
  paths = await loadPaths();
  render();
  await Neutralino.window.show();
  await Neutralino.window.focus();
});
