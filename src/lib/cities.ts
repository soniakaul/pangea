export type City = {
  name: string;
  country: string;
  countryCode: string;
  timezone: string;
  lat: number;
  lng: number;
};

export const CITIES: City[] = [
  { name: "San Francisco", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 37.77, lng: -122.42 },
  { name: "Los Angeles", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 34.05, lng: -118.24 },
  { name: "Seattle", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 47.6, lng: -122.33 },
  { name: "Denver", country: "United States", countryCode: "US", timezone: "America/Denver", lat: 39.74, lng: -104.99 },
  { name: "Chicago", country: "United States", countryCode: "US", timezone: "America/Chicago", lat: 41.88, lng: -87.63 },
  { name: "Austin", country: "United States", countryCode: "US", timezone: "America/Chicago", lat: 30.27, lng: -97.74 },
  { name: "New York", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 40.71, lng: -74.0 },
  { name: "Boston", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 42.36, lng: -71.06 },
  { name: "Miami", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 25.76, lng: -80.19 },
  { name: "Toronto", country: "Canada", countryCode: "CA", timezone: "America/Toronto", lat: 43.65, lng: -79.38 },
  { name: "Vancouver", country: "Canada", countryCode: "CA", timezone: "America/Vancouver", lat: 49.28, lng: -123.12 },
  { name: "Mexico City", country: "Mexico", countryCode: "MX", timezone: "America/Mexico_City", lat: 19.43, lng: -99.13 },
  { name: "São Paulo", country: "Brazil", countryCode: "BR", timezone: "America/Sao_Paulo", lat: -23.55, lng: -46.63 },
  { name: "Buenos Aires", country: "Argentina", countryCode: "AR", timezone: "America/Argentina/Buenos_Aires", lat: -34.6, lng: -58.38 },
  { name: "Bogotá", country: "Colombia", countryCode: "CO", timezone: "America/Bogota", lat: 4.71, lng: -74.07 },
  { name: "London", country: "United Kingdom", countryCode: "GB", timezone: "Europe/London", lat: 51.51, lng: -0.13 },
  { name: "Dublin", country: "Ireland", countryCode: "IE", timezone: "Europe/Dublin", lat: 53.35, lng: -6.26 },
  { name: "Paris", country: "France", countryCode: "FR", timezone: "Europe/Paris", lat: 48.86, lng: 2.35 },
  { name: "Amsterdam", country: "Netherlands", countryCode: "NL", timezone: "Europe/Amsterdam", lat: 52.37, lng: 4.9 },
  { name: "Berlin", country: "Germany", countryCode: "DE", timezone: "Europe/Berlin", lat: 52.52, lng: 13.4 },
  { name: "Madrid", country: "Spain", countryCode: "ES", timezone: "Europe/Madrid", lat: 40.42, lng: -3.7 },
  { name: "Lisbon", country: "Portugal", countryCode: "PT", timezone: "Europe/Lisbon", lat: 38.72, lng: -9.14 },
  { name: "Rome", country: "Italy", countryCode: "IT", timezone: "Europe/Rome", lat: 41.9, lng: 12.5 },
  { name: "Zurich", country: "Switzerland", countryCode: "CH", timezone: "Europe/Zurich", lat: 47.38, lng: 8.54 },
  { name: "Stockholm", country: "Sweden", countryCode: "SE", timezone: "Europe/Stockholm", lat: 59.33, lng: 18.07 },
  { name: "Warsaw", country: "Poland", countryCode: "PL", timezone: "Europe/Warsaw", lat: 52.23, lng: 21.01 },
  { name: "Athens", country: "Greece", countryCode: "GR", timezone: "Europe/Athens", lat: 37.98, lng: 23.73 },
  { name: "Istanbul", country: "Turkey", countryCode: "TR", timezone: "Europe/Istanbul", lat: 41.01, lng: 28.98 },
  { name: "Cairo", country: "Egypt", countryCode: "EG", timezone: "Africa/Cairo", lat: 30.04, lng: 31.24 },
  { name: "Lagos", country: "Nigeria", countryCode: "NG", timezone: "Africa/Lagos", lat: 6.52, lng: 3.38 },
  { name: "Nairobi", country: "Kenya", countryCode: "KE", timezone: "Africa/Nairobi", lat: -1.29, lng: 36.82 },
  { name: "Cape Town", country: "South Africa", countryCode: "ZA", timezone: "Africa/Johannesburg", lat: -33.92, lng: 18.42 },
  { name: "Johannesburg", country: "South Africa", countryCode: "ZA", timezone: "Africa/Johannesburg", lat: -26.2, lng: 28.05 },
  { name: "Tel Aviv", country: "Israel", countryCode: "IL", timezone: "Asia/Jerusalem", lat: 32.08, lng: 34.78 },
  { name: "Dubai", country: "UAE", countryCode: "AE", timezone: "Asia/Dubai", lat: 25.2, lng: 55.27 },
  { name: "Karachi", country: "Pakistan", countryCode: "PK", timezone: "Asia/Karachi", lat: 24.86, lng: 67.0 },
  { name: "Mumbai", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 19.07, lng: 72.88 },
  { name: "Delhi", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 28.61, lng: 77.21 },
  { name: "Bangalore", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 12.97, lng: 77.59 },
  { name: "Bangkok", country: "Thailand", countryCode: "TH", timezone: "Asia/Bangkok", lat: 13.75, lng: 100.5 },
  { name: "Singapore", country: "Singapore", countryCode: "SG", timezone: "Asia/Singapore", lat: 1.35, lng: 103.82 },
  { name: "Jakarta", country: "Indonesia", countryCode: "ID", timezone: "Asia/Jakarta", lat: -6.21, lng: 106.85 },
  { name: "Hong Kong", country: "Hong Kong", countryCode: "HK", timezone: "Asia/Hong_Kong", lat: 22.32, lng: 114.17 },
  { name: "Shanghai", country: "China", countryCode: "CN", timezone: "Asia/Shanghai", lat: 31.23, lng: 121.47 },
  { name: "Beijing", country: "China", countryCode: "CN", timezone: "Asia/Shanghai", lat: 39.9, lng: 116.41 },
  { name: "Taipei", country: "Taiwan", countryCode: "TW", timezone: "Asia/Taipei", lat: 25.03, lng: 121.57 },
  { name: "Seoul", country: "South Korea", countryCode: "KR", timezone: "Asia/Seoul", lat: 37.57, lng: 126.98 },
  { name: "Tokyo", country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo", lat: 35.68, lng: 139.69 },
  { name: "Sydney", country: "Australia", countryCode: "AU", timezone: "Australia/Sydney", lat: -33.87, lng: 151.21 },
  { name: "Melbourne", country: "Australia", countryCode: "AU", timezone: "Australia/Melbourne", lat: -37.81, lng: 144.96 },
  { name: "Auckland", country: "New Zealand", countryCode: "NZ", timezone: "Pacific/Auckland", lat: -36.85, lng: 174.76 },
];

export function findCity(name: string): City | undefined {
  return CITIES.find((c) => c.name === name);
}
