// Import necessary components and Firebase
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { createContext, useState, useEffect, useContext } from 'react';
import LoginScreen from './assets/pages/login';
import SignupScreen from './assets/pages/signup';
import PostDisplay from './assets/pages/postDisplay';
import CreatePostForm from './assets/pages/createPost';
import MainPage from './assets/pages/mainPage';
import {Ionicons, FontAwesome, Feather } from '@expo/vector-icons';

// Create navigation stacks
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

// Create Authentication Context
const AuthContext = createContext({
  user: null,
  loading: true,
});

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
      name="MainPage" 
      component={MainPage}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        ),
      }}
    />
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
    {/* <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
      }}
    /> */}
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

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const auth = getAuth();
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({
        user,
        loading: false,
      });
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {!state.loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Root Navigator - Handles authentication flow
const RootNavigator = () => {
  const { user, loading } = useAuth();

  // Option 1: Show loading indicator directly in the navigator
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

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