import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { storage, firestore } from '../services/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { useGreenhouseData } from '../hooks/useGreenhouseData';
import { NavigationProp } from '../types/navigation';

export default function WeeklyUpdate() {
  const navigation = useNavigation<NavigationProp>();
  const { data } = useGreenhouseData();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const openCamera = async () => {
    // Add permissions check
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("You need to enable camera permissions to use this feature");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Failed to capture image. Please try again.');
    }
  };

  const saveRecord = async () => {
    if (uploading) return;
    
    try {
      setUploading(true);
      let photoUrl = null;

      if (image) {
        // Upload image to Firebase Storage
        const response = await fetch(image);
        const blob = await response.blob();
        const filename = `greenhouse_${Date.now()}.jpg`;
        const storageRef = ref(storage, `photos/${filename}`);
        
        await uploadBytes(storageRef, blob);
        photoUrl = await getDownloadURL(storageRef);
      }

      // Save record to Firestore
      const record = {
        timestamp: new Date(),
        daysSincePlanting: data.daysSincePlanting || 0,
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        soilMoisture: data.soilMoisture || 0,
        photoUrl,
      };

      await addDoc(collection(firestore, 'weekly-records'), record);
      setImage(null);
      alert('Record saved successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving record:', error);
      alert(`Failed to save record: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Weekly Update</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#166534" />
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.title}>Current Status</Text>
        <View style={styles.statsGrid}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Day</Text>
            <Text style={styles.statValue}>257</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Temperature</Text>
            <Text style={styles.statValue}>29.5°C</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Humidity</Text>
            <Text style={styles.statValue}>62%</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Soil Moisture</Text>
            <Text style={styles.statValue}>430</Text>
          </View>
        </View>


      </View>

      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>Capture Photo</Text>
        {image ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.retakeButton}
              onPress={openCamera}
              disabled={uploading}
            >
              <Text style={styles.buttonText}>
                {uploading ? 'Saving...' : 'Retake Photo'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={openCamera}
            disabled={uploading}
          >
            <Ionicons name="camera" size={24} color="#166534" />
            <Text style={styles.buttonText}>Start Camera</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={[
          styles.saveButton,
          uploading && styles.saveButtonDisabled
        ]}
        onPress={saveRecord}
        disabled={uploading}
      >
        <Text style={styles.saveButtonText}>
          {uploading ? 'Saving...' : 'Save Record'}
        </Text>
        <Text style={styles.saveNote}>
          {image ? 'Record will be saved with photo' : 'You can save a record without taking a photo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 45, // Add this line
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#166534',
  },
  statusCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginTop: 4,
  },

  photoSection: {
    marginBottom: 24,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  saveButton: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  saveButtonText: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '600',
  },
  saveNote: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
});