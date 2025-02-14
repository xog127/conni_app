// Import necessary components and Firebase
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth } from './assets/firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useState, useEffect, useContext } from 'react';
import LoginScreen from './assets/pages/login';
import SignupScreen from './assets/pages/signup';
import PostDisplay from './assets/pages/postDisplay';
import CreatePostForm from './assets/pages/createPost';
import ForumsPage from './assets/pages/forum';
import OnboardingPage from './assets/pages/onboarding';
import { Feather } from '@expo/vector-icons';
import { AuthProvider } from './assets/services/authContext';
import { AuthContext } from './assets/services/authContext';


// Create navigation stacks
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();


// Auth Stack Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{ headerShown: false }}
    />
    <AuthStack.Screen 
      name="Signup" 
      component={SignupScreen} 
      options={{ headerShown: false }}
    />
    {/* <AuthStack.Screen 
      name="ForgotPassword" 
      component={ForgotPasswordScreen} 
      options={{ headerShown: false }}
    /> */}
  </AuthStack.Navigator>
);

// Main Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="CreatePost" 
      component={CreatePostForm}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Feather name="plus" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Display" 
      component={PostDisplay}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Feather name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Forums" 
      component={ForumsPage}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Feather name="person" size={size} color={color} />
        ),
      }}
    /> 
    <Tab.Screen 
      name="user" 
      component={OnboardingPage}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Feather name="heart" size={size} color={color} />
        ),
      }}
    /> 
  </Tab.Navigator>
);

// Main Stack Navigator (for screens that shouldn't be in tabs)
const MainStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MainTabs" 
      component={TabNavigator}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);



// Root Navigator - Handles authentication flow
const RootNavigator = () => {
  const { user} = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainStackNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

// Main App component
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

