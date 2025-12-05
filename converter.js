/* converter.js */

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const state = {
        files: [], // Array of file objects with extra metadata
        editingId: null, // ID of file currently being edited
        cropper: null,
        settings: {
            pageSize: 'a4',
            orientation: 'portrait',
            margin: 'small',
            compressionLevel: 'medium',
            ocr: false
        }
    };

    // --- DOM Elements ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadView = document.getElementById('upload-view');
    const editorView = document.getElementById('editor-view');
    const imageGrid = document.getElementById('image-grid');
    const fileCount = document.getElementById('file-count');
    const btnConvert = document.getElementById('btn-convert');

    // Tools
    const btnAddMore = document.getElementById('btn-add-more');
    const btnDeleteAll = document.getElementById('btn-delete-all');
    const btnRotateAll = document.getElementById('btn-rotate-all');

    // Settings Modifiers
    const settingPageSize = document.getElementById('setting-page-size');
    const settingOrientation = document.getElementById('setting-orientation');
    const settingMargin = document.getElementById('setting-margin');
    const settingCompression = document.getElementById('setting-compression');
    const btnOcrToggle = document.getElementById('btn-ocr-toggle');

    // Progress
    const progressOverlay = document.getElementById('progress-overlay');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    const progressSubtext = document.getElementById('progress-subtext');

    // Editor Modal Elements
    const editorModal = document.getElementById('editor-modal');
    const cropperImage = document.getElementById('cropper-image');
    const btnModalCancel = document.getElementById('modal-cancel');
    const btnModalSave = document.getElementById('modal-save');
    const editorTools = document.querySelectorAll('.editor-tools-bar .tool-btn');

    // --- Event Listeners ---

    // Upload Handling
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            processFiles(e.dataTransfer.files);
        }
    });

    // Toolbar Actions
    btnAddMore.addEventListener('click', () => fileInput.click());

    btnDeleteAll.addEventListener('click', () => {
        if (confirm('Remove all images?')) {
            state.files = [];
            renderGrid();
            toggleView('upload');
        }
    });

    btnRotateAll.addEventListener('click', () => {
        state.files.forEach(f => {
            f.rotation = (f.rotation || 0) + 90;
        });
        renderGrid();
    });

    // Settings
    settingPageSize.addEventListener('change', (e) => state.settings.pageSize = e.target.value);
    settingOrientation.addEventListener('change', (e) => state.settings.orientation = e.target.value);
    settingMargin.addEventListener('change', (e) => state.settings.margin = e.target.value);
    settingCompression.addEventListener('change', (e) => state.settings.compressionLevel = e.target.value);

    // btnCompressToggle.addEventListener('click', () => {
    //    state.settings.compression = !state.settings.compression;
    //    btnCompressToggle.classList.toggle('active');
    // }); 
    // ^ Replaced by select above, but keeping structure clean

    btnOcrToggle.addEventListener('click', () => {
        state.settings.ocr = !state.settings.ocr;
        btnOcrToggle.classList.toggle('active');
    });

    btnConvert.addEventListener('click', generatePDF);

    // Modal Listeners
    btnModalCancel.addEventListener('click', closeEditor);
    btnModalSave.addEventListener('click', saveEditorChanges);

    editorTools.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!state.cropper) return;
            const action = btn.dataset.action;
            switch (action) {
                case 'rotate-left': state.cropper.rotate(-90); break;
                case 'rotate-right': state.cropper.rotate(90); break;
                case 'flip-h': state.cropper.scaleX(state.cropper.getData().scaleX * -1); break;
                case 'flip-v': state.cropper.scaleY(state.cropper.getData().scaleY * -1); break;
            }
        });
    });


    // --- Core Logic ---

    function handleFileSelect(e) {
        if (e.target.files.length) {
            processFiles(e.target.files);
        }
    }

    async function processFiles(fileList) {
        // Filter for images only
        const imageFiles = Array.from(fileList).filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            alert('Please select valid image files.');
            return;
        }

        const newFiles = imageFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file: file,
            preview: URL.createObjectURL(file), // Helper for display
            rotation: 0,
            cropData: null // Stores cropperjs data
        }));

        state.files = [...state.files, ...newFiles];
        toggleView('editor');
        renderGrid();
    }

    function toggleView(viewName) {
        if (viewName === 'editor') {
            uploadView.classList.add('hidden');
            editorView.classList.remove('hidden');
            // Ensure sidebar is visible and styled correctly
        } else {
            uploadView.classList.remove('hidden');
            editorView.classList.add('hidden');
        }
    }

    function renderGrid() {
        imageGrid.innerHTML = '';
        fileCount.textContent = `${state.files.length} Image${state.files.length !== 1 ? 's' : ''}`;

        state.files.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'grid-item';
            el.dataset.id = item.id;

            // If crop data exists, we rely on the preview image being updated or manage it. 
            // For simple rotation, CSS transform is fastest preview.
            // If cropped, we should probably generate a new preview URL or just use CSS.
            // Complex cropping usually requires new data URL.

            let imgStyle = `transform: rotate(${item.rotation}deg)`;
            if (item.cropData) {
                // visual rotation reset if cropped because crop image is already rotated
                imgStyle = '';
            }

            el.innerHTML = `
                <div class="thumb-wrapper">
                    <img src="${item.preview}" style="${imgStyle}" alt="preview">
                    <div class="thumb-actions">
                         <div class="mini-btn edit-btn" title="Edit"><i class="ph ph-pencil-simple"></i></div>
                        <div class="mini-btn rotate-btn" title="Rotate"><i class="ph ph-arrow-clockwise"></i></div>
                        <div class="mini-btn delete-btn" title="Remove"><i class="ph ph-x"></i></div>
                    </div>
                </div>
                <div class="thumb-info">
                    <h5>${item.file.name}</h5>
                    <span>${formatSize(item.file.size)}</span>
                </div>
            `;

            // Events
            el.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openEditor(item.id);
            });

            el.querySelector('.rotate-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                // If previously cropped, simple rotation might break crop data logic w/o complex math
                // For simplicity: Reset crop if rotated outside editor, or just add 90 deg.
                if (item.cropData) {
                    if (confirm("Rotating will reset your crop. Continue?")) {
                        item.cropData = null;
                        // revert to original file preview
                        item.preview = URL.createObjectURL(item.file);
                        item.rotation = (item.rotation || 0) + 90;
                    }
                } else {
                    item.rotation = (item.rotation || 0) + 90;
                }
                renderGrid();
            });

            el.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                state.files = state.files.filter(f => f.id !== item.id);
                if (state.files.length === 0) toggleView('upload');
                else renderGrid();
            });

            imageGrid.appendChild(el);
        });

        // Initialize Sortable
        if (state.files.length > 0) {
            new Sortable(imageGrid, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: function (evt) {
                    const newOrder = [];
                    const items = imageGrid.querySelectorAll('.grid-item');
                    items.forEach(node => {
                        const id = node.dataset.id;
                        const fileObj = state.files.find(f => f.id === id);
                        if (fileObj) newOrder.push(fileObj);
                    });
                    state.files = newOrder;
                }
            });
        }
    }

    // --- Modal Logic ---
    function openEditor(id) {
        const fileObj = state.files.find(f => f.id === id);
        if (!fileObj) return;

        state.editingId = id;
        cropperImage.src = fileObj.preview;

        // Handling crop with existing rotation:
        // Cropper JS handles rotation internally well if we pass in clean image
        // If we have a 'preview' that is a blob of the original file, we just load it.
        // We set initial rotation from state.

        editorModal.classList.remove('hidden');

        // Init Cropper
        if (state.cropper) state.cropper.destroy();

        state.cropper = new Cropper(cropperImage, {
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            ready() {
                // Apply existing rotation if not cropped yet?
                // If it was already cropped, `preview` is the cropped image, so rotation is 0 relative to it.
                // If it wasn't cropped, `preview` is original, so we apply rotation.
                if (!fileObj.cropData) {
                    state.cropper.rotate(fileObj.rotation || 0);
                }
            }
        });
    }

    function closeEditor() {
        editorModal.classList.add('hidden');
        if (state.cropper) {
            state.cropper.destroy();
            state.cropper = null;
        }
        state.editingId = null;
    }

    function saveEditorChanges() {
        if (!state.cropper || !state.editingId) return;

        // Get cropped canvas
        const canvas = state.cropper.getCroppedCanvas();
        if (!canvas) return;

        // Update state
        const fileObj = state.files.find(f => f.id === state.editingId);

        canvas.toBlob((blob) => {
            const newUrl = URL.createObjectURL(blob);

            // Update preview to the new cropped version
            fileObj.preview = newUrl;
            fileObj.cropData = true; // Mark as processed
            fileObj.rotation = 0; // Reset rotation as it is baked into the crop

            renderGrid();
            closeEditor();
        });
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Placeholder for missing generatePDF function
    async function generatePDF() {
        alert("PDF generation is not yet implemented.");
        console.warn("generatePDF function is missing.");
    }
});
