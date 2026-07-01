import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const logWorkoutSession = async (userId: string, category: string, durationMinutes: number) => {
    try {
        await addDoc(collection(db, "workouts"), {
            userId,
            category,
            duration: durationMinutes,
            date: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error("Error logging workout session:", error);
        return false;
    }
};

export const fetchWeeklyStats = async (userId: string, category: string) => {
    try {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, "workouts"),
            where("userId", "==", userId),
            where("category", "==", category),
            where("date", ">=", Timestamp.fromDate(sevenDaysAgo))
        );

        const querySnapshot = await getDocs(q);
        const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Array to hold total duration for each day of the week
        let totalMins = 0;
        let longest = 0;
        let workoutCount = 0; 

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const workoutDate = data.date.toDate();
            const duration = data.duration;

            totalMins += duration;
            workoutCount += 1;
            if (duration > longest) {
                longest = duration;
            }
            let dayIndex = workoutDate.getDay(); // 0 (Sunday) to 6 (Saturday)
            dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust to make Monday = 0, Sunday = 6
            weeklyData[dayIndex] += duration;
        });

        return {
            weeklyData,
            totalMins,
            longest,
            workoutCount
        };
    } catch (error) {
        console.error("Error fetching weekly stats:", error);
        return null;
    }
};