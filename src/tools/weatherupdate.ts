export interface WeatherOptions {
  unit?: 'celsius' | 'fahrenheit';
  details?: boolean;
}

export async function getWeather(
  location: string,
  options: WeatherOptions = {},
): Promise<string> {
  const trimmed = location.trim();
  if (!trimmed) {
    throw new Error('getWeather: location must be a non-empty string');
  }

  const { unit = 'celsius', details = false } = options;
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('WEATHER_API_KEY environment variable not set');
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmed)}&appid=${apiKey}&units=${unit === 'fahrenheit' ? 'imperial' : 'metric'}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json() as Record<string, unknown>;
    const weather = (data.main as Record<string, unknown>)?.temp || 'N/A';
    const description = ((data.weather as Array<Record<string, unknown>>)?.[0]?.main || 'Unknown');

    if (details) {
      const feels_like = (data.main as Record<string, unknown>)?.feels_like || 'N/A';
      const humidity = (data.main as Record<string, unknown>)?.humidity || 'N/A';
      return `Weather for ${trimmed}: ${description}, ${weather}°${unit === 'fahrenheit' ? 'F' : 'C'}, Feels like ${feels_like}°, Humidity: ${humidity}%`;
    }

    return `Weather for ${trimmed}: ${description}, ${weather}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
  } catch (error) {
    throw new Error(`Failed to fetch weather for ${trimmed}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
