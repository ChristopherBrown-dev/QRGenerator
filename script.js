document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const sizeSelect = document.getElementById('sizeSelect');
    const foregroundColor = document.getElementById('foregroundColor');
    const backgroundColor = document.getElementById('backgroundColor');
    const generateBtn = document.getElementById('generateBtn');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadSection = document.querySelector('.download-section');
    const downloadBtn = document.getElementById('downloadBtn');
    const formatSelect = document.getElementById('formatSelect');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    let currentQRCanvas = null;
    let currentQRText = '';
    let qrHistory = JSON.parse(localStorage.getItem('qrHistory')) || [];

    generateBtn.addEventListener('click', generateQRCode);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateQRCode();
        }
    });
    
    // Load history on page load
    loadHistory();

    function generateQRCode() {
        const text = textInput.value.trim();
        const size = parseInt(sizeSelect.value);
        
        if (!text) {
            showError('Please enter some text or URL');
            textInput.focus();
            return;
        }

        if (text.length > 4000) {
            showError('Text is too long. Please enter less than 4000 characters.');
            return;
        }

        qrcodeDiv.innerHTML = '';
        downloadSection.style.display = 'none';
        
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        const options = {
            width: size,
            height: size,
            margin: 2,
            color: {
                dark: foregroundColor.value,
                light: backgroundColor.value
            },
            errorCorrectionLevel: 'M'
        };

        try {
            QRCode.toCanvas(text, options, function(error, canvas) {
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate QR Code';
                
                if (error) {
                    console.error('QR Code generation error:', error);
                    showError('Failed to generate QR code. The text might be too complex.');
                    return;
                }
                
                currentQRCanvas = canvas;
                currentQRText = text;
                qrcodeDiv.appendChild(canvas);
                downloadSection.style.display = 'block';
                clearError();
                
                // Save to history
                saveToHistory(text, canvas);
            });
        } catch (error) {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate QR Code';
            console.error('Unexpected error:', error);
            showError('An unexpected error occurred. Please try again.');
        }
    }

    function showError(message) {
        clearError();
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.cssText = `
            color: #d32f2f;
            background: #ffebee;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            border: 1px solid #ffcdd2;
            font-size: 14px;
        `;
        errorDiv.textContent = message;
        textInput.parentNode.insertBefore(errorDiv, textInput.nextSibling);
    }

    function clearError() {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    downloadBtn.addEventListener('click', function() {
        if (!currentQRCanvas && formatSelect.value !== 'svg') {
            alert('No QR code to download');
            return;
        }

        const format = formatSelect.value;
        const link = document.createElement('a');
        
        if (format === 'svg') {
            generateSVGDownload();
            return;
        }
        
        let mimeType = 'image/png';
        let fileName = 'qrcode.png';
        
        if (format === 'jpeg') {
            mimeType = 'image/jpeg';
            fileName = 'qrcode.jpg';
        }
        
        link.download = fileName;
        link.href = currentQRCanvas.toDataURL(mimeType);
        link.click();
    });
    
    function generateSVGDownload() {
        if (!currentQRText) {
            alert('No QR code to download');
            return;
        }
        
        const options = {
            width: parseInt(sizeSelect.value),
            margin: 2,
            color: {
                dark: foregroundColor.value,
                light: backgroundColor.value
            },
            errorCorrectionLevel: 'M'
        };
        
        QRCode.toString(currentQRText, { ...options, type: 'svg' }, function(error, string) {
            if (error) {
                console.error('SVG generation error:', error);
                alert('Failed to generate SVG');
                return;
            }
            
            const blob = new Blob([string], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.download = 'qrcode.svg';
            link.href = url;
            link.click();
            
            URL.revokeObjectURL(url);
        });
    }
    
    function saveToHistory(text, canvas) {
        // Don't save duplicates
        if (qrHistory.some(item => item.text === text)) {
            return;
        }
        
        const historyItem = {
            text: text,
            dataUrl: canvas.toDataURL(),
            timestamp: Date.now()
        };
        
        qrHistory.unshift(historyItem);
        
        // Keep only last 10 items
        if (qrHistory.length > 10) {
            qrHistory = qrHistory.slice(0, 10);
        }
        
        localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
        loadHistory();
    }
    
    function loadHistory() {
        historyList.innerHTML = '';
        
        if (qrHistory.length === 0) {
            clearHistoryBtn.style.display = 'none';
            return;
        }
        
        clearHistoryBtn.style.display = 'block';
        
        qrHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const img = document.createElement('img');
            img.src = item.dataUrl;
            img.alt = 'QR Code';
            img.style.cssText = 'width: 80px; height: 80px; border-radius: 4px;';
            
            const textDiv = document.createElement('div');
            textDiv.className = 'history-text';
            textDiv.textContent = item.text;
            
            historyItem.appendChild(img);
            historyItem.appendChild(textDiv);
            
            historyItem.addEventListener('click', () => {
                textInput.value = item.text;
                generateQRCode();
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    function clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            qrHistory = [];
            localStorage.removeItem('qrHistory');
            loadHistory();
        }
    }
});