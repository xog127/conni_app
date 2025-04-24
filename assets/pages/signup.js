// LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox, HStack, Link } from 'native-base';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      Alert.alert('Error', 'Please accept both the Terms & Conditions and Privacy Policy');
      return;
    }

    try {
      setLoading(true);
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('user', JSON.stringify(userCredential.user));
 
        // You can also store additional user data in Firestore here
      // const userDoc = doc(db, 'users', user.uid);
      // await setDoc(userDoc, {
      //   name,
      //   email,
      //   createdAt: serverTimestamp(),
      // });

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={styles.checkboxContainer}>
          <HStack space={2} alignItems="flex-start">
            <Checkbox
              value="terms"
              isChecked={termsAccepted}
              onChange={setTermsAccepted}
              accessibilityLabel="Accept terms and conditions"
            />
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text style={styles.linkText} onPress={() => navigation.navigate('Terms')}>
                Terms & Conditions
              </Text>
            </Text>
          </HStack>
        </View>

        <View style={styles.checkboxContainer}>
          <HStack space={2} alignItems="flex-start">
            <Checkbox
              value="privacy"
              isChecked={privacyAccepted}
              onChange={setPrivacyAccepted}
              accessibilityLabel="Accept privacy policy"
            />
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text style={styles.linkText} onPress={() => navigation.navigate('Privacy')}>
                Privacy Policy
              </Text>
            </Text>
          </HStack>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#836FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signupLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.signupText}>
            Already have an account? <Text style={styles.signupTextBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#836FFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#6A707C',
  },
  signupTextBold: {
    color: '#6A707C',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    marginBottom: 15,
  },
  checkboxText: {
    fontSize: 14,
    color: '#6A707C',
    flex: 1,
  },
  linkText: {
    color: '#6A707C',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;