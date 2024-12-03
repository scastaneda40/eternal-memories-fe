import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const SharingModal = ({ isVisible, onClose, memory }) => {
  const navigation = useNavigation();

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Share Memory</Text>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onClose();
              navigation.navigate("ShareDetailComponent", { memory });
            }}
          >
            <Text style={styles.buttonText}>Share Link</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onClose();
              navigation.navigate("SharePDFComponent", { memory });
            }}
          >
            <Text style={styles.buttonText}>Share as PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: "#19747E",
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#BBBBBB",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SharingModal;
