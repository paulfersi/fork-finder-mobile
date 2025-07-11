import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from './lib/supabase';

import FeedScreen from './screens/Core/FeedScreen';
import AddReviewScreen from './screens/Core/AddReviewScreen';
import MyAccountScreen from './screens/Core/MyAccountScreen';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import SearchProfileScreen from './screens/Core/SearchProfileScreen';
import PublicProfileScreen from './screens/Core/PublicProfileScreen';
import MapViewScreen from './screens/Core/MapViewScreen';
import ExploreScreen from './screens/Core/ExploreScreen';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function MainAppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Add Review" component={AddReviewScreen} />
      <Tab.Screen name="Search" component={SearchProfileScreen} />
      <Tab.Screen name="Account" component={MyAccountScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  //if there is a session display MainAppTabs otherwise AuthStack
  return (
    <NavigationContainer>
      {session ? (
        <RootStack.Navigator>
          <RootStack.Screen
            name="Tabs"
            component={MainAppTabs}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="PublicProfile"
            component={PublicProfileScreen}
            options={{ title: 'Profile' }}
          />
          <RootStack.Screen
            name="MapView"
            component={MapViewScreen}
            options={{ title: 'Map' }}
          />

        </RootStack.Navigator>
      ) : (
        <AuthStack.Navigator>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
