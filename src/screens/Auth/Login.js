import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../utils/colors';
//import { useSelector } from 'react-redux';

// Redux + Firebase
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, restoreSession } from '../../redux/slices/authSlice';




//const theme = colors.light;

const Login = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { user, error, loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //   
const themeMode = useSelector((state) => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Please enter a valid email').required('Email required'),
    password: Yup.string().required('Password required'),
  });

  // On mount → restore user session if exists  
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Navigate when user logged in
  useEffect(() => {
    if (user) {
      navigation.replace('MainTabs');
    }
  }, [user]);

  // Show alert for errors from auth slice
  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
    }
  }, [error]);

  // Handle Firebase login
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.primarybackground, paddingTop: insets.top }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          paddingBottom: insets.bottom + 10,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Login Form */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ errors, touched }) => (
            <View style={{ width: '100%', paddingHorizontal: 20 }}>
              <FormInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                textColor={theme.primaryText}
                placeholderTextColor={theme.secondaryText}
                borderColor={theme.border}
                backgroundColor={theme.surface}
                error={errors.email}
                touched={touched.email}
              />

              <FormInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                textColor={theme.primaryText}
                placeholderTextColor={theme.secondaryText}
                borderColor={theme.border}
                backgroundColor={theme.surface}
                error={errors.password}
                touched={touched.password}
              />

              <FormButton
                title={loading ? 'Logging In…' : 'Login'}
                onPress={handleLogin}
                color={theme.accent}
                loading={loading}
              />
            </View>
          )}
        </Formik>

        {/* Footer */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomRow}>
            <Text style={[styles.text, { color: theme.primaryText }]}>
              Don’t have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.link, { color: theme.accent }]}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  logo: { width: 160, height: 250, marginTop: 70 },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 'auto',
  },
  bottomRow: { flexDirection: 'row', justifyContent: 'center' },
  text: { fontSize: 14 },
  link: { fontWeight: '600', left: 5 },
});