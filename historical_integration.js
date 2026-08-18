// Historical STIW Data Integration
function initializeHistoricalData() {
    // Check if historical data functions are available
    if (typeof hasHistoricalData === 'function' && typeof autoLoadHistoricalData === 'function' && userEmail) {
        if (hasHistoricalData(userEmail)) {
            const message = autoLoadHistoricalData(userEmail);
            if (message) {
                // Show historical data notification
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #e3f2fd;
                    border: 1px solid #2196f3;
                    border-radius: 8px;
                    padding: 15px;
                    max-width: 400px;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                `;
                notification.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">📊</span>
                        <div>
                            <strong>Historical STIW Data Loaded</strong>
                            <p style="margin: 5px 0 0 0; font-size: 14px;">${message}</p>
                        </div>
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            background: none;
                            border: none;
                            font-size: 18px;
                            cursor: pointer;
                            color: #666;
                            margin-left: auto;
                        ">×</button>
                    </div>
                `;
                document.body.appendChild(notification);
                
                // Auto-remove after 8 seconds
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 8000);
                
                // Update displays with new historical data
                updateAllTripsDisplay();
                updateRequestTracking();
            }
        }
    }
}

// Call historical data initialization after user authentication
const originalInitializeUser = initializeUser;
initializeUser = function() {
    originalInitializeUser();
    setTimeout(initializeHistoricalData, 1000); // Delay to ensure historical data script loads
};