import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CustomDropdown from '../components/dropdown';


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

const OnboardingPage = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    nationality: '',
    universityName: '',
    course: '',
    graduationYear: '',
  });

  const [errors, setErrors] = useState({});

  const validatePage = (pageNumber) => {
    const newErrors = {};

    switch (pageNumber) {
      case 0:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
        break;
      case 1:
        if (!formData.universityName.trim()) newErrors.universityName = 'University name is required';
        if (!formData.course.trim()) newErrors.course = 'Course is required';
        if (!formData.graduationYear.trim()) newErrors.graduationYear = 'Graduation year is required';
        break;
      case 2:
        if (!profileImage) newErrors.profileImage = 'Profile picture is required';
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
        scrollViewRef.current?.scrollTo({ x: width * (currentPage + 1), animated: true });
        setCurrentPage(currentPage + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      scrollViewRef.current?.scrollTo({ x: width * (currentPage - 1), animated: true });
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('Form Data:', formData);
    console.log('Profile Image:', profileImage);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setErrors({ ...errors, profileImage: null });
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
      <SafeAreaView style={styles.container}>
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
          >
            {/* Page 1: Basic Info */}
            <View style={styles.page}>
              <ScrollView>
                {renderInputField('firstName', 'First Name', 'Enter your first name')}
                {renderInputField('lastName', 'Last Name', 'Enter your last name')}
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
                
              </ScrollView>
            </View>

            {/* Page 2: University Details */}
            <View style={styles.page}>
              <ScrollView>
                {renderInputField('universityName', 'University Name', 'Enter your university name')}
                {renderInputField('course', 'Course', 'Enter your course name')}
                {renderInputField('graduationYear', 'Graduation Year', 'YYYY', 'numeric')}
              </ScrollView>
            </View>

            {/* Page 3: Profile Picture */}
            <View style={styles.page}>
              <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                  {profileImage ? (
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