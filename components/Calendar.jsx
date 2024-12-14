import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(null); // Random date highlighted
  const [currentWeek, setCurrentWeek] = useState([]);

  useEffect(() => {
    const getCurrentWeek = () => {
      const today = new Date();
      const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
      const week = Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(firstDayOfWeek);
        date.setDate(firstDayOfWeek.getDate() + index);
        return {
          day: date.toLocaleDateString("en-US", { weekday: "short" }), // e.g., "Sun"
          date: date.getDate(), // e.g., 2 (day of the month)
        };
      });
      setCurrentWeek(week);

      // Set a random date from the week as the initially selected date
      const randomIndex = Math.floor(Math.random() * week.length);
      setSelectedDate(week[randomIndex].date);
    };

    getCurrentWeek();
  }, []);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.row}>
        {currentWeek.map(({ day, date }, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayDateContainer,
              selectedDate === date && styles.activeContainer,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDate === date && styles.activeText,
              ]}
            >
              {day}
            </Text>
            <Text
              style={[
                styles.dateText,
                selectedDate === date && styles.activeText,
              ]}
            >
              {date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayDateContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 60,
    borderRadius: 8,
  },
  activeContainer: {
    backgroundColor: "#19747E",
    borderRadius: 8,
    width: 50,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
  },
  dateText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  activeText: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default Calendar;
