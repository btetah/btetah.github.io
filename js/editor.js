// لا تلعب بالسورس ياحيبي
(function() {
    const ALIGN_STORAGE_KEY = 'dtk02-align-overrides-v1';
    let listenersAttached = false;
    let draggedEl = null;
    let selectedDisplay = null;
    let ox = 0;
    let oy = 0;

    const readOverrides = () => {
        try {
            const raw = localStorage.getItem(ALIGN_STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    };

    const saveOverride = (el) => {
        const key = el.dataset.alignKey;
        if (!key) return;
        const x = parseFloat(el.style.left);
        const y = parseFloat(el.style.top);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;

        const data = readOverrides();
        data[key] = { x: x, y: y };
        localStorage.setItem(ALIGN_STORAGE_KEY, JSON.stringify(data));
    };

    const attachEditorListeners = () => {
        if (listenersAttached) return;
        listenersAttached = true;

        document.addEventListener('mousedown', e => {
            if(!document.body.classList.contains('edit-mode')) return;
            const targetInteractive = e.target.closest('.interactive');
            if(!targetInteractive) return;

            draggedEl = targetInteractive;
            draggedEl.classList.add('dragging');

            if (draggedEl.classList.contains('seven-seg')) {
                if (selectedDisplay) selectedDisplay.classList.remove('selected-display');
                selectedDisplay = draggedEl;
                selectedDisplay.classList.add('selected-display');
            }

            let rect = draggedEl.getBoundingClientRect();
            ox = e.clientX - rect.left;
            oy = e.clientY - rect.top;

            e.preventDefault();
            e.stopPropagation();
        }, true);

        document.addEventListener('mousemove', e => {
            if(!draggedEl) return;
            let pRect = draggedEl.parentElement.getBoundingClientRect();

            let leftPx = e.clientX - pRect.left - ox + draggedEl.offsetWidth / 2;
            let topPx = e.clientY - pRect.top - oy + draggedEl.offsetHeight / 2;

            let px = (leftPx / pRect.width) * 100;
            let py = (topPx / pRect.height) * 100;

            draggedEl.style.left = px + "%";
            draggedEl.style.top = py + "%";

            if(Breadboard.redrawAllWires) Breadboard.redrawAllWires();
        }, true);

        document.addEventListener('mouseup', () => {
            if(draggedEl) {
                saveOverride(draggedEl);
                draggedEl.classList.remove('dragging');
                draggedEl = null;
            }
        }, true);

        document.addEventListener('keydown', e => {
            if(!document.body.classList.contains('edit-mode')) return;
            if(!selectedDisplay) return;

            const step = e.shiftKey ? 0.02 : 0.1;
            let x = parseFloat(selectedDisplay.style.left);
            let y = parseFloat(selectedDisplay.style.top);
            if (!Number.isFinite(x) || !Number.isFinite(y)) return;

            let handled = true;
            if (e.key === 'ArrowLeft') x -= step;
            else if (e.key === 'ArrowRight') x += step;
            else if (e.key === 'ArrowUp') y -= step;
            else if (e.key === 'ArrowDown') y += step;
            else handled = false;

            if (!handled) return;

            e.preventDefault();
            selectedDisplay.style.left = x + "%";
            selectedDisplay.style.top = y + "%";
            saveOverride(selectedDisplay);
            if(Breadboard.redrawAllWires) Breadboard.redrawAllWires();
        }, true);
    };

    window.enableEditor = function() {
        let modeBtn = document.getElementById('btn-edit-mode');

        if(document.body.classList.contains('edit-mode')) {
            document.body.classList.remove('edit-mode');
            modeBtn.classList.remove('active');
            if (selectedDisplay) {
                selectedDisplay.classList.remove('selected-display');
                selectedDisplay = null;
            }
            alert("Edit Mode Disabled. Alignment changes were saved automatically.");
            return;
        }

        attachEditorListeners();
        document.body.classList.add('edit-mode');
        modeBtn.classList.add('active');
        alert("Alignment Editor Active!\n\n1. Drag any element until it perfectly matches the board photo.\n2. For the 3 number displays: click a display then use arrow keys for fine movement (Shift + Arrow = ultra-fine).\n3. All positions are saved automatically.\n4. Click Editor again to exit.");
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-edit-mode').addEventListener('click', window.enableEditor);
});
