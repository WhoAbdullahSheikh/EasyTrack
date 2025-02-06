import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  ActivityIndicator, 
  Image, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import  Ionicons  from 'react-native-vector-icons/Ionicons'; 

const U_SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const usersCollection = firestore().collection('Users');

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword || !phoneNumber) {
      showModal('Please fill all fields');
    } else if (password !== confirmPassword) {
      showModal('Passwords do not match');
    } else if (phoneNumber.length !== 10) {
      showModal('Phone number must be 10 digits');
    } else {
      setIsLoading(true); 
      try {
        const snapshot = await usersCollection.where('email', '==', email).get();

        if (!snapshot.empty) {
          showModal('Email already exists');
        } else {
          await usersCollection.add({
            name: name,
            email: email,
            password: password,
            phoneNumber: '+92' + phoneNumber,
          });

          Alert.alert('Sign Up Success', 'Account created successfully');
          navigation.navigate('Login');
        }
      } catch (error) {
        showModal(error.message);
      } finally {
        setIsLoading(false); 
      }
    }
  };

  const handlePhoneChange = (text) => {
    if (text.length <= 10 && /^[0-9]*$/.test(text)) {
      setPhoneNumber(text);
    }
  };

  const showModal = (message) => {
    setErrorMessage(message);
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {}
        <View style={styles.topSheet}>
          <Image
            source={require('../../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number (without +92)"
          placeholderTextColor="#888"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          maxLength={10}
        />

        {}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} 
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#888" />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword} 
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('U_Login')}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>

        {}
        <TouchableOpacity style={styles.accountTypeButton} onPress={() => navigation.navigate('Options')}>
          <Text style={styles.accountTypeButtonText}>Change Account Type</Text>
        </TouchableOpacity>
      </ScrollView>

      {}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#1a81f0" style={styles.loading} />
            ) : (
              <>
                <Image
                  source={require('../../../assets/warn.png')} 
                  style={styles.image}
                  resizeMode="contain"
                />
                <Text style={styles.modalText}>{errorMessage}</Text>
              </>
            )}

            <TouchableOpacity style={styles.modalButton} onPress={hideModal}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    padding: 20,
  },
  topSheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a81f0',
    zIndex: 1,
    paddingTop: 20,
  },
  logo: {
    width: 250, 
    height: 60, 
  },
  title: {
    fontSize: 32,
    fontFamily: 'Raleway-Bold',
    marginTop: 150, 
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    color: "black",
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  button: {
    backgroundColor: '#1a81f0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
  },
  link: {
    color: '#1a81f0',
    marginTop: 20,
    fontSize: 14,
    fontFamily: 'Raleway-Regular',
  },
  accountTypeButton: {
    backgroundColor: '#f25e65', 
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  accountTypeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20, 
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  image: {
    width: 130,
    height: 130,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    fontFamily: 'Raleway-Bold',
    marginBottom: 20,
  },
  loading: {
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#f25e65',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontFamily: 'Raleway-Regular',
    fontSize: 16,
  },
});

export default U_SignUpScreen;
