import React from "react";
import { View, Image, StyleSheet, SafeAreaView, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./src/screens/User/navigations/HomeScreen";
import AccountScreen from "./src/screens/User/navigations/AccountScreen";
import RoutesScreen from "./src/screens/User/navigations/RoutesScreen";

const Tab = createBottomTabNavigator();

const LogoTitle = () => {
  return (
    <View style={styles.logoContainer}>
      <Image source={require("./assets/logo.png")} style={styles.logo} />
    </View>
  );
};

const MainAppScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1a81f0",
        tabBarInactiveTintColor: "black",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopLeftRadius: 30,  
          borderTopRightRadius: 30, 
          borderColor: "#1a81f0",
          borderWidth: 1,
          height: 50,               
          elevation: 5,             
          shadowColor: "#000",      
          shadowOffset: { width: 0, height: -3 }, 
          shadowOpacity: 0.1,       
          shadowRadius: 5,          
          paddingBottom: 5,         
          position: "absolute",     
          bottom: 0,                
          left: 0,
          right: 0,

        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: () => <LogoTitle />,
          headerStyle: {
            backgroundColor: "white",
            borderBottomLeftRadius: 30,  
            borderBottomRightRadius: 30, 
            elevation: 5,                
            shadowColor: "#000",         
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.1,          
            shadowRadius: 5, 

          },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <Tab.Screen
        name="Routes"
        component={RoutesScreen}
        options={{
          tabBarLabel: "Routes",
          tabBarIcon: ({ color, size }) => (
            <Icon name="map-outline" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: "Bus Ride Booking",
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
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => (
            <Icon2 name="account-outline" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: "Accounts",
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
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: "contain",
  },
});

export default MainAppScreen;
