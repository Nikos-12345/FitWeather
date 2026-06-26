import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function generateAIVerdict(currentWeather: any, forecastData: any): Promise<string> {
    try {
        if (!API_KEY) {
            throw new Error("Missing Gemini API key in environment variables.");
        }

        const currentTimeString = new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

        const forecastSummary = forecastData?.list?.slice(0, 4).map((f: any) => {
            const time = new Date(f.dt * 1000).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
            return `${time}: ${Math.round(f.main.temp)}°C, ${f.weather[0].description}`;        
        }).join('\n') || 'No forecast data available.';

        const promt = `
          You are the "FitWeather Coach", an experienced personal trainer and outdoor fitness coach.
          I am giving you the current weather data and the hourly forecast for the user's city.
      
          [CURRENT TIME]: ${currentTimeString}
          [CURRENT WEATHER]: ${Math.round(currentWeather.main.temp)}°C, ${currentWeather.weather[0].description}, Humidity: ${currentWeather.main.humidity}%, Wind: ${Math.round(currentWeather.wind.speed * 3.6)} km/h.
      
          [UPCOMING FORECAST]:
          ${forecastSummary}
      
          INSTRUCTIONS:
          1. Write a short, smart, and highly motivating workout advice (strictly 2-3 sentences) in English.
          2. Your tone must be friendly, athletic, cool, and direct (feel free to use slang/words like "bro", "let's go", "push hard", "beast mode").
          3. CRITICAL: Analyze the CURRENT TIME and current temperature compared to the UPCOMING FORECAST. Dynamically suggest whether to train outside RIGHT NOW, go to an indoor gym instead if the weather/heat is going to worsen, or wait for a specific better hour later in the day (e.g. if it's morning and the temperature will spike later, suggest gym now or waiting until evening around 18:00/20:00 when it cools down for perfect outdoor cardio and sunset vibes).
          4. Do not use any markdown formatting at all (no asterisks **, hashtags, or bold text). Return ONLY clean, raw text.
        `;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const result = await model.generateContent(promt);
        return result.response.text();

    } catch (error: any) {
        console.log(error);
        return `AI Error: ${error.message || 'Unknown error'}`;
    }
}