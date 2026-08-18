# PowerShell script to process STIW CSV data and generate JavaScript file

# Read CSV data
$csvData = Import-Csv "C:\Users\MeredithEmrich\Downloads\stiw_data.csv"

# Group data by email and process
$historicalData = @()
$userGroups = $csvData | Group-Object "Email Address 2"

foreach ($group in $userGroups) {
    $email = $group.Name
    if ([string]::IsNullOrEmpty($email)) {
        $email = $group.Group[0]."Email Address"
    }
    
    $trips = @()
    
    foreach ($row in $group.Group) {
        # Parse dates
        try {
            $startDate = [DateTime]::Parse($row.Start_Date).ToString("yyyy-MM-dd")
            $endDate = [DateTime]::Parse($row.End_Date).ToString("yyyy-MM-dd")
        } catch {
            continue
        }
        
        # Extract primary country from location
        $location = $row.STIW_Location
        $country = $location
        
        if ($location -match "^([^,]+),\s*(.+)$") {
            $country = $matches[2].Trim()
        } elseif ($location -match "&") {
            $parts = $location -split "&"
            $firstPart = $parts[0].Trim()
            if ($firstPart -match "^([^,]+),\s*(.+)$") {
                $country = $matches[2].Trim()
            } else {
                $country = $firstPart
            }
        }
        
        # Create trip object
        $trip = @{
            id = [Math]::Abs(($email + $startDate + $endDate).GetHashCode())
            country = $country
            additionalLocation = $location
            purpose = "Historical STIW Trip"
            startDate = $startDate
            endDate = $endDate
            duration = [int]$row.Days_on_STIW
            dateAdded = "${startDate}T00:00:00.000Z"
            source = "Historical Data"
        }
        
        $trips += $trip
    }
    
    if ($trips.Count -gt 0) {
        $userData = @{
            email = $email
            name = "$($group.Group[0].First_Name) $($group.Group[0].Last_Name)"
            trips = $trips
        }
        
        $historicalData += $userData
    }
}

# Convert to JSON
$jsonData = $historicalData | ConvertTo-Json -Depth 10

# Create JavaScript file content
$jsContent = @"
// STIW Historical Data - Auto-generated from CSV
// Total employees: $($historicalData.Count)
// Total trips: $(($historicalData | ForEach-Object { $_.trips.Count } | Measure-Object -Sum).Sum)

const STIW_HISTORICAL_DATA = $jsonData;

// Function to load historical data for a specific user
function loadHistoricalDataForUser(userEmail) {
    const userData = STIW_HISTORICAL_DATA.find(user => user.email.toLowerCase() === userEmail.toLowerCase());
    
    if (userData) {
        // Get existing user data or create new
        const existingData = JSON.parse(localStorage.getItem(`stiwUserData_`+userEmail)) || {
            allTrips: [],
            requests: []
        };
        
        // Add historical trips if not already present
        let addedTrips = 0;
        userData.trips.forEach(historicalTrip => {
            const exists = existingData.allTrips.some(trip => 
                trip.startDate === historicalTrip.startDate && 
                trip.endDate === historicalTrip.endDate &&
                trip.country === historicalTrip.country &&
                trip.source === 'Historical Data'
            );
            
            if (!exists) {
                existingData.allTrips.push(historicalTrip);
                addedTrips++;
            }
        });
        
        // Save updated data
        localStorage.setItem(`stiwUserData_`+userEmail, JSON.stringify(existingData));
        
        return {
            loaded: true,
            tripsAdded: addedTrips,
            totalTrips: userData.trips.length,
            employeeName: userData.name
        };
    }
    
    return {
        loaded: false,
        tripsAdded: 0,
        totalTrips: 0,
        employeeName: null
    };
}

// Function to check if user has historical data available
function hasHistoricalData(userEmail) {
    return STIW_HISTORICAL_DATA.some(user => user.email.toLowerCase() === userEmail.toLowerCase());
}

// Function to get historical data summary for a user
function getHistoricalDataSummary(userEmail) {
    const userData = STIW_HISTORICAL_DATA.find(user => user.email.toLowerCase() === userEmail.toLowerCase());
    
    if (userData) {
        const totalDays = userData.trips.reduce((sum, trip) => sum + trip.duration, 0);
        return {
            hasData: true,
            employeeName: userData.name,
            totalTrips: userData.trips.length,
            totalDays: totalDays,
            trips: userData.trips
        };
    }
    
    return {
        hasData: false,
        employeeName: null,
        totalTrips: 0,
        totalDays: 0,
        trips: []
    };
}

// Function to automatically load historical data on user login
function autoLoadHistoricalData(userEmail) {
    if (hasHistoricalData(userEmail)) {
        const result = loadHistoricalDataForUser(userEmail);
        if (result.loaded && result.tripsAdded > 0) {
            return `✅ Loaded ${result.tripsAdded} historical STIW trips for ${result.employeeName}`;
        } else if (result.loaded) {
            return `ℹ️ Historical data already loaded for ${result.employeeName}`;
        }
    }
    return null;
}
"@

# Write JavaScript file
$jsContent | Out-File -FilePath "C:\Users\MeredithEmrich\Short-Term-International-Work\stiw_historical_data.js" -Encoding UTF8

Write-Host "Generated JavaScript file with $($historicalData.Count) employees"

# Create summary report
$summary = @()
foreach ($user in $historicalData) {
    $totalDays = ($user.trips | Measure-Object -Property duration -Sum).Sum
    $summary += @{
        email = $user.email
        name = $user.name
        trips = $user.trips.Count
        total_days = $totalDays
        remaining_days = 45 - $totalDays
    }
}

# Sort by total days used (highest first)
$summary = $summary | Sort-Object total_days -Descending

# Display top 10 users
Write-Host "`nTop 10 employees by STIW usage:"
Write-Host ("-" * 60)
for ($i = 0; $i -lt [Math]::Min(10, $summary.Count); $i++) {
    $user = $summary[$i]
    Write-Host ("{0,2}. {1} ({2})" -f ($i + 1), $user.name, $user.email)
    Write-Host ("    Trips: {0}, Days used: {1}, Remaining: {2}" -f $user.trips, $user.total_days, $user.remaining_days)
}

# Save summary as JSON
$summary | ConvertTo-Json | Out-File -FilePath "C:\Users\MeredithEmrich\Short-Term-International-Work\historical_data_summary.json" -Encoding UTF8

Write-Host "`nSummary report saved to historical_data_summary.json"