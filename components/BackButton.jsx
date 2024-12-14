import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather"; // Import Feather icons

const BackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
      <Icon name="chevron-left" size={18} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: "#006b6b", // Teal color
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BackButton;



