interface WeatherData {
  city: string;
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  high: number;
  low: number;
}

const WEATHER: Record<string, WeatherData> = {
  'new york': { city: 'New York', temperature: 72, conditions: 'Partly cloudy', humidity: 58, windSpeed: 12, high: 78, low: 65 },
  'london': { city: 'London', temperature: 59, conditions: 'Overcast with light rain', humidity: 82, windSpeed: 8, high: 62, low: 54 },
  'tokyo': { city: 'Tokyo', temperature: 81, conditions: 'Sunny and humid', humidity: 70, windSpeed: 6, high: 85, low: 75 },
  'paris': { city: 'Paris', temperature: 64, conditions: 'Clear skies', humidity: 55, windSpeed: 10, high: 68, low: 58 },
  'sydney': { city: 'Sydney', temperature: 68, conditions: 'Sunny with a cool breeze', humidity: 45, windSpeed: 15, high: 71, low: 60 },
  'los angeles': { city: 'Los Angeles', temperature: 85, conditions: 'Sunny and warm', humidity: 30, windSpeed: 5, high: 90, low: 72 },
  'berlin': { city: 'Berlin', temperature: 57, conditions: 'Cloudy with occasional sun', humidity: 68, windSpeed: 11, high: 61, low: 50 },
  'mumbai': { city: 'Mumbai', temperature: 91, conditions: 'Hot and humid', humidity: 78, windSpeed: 9, high: 93, low: 84 },
  'toronto': { city: 'Toronto', temperature: 65, conditions: 'Partly sunny', humidity: 52, windSpeed: 14, high: 70, low: 58 },
  'san francisco': { city: 'San Francisco', temperature: 62, conditions: 'Foggy morning, clearing afternoon', humidity: 75, windSpeed: 18, high: 66, low: 55 },
};

export function getWeather(city: string): WeatherData | { error: string } {
  const key = city.toLowerCase().trim();
  const data = WEATHER[key];
  if (data) return data;

  const partial = Object.entries(WEATHER).find(([k]) => k.includes(key) || key.includes(k));
  if (partial) return partial[1];

  return { error: `No weather data available for "${city}". Try: ${Object.values(WEATHER).map((w) => w.city).join(', ')}` };
}
