document.addEventListener("DOMContentLoaded", function () {
    const motd = document.getElementById('motd'); // Input area
    const colorPicker = document.getElementById('color-picker'); // Color picker
    const copyOutput = document.getElementById('copy-output'); // Output area
    const copyBtn = document.getElementById('copy-btn'); // Copy button
    const clearBtn = document.getElementById('clear-btn'); // Clear button
    const darkModeToggle = document.getElementById('toggle-dark-mode'); // Dark mode toggle
    
    // Apply color to selected text in input (only HTML span style here)
    document.getElementById('apply-btn').addEventListener('click', function () {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            const color = colorPicker.value;
            const replacement = `<span style="color:${color}">${selectedText}</span>`;
            replaceSelectedText(replacement);
            updateOutput();
        }
    });

    // Clear content in input
    clearBtn.addEventListener('click', function () {
        motd.innerHTML = '';
        updateOutput();
    });

    // Update output with ESO color codes
    function updateOutput() {
        let htmlContent = motd.innerHTML;

        // Convert <span> color styling into ESO color codes (only for output)
        htmlContent = htmlContent.replace(/<span style="color:(#[0-9a-fA-F]{6})">(.*?)<\/span>/g, function (match, p1, p2) {
            const hexColor = p1.substring(1); // Remove '#' from hex color
            return `|c${hexColor}${p2}|r`; // Format it as ESO color code
        });

        // Replace <br> with newline
        htmlContent = htmlContent.replace(/<br>/g, '\n'); 
        // Remove <div> and </div> tags and replace them with newlines
        htmlContent = htmlContent.replace(/<div>/g, '').replace(/<\/div>/g, '\n'); 

        // Set the formatted output to the copy-output area
        copyOutput.textContent = htmlContent;
    }

    // Replace selected text in input area with formatted HTML
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

    // Copy ESO-formatted output to clipboard
    copyBtn.addEventListener('click', function () {
        const output = copyOutput.textContent;
        navigator.clipboard.writeText(output).then(() => {
            alert('Copied to clipboard!');
        });
    });

    // Toggle dark mode
    darkModeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
    });

    // Update output on any change in the MOTD (input area)
    motd.addEventListener('input', updateOutput);
});
