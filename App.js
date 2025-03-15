// Import necessary components and Firebase
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './assets/pages/login';
import SignupScreen from './assets/pages/signup';
import PostDisplay from './assets/pages/postDisplay';
import CreatePostForm from './assets/pages/createPost';
import MainPage from './assets/pages/mainPage';
import {Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import ProfileScreen from './assets/pages/profile';
import ForumsPage from './assets/pages/forum';
import OnboardingPage from './assets/pages/onboarding';
import Setting from './assets/pages/setting';
import Feedback from './assets/pages/feedback';
import { AuthProvider, AuthContext, useAuth } from './assets/services/authContext';
import { TouchableOpacity } from 'react-native';
import createPostNew from './assets/pages/createPostNew';
import CreatePostNew from './assets/pages/createPostNew';
import CustomDrawerContent from './assets/customFunctions/CustomDrawerContent';
import UserSettingsScreen from './assets/pages/setting';
import ProfileEditScreen from './assets/pages/editProfile';


// Create navigation stacks
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const ForumStack = createStackNavigator();
const PostStack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Profile Stack Navigator (for nested profile screens)
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="ProfileMain" 
      component={ProfileScreen} 
      options={{ headerShown: false }}
    />
     <ProfileStack.Screen 
      name="EditProfile" 
      component={ProfileEditScreen}
      options={{ headerShown: false }}
    /> 
    <ProfileStack.Screen 
      name="UserSettings" 
      component={UserSettingsScreen}
      options={{ title: 'Settings' }}/>
          <ProfileStack.Screen 
      name="PostDisplay" 
      component={PostDisplay}
      options={{ headerShown: false }}
    />
  </ProfileStack.Navigator>
);
const DrawerNavigator = () => (
  <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="MainPage" component={MainPage} options={{ headerShown: false }}  />
</Drawer.Navigator>
);

// Forum Stack Navigator (for forum-related screens)
const ForumStackNavigator = () => (
  <ForumStack.Navigator>
    <ForumStack.Screen 
      name="ForumsList" 
      component={ForumsPage} 
      options={{ headerShown: false }}
    />
    <ForumStack.Screen 
      name="Forums" 
      component={ForumsPage}
      options={({ route }) => ({ title: route.params?.forumName || 'Forum' })}
    />
  </ForumStack.Navigator>
);

// Post Stack Navigator (for post-related screens)
const PostStackNavigator = () => (
  <PostStack.Navigator>
    <PostStack.Screen 
      name="Drawer" 
      component={DrawerNavigator} 
      options={{ headerShown: false }}
    />

    <PostStack.Screen 
      name="PostDisplay" 
      component={PostDisplay}
      options={{ headerShown: false }}
    />
    <PostStack.Screen 
      name="createPost" 
      component={CreatePostForm}
      options={{ headerShown: false }}
    />
  </PostStack.Navigator>
);

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
    <AuthStack.Screen
      name = "Setting"
      component = {UserSettingsScreen}
      options = {{headerShown: true}}
      />
    {/* <AuthStack.Screen 
      name="ForgotPassword" 
      component={ForgotPasswordScreen} 
      options={{ headerShown: false }}
    /> */}
  </AuthStack.Navigator>
);

const EmptyComponent = () => null;

// Main Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="Posts" 
      component={PostStackNavigator}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
        name="CreatePost" 
        component={EmptyComponent} // This is just a placeholder
        options={({ navigation }) => ({
          tabBarLabel: 'Create',
          tabBarIcon: ({ color, size }) => (
            <Feather name="plus" size={size} color={color} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => {
                // Navigate to CreatePost screen which is defined in another navigator
                navigation.navigate('Posts', { screen: 'createPost' });
              }}
            />
          ),
        })}
      />
    <Tab.Screen 
      name="Forums" 
      component={ForumStackNavigator}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Feather name="message-circle" size={size} color={color} />
        ),
      }}
    /> 
    <Tab.Screen 
      name="Profile" 
      component={ProfileStackNavigator}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Feather name="user" size={size} color={color} />
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
        <Stack.Screen 
      name="Setting" 
      component={Setting} 
      options={{ headerShown: true, title: "Settings" }} // Show header for Settings
    />
    <Stack.Screen 
      name="Feedback" 
      component={Feedback} 
      options={{ headerShown: true, title: "Feedback" }} // Show header for Settings
  />
    <Stack.Screen 
      name="Onboarding" 
      component={OnboardingPage}
      options={{ headerShown: false, gestureEnabled: false }}
    />
  </Stack.Navigator>
);


// Root Navigator - Handles authentication flow
const RootNavigator = () => {
  const { login, user, isAuthenticated } = useAuth();

  // Show loading screen while checking authentication

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && user ? (
          // Check if user needs onboarding
          (user.isOnboarded ? (<Stack.Screen name="Main" component={MainStackNavigator} />) : (<Stack.Screen 
            name="Onboarding" 
            component={OnboardingPage} 
            options={{ gestureEnabled: false }}
          />))
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