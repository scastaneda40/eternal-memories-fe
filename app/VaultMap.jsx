import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRoute, useNavigation } from "@react-navigation/native";

const VaultMap = () => {
  const route = useRoute();
  console.log('duh vault route', route)
  const navigation = useNavigation();
  const { memories = [] } = route.params || {}; // Safely access memories

  console.log('route params vault map', route.params)

  return (
    <View style={styles.container}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
            latitude: 39.8283, // Geographic center of the contiguous US
            longitude: -98.5795, // Geographic center of the contiguous US
            latitudeDelta: 25, // Reduced to zoom in closer
            longitudeDelta: 35, // Reduced to zoom in closer
          }}
      >
        {memories
          .filter((memory) => memory.location?.coordinates) // Ensure location exists
          .map((memory) => {
            const [longitude, latitude] = memory.location.coordinates; // Extract coordinates
            return (
              <Marker
                key={memory.id}
                coordinate={{ latitude, longitude }}
                title={memory.title || "Untitled Memory"}
                description={memory.description || "No description provided"}
                onPress={() => navigation.navigate("MemoryDetail", { memory })}
              />
            );
          })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default VaultMap;


