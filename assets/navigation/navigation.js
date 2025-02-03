import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

// Create navigation stacks
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab navigator component
const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="Home" 
      component={PostDisplay} 
      options={{
        headerShown: false,
        title: 'Home'
      }}
    />
    <Tab.Screen 
      name="New Post" 
      component={CreatePostForm}
      options={{
        headerShown: false,
        title: 'Profile'
      }}
    />
  </Tab.Navigator>
);

