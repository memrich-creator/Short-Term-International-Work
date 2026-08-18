import pandas as pd
import json
from datetime import datetime
import re

def process_stiw_csv_data():
    """Process the STIW CSV data and convert it to JavaScript format for integration"""
    
    # Read the CSV file
    df = pd.read_csv(r'C:\Users\MeredithEmrich\Downloads\stiw_data.csv')
    
    # Group by email address
    historical_data = {}
    
    for _, row in df.iterrows():
        # Use block.xyz email if available, otherwise squareup.com
        email = row['Email Address 2'] if pd.notna(row['Email Address 2']) else row['Email Address']
        
        # Parse dates
        try:
            start_date = pd.to_datetime(row['Start_Date']).strftime('%Y-%m-%d')
            end_date = pd.to_datetime(row['End_Date']).strftime('%Y-%m-%d')
        except:
            continue
            
        # Extract primary country from location
        location = str(row['STIW_Location'])
        # Get first country mentioned
        if '&' in location:
            primary_location = location.split('&')[0].strip()
        else:
            primary_location = location
            
        # Extract country name (after the comma if present)
        if ',' in primary_location:
            country = primary_location.split(',')[-1].strip()
        else:
            country = primary_location
            
        # Create trip object
        trip = {
            'id': f"hist_{row.name}_{hash(email + start_date + end_date)}",
            'country': country,
            'additionalLocation': location,
            'purpose': 'Historical STIW Trip',
            'startDate': start_date,
            'endDate': end_date,
            'duration': int(row['Days_on_STIW']),
            'dateAdded': f"{start_date}T00:00:00.000Z",
            'source': 'Historical Data'
        }
        
        # Add to user's trips
        if email not in historical_data:
            historical_data[email] = {
                'email': email,
                'name': f"{row['First_Name']} {row['Last_Name']}",
                'trips': []
            }
        
        historical_data[email]['trips'].append(trip)
    
    # Convert to JavaScript format
    js_data = []
    for email, user_data in historical_data.items():
        js_data.append({
            'email': email,
            'name': user_data['name'],
            'trips': user_data['trips']
        })
    
    return js_data

def generate_javascript_file():
    """Generate a JavaScript file with all historical data"""
    
    data = process_stiw_csv_data()
    
    js_content = """// STIW Historical Data - Auto-generated from CSV
// Total employees: {total_employees}
// Total trips: {total_trips}

const STIW_HISTORICAL_DATA = {data};

// Function to load historical data for a specific user
function loadHistoricalDataForUser(userEmail) {{
    const userData = STIW_HISTORICAL_DATA.find(user => user.email.toLowerCase() === userEmail.toLowerCase());
    
    if (userData) {{
        // Get existing user data or create new
        const existingData = JSON.parse(localStorage.getItem(`stiwUserData_${{userEmail}}`)) || {{
            allTrips: [],
            requests: []
        }};
        
        // Add historical trips if not already present
        let addedTrips = 0;
        userData.trips.forEach(historicalTrip => {{
            const exists = existingData.allTrips.some(trip => 
                trip.startDate === historicalTrip.startDate && 
                trip.endDate === historicalTrip.endDate &&
                trip.country === historicalTrip.country &&
                trip.source === 'Historical Data'
            );
            
            if (!exists) {{
                existingData.allTrips.push(historicalTrip);
                addedTrips++;
            }}
        }});
        
        // Save updated data
        localStorage.setItem(`stiwUserData_${{userEmail}}`, JSON.stringify(existingData));
        
        return {{
            loaded: true,
            tripsAdded: addedTrips,
            totalTrips: userData.trips.length,
            employeeName: userData.name
        }};
    }}
    
    return {{
        loaded: false,
        tripsAdded: 0,
        totalTrips: 0,
        employeeName: null
    }};
}}

// Function to check if user has historical data available
function hasHistoricalData(userEmail) {{
    return STIW_HISTORICAL_DATA.some(user => user.email.toLowerCase() === userEmail.toLowerCase());
}}

// Function to get historical data summary for a user
function getHistoricalDataSummary(userEmail) {{
    const userData = STIW_HISTORICAL_DATA.find(user => user.email.toLowerCase() === userEmail.toLowerCase());
    
    if (userData) {{
        const totalDays = userData.trips.reduce((sum, trip) => sum + trip.duration, 0);
        return {{
            hasData: true,
            employeeName: userData.name,
            totalTrips: userData.trips.length,
            totalDays: totalDays,
            trips: userData.trips
        }};
    }}
    
    return {{
        hasData: false,
        employeeName: null,
        totalTrips: 0,
        totalDays: 0,
        trips: []
    }};
}}
""".format(
        total_employees=len(data),
        total_trips=sum(len(user['trips']) for user in data),
        data=json.dumps(data, indent=2)
    )
    
    # Write to file
    with open(r'C:\Users\MeredithEmrich\Short-Term-International-Work\stiw_historical_data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Generated JavaScript file with {len(data)} employees and {sum(len(user['trips']) for user in data)} trips")
    
    # Also create a summary report
    summary = []
    for user in data:
        total_days = sum(trip['duration'] for trip in user['trips'])
        summary.append({
            'email': user['email'],
            'name': user['name'],
            'trips': len(user['trips']),
            'total_days': total_days,
            'remaining_days': 45 - total_days
        })
    
    # Sort by total days used (highest first)
    summary.sort(key=lambda x: x['total_days'], reverse=True)
    
    with open(r'C:\Users\MeredithEmrich\Short-Term-International-Work\historical_data_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    print("Summary report generated")
    return summary

if __name__ == "__main__":
    summary = generate_javascript_file()
    
    # Print top 10 users by STIW usage
    print("\nTop 10 employees by STIW usage:")
    print("-" * 60)
    for i, user in enumerate(summary[:10], 1):
        print(f"{i:2d}. {user['name']} ({user['email']})")
        print(f"    Trips: {user['trips']}, Days used: {user['total_days']}, Remaining: {user['remaining_days']}")