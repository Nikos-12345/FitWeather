import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// We updated workoutType to an array of strings to hold multiple selections
export interface UserProfile {
  weeklyFrequency: string;
  selectedWorkouts: string[];
  restDays: string[];
}

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
  const [frequency, setFrequency] = useState('');
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const [restDays, setRestDays] = useState<string[]>([]);

  const [customInput, setCustomInput] = useState('');
  const [userAddedActivities, setUserAddedActivities] = useState<string[]>([]);

  const frequencies = ['1-2 times', '3-5 times', '6+ times (Intensive / Daily Grind)'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Categories now have an array of specific 'activities'
  const workoutCategories = [
    {
      id: 'cardio',
      title: 'Cardio & Aerobic',
      activities: ['Running', 'Cycling', 'Swimming', 'Walking', 'Rowing', 'Zumba'], 
    },
    {
      id: 'strength',
      title: 'Strength & Resistance',
      activities: ['Weightlifting', 'CrossFit', 'Calisthenics', 'Powerlifting'], 
    },
    {
      id: 'flexibility',
      title: 'Flexibility & Recovery',
      activities: ['Pilates', 'Yoga', 'Stretching', 'Mobility', 'Tai Chi'], 
    },
    {
      id: 'functional',
      title: 'Functional Training',
      activities: ['HIIT', 'Circuit Training', 'TRX', 'Kettlebells'], 
    },
    {
      id: 'other',
      title: 'Other / Outdoor',
      activities: ['Martial Arts', 'Dance', 'Hiking', 'Basketball', 'Football', 'Tennis'], 
    },
  ];

  // Function to toggle an activity on and off
  const toggleActivity = (activity: string) => {
    setSelectedWorkouts((prevSelected) => {
      if (prevSelected.includes(activity)) {
        // If it's already selected, remove it
        return prevSelected.filter((item) => item !== activity);
      } else {
        // If it's not selected, add it
        return [...prevSelected, activity];
      }
    });
  };

  const handleAddCustomActivity = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedWorkouts.includes(trimmed)) {
      setSelectedWorkouts((prev) => [...prev, trimmed]);
      if (!userAddedActivities.includes(trimmed)) {
        setUserAddedActivities((prev) => [...prev, trimmed]);
      }
      setCustomInput(''); 
    }
  };

  const toggleRestDay = (day: string) => {
    setRestDays((prevDays) => {
      if (prevDays.includes(day)) {
        return prevDays.filter((item) => item !== day);
      } else {
        return [...prevDays, day];
      }
    });
  };

  const handleFinish = () => {
    if (frequency && selectedWorkouts.length > 0 && restDays.length > 0) {
      onComplete({ 
        weeklyFrequency: frequency, 
        selectedWorkouts: selectedWorkouts,
        restDays: restDays 
      });
    }
  };

  // Valid if frequency is chosen and at least ONE activity is selected
  const isFormValid = frequency !== '' && selectedWorkouts.length > 0 && restDays.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.title}>Welcome to FitWeather</Text>
        <Text style={styles.subtitle}>Let's set up your personal AI Coach.</Text>

        {/* QUESTION 1 */}
        <View style={styles.section}>
          <Text style={styles.questionText}>1. How many times a week do you train?</Text>
          <View style={styles.frequencyContainer}>
            {frequencies.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.freqOption, frequency === item && styles.selectedOption]}
                onPress={() => setFrequency(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, frequency === item && styles.selectedOptionText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* QUESTION 2 */}
        <View style={styles.section}>
          <Text style={styles.questionText}>2. What activities do you do?</Text>
          
          {workoutCategories.map((category) => (
            <View key={category.id} style={styles.categoryBlock}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              
              <View style={styles.chipsContainer}>
                {category.activities.map((activity) => {
                  const isSelected = selectedWorkouts.includes(activity);
                  return (
                    <TouchableOpacity
                      key={activity}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => toggleActivity(activity)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {isSelected ? '✓ ' : '+ '}{activity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

        {/* CUSTOM ACTIVITY INPUT */}
        <View style={styles.customInputWrapper}>
          <TextInput
            style={styles.customInput}
              placeholder="Don't see your activity? Type it here..."
              placeholderTextColor="#888888"
              value={customInput}
              onChangeText={setCustomInput}
              onSubmitEditing={handleAddCustomActivity}
              returnKeyType="done"
          />
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddCustomActivity}
            disabled={customInput.trim() === ''}
          >
          <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

          {/* Render custom user chips */}
          {userAddedActivities.length > 0 && (
            <View style={[styles.chipsContainer, { marginTop: 10 }]}>
              {userAddedActivities.map((activity) => {
                const isSelected = selectedWorkouts.includes(activity);
                return (
                  <TouchableOpacity
                    key={activity}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleActivity(activity)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {isSelected ? '✓ ' : '+ '}{activity}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Question 3 */}
        <View style={styles.section}>
          <Text style={styles.questionText}>3. Select your preffered Rest Day(s):</Text>
          <View style={styles.chipsContainer}>
            {daysOfWeek.map((day) => {
              const isSelected = restDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleRestDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {isSelected ? '✓ ' : '+ '}{day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* COMPLETE BUTTON */}
        <TouchableOpacity
          style={[styles.finishButton, !isFormValid && styles.disabledButton]}
          onPress={handleFinish}
          disabled={!isFormValid}
        >
          <Text style={styles.finishButtonText}>Complete Setup</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10, textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#A0A0A0', marginBottom: 40, textAlign: 'center' },
  section: { marginBottom: 35 },
  questionText: { fontSize: 18, color: '#FFFFFF', marginBottom: 15, fontWeight: '600' },
  frequencyContainer: { flexDirection: 'column', gap: 12 },
  freqOption: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#2C2C2C' },
  selectedOption: { borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' },
  optionText: { color: '#E0E0E0', fontSize: 16, textAlign: 'center', fontWeight: '500' },
  selectedOptionText: { color: '#4CAF50' },
  categoryBlock: { marginBottom: 20 },
  categoryTitle: { color: '#E0E0E0', fontSize: 15, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#1E1E1E', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#333333' },
  chipSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  chipText: { color: '#A0A0A0', fontSize: 14, fontWeight: '500' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: 'bold' },
  customInputWrapper: { flexDirection: 'row', marginTop: 10, gap: 10, },
  customInput: { flex: 1, backgroundColor: '#1E1E1E', color: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#333333', fontSize: 15, },
  addButton: { backgroundColor: '#333333', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 12, },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15, },
  finishButton: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#333333' },
  finishButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});