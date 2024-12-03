import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const SharePDF = ({ route }) => {
  const { memory } = route.params || {};

  const generatePDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                padding: 0;
              }
              .container {
                text-align: center;
              }
              .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333333;
              }
              .date {
                font-size: 16px;
                color: #555555;
                margin-bottom: 20px;
              }
              .description {
                font-size: 16px;
                color: #444444;
                margin-top: 20px;
                line-height: 1.5;
              }
              .image-container {
                margin: 20px 0;
              }
              .image {
                max-width: 50%;
                height: auto;
                border-radius: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="title">${memory.title || "Untitled Memory"}</h1>
              <p class="date">${new Date(memory.actual_date).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              )}</p>
              <div class="image-container">
                <img src="${memory.file_url}" alt="Memory Image" class="image" />
              </div>
              <p class="description">${
                memory.description || "No description provided."
              }</p>
            </div>
          </body>
        </html>
      `;

      // Generate the PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      Alert.alert("PDF Generated", `File saved at: ${uri}`);

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Sharing Not Available", "PDF saved locally but cannot be shared.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Save as PDF</Text>
      <TouchableOpacity style={styles.saveButton} onPress={generatePDF}>
        <Text style={styles.buttonText}>Generate PDF</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#19747E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SharePDF;


