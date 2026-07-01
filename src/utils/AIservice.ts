import { GoogleGenerativeAI } from "@google/generative-ai";
import i18n from "i18next";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function generateAIVerdict(currentWeather: any, forecastData: any, userProfile?: any): Promise<string> {
    /*if (i18n.language === 'el') {
    return "Αυτή είναι μια δοκιμαστική συμβουλή από τον AI Coach για εξοικονόμηση αιτημάτων API. Ο καιρός φαίνεται ιδανικός, συνέχισε τη σκληρή δουλειά!";
  }
    return "This is a mock AI Coach advice to save API requests during development. The weather looks solid, keep grinding!";
    */
    try {
        if (!API_KEY) {
            throw new Error("Missing Gemini API key in environment variables.");
        }

        const currentTimeString = new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

        const forecastSummary = forecastData?.list?.slice(0, 4).map((f: any) => {
            const time = new Date(f.dt * 1000).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
            return `${time}: ${Math.round(f.main.temp)}°C, ${f.weather[0].description}`;        
        }).join('\n') || 'No forecast data available.';

        const workouts = userProfile?.selectedWorkouts?.join(', ') || 'general fitness';
        const frequency = userProfile?.weeklyFrequency || 'a few times a week';

        const promt = `
          You are the "FitWeather Coach", an experienced personal trainer and outdoor fitness coach.
      
          [USER FITNESS PROFILE]
          - Goal: Trains ${frequency}.
          - Preferred Workouts: ${workouts}.
      
          [CURRENT TIME]: ${currentTimeString}
          [CURRENT WEATHER]: ${Math.round(currentWeather.main.temp)}°C, ${currentWeather.weather[0].description}, Humidity: ${currentWeather.main.humidity}%, Wind: ${Math.round(currentWeather.wind.speed * 3.6)} km/h.
      
          [UPCOMING FORECAST]:
          ${forecastSummary}
      
          INSTRUCTIONS:
          1. Write a short, smart, and highly motivating workout advice (strictly 2-3 sentences) in English.
          2. PERSONALIZATION IS CRITICAL: Tailor your advice SPECIFICALLY to the user's preferred workouts (${workouts}). If they like Running or Calisthenics, focus heavily on the outdoor conditions. If they chose Weightlifting/Gym, tell them to hit the indoor gym if the weather outside is bad.
          3. Analyze the CURRENT TIME and temperature compared to the UPCOMING FORECAST. Dynamically suggest whether to train RIGHT NOW or wait for a better hour later in the day.
          4. Acknowledge their training frequency (${frequency}) to push them appropriately.
          5. Your tone must be friendly, athletic, cool, and direct (use slang like "bro", "let's go", "push hard", "beast mode").
          6. Do not use any markdown formatting at all (no asterisks **, hashtags, or bold text). Return ONLY clean, raw text.
        `;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        
        const result = await model.generateContent(promt);
        return result.response.text();

    } catch (error: any) {
        console.log(error);
        return `AI Error: ${error.message || 'Unknown error'}`;
    }
}