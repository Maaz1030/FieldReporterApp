import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { Formik } from 'formik';
import * as Yup from 'yup';
import colors from '../../utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
//import { useSelector } from 'react-redux';

/////////////////////////
import { useDispatch, useSelector } from 'react-redux';
import { signUpUser } from '../../redux/slices/authSlice';


//const theme = colors.light;

const Signup = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { user, error, loading } = useSelector((state) => state.auth);


const themeMode = useSelector((state) => state.auth.themeMode);
  const theme = colors[themeMode] || colors.light;

  // Validation schema
  const SignupSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Enter a valid email').required('Email is required'),
    password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  });

  // Navigate once user is registered
  useEffect(() => {
    if (user) {
      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('MainTabs');
    }
  }, [user]);

  // Handle potential errors
  useEffect(() => {
    if (error) {
      Alert.alert('Sign Up Failed', error);
    }
  }, [error]);

  // Form submit handler
  const handleSignUp = (values) => {
    const { email, password } = values;
    dispatch(signUpUser({ email, password }));
  };

  return (
    <View style={[styles.container ,{backgroundColor: theme.primaryBackground}, { paddingTop: insets.top }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          paddingBottom: insets.bottom + 10,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* --- Logo --- */}
        <View style={styles.bottomSection}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* --- Form --- */}
          <Formik
            initialValues={{ name: '', email: '', password: '' }}
            validationSchema={SignupSchema}
            onSubmit={handleSignUp}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <View style={{ width: '90%' }}>
                <FormInput
                  name="name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  placeholder="Name"
                  error={errors.name}
                  touched={touched.name}
                  textColor={theme.primaryText}
                  placeholderTextColor={theme.secondaryText}
                  borderColor={theme.border}
                  backgroundColor={theme.surface}
                />
                <FormInput
                  name="email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  placeholder="Email"
                  error={errors.email}
                  touched={touched.email}
                  textColor={theme.primaryText}
                  placeholderTextColor={theme.secondaryText}
                  borderColor={theme.border}
                  backgroundColor={theme.surface}
                />
                <FormInput
                  name="password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  placeholder="Password"
                  secureTextEntry
                  error={errors.password}
                  touched={touched.password}
                  textColor={theme.primaryText}
                  placeholderTextColor={theme.secondaryText}
                  borderColor={theme.border}
                  backgroundColor={theme.surface}
                />
                <FormButton
                  title={loading ? 'Creating Account…' : 'Sign Up'}
                  onPress={handleSubmit}
                  loading={loading}
                  color={theme.accent}
                />
              </View>
            )}
          </Formik>
        </View>

        {/* --- Footer --- */}
        <View style={styles.bottomSection}>
          <View style={styles.divider} />
          <View style={styles.bottomRow}>
            <Text style={[styles.text, { color: theme.primaryText }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: theme.accent }]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  logo: { width: 160, height: 160, marginBottom: 60 },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 'auto',
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  bottomRow: { flexDirection: 'row', justifyContent: 'center' },
  text: { fontSize: 14 },
  link: { fontWeight: '600', left: 5 },
});

export default Signup;