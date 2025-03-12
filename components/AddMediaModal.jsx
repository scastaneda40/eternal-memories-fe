import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AddMediaModal = ({
  isVisible,
  onClose,
  pickMedia, // ✅ Triggers Image Picker
  openMediaBank, // ✅ Opens Media Bank Modal
  mediaAdded,
}) => {
  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '90%',
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            Add Media
          </Text>

          {/* ✅ Import from Device */}
          <TouchableOpacity style={styles.button} onPress={pickMedia}>
            <MaterialIcons
              name="folder-open"
              size={24}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Import from Device</Text>
          </TouchableOpacity>

          {/* ✅ Select from Media Bank */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#555' }]}
            onPress={openMediaBank}
          >
            <MaterialIcons
              name="photo-library"
              size={24}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Select from Media Bank</Text>
          </TouchableOpacity>

          {/* ❌ Close Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#ddd' }]}
            onPress={onClose}
          >
            <Text style={{ color: '#333', fontSize: 16 }}>❌ Close</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Success Message */}
        {mediaAdded && (
          <View
            style={{
              position: 'absolute',
              bottom: 10,
              width: '90%',
              backgroundColor: 'green',
              padding: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              ✅ Media Added Successfully!
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

// ✅ Styles
const styles = {
  button: {
    backgroundColor: '#19747E',
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
};

export default AddMediaModal;
