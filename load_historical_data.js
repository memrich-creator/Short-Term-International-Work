// STIW Historical Data Loader
// This script processes the CSV data and creates the historical trip data structure

function processSTIWHistoricalData() {
    // Historical STIW data from G2_-_STIW_-_Last_12_months (3).xlsx
    const historicalData = [
        {
            email: "leonti@block.xyz",
            trips: [
                {
                    id: Date.now() + Math.random(),
                    country: "Taiwan",
                    additionalLocation: "Taichung, Taiwan & Chiang Mai, Thailand",
                    purpose: "Historical STIW Trip",
                    startDate: "2025-01-25",
                    endDate: "2025-03-10",
                    duration: 2,
                    dateAdded: "2025-01-25T00:00:00.000Z",
                    source: "Historical Data"
                }
            ]
        },
        {
            email: "area@block.xyz", 
            trips: [
                {
                    id: Date.now() + Math.random(),
                    country: "Mexico",
                    additionalLocation: "Akumal, Mexico",
                    purpose: "Historical STIW Trip",
                    startDate: "2025-02-10",
                    endDate: "2025-03-12",
                    duration: 4,
                    dateAdded: "2025-02-10T00:00:00.000Z",
                    source: "Historical Data"
                }
            ]
        },
        {
            email: "herbert@block.xyz",
            trips: [
                {
                    id: Date.now() + Math.random(),
                    country: "Germany",
                    additionalLocation: "Berlin, Germany & Copenhagen, Denmark",
                    purpose: "Historical STIW Trip", 
                    startDate: "2025-02-10",
                    endDate: "2025-03-25",
                    duration: 17,
                    dateAdded: "2025-02-10T00:00:00.000Z",
                    source: "Historical Data"
                }
            ]
        },
        {
            email: "ankits@block.xyz",
            trips: [
                {
                    id: Date.now() + Math.random(),
                    country: "India",
                    additionalLocation: "Ujjain, India",
                    purpose: "Historical STIW Trip",
                    startDate: "2025-02-10", 
                    endDate: "2025-03-26",
                    duration: 18,
                    dateAdded: "2025-02-10T00:00:00.000Z",
                    source: "Historical Data"
                }
            ]
        },
        {
            email: "annawu@block.xyz",
            trips: [
                {
                    id: Date.now() + Math.random(),
                    country: "France",
                    additionalLocation: "Paris, France & London, United Kingdom",
                    purpose: "Historical STIW Trip",
                    startDate: "2025-02-10",
                    endDate: "2025-03-26", 
                    duration: 18,
                    dateAdded: "2025-02-10T00:00:00.000Z",
                    source: "Historical Data"
                }
            ]
        }
        // Add more employees as needed...
    ];

    return historicalData;
}

// Function to load historical data into user's localStorage
function loadHistoricalDataForUser(userEmail) {
    const historicalData = processSTIWHistoricalData();
    const userData = historicalData.find(user => user.email === userEmail);
    
    if (userData) {
        // Get existing user data or create new
        const existingData = JSON.parse(localStorage.getItem(`stiwUserData_${userEmail}`)) || {
            allTrips: [],
            requests: []
        };
        
        // Add historical trips if not already present
        userData.trips.forEach(historicalTrip => {
            const exists = existingData.allTrips.some(trip => 
                trip.startDate === historicalTrip.startDate && 
                trip.endDate === historicalTrip.endDate &&
                trip.country === historicalTrip.country
            );
            
            if (!exists) {
                existingData.allTrips.push(historicalTrip);
            }
        });
        
        // Save updated data
        localStorage.setItem(`stiwUserData_${userEmail}`, JSON.stringify(existingData));
        
        return userData.trips.length;
    }
    
    return 0;
}