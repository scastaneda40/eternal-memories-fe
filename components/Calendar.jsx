import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(6); // Initially select "6"
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = [2, 3, 4, 5, 6, 7, 8]; // Corresponding dates for the week

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.row}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayDateContainer,
              selectedDate === dates[index] && styles.activeContainer,
            ]}
            onPress={() => setSelectedDate(dates[index])}
          >
            <Text
              style={[
                styles.dayText,
                selectedDate === dates[index] && styles.activeText,
              ]}
            >
              {day}
            </Text>
            <Text
              style={[
                styles.dateText,
                selectedDate === dates[index] && styles.activeText,
              ]}
            >
              {dates[index]}
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




