import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform,
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { auth, storage } from '@/services/firebase';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Define TypeScript interfaces
interface ImageInfo {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
  fileName?: string;
}

interface User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

export default function EditProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold
  });

  // Get current user and setup data
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        uid: currentUser.uid
      });
      
      if (currentUser.photoURL) {
        setProfileImage(currentUser.photoURL);
      }
    }
  }, []);

  // Request permissions for image library
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload a profile image.');
        }
      }
    })();
  }, []);

  // Handle profile image selection
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setProfileImage(selectedAsset.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
      console.error('Error picking image:', error);
    }
  };

  // Upload image to Firebase Storage
  const uploadImageAsync = async (uri: string): Promise<string> => {
    setUploading(true);
    
    try {
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create a unique filename
      const filename = `profile_${user?.uid}_${Date.now()}`;
      const storageRef = ref(storage, `profile_images/${filename}`);
      
      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Save profile with new image
  const saveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let photoURL = user.photoURL;
      
      // Only upload if there's a new image and it doesn't match the current photoURL
      if (profileImage && profileImage !== user.photoURL) {
        photoURL = await uploadImageAsync(profileImage);
      }
      
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: photoURL
        });
        
        // Update local state
        setUser({
          ...user,
          photoURL: photoURL
        });
        
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" color="#FF4B3E" style={styles.loader} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <Image 
              source={require('@/assets/images/avatar.png')} 
              style={styles.profileImage}
            />
          )}
          <View style={styles.editIconContainer}>
            <MaterialIcons name="camera-alt" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.infoField}>
          <Text style={styles.infoText}>{user?.displayName || 'User'}</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.infoField}>
          <Text style={styles.infoText}>{user?.email || 'No email available'}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, uploading && styles.disabledButton]} 
        onPress={saveProfile}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FF4B3E',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#FF4B3E',
    marginTop: 5,
  },
  infoContainer: {
    backgroundColor: '#fff',
    marginVertical: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    marginBottom: 5,
    marginTop: 15,
  },
  infoField: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#FF4B3E',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ffb0aa',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  }
});