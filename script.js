document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const motd = document.getElementById('motd');
    const colorPicker = document.getElementById('color-picker');
    const copyOutput = document.getElementById('copy-output');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const presetContainer = document.querySelector('.preset-container');
    const applyBtn = document.getElementById('apply-btn');
    const charCounter = document.getElementById('char-counter');
    const previewArea = document.getElementById('preview-area');
    const copiedAlert = document.getElementById('copied-alert');

    // Constants
    const MAX_CHARS = 1000;
    const ESO_COLOR_PRESETS = [
        { color: '#FF0000', name: 'Red' },
        { color: '#00FF00', name: 'Green' },
        { color: '#0000FF', name: 'Blue' },
        { color: '#FFFF00', name: 'Yellow' },
        { color: '#FF00FF', name: 'Magenta' },
        { color: '#00FFFF', name: 'Cyan' },
        { color: '#FFFFFF', name: 'White' },
        { color: '#FFA500', name: 'Orange' },
        { color: '#800080', name: 'Purple' },
        { color: '#FFC0CB', name: 'Pink' }
    ];

    // Sticky color variable
    let lastSelectedColor = null; // Start as null to avoid |cffffff...|r on first input

    // Initialize
    init();

    // Functions
    function init() {
        createColorPresets();
        updateOutput();
        updateCharCounter();

        // Load dark mode preference from localStorage
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }

        // Update theme icon based on current mode
        updateThemeIcon(isDarkMode);

        // Set initial color
        colorPicker.value = '#FFFFFF';
    }

    function createColorPresets() {
        ESO_COLOR_PRESETS.forEach(preset => {
            const presetElement = document.createElement('div');
            presetElement.className = 'color-preset';
            presetElement.style.backgroundColor = preset.color;
            presetElement.title = preset.name;

            // When a preset is clicked, set color picker and make it sticky for new input
            presetElement.addEventListener('click', () => {
                colorPicker.value = preset.color;
                lastSelectedColor = preset.color;
                if (document.activeElement === motd) {
                    document.execCommand('foreColor', false, preset.color);
                }
            });

            presetContainer.appendChild(presetElement);
        });

        // Color picker applies color at caret if motd is focused, and makes it sticky
        colorPicker.addEventListener('input', () => {
            lastSelectedColor = colorPicker.value;
            if (document.activeElement === motd) {
                document.execCommand('foreColor', false, colorPicker.value);
            }
        });

        // When motd is focused, always apply the last selected color at caret (if any)
        motd.addEventListener('focus', function() {
            setTimeout(() => {
                if (lastSelectedColor) {
                    document.execCommand('foreColor', false, lastSelectedColor);
                }
            }, 0);
        });
    }

    function replaceSelectedText(replacementText) {
        const selection = window.getSelection();
        if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = replacementText;
            const fragment = document.createDocumentFragment();
            let node;
            while ((node = tempDiv.firstChild)) {
                fragment.appendChild(node);
            }
            range.insertNode(fragment);
        }
    }

    function updateOutput() {
        let htmlContent = motd.innerHTML;

        // Recursively convert all <span style="color:...">...</span> to ESO color codes
        let spanRegex = /<span style="color:(#[0-9a-fA-F]{6})">(.*?)<\/span>/gs;
        while (spanRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(spanRegex, function (match, p1, p2) {
                const hexColor = p1.substring(1);
                return `|c${hexColor}${p2}|r`;
            });
        }

        // Recursively convert all <font color="...">...</font> to ESO color codes
        let fontRegex = /<font color="(#[0-9a-fA-F]{6})">(.*?)<\/font>/gs;
        while (fontRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(fontRegex, function (match, p1, p2) {
                const hexColor = p1.substring(1);
                return `|c${hexColor}${p2}|r`;
            });
        }

        // Replace &nbsp; with normal space
        htmlContent = htmlContent.replace(/&nbsp;/g, ' ');

        // Replace <br> with newline
        htmlContent = htmlContent.replace(/<br>/g, '\n');

        // Remove <div> and </div> tags and replace them with newlines
        htmlContent = htmlContent.replace(/<div>/g, '').replace(/<\/div>/g, '\n');

        // Remove ESO color codes that wrap only spaces
        htmlContent = htmlContent.replace(/\|c[0-9a-fA-F]{6}(\s+)\|r/g, '$1');

        // Set the formatted output to the copy-output area
        copyOutput.textContent = htmlContent;

        // Update the preview
        updatePreview();
    }

    function updateCharCounter() {
        // Get plain text content (without HTML tags) for character counting
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = motd.innerHTML;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const charCount = textContent.length;

        charCounter.textContent = `Characters: ${charCount}/${MAX_CHARS}`;

        // Add warning class if approaching limit
        if (charCount > MAX_CHARS * 0.9) {
            charCounter.classList.add('text-danger');
        } else {
            charCounter.classList.remove('text-danger');
        }
    }

    function updatePreview() {
        // Clone the editor content for the preview
        previewArea.innerHTML = motd.innerHTML;
    }

    function copyToClipboard() {
        const output = copyOutput.textContent;
        navigator.clipboard.writeText(output)
            .then(() => {
                showCopiedAlert();
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                alert('Failed to copy to clipboard. Please try again.');
            });
    }

    function showCopiedAlert() {
        copiedAlert.style.display = 'block';
        copiedAlert.style.opacity = '1';

        setTimeout(() => {
            copiedAlert.style.opacity = '0';
            setTimeout(() => {
                copiedAlert.style.display = 'none';
            }, 300);
        }, 2000);
    }

    function clearContent() {
        // Clear the MOTD editor
        motd.innerHTML = '';

        // Reset color picker to default (white)
        colorPicker.value = '#FFFFFF';

        // Reset last selected color
        lastSelectedColor = null;

        // Optionally, reset preview and output areas
        copyOutput.textContent = 'Your formatted message will appear here...';
        previewArea.innerHTML = '';

        // Reset character counter
        updateCharCounter();

        // Update output
        updateOutput();
    }

    function toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');

        // Save preference to localStorage
        localStorage.setItem('darkMode', isDarkMode);

        // Update icon
        updateThemeIcon(isDarkMode);
    }

    function updateThemeIcon(isDarkMode) {
        if (isDarkMode) {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Event Listeners
    applyBtn.addEventListener('click', applyColorToSelection);

    copyBtn.addEventListener('click', copyToClipboard);

    clearBtn.addEventListener('click', clearContent);

    themeToggle.addEventListener('click', toggleDarkMode);

    motd.addEventListener('input', function() {
        updateOutput();
        updateCharCounter();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl+C in the output area
        if (event.ctrlKey && event.key === 'c' && document.activeElement === copyOutput) {
            copyToClipboard();
        }

        // Shortcuts for color application (Ctrl+Shift+C)
        if (event.ctrlKey && event.shiftKey && event.key === 'C') {
            applyColorToSelection();
            event.preventDefault();
        }
    });

    // Helper: Apply color to selection (if any)
    function applyColorToSelection() {
        const selectedText = window.getSelection().toString();
        if (selectedText && selectedText.trim().length > 0) {
            const color = colorPicker.value;
            const replacement = `<span style="color:${color}">${selectedText}</span>`;
            replaceSelectedText(replacement);
            updateOutput();
            updateCharCounter();
            updatePreview();
        }
    }
});
