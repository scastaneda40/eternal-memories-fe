import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState(15); // Example: Initially select "15"
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dates = [10, 11, 12, 13, 14, 15, 16]; // Corresponding dates for the week

    return (
        <View style={styles.calendarContainer}>
            <View style={styles.row}>
                {days.map((day, index) => (
                    <View key={day} style={styles.dayDateContainer}>
                        <Text style={styles.dayText}>{day}</Text>
                        <TouchableOpacity
                            style={[
                                styles.dateButton,
                                selectedDate === dates[index] && styles.activeDateButton,
                            ]}
                            onPress={() => setSelectedDate(dates[index])}
                        >
                            <Text
                                style={[
                                    styles.dateText,
                                    selectedDate === dates[index] && styles.activeDateText,
                                ]}
                            >
                                {dates[index]}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    calendarContainer: {
        paddingVertical: 20,
        paddingHorizontal: 15,
        backgroundColor: "#333", // Dark background for contrast
        borderRadius: 15,
        marginHorizontal: 10,
        marginTop: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // Ensures vertical alignment of all elements
    },
    dayDateContainer: {
        alignItems: "center", // Centers day and date within the container
        width: 40, // Consistent width for each day-date pair
        height: 60, // Fix the height to avoid layout shifting
    },
    dayText: {
        color: "#aaa",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 6, // Add consistent spacing below the day
    },
    dateButton: {
        width: 34, // Standard size for all date buttons
        height: 34,
        alignItems: "center",
        justifyContent: "center",
    },
    activeDateButton: {
        backgroundColor: "rgba(25, 116, 126, 0.8)", // Solid teal for the active date
        width: 38, // Slightly wider than unselected dates
        height: 34, // Keep height consistent with unselected dates
        borderRadius: 8, // Slightly rounded corners for rectangular shape
        justifyContent: "center",
        alignItems: "center",
    },
    dateText: {
        color: "#fff", // Default color for unselected dates
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
    activeDateText: {
        color: "#fff", // White text inside active state
        fontWeight: "700",
        fontSize: 16, // Same font size as unselected text
        textAlign: "center",
    },
});

export default Calendar;




