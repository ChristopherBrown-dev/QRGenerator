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
            alert('Please enter some text or URL');
            textInput.focus();
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
            }
        };

        QRCode.toCanvas(text, options, function(error, canvas) {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate QR Code';
            
            if (error) {
                console.error('QR Code generation error:', error);
                alert('Failed to generate QR code. Please try again.');
                return;
            }
            
            currentQRCanvas = canvas;
            qrcodeDiv.appendChild(canvas);
            downloadSection.style.display = 'block';
        });
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