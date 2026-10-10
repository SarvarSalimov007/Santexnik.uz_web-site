// Fix corrupted CSS ending and add Google Mock styles
const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'frontend', 'css', 'style.css');
let content = fs.readFileSync(cssPath);

// Find last valid position (look for the corrupted null bytes)
let text = content.toString('utf-8');
const corruptIndex = text.indexOf('\x00');

if (corruptIndex > -1) {
    text = text.substring(0, corruptIndex);
    console.log(`Removed corrupted bytes starting at position ${corruptIndex}`);
}

// Trim trailing whitespace
text = text.trimEnd();

// Add Google Mock CSS
const googleMockCSS = `

/* ===== Google Mock OAuth Overlay ===== */
.mock-google-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
}
.mock-google-card {
    background: #fff;
    border-radius: 8px;
    width: 450px;
    max-width: 90%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: 'Inter', 'Roboto', sans-serif;
    overflow: hidden;
    animation: slideUp 0.3s var(--ease-spring);
}
.mock-google-inner {
    padding: 40px 40px;
    text-align: center;
}
.mock-google-title {
    margin: 0;
    font-size: 24px;
    font-weight: 400;
    color: #202124;
}
.mock-google-subtitle {
    margin: 10px 0 30px;
    font-size: 16px;
    color: #5f6368;
}
.mock-google-fields {
    text-align: left;
    margin-bottom: 20px;
}
.mock-google-input {
    width: 100%;
    padding: 13px 15px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    font-size: 16px;
    outline: none;
    transition: border 0.2s;
    margin-bottom: 15px;
    font-family: 'Inter', sans-serif;
    color: #202124;
    box-sizing: border-box;
}
.mock-google-input:focus {
    border: 2px solid #1a73e8;
}
.mock-google-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 40px;
}
.mock-google-btn-cancel {
    background: transparent;
    border: none;
    color: #1a73e8;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    padding: 10px 15px;
    border-radius: 4px;
    transition: background 0.2s;
}
.mock-google-btn-cancel:hover {
    background: #f8f9fa;
}
.mock-google-btn-submit {
    background: #1a73e8;
    border: none;
    color: white;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    padding: 10px 24px;
    border-radius: 4px;
    transition: background 0.2s;
}
.mock-google-btn-submit:hover {
    background: #1765cc;
}
`;

text += googleMockCSS;

fs.writeFileSync(cssPath, text, 'utf-8');
console.log('CSS file cleaned and Google Mock styles added successfully.');
