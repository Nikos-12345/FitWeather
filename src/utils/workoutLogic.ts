export const getWorkoutVerdict = (temp: number, windKmH: number, condition: string) => {
    const weatherCondition = condition.toLowerCase();
    const isRaining = weatherCondition.includes('rain') || weatherCondition.includes('drizzle') || weatherCondition.includes('storm');

    if (isRaining) {
        return {
            title: "Stay dry",
            message: "It's raining outside. Perfect day to hit the gym for some heavy lifting or an indoor workout.",
            icon: "barbell",
            color: "#6366f1"
        };
    } else if (temp >= 30) {
        return {
            title: "Heat warning",
            message: "It's so hot to workout outside! Stay hydrated and train whether at home or at gym.",
            icon: "water",
            color: "#ef4444"
        };
    } else if (temp <= 10) {
        return {
            title: "Cold warning",
            message: "Low temperatures! Stay warm and train well at gym by lifting weight. You can also go running outside.",
            icon: "snow",
            color: "#0ea5e9"
        };
    } else if (windKmH >= 35) {
        return {
            title: "Windy conditions",
            message: "Strong winds today. Might be annoying for a run, but great for indoor strength training.",
            icon: "leaf",
            color: "#f59e0b"
        };
    } else {
        return {
            title: "Prime conditions",
            message: "The weather is absolute perfection! Tie your shoes and go for an outdoor run. Don't forget your strength training at gym.",
            icon: "walk",
            color: "#10b981"
        };
    }
};

export const getRestDayRecommendation = (forecastList: any[]) => {
    const dailyScores: Record<string, { score: number; condition: string }> = {};

    forecastList.forEach((item) => {
        // we save only the date
        const date = item.dt_txt.split(' ')[0];
        let score = 0;
        const condition = item.weather[0].main.toLowerCase();

        // Score system
        if (condition.includes('rain') || condition.includes('storm')) score += 5;
        if (item.main.temp > 30) score += 3;
        if (item.main.temp < 5) score += 3;
        if (item.wind.speed > 10) score += 2;

        if (!dailyScores[date]) {
            dailyScores[date] = { score: 0, condition: item.weather[0].description };
        }

        dailyScores[date].score += score;
    });

    let worstDay = '';
    let maxScore = -1;
    let worstCondition = '';

    for (const [date, data] of Object.entries(dailyScores)) {
        if (data.score > maxScore) {
            maxScore = data.score;
            worstDay = date;
            worstCondition = data.condition; 
        }
    }

    const formattedDate = worstDay.split('-').reverse().slice(0, 2).join('/');

    if (maxScore === 0) {
        return {
            day: "May you choose your rest day.",
            reason: "Weather will be in perfect condition for the next 5 days!"
        };
    }

    return {
        day: formattedDate,
        reason: `Hard conditions are being expected (${worstCondition}). You should recover that day!`
    };
};