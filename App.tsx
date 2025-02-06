import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, ActivityIndicator, View } from "react-native";
import MainAppScreen from "./MainAppScreen";
import OptionsScreen from "./src/screens/OptionsScreen";
import U_LoginScreen from "./src/screens/User/U_LoginScreen";
import U_SignUpScreen from "./src/screens/User/U_SignUpScreen";
import RoutesScreen from "./src/screens/User/navigations/RoutesScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileSettingsScreen from "./src/screens/User/navigations/ProfileSettingsScreen";
import D_SignUpScreen from "./src/screens/Driver/D_SignUpScreen";
import D_LoginScreen from "./src/screens/Driver/D_LoginScreen";
import DriverMainAppScreen from "./DriverMainAppScreen";
import CompletedStopsScreen from "./src/screens/Driver/navigations/CompletedStopsScreen";
import D_ProfileSettingsScreen from "./src/screens/Driver/navigations/D_ProfileSettingsScreen";
import D_ForgotPasswordScreen from "./src/screens/Driver/navigations/D_ForgotPasswordScreen";
import U_ForgotPasswordScreen from "./src/screens/User/navigations/U_ForgotPasswordScreen";

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Options");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userSession = await AsyncStorage.getItem("userSession");
        console.log("User Session:", userSession);

        if (userSession) {
          setInitialRoute("MainApp");
          return;
        }

        const driverSession = await AsyncStorage.getItem("driverSession");
        console.log("Driver Session:", driverSession);

        if (driverSession) {
          setInitialRoute("DriverMainApp");
          return;
        }

        setInitialRoute("Options");
      } catch (error) {
        console.error("Error checking session", error);
        setInitialRoute("Options");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a81f0" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="default" />

      <Stack.Navigator initialRouteName={initialRoute}>
        {/* Options Screen */}
        <Stack.Screen
          name="Options"
          component={OptionsScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* User Login Screen */}
        <Stack.Screen
          name="U_Login"
          component={U_LoginScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Driver Login Screen */}
        <Stack.Screen
          name="D_Login"
          component={D_LoginScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* User and Driver SignUp Screens */}
        <Stack.Screen
          name="U_SignUp"
          component={U_SignUpScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="D_SignUp"
          component={D_SignUpScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Main App Screens */}
        <Stack.Screen
          name="MainApp"
          component={MainAppScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Driver Main App Screen */}
        <Stack.Screen
          name="DriverMainApp"
          component={DriverMainAppScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Other Screens */}
        <Stack.Screen
          name="Routes"
          component={RoutesScreen}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ProfileSettings"
          component={ProfileSettingsScreen}
          options={{
            headerShown: true,
            headerTitle: "Profile Settings",
            headerStyle: {
              backgroundColor: "#1a81f0",
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
            },
            headerTintColor: "white",
            headerTitleStyle: {
              fontFamily: "Raleway-Bold",
              fontSize: 20,
            },
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="DProfileSettings"
          component={D_ProfileSettingsScreen}
          options={{
            headerShown: true,
            headerTitle: "Profile Settings",
            headerStyle: {
              backgroundColor: "#fa9837",
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
            },
            headerTintColor: "white",
            headerTitleStyle: {
              fontFamily: "Raleway-Bold",
              fontSize: 20,
            },
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={D_ForgotPasswordScreen}
          options={{
            headerShown: true,
            headerTitle: "Profile Settings",
            headerStyle: {
              backgroundColor: "#fa9837",
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
            },
            headerTintColor: "white",
            headerTitleStyle: {
              fontFamily: "Raleway-Bold",
              fontSize: 20,
            },
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="UForgotPassword"
          component={U_ForgotPasswordScreen}
          options={{
            headerShown: true,
            headerTitle: "Profile Settings",
            headerStyle: {
              backgroundColor: "#1a81f0",
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
            },
            headerTintColor: "white",
            headerTitleStyle: {
              fontFamily: "Raleway-Bold",
              fontSize: 20,
            },
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="CompStops"
          component={CompletedStopsScreen}
          options={{
            headerShown: true,
            headerTitle: "Stops Assigned",
            headerStyle: {
              backgroundColor: "#fa9837",
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
            },
            headerTintColor: "white",
            headerTitleStyle: {
              fontFamily: "Raleway-Bold",
              fontSize: 20,
            },
            headerTitleAlign: "center",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
