import React, { useState, useRef, useEffect } from 'react';
import { TextInput, Button, StyleSheet, ImageBackground, View, Dimensions, TouchableOpacity, ScrollView, RefreshControl, Text, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Link, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const translations = {
  English: {
    register: 'Register',
    usernamePlaceholder: 'Username',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    registerButton: 'Register',
    alreadyHaveAccount: 'Already have an account? Login here',
    allFieldsRequired: 'All fields are required.',
    passwordLength: 'Password must be exactly 8 characters long.',
    invalidEmail: 'Email is not valid.',
    registrationSuccess: 'Registration successful! Please check your email for OTP.',
    otpVerification: 'Enter OTP sent to your email',
    otpInvalid: 'Invalid OTP.',
    otpVerified: 'OTP verified successfully!',
    errorOccurred: 'Something went wrong. Please try again.',
    resendOtp: 'Resend OTP',
  },
  Gujarati: {
    register: 'નોંધણી કરો',
    usernamePlaceholder: 'વપરાશકર્તાનું નામ',
    emailPlaceholder: 'ઈમેઈલ',
    passwordPlaceholder: 'પાસવર્ડ',
    registerButton: 'નોંધણી',
    alreadyHaveAccount: 'પહેલેથી જ એક ખાતું છે? અહીં લોગિન કરો',
    allFieldsRequired: 'બધા ફીલ્ડ આવશ્યક છે.',
    passwordLength: 'પાસવર્ડ ખરા ખરા 8 અક્ષરનો હોવો જોઈએ.',
    invalidEmail: 'ઈમેઈલ માન્ય નથી.',
    registrationSuccess: 'નોંધણી સફળતાપૂર્વક થઈ! કૃપા કરીને તમારું ઈમેઈલ તપાસો અને OTP મેળવવા માટે.',
    otpVerification: 'તમારા ઈમેઈલ પર મોકલાયેલ OTP દાખલ કરો',
    otpInvalid: 'અમાન્ય OTP.',
    otpVerified: 'OTP સફળતાપૂર્વક ચકાસાયું!',
    errorOccurred: 'કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.',
    resendOtp: 'OTP ફરી મોકલો',
  },
  Hindi: {
    register: 'पंजीकरण करें',
    usernamePlaceholder: 'उपयोगकर्ता नाम',
    emailPlaceholder: 'ईमेल',
    passwordPlaceholder: 'पासवर्ड',
    registerButton: 'पंजीकरण',
    alreadyHaveAccount: 'पहले से ही खाता है? यहाँ लॉगिन करें',
    allFieldsRequired: 'सभी फ़ील्ड आवश्यक हैं।',
    passwordLength: 'पासवर्ड बिल्कुल 8 अक्षरों का होना चाहिए।',
    invalidEmail: 'ईमेल मान्य नहीं है।',
    registrationSuccess: 'पंजीकरण सफल रहा! कृपया अपना ईमेल जांचें और OTP प्राप्त करें।',
    otpVerification: 'अपने ईमेल पर भेजा गया OTP दर्ज करें',
    otpInvalid: 'अमान्य OTP।',
    otpVerified: 'OTP सफलतापूर्वक सत्यापित किया गया!',
    errorOccurred: 'कुछ गलत हो गया। कृपया पुन: प्रयास करें।',
    resendOtp: 'OTP पुनः भेजें',
  },
};

const { width } = Dimensions.get('window');

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState('English');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [otpResendTime, setOtpResendTime] = useState(30);
  const [timer, setTimer] = useState(null);

  const router = useRouter();
  const inputRefs = useRef([]);

  const t = translations[language];

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setOtpDigits(['', '', '', '', '', '']);
  };

  const openOtpModal = () => {
    setOtpDigits(['', '', '', '', '', '']); // <-- clear otp input fields every time modal opens
    setOtpModalVisible(true);
    startOtpTimer();
  };

  const closeOtpModal = () => {
    setOtpModalVisible(false);
    if (timer) clearInterval(timer);
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      alert(t.allFieldsRequired);
      return;
    }
    if (!isValidEmail(email)) {
      alert(t.invalidEmail);
      return;
    }
    if (password.length !== 8) {
      alert(t.passwordLength);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://192.168.254.253:5000/register', { username, email, password });
      if (response.status === 201) {
        alert(t.registrationSuccess);
        openOtpModal();
      }
    } catch (error) {
      alert(error.response?.data?.message || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    const updatedOtp = [...otpDigits];
    updatedOtp[index] = text;
    setOtpDigits(updatedOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      alert(t.otpInvalid);
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post('http://192.168.254.253:5000/verify-otp', { email, otp });
      if (response.status === 200) {
        alert(t.otpVerified);
        closeOtpModal();
        resetForm();
        router.push('/LoginPage');
      }
    } catch (error) {
      alert(t.otpInvalid);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      const response = await axios.post('http://192.168.254.253:5000/resend-otp', { email });
      if (response.status === 200) {
        alert('OTP resent successfully.');
        startOtpTimer();
      }
    } catch (error) {
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setResendingOtp(false);
    }
  };

  const startOtpTimer = () => {
    setOtpResendTime(30);
    if (timer) clearInterval(timer);

    const interval = setInterval(() => {
      setOtpResendTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    setTimer(interval);
  };

  const onRefresh = () => {
    setRefreshing(true);
    resetForm();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <ImageBackground source={require('../assets/images/background.png')} style={styles.background} blurRadius={5}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
          <View style={[styles.container, { width: width > 600 ? 400 : '90%' }]}>
            <RNPickerSelect
              onValueChange={(value) => setLanguage(value || 'English')}
              items={Object.keys(translations).map(lang => ({ label: lang, value: lang }))}
              value={language}
              style={pickerSelectStyles}
              placeholder={{ label: 'Select Language', value: null }}
            />
            <Text style={styles.titleCSS}>{t.register}</Text>

            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color="#888" style={styles.icon} />
              <TextInput style={styles.input} placeholder={t.usernamePlaceholder} value={username} onChangeText={setUsername} />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="mail" size={20} color="#888" style={styles.icon} />
              <TextInput style={styles.input} placeholder={t.emailPlaceholder} keyboardType="email-address" value={email} onChangeText={setEmail} />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-closed" size={20} color="#888" style={styles.icon} />
              <TextInput style={styles.input} placeholder={t.passwordPlaceholder} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color="#007BFF" /> : <Button title={t.registerButton} onPress={handleRegister} />}
            <Link href="/LoginPage" style={styles.linkText}>{t.alreadyHaveAccount}</Link>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>

      {/* OTP Modal */}
      <Modal animationType="slide" transparent={true} visible={otpModalVisible} onRequestClose={closeOtpModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t.otpVerification}</Text>
            <View style={styles.otpInputContainer}>
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => inputRefs.current[index] = ref}
                  style={styles.otpInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  autoFocus={index === 0}
                />
              ))}
            </View>
            {otpLoading ? <ActivityIndicator size="large" color="#007BFF" /> : <Button title="Verify OTP" onPress={handleOtpVerify} />}
            <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton} disabled={otpResendTime > 0}>
              {otpResendTime > 0 ? (
                <Text style={styles.resendButtonText}>{t.resendOtp} ({otpResendTime}s)</Text>
              ) : (
                resendingOtp ? <ActivityIndicator color="#fff" /> : <Text style={styles.resendButtonText}>{t.resendOtp}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={closeOtpModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  background: { flex: 1, width: '100%', height: '100%', justifyContent: 'center' },
  wrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 12, paddingHorizontal: 8 },
  input: { flex: 1, height: 40, paddingHorizontal: 8 },
  icon: { marginRight: 8 },
  titleCSS: { textAlign: 'center', fontSize: 24, marginBottom: 20, color: 'skyblue', fontWeight: 'bold' },
  linkText: { color: '#007BFF', marginTop: 16, textAlign: 'center' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
  otpInputContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  otpInput: { borderBottomWidth: 2, borderBottomColor: '#007BFF', marginHorizontal: 5, textAlign: 'center', fontSize: 20, width: 40 },
  resendButton: { marginTop: 20 },
  resendButtonText: { color: '#007BFF', fontSize: 16 },
  closeButton: { marginTop: 10 },
  closeButtonText: { color: '#FF0000', fontSize: 16 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 4, color: 'black', marginBottom: 20 },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: 'gray', borderRadius: 8, color: 'black', marginBottom: 20 },
});
