(function() {
    // Prevent multiple scanners
    if (document.getElementById('scanner-window')) {
        document.getElementById('scanner-window').remove();
    }

    // Create the scanner window
    const scannerWindow = document.createElement('div');
    scannerWindow.id = 'scanner-window';
    scannerWindow.innerHTML = `
        <div class="scanner-header">
            <div class="scanner-title">Screen Scanner</div>
            <div class="scanner-controls">
                <div class="scanner-btn close-btn"></div>
                <div class="scanner-btn minimize-btn"></div>
                <div class="scanner-btn maximize-btn"></div>
            </div>
        </div>
        <div class="scanner-content">
            <button class="scan-btn">📸 Scan Screen</button>
            <div class="scan-result hidden">
                <canvas id="scan-canvas"></canvas>
                <p>Screen captured! Right-click to save.</p>
            </div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #scanner-window {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-width: 90%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        .scanner-header {
            background: rgba(255, 255, 255, 0.8);
            padding: 15px 20px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
        }

        .scanner-title {
            font-weight: 600;
            color: #333;
        }

        .scanner-controls {
            display: flex;
            gap: 10px;
        }

        .scanner-btn {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            cursor: pointer;
            transition: opacity 0.2s ease;
        }

        .scanner-btn:hover {
            opacity: 0.8;
        }

        .close-btn { background: #ff5f57; }
        .minimize-btn { background: #ffbd2e; }
        .maximize-btn { background: #28ca42; }

        .scanner-content {
            padding: 20px;
            text-align: center;
        }

        .scan-btn {
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .scan-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .scan-result {
            margin-top: 20px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
        }

        .scan-result canvas {
            max-width: 100%;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .hidden {
            display: none;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(scannerWindow);

    // Dragging functionality
    let isDragging = false;
    let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

    const dragStart = (e) => {
        if (e.target.closest('.scanner-header')) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        }
    };

    const dragEnd = () => {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    };

    const drag = (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            scannerWindow.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
        }
    };

    document.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    // Button functionality
    scannerWindow.querySelector('.close-btn').onclick = () => scannerWindow.remove();
    scannerWindow.querySelector('.minimize-btn').onclick = () => {
        scannerWindow.style.transform = 'translate(-50%, -50%) scale(0.1)';
        setTimeout(() => scannerWindow.remove(), 300);
    };
    scannerWindow.querySelector('.maximize-btn').onclick = () => {
        if (scannerWindow.style.width === '90vw') {
            scannerWindow.style.width = '600px';
            scannerWindow.style.height = 'auto';
        } else {
            scannerWindow.style.width = '90vw';
            scannerWindow.style.height = '90vh';
        }
    };

    // Scan screen using html2canvas if available, otherwise fallback
    scannerWindow.querySelector('.scan-btn').onclick = () => {
        const scanResult = scannerWindow.querySelector('.scan-result');
        const scanCanvas = scannerWindow.querySelector('#scan-canvas');
        const ctx = scanCanvas.getContext('2d');

        // Simple fallback using html2canvas library injection