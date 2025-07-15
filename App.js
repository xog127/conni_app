// Import necessary components and Firebase
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './assets/pages/login';
import SignupScreen from './assets/pages/signup';
import ForgotPasswordScreen from './assets/pages/forgot-password';
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
import { TouchableOpacity, Platform, StyleSheet, View, Text } from 'react-native';
import CustomDrawerContent from './assets/customFunctions/CustomDrawerContent';
import UserSettingsScreen from './assets/pages/setting';
import ProfileEditScreen from './assets/pages/editProfile';
import AllChats from './assets/pages/allChats';
import CreateChat from './assets/pages/createChat';
import ChatRoom from './assets/pages/chatRoom';
import ChatInfo from './assets/pages/chatInfo';
import ForumScreen from './assets/pages/ForumScreen';
import NewSearchScreen from './assets/pages/NewSearchScreen';
import NotificationScreen from './assets/pages/notification';
import { NativeBaseProvider, Box } from 'native-base';


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
  <PostStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <PostStack.Screen 
      name="MainFeed" 
      component={DrawerNavigator} 
    />
    <PostStack.Screen 
      name="Search" 
      component={NewSearchScreen} 
      options={{ 
        presentation: 'modal',
      }}
    />
    <PostStack.Screen 
      name="Notification" 
      component={NotificationScreen}
      options={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      } 
      }
    />
    <PostStack.Screen 
      name="PostDisplay" 
      component={PostDisplay}
      options={{ 
        presentation: 'card',
        tabBarVisible: false
      }}
    />
    <PostStack.Screen 
      name="createPost" 
      component={CreatePostForm}
      options={{ 
        presentation: 'modal',
        animation: 'slide_from_bottom'
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
      name="forgot-password" 
      component={ForgotPasswordScreen} 
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

// Create Button Component
const CreateButton = ({ navigation }) => (
  <TouchableOpacity 
    onPress={() => {
      navigation.navigate('Home', {
        screen: 'createPost'
      });
    }} 
    style={styles.createButton}
  >
    <View style={styles.createButtonInner}>
      <Ionicons name="add" size={32} color="#FFFFFF" />
    </View>
  </TouchableOpacity>
);

// Main Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route, navigation }) => ({
      tabBarHideOnKeyboard: true,
      tabBarActiveTintColor: '#836FFF',
      tabBarInactiveTintColor: '#666',
      tabBarLabelStyle: {
        fontSize: 12,
        marginBottom: 4,
      },
      tabBarStyle: ((state) => {
        const navigationState = navigation.getState();
        const currentRouteName = navigationState.routes[navigationState.index].state?.routes?.slice(-1)[0]?.name;

        const hideTabBarRoutes = [
          'Search',
          'Notification',
          'PostDisplay',
          'createPost',
          'IndividualForum',
          'Chatroom',
          'CreateChat',
          'Chatinfo',
          'EditProfile',
          'Setting',
          'Feedback'
        ];

        if (hideTabBarRoutes.includes(currentRouteName)) {
          return { display: 'none' };
        }

        return {
          display: 'flex',
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        };
      })(),
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Chats') {
          iconName = focused ? 'chatbubble' : 'chatbubble-outline';
        } else if (route.name === 'Create') {
          return null; // Custom create button will be rendered separately
        } else if (route.name === 'Forums') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={24} color={color} />;
      },
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={PostStackNavigator}
      options={{ headerShown: false }}
    />
    <Tab.Screen 
      name="Chats" 
      component={ChatStackNavigator}
      options={{ headerShown: false }}
    />
    <Tab.Screen 
      name="Create" 
      component={EmptyComponent}
      options={({ navigation }) => ({
        headerShown: false,
        tabBarButton: () => (
          <CreateButton navigation={navigation} />
        ),
        tabBarLabel: () => null,
      })}
    />
    <Tab.Screen 
      name="Forums" 
      component={ForumStackNavigator}
      options={{ headerShown: false }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStackNavigator}
      options={{ headerShown: false }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  createButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#836FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#836FFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

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