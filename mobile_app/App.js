/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {createContext, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Dimensions,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {ApplicationProvider} from '@ui-kitten/components';
import * as eva from '@eva-design/eva';

// Import all of the pages of the app
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import ConfirmAccount from './components/ConfirmAccount';
import Login from './components/Login';
import Settings from './components/Settings';

import {UserContext} from './src/context';
// import Ionicons from 'react-native-vector-icons/Ionicons';  // This causes error when trying to install (ask rick)

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Screen() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>prax!</Text>
    </View>
  );
}

function Home() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen
        name="Settings"
        component={Settings}
        // options={{tabBarBadge:  .3}}
      />
    </Tab.Navigator>
  );
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useState({});

  return (
    <UserContext.Provider value={[user, setUser]}>
      <ApplicationProvider {...eva} theme={eva.light}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="ConfirmAccount" component={ConfirmAccount} />
            {/* <Stack.Screen name="Dashboard" component={Dashboard} /> */}
            <Stack.Screen
              name="Home"
              component={Home}
              // component={Dashboard}
              options={{title: 'Mindfulness'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
    </UserContext.Provider>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
