import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CustomDropdown from '../components/dropdown';
import { useAuth } from '../services/authContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SearchableDropdown from '../components/SearchableDropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ActivityIndicator } from 'react-native';


const SECONDARY_COLOR = "#836FFF";

const { width } = Dimensions.get('window');

// Define dropdown options
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];
const countryOptions = [
  { label: 'India', value: 'India' },
  { label: 'UK', value: 'UK' },
  { label: 'USA', value: 'USA' },
];
const universityOptions = [
  { label: 'Imperial College London', value: 'Imperial College London' },
  { label: 'University College London', value: 'University College London' },
  { label: "King's College London", value: "King's College London" },
  { label: 'University Arts London', value: 'University Arts London' },
];

const courseOptions = [
  { label: 'BSc Psychology', value: 'BSc Psychology' },
  { label: 'BSc Mathematics', value: 'BSc Mathematics' },
  { label: 'BSc Computer Science', value: 'BSc Computer Science' },
];

import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // adjust if needed

// 🔽 PLACE THIS RIGHT HERE
const checkUsernameExists = async (username) => {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};


const OnboardingPage = ({ navigation }) => {
  const { user, updateProfile, completeOnboarding } = useAuth();
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [courseQuery, setCourseQuery] = useState('');
  const filteredCourseOptions = courseOptions.filter((course) =>
    course.label.toLowerCase().includes(courseQuery.toLowerCase())
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fixed property names to match with what's being rendered
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    gender: '',
    nationality: '',
    university: '',
    course: '',
    graduation_year: '',
  });
  useEffect(() => {
    if (!formData.username.trim()) {
      return;
    }
  
    const timeout = setTimeout(async () => {
      const taken = await checkUsernameExists(formData.username);
      if (taken) {
        setErrors((prev) => ({ ...prev, username: 'This username is already taken' }));
      } else {
        setErrors((prev) => ({ ...prev, username: null }));
      }
    }, 500); // 500ms debounce
  
    return () => clearTimeout(timeout); // clear previous timer
  }, [formData.username]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Request permissions on component mount for Android
    if (Platform.OS === 'android') {
      (async () => {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      })();
    }
  }, []);

  const validatePage = (pageNumber) => {
    const newErrors = {};

    switch (pageNumber) {
      case 0:
        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.nationality) newErrors.nationality = 'Nationality is required';
        break;
      case 1:
        if (!formData.university.trim()) newErrors.university = 'University name is required';
        if (!formData.course.trim()) newErrors.course = 'Course is required';
        if (!formData.graduation_year.trim()) newErrors.graduation_year = 'Graduation year is required';
        
        // Validate graduation year format
        if (formData.graduation_year && !/^\d{4}$/.test(formData.graduation_year)) {
          newErrors.graduation_year = 'Enter a valid 4-digit year';
        }
        break;
      case 2:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenderSelect = (item) => {
    setFormData({ ...formData, gender: item.value });
    setErrors({ ...errors, gender: null });
  };

  const handleCountrySelect = (item) => {
    setFormData({ ...formData, nationality: item.value });
    setErrors({ ...errors, nationality: null });
  };

  const handleNext = () => {
    if (validatePage(currentPage)) {
      if (currentPage < 2) {
        const nextPage = currentPage + 1;
        scrollViewRef.current?.scrollTo({ x: width * nextPage, animated: true });
        setCurrentPage(nextPage);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      scrollViewRef.current?.scrollTo({ x: width * prevPage, animated: true });
      setCurrentPage(prevPage);
    }
  };

  const handleSubmit = async () => {
    const usernameTaken = await checkUsernameExists(formData.username);
    if (usernameTaken) {
      setErrors((prev) => ({ ...prev, username: 'This username is already taken' }));
      return;
    }
    try {
      await updateProfile({
        ...formData,
        displayName:`${formData.first_name} ${formData.last_name}`,
        profileImage: profileImage,
      });
      await completeOnboarding();
      navigation.navigate('MainPage');
    } catch (error) {
      console.error('Error submitting profile:', error);
      alert('Failed to submit profile. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsSubmitting(true);
        const uri = result.assets[0].uri;
        const imageUrl = await uploadImageToFirebase(uri);
        setProfileImage(imageUrl);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to process image.');
      setIsSubmitting(false);
    }
  };

  const uploadImageToFirebase = async (uri) => {
    try {
      const storage = getStorage();
      const filename = `user_images/${Date.now()}`;
      const storageRef = ref(storage, filename);
      
      const response = await fetch(uri);
      const blob = await response.blob();
      
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            currentPage >= index && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderInputField = (field, label, placeholder, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        placeholder={placeholder}
        value={formData[field]}
        onChangeText={(text) => {
          setFormData({ ...formData, [field]: text });
          setErrors({ ...errors, [field]: null });
        }}
        keyboardType={keyboardType}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              {currentPage > 0 && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Feather name="arrow-left" size={24} color="#111827" />
                </TouchableOpacity>
              )}
              <Text style={styles.headerTitle}>Create Profile</Text>
            </View>

            {renderProgressBar()}

            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
            >
              {/* Page 1: Basic Info */}
              <View style={styles.page}>
                <KeyboardAwareScrollView
                  enableOnAndroid
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ flexGrow : 1 }}
                >
                  {renderInputField('first_name', 'First Name', 'Enter your first name')}
                  {renderInputField('last_name', 'Last Name', 'Enter your last name')}
                  {renderInputField('username', 'Username', 'Choose a unique username')}
                  <CustomDropdown
                    label="Gender"
                    data={genderOptions}
                    value={formData.gender}
                    onSelect={handleGenderSelect}
                    placeholder="Select gender"
                    required={true}
                    errorText={errors.gender}
                    containerStyle={styles.dropdownContainer}
                    labelStyle={styles.label}
                  />
                  <CustomDropdown
                    label="Nationality"
                    data={countryOptions}
                    value={formData.nationality}
                    onSelect={handleCountrySelect}
                    placeholder="Select Nationality"
                    required={true}
                    errorText={errors.nationality}
                    containerStyle={styles.dropdownContainer}
                    labelStyle={styles.label}
                  />
                </KeyboardAwareScrollView>
              </View>

              {/* Page 2: University Details */}
              <View style={styles.page}>
                <KeyboardAwareScrollView
                  enableOnAndroid
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ flexGrow : 1 }}
                >
                  <CustomDropdown
                    label="University"
                    data={universityOptions}
                    value={formData.university}
                    onSelect={(item) => {
                      setFormData({ ...formData, university: item.value });
                      setErrors({ ...errors, university: null });
                    }}
                    placeholder="Select university"
                    required={true}
                    errorText={errors.university}
                    containerStyle={styles.dropdownContainer}
                    labelStyle={styles.label}
                  />
                  <SearchableDropdown
                    label="Course"
                    data={courseOptions}
                    value={formData.course}
                    onSelect={(item) => {
                      setFormData({ ...formData, course: item.value });
                      setErrors({ ...errors, course: null });
                    }}
                    placeholder="Search your course"
                    errorText={errors.course}
                  />
                  {renderInputField('graduation_year', 'Graduation Year', 'YYYY', 'numeric')}
                </KeyboardAwareScrollView>
              </View>

              {/* Page 3: Profile Picture */}
              <View style={styles.page}>
                <View style={styles.profileImageContainer}>
                  <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                    {isSubmitting ? (
                      <View style={styles.spinnerContainer}>
                        <ActivityIndicator size="large" color={SECONDARY_COLOR} />
                        <Text style={styles.placeholderText}>Uploading...</Text>
                      </View>
                    ) : profileImage ? (
                      <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <Feather name="camera" size={40} color="#9CA3AF" />
                        <Text style={styles.placeholderText}>Add Profile Picture</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {errors.profileImage && (
                    <Text style={styles.errorText}>{errors.profileImage}</Text>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: SECONDARY_COLOR }]}
                onPress={handleNext}
              >
                <Text style={styles.buttonText}>
                  {currentPage === 2 ? 'Submit' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: SECONDARY_COLOR,
  },
  page: {
    width,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  imagePickerButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
});

export default OnboardingPage;