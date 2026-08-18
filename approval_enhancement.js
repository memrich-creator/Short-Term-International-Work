        // Enhanced approval handling to move approved requests to STIW trips
        function enhanceApprovalHandling() {
            const urlParams = new URLSearchParams(window.location.search);
            const approveId = urlParams.get('approve');
            const employeeEmail = urlParams.get('email');
            
            if (approveId && employeeEmail) {
                const requestId = parseInt(approveId);
                const userData = JSON.parse(localStorage.getItem(`stiwUserData_${employeeEmail}`)) || {};
                
                if (userData.requests) {
                    const request = userData.requests.find(req => req.id === requestId);
                    if (request && request.status === 'Approved') {
                        // Move approved request to STIW trips by removing from requests array
                        // The trip is already added to allTrips in the main approval handler
                        userData.requests = userData.requests.filter(req => req.id !== requestId);
                        localStorage.setItem(`stiwUserData_${employeeEmail}`, JSON.stringify(userData));
                        
                        // Refresh the display
                        if (typeof updateRequestTracking === 'function') {
                            updateRequestTracking();
                        }
                    }
                }
            }
        }
        
        // Override the existing approval handling to include our enhancement
        const originalApprovalHandling = window.onload;
        window.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                enhanceApprovalHandling();
                if (originalApprovalHandling) originalApprovalHandling();
            }, 200);
        });