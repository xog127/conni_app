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
import { TouchableOpacity, Platform } from 'react-native';
import CustomDrawerContent from './assets/customFunctions/CustomDrawerContent';
import UserSettingsScreen from './assets/pages/setting';
import ProfileEditScreen from './assets/pages/editProfile';
import AllChats from './assets/pages/allChats';
import CreateChat from './assets/pages/createChat';
import ChatRoom from './assets/pages/chatRoom';
import ChatInfo from './assets/pages/chatInfo';
import ForumScreen from './assets/pages/ForumScreen';
import NewSearchScreen from './assets/pages/NewSearchScreen';
import { NativeBaseProvider } from 'native-base';


// Create navigation stacks
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const ForumStack = createStackNavigator();
const PostStack = createStackNavigator();
const Drawer = createDrawerNavigator();
const ChatStack = createStackNavigator();

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
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    /> 
    <ProfileStack.Screen 
      name="Setting" 
      component={UserSettingsScreen}
      options={{ 
        title: 'Settings',
        tabBarStyle: { display: 'none' }
      }}
    />
    <ProfileStack.Screen 
      name="PostDisplay" 
      component={PostDisplay}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
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
      name="IndividualForum" 
      component={ForumScreen}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    />
        <ForumStack.Screen 
      name="PostDisplay" 
      component={PostDisplay}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    />
  </ForumStack.Navigator>
);

const ChatStackNavigator = () => (
  <ChatStack.Navigator>
    <ChatStack.Screen 
      name="ChatsList" 
      component={AllChats} 
      options={{ headerShown: false }}
    />
    <ChatStack.Screen 
      name="CreateChat" 
      component={CreateChat} 
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    />
    <ChatStack.Screen 
      name="Chatroom" 
      component={ChatRoom} 
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    />
    <ChatStack.Screen 
      name="Chatinfo" 
      component={ChatInfo} 
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    />
  </ChatStack.Navigator>
);

// Post Stack Navigator (for post-related screens)
const PostStackNavigator = () => (
  <PostStack.Navigator>
    <PostStack.Screen 
      name="MainFeed" 
      component={DrawerNavigator} 
      options={{ headerShown: false }}
    />
    <PostStack.Screen 
      name="Search" 
      component={NewSearchScreen} 
      options={{ 
        headerShown: false,
        presentation: 'modal',
        tabBarStyle: { display: 'none' }
      }}
    />
    <PostStack.Screen 
      name="PostDisplay" 
      component={PostDisplay}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    />
    <PostStack.Screen 
      name="createPost" 
      component={CreatePostForm}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
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
  <Tab.Navigator
    screenOptions={({ route, navigation }) => ({
      tabBarHideOnKeyboard: true,
      tabBarStyle: ((state) => {
        const navigationState = navigation.getState();
        
        // Get the current route name
        const currentRouteName = navigationState.routes[navigationState.index].state?.routes?.slice(-1)[0]?.name;

        // List of routes where tab bar should be hidden
        const hideTabBarRoutes = [
          'Search',
          'PostDisplay',
          'createPost',
          'Forums',
          'IndividualForum',
          'Chatroom',
          'CreateChat',
          'Chatinfo',
          'EditProfile',
          'Setting',
          'Feedback'
        ];

        // Hide tab bar if we're in one of the specified routes
        if (hideTabBarRoutes.includes(currentRouteName)) {
          return { display: 'none' };
        }

        // Show tab bar with styling
        return {
          display: 'flex',
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        };
      })()
    })}
  >
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
      component={EmptyComponent}
      options={({ navigation }) => ({
        tabBarLabel: 'Create',
        tabBarIcon: ({ color, size }) => (
          <Feather name="plus" size={size} color={color} />
        ),
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            onPress={() => {
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
      name="Chats" 
      component={ChatStackNavigator}
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


// Root Navigator - Handles authentication flow
const RootNavigator = () => {
  const { login, user, isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated && user ? (
        // Check if user needs onboarding
        user.isOnboarded ? (
          <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen 
          name="Feedback" 
          component={Feedback} 
          options={{ headerShown: true, title: "Feedback" }}
        />
            <Stack.Screen 
      name="IndividualForum" 
      component={ForumScreen}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    />
        <Stack.Screen 
      name="PostDisplay" 
      component={PostDisplay}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    />
        </>
        ) : (
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingPage} 
            options={{ gestureEnabled: false }}
          />
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

// Main App component
export default function App() {
  return (
    <NativeBaseProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </NativeBaseProvider>

  );
}