import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 

const OptionsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Top Sheet */}
      <View style={styles.topSheet}>
        <Image
          source={require('../../assets/logo.png')} 
          style={styles.logo}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.UserSignUp}
        onPress={() => navigation.navigate('U_SignUp')} 
      >
        <Icon name="user" size={20} color="#FFF" style={styles.icon} />
        <Text style={styles.buttonText}>Sign In as User</Text>
        <Icon name="chevron-right" size={20} color="#FFF" style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.DriverSignup}
        onPress={() => navigation.navigate('D_SignUp')} 
      >
        <Icon name="truck" size={20} color="#FFF" style={styles.icon} />
        <Text style={styles.buttonText}>Sign In as Driver</Text>
        <Icon name="chevron-right" size={20} color="#FFF" style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'white', 
  },
  topSheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a81f0', 
    paddingTop: 40, 
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, 
  },
  logo: {
    width: 300, 
    height: 80,  
    resizeMode: 'contain',
  },

  UserSignUp: {
    backgroundColor: '#1a81f0', 
    padding: 15,
    borderRadius: 15,
    width: '80%', 
    alignItems: 'center',
    marginBottom: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between',  // Adjusted to space out the icons and text
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10, 
    elevation: 8,  // Increased elevation for Android shadow effect
  },
  DriverSignup: {
    backgroundColor: '#fa9837', 
    padding: 15,
    borderRadius: 15,
    width: '80%', 
    alignItems: 'center',
    flexDirection: 'row', 
    justifyContent: 'space-between',  // Adjusted to space out the icons and text
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10, 
    elevation: 8,  // Increased elevation for Android shadow effect
  },
  buttonText: {
    color: '#FFF', 
    fontSize: 18,
    fontFamily: 'Raleway-Bold', 
    marginLeft: 10, 
  },
  icon: {
    marginRight: 10, 
  },
});

export default OptionsScreen;
