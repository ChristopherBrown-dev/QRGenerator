document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const sizeSelect = document.getElementById('sizeSelect');
    const generateBtn = document.getElementById('generateBtn');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadSection = document.querySelector('.download-section');
    const downloadBtn = document.getElementById('downloadBtn');
    
    let currentQRCanvas = null;

    generateBtn.addEventListener('click', generateQRCode);
    
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateQRCode();
        }
    });

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
                dark: '#000000',
                light: '#FFFFFF'
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
                qrcodeDiv.appendChild(canvas);
                downloadSection.style.display = 'block';
                clearError();
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
        if (!currentQRCanvas) {
            alert('No QR code to download');
            return;
        }

        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = currentQRCanvas.toDataURL();
        link.click();
    });
});