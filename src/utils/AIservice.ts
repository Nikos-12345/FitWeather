import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

export async function generateAIVerdict(currentWeather: any, forecastData: any): Promise<string> {
    try {
        // Set the AI model we use
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // We receive the 4 next forecasts (12 hours) to give them to our AI model
        const forecastSummary = forecastData?.list?.slice(0, 4).map((f: any) => {
            const time = new Date(f.dt * 1000).toLocaleTimeString('el=GR', {hour: '2-digit', minute: '2-digit' });
            return `${time}: ${Math.round(f.main.temp)}°C, ${f.weather[0].description}`;        
        }).join('\n') || 'No forecast data available.';

        const promt = `
        You are the "FitWeather Coach", an experienced personal trainer and outdoor fitness coach.
      I am giving you the current weather data and the hourly forecast for the user's city.
      
      [CURRENT WEATHER]: ${Math.round(currentWeather.main.temp)}°C, ${currentWeather.weather[0].description}, Humidity: ${currentWeather.main.humidity}%, Wind: ${Math.round(currentWeather.wind.speed * 3.6)} km/h.
      
      [UPCOMING FORECAST]:
      ${forecastSummary}
      
      INSTRUCTIONS:
      1. Write a short, smart, and highly motivating workout advice (strictly 2-3 sentences) in English.
      2. Your tone must be friendly, athletic, cool, and direct (feel free to use slang/words like "bro", "let's go", "push hard", "beast mode").
      3. Analyze whether it is a good idea to work out outside RIGHT NOW, or if it is better to wait for a specific upcoming hour because the weather will improve or worsen.
      4. Do not use any markdown formatting at all (no asterisks **, hashtags, or bold text). Return ONLY clean, raw text.
      `;

      const result = await model.generateContent(promt);
      return result.response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        return "The AI coach ran into a small network glitch! Check the stats be;ow and make your own call for today's workout. Let's go hard!";
    }
}