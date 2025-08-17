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
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';

import { BackHandler } from 'react-native';
import * as Notifications from 'expo-notifications';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true, // Changed to true for badge support
  }),
});

// Patch to prevent crash on deprecated usage
if (!BackHandler.removeEventListener) {
  BackHandler.removeEventListener = () => {};
}

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
      name="AllChats" 
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
      name="Notification" 
      component={NotificationScreen}
      options={{ 
        headerShown: false,
        tabBarVisible: false
      }}
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
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          height: 60,
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
          return null;
        } else if (route.name === 'Search') {
          return <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />;
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
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          console.log('Home tab pressed, currently focused:', navigation.isFocused());
          if (navigation.isFocused()) {
            e.preventDefault();
            
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Home',
                    state: {
                      routes: [
                        {
                          name: 'MainFeed',
                          params: {
                            scrollToTop: true,
                            refresh: true,
                            timestamp: Date.now()
                          }
                        }
                      ]
                    }
                  }
                ]
              })
            );
          }
        },
      })}
    />
    <Tab.Screen
      name="Chats"
      component={ChatStackNavigator}
      options={{ headerShown: false, unmountOnBlur: true }}
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          e.preventDefault();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'Chats',
                  state: {
                    routes: [{ name: 'AllChats' }],   
                  },
                },
              ],
            })
          );
        },
      })}
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
      name="Search" 
      component={NewSearchScreen}
      options={{ headerShown: false}}
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

// Push notification functions
const registerForPushNotificationsAsync = async (userId) => {
  try {
    console.log('🔍 Getting push notification permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Push notification permission denied');
      return null;
    }
    
    console.log('🎫 Getting Expo push token...');
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '080aeb66-6827-48e4-b7bc-8035d863a5cb'
    });
    
    const token = tokenData.data;
    console.log('✅ Expo Push Token obtained:', token.substring(0, 50) + '...');
    
    // Store the token in Firestore
    if (userId && token) {
      await savePushTokenToFirestore(userId, token);
    }
    
    return token;
    
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    return null;
  }
};

const savePushTokenToFirestore = async (userId, pushToken) => {
  try {
    const { doc, setDoc } = require('firebase/firestore');
    const { db } = require('./assets/firebase/firebaseConfig');
    
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      expoPushToken: pushToken,
      tokenUpdatedAt: new Date()
    }, { merge: true });
    
    console.log('✅ Push token saved to Firestore');
  } catch (error) {
    console.error('❌ Error saving push token:', error);
  }
};


// Root Navigator - Fixed push notification handling
const RootNavigator = () => {
  const { login, user, isAuthenticated } = useAuth();
  const navigationRef = useRef(null);
  const tokenRegistered = useRef(false); // Track if token is already registered
  
  // Enhanced notification handling with proper dependency management
  useEffect(() => {
    let notificationListener;
    let responseListener;

    // Register for push notifications only once when user is authenticated
    if (isAuthenticated && user?.uid && !tokenRegistered.current) {
      console.log('🔄 Registering for push notifications (first time)...');
      registerForPushNotificationsAsync(user.uid)
        .then(() => {
          tokenRegistered.current = true; // Mark as registered
          console.log('✅ Push notification registration complete');
        })
        .catch((error) => {
          console.error('❌ Failed to register for push notifications:', error);
        });
    }

    // Listen for notifications received while app is running
    notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received while app is open:', notification);
      
      // You can add custom logic here for in-app notification display
      // For example, showing a banner or updating badge count
    });

    // Listen for user tapping on notifications
    responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 User tapped notification:', response);
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener) {
        // Use the new method to avoid deprecation warning
        notificationListener.remove();
      }
      if (responseListener) {
        // Use the new method to avoid deprecation warning
        responseListener.remove();
      }
    };
  }, [isAuthenticated, user?.uid]); // Only depend on authentication state and user ID

  // Reset token registration flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      tokenRegistered.current = false;
    }
  }, [isAuthenticated]);

  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    console.log('📱 Handling notification tap with data:', data);
    
    if (!navigationRef.current) {
      console.log('❌ Navigation ref not available');
      return;
    }

    // Handle different notification types
    switch (data.type) {
      case 'post_interaction':
        if (data.postId) {
          console.log('📍 Navigating to post:', data.postId);
          navigationRef.current.navigate('MainTabs', {
            screen: 'Home',
            params: {
              screen: 'PostDisplay',
              params: {
                postRef: data.postId,
              }
            }
          });
        }
        break;
        
      case 'message':
        console.log('📍 Navigating to messages');
        if (data.chatId) {
          navigationRef.current.navigate('MainTabs', {
            screen: 'Chats',
            params: {
              screen: 'Chatroom',
              params: {
                chatId: data.chatId,
                recipientId: data.senderId,
              }
            }
          });
        } else {
          navigationRef.current.navigate('MainTabs', {
            screen: 'Chats'
          });
        }
        break;
        
      default:
        console.log('📍 Navigating to notifications screen');
        navigationRef.current.navigate('MainTabs', {
          screen: 'Home',
          params: {
            screen: 'Notification'
          }
        });
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && user ? (
          user.isOnboarded ? (
            <>
              <Stack.Screen name="MainTabs" component={TabNavigator} />
              <Stack.Screen name="MainPage" component={MainPage} />
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
    </NavigationContainer>
  );
};

// Main App component
export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <NativeBaseProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </NativeBaseProvider>
    </SafeAreaView>
  );
}