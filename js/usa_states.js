/**
 * REGISTRO DEI 50 STATI DEGLI STATI UNITI D'AMERICA (USA)
 * Sub-totale Stati Federati Visitati vs Non Ancora Visitati
 * Tracciamento TripAdvisor (UccelloGiraviti) - Giuseppe Ricatti
 */

if (typeof window === "undefined") {
  var window = this;
}

window.USA_STATES_DATA = [
  {
    "code": "AL",
    "name": "Alabama",
    "capital": "Montgomery",
    "visited": false
  },
  {
    "code": "AK",
    "name": "Alaska",
    "capital": "Juneau",
    "visited": false
  },
  {
    "code": "AZ",
    "name": "Arizona",
    "capital": "Phoenix",
    "visited": true,
    "cities": [
      "Parco nazionale del Grand Canyon"
    ]
  },
  {
    "code": "AR",
    "name": "Arkansas",
    "capital": "Little Rock",
    "visited": false
  },
  {
    "code": "CA",
    "name": "California",
    "capital": "Sacramento",
    "visited": true,
    "cities": [
      "Los Angeles",
      "San Francisco",
      "San Diego",
      "Beverly Hills",
      "Malibu",
      "Santa Monica",
      "Santa Barbara",
      "Monterey",
      "Big Sur",
      "Sausalito",
      "Coronado",
      "Marina del Rey",
      "West Hollywood",
      "Death Valley Junction"
    ]
  },
  {
    "code": "CO",
    "name": "Colorado",
    "capital": "Denver",
    "visited": false
  },
  {
    "code": "CT",
    "name": "Connecticut",
    "capital": "Hartford",
    "visited": false
  },
  {
    "code": "DE",
    "name": "Delaware",
    "capital": "Dover",
    "visited": false
  },
  {
    "code": "DC",
    "name": "Distretto di Columbia",
    "capital": "Washington D.C.",
    "visited": true,
    "cities": [
      "Washington D.C."
    ],
    "isDistrict": true
  },
  {
    "code": "FL",
    "name": "Florida",
    "capital": "Tallahassee",
    "visited": true,
    "cities": [
      "Miami",
      "Miami Beach",
      "Orlando",
      "Key West",
      "Key Largo",
      "Fort Lauderdale",
      "Tampa",
      "St. Petersburg",
      "Cape Canaveral",
      "Daytona Beach",
      "Clearwater",
      "Cocoa Beach",
      "Crystal River",
      "Everglades City",
      "Florida City",
      "Key Biscayne",
      "Napoli",
      "Sarasota"
    ]
  },
  {
    "code": "GA",
    "name": "Georgia",
    "capital": "Atlanta",
    "visited": true,
    "cities": [
      "Atlanta"
    ]
  },
  {
    "code": "HI",
    "name": "Hawaii",
    "capital": "Honolulu",
    "visited": false
  },
  {
    "code": "ID",
    "name": "Idaho",
    "capital": "Boise",
    "visited": false
  },
  {
    "code": "IL",
    "name": "Illinois",
    "capital": "Springfield",
    "visited": true,
    "cities": [
      "Chicago"
    ]
  },
  {
    "code": "IN",
    "name": "Indiana",
    "capital": "Indianapolis",
    "visited": false
  },
  {
    "code": "IA",
    "name": "Iowa",
    "capital": "Des Moines",
    "visited": true,
    "cities": [
      "Iowa City",
      "Carter Lake"
    ]
  },
  {
    "code": "KS",
    "name": "Kansas",
    "capital": "Topeka",
    "visited": false
  },
  {
    "code": "KY",
    "name": "Kentucky",
    "capital": "Frankfort",
    "visited": false
  },
  {
    "code": "LA",
    "name": "Louisiana",
    "capital": "Baton Rouge",
    "visited": false
  },
  {
    "code": "ME",
    "name": "Maine",
    "capital": "Augusta",
    "visited": false
  },
  {
    "code": "MD",
    "name": "Maryland",
    "capital": "Annapolis",
    "visited": true,
    "cities": [
      "Baltimore"
    ]
  },
  {
    "code": "MA",
    "name": "Massachusetts",
    "capital": "Boston",
    "visited": true,
    "cities": [
      "Boston",
      "Cambridge",
      "Chelsea"
    ]
  },
  {
    "code": "MI",
    "name": "Michigan",
    "capital": "Lansing",
    "visited": true,
    "cities": [
      "Detroit"
    ]
  },
  {
    "code": "MN",
    "name": "Minnesota",
    "capital": "Saint Paul",
    "visited": false
  },
  {
    "code": "MS",
    "name": "Mississippi",
    "capital": "Jackson",
    "visited": false
  },
  {
    "code": "MO",
    "name": "Missouri",
    "capital": "Jefferson City",
    "visited": false
  },
  {
    "code": "MT",
    "name": "Montana",
    "capital": "Helena",
    "visited": false
  },
  {
    "code": "NE",
    "name": "Nebraska",
    "capital": "Lincoln",
    "visited": true,
    "cities": [
      "Omaha"
    ]
  },
  {
    "code": "NV",
    "name": "Nevada",
    "capital": "Carson City",
    "visited": true,
    "cities": [
      "Las Vegas",
      "North Las Vegas"
    ]
  },
  {
    "code": "NH",
    "name": "New Hampshire",
    "capital": "Concord",
    "visited": false
  },
  {
    "code": "NJ",
    "name": "New Jersey",
    "capital": "Trenton",
    "visited": false
  },
  {
    "code": "NM",
    "name": "New Mexico",
    "capital": "Santa Fe",
    "visited": false
  },
  {
    "code": "NY",
    "name": "New York",
    "capital": "Albany",
    "visited": true,
    "cities": [
      "New York City",
      "Brooklyn",
      "Buffalo",
      "Cascate del Niagara",
      "Syracuse"
    ]
  },
  {
    "code": "NC",
    "name": "North Carolina",
    "capital": "Raleigh",
    "visited": false
  },
  {
    "code": "ND",
    "name": "North Dakota",
    "capital": "Bismarck",
    "visited": false
  },
  {
    "code": "OH",
    "name": "Ohio",
    "capital": "Columbus",
    "visited": false
  },
  {
    "code": "OK",
    "name": "Oklahoma",
    "capital": "Oklahoma City",
    "visited": false
  },
  {
    "code": "OR",
    "name": "Oregon",
    "capital": "Salem",
    "visited": false
  },
  {
    "code": "PA",
    "name": "Pennsylvania",
    "capital": "Harrisburg",
    "visited": true,
    "cities": [
      "Philadelphia"
    ]
  },
  {
    "code": "RI",
    "name": "Rhode Island",
    "capital": "Providence",
    "visited": false
  },
  {
    "code": "SC",
    "name": "South Carolina",
    "capital": "Columbia",
    "visited": false
  },
  {
    "code": "SD",
    "name": "South Dakota",
    "capital": "Pierre",
    "visited": true,
    "cities": [
      "Rapid City",
      "Keystone",
      "Crazy Horse",
      "Custer"
    ]
  },
  {
    "code": "TN",
    "name": "Tennessee",
    "capital": "Nashville",
    "visited": false
  },
  {
    "code": "TX",
    "name": "Texas",
    "capital": "Austin",
    "visited": false
  },
  {
    "code": "UT",
    "name": "Utah",
    "capital": "Salt Lake City",
    "visited": true,
    "cities": [
      "Salt Lake City",
      "Moab",
      "Monument Valley"
    ]
  },
  {
    "code": "VT",
    "name": "Vermont",
    "capital": "Montpelier",
    "visited": false
  },
  {
    "code": "VA",
    "name": "Virginia",
    "capital": "Richmond",
    "visited": true,
    "cities": [
      "Arlington"
    ]
  },
  {
    "code": "WA",
    "name": "Washington",
    "capital": "Olympia",
    "visited": false
  },
  {
    "code": "WV",
    "name": "West Virginia",
    "capital": "Charleston",
    "visited": false
  },
  {
    "code": "WI",
    "name": "Wisconsin",
    "capital": "Madison",
    "visited": false
  },
  {
    "code": "WY",
    "name": "Wyoming",
    "capital": "Cheyenne",
    "visited": true,
    "cities": [
      "Parco nazionale Yellowstone",
      "Jackson",
      "Cody",
      "Teton Village",
      "Alpine",
      "Big Horn",
      "Etna"
    ]
  }
];
