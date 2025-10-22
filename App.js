import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useState, useRef } from 'react';
import Home from './screens/Home';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('John Doe');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Sign up form states
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpConfirmEmail, setSignUpConfirmEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animated values for text inputs
  const emailBorderAnim = useRef(new Animated.Value(0)).current;
  const emailScaleAnim = useRef(new Animated.Value(1)).current;
  const passwordBorderAnim = useRef(new Animated.Value(0)).current;
  const passwordScaleAnim = useRef(new Animated.Value(1)).current;
  const signUpFirstNameBorderAnim = useRef(new Animated.Value(0)).current;
  const signUpFirstNameScaleAnim = useRef(new Animated.Value(1)).current;
  const signUpLastNameBorderAnim = useRef(new Animated.Value(0)).current;
  const signUpLastNameScaleAnim = useRef(new Animated.Value(1)).current;
  const signUpEmailBorderAnim = useRef(new Animated.Value(0)).current;
  const signUpEmailScaleAnim = useRef(new Animated.Value(1)).current;
  const signUpConfirmEmailBorderAnim = useRef(new Animated.Value(0)).current;
  const signUpConfirmEmailScaleAnim = useRef(new Animated.Value(1)).current;
  const signUpPasswordBorderAnim = useRef(new Animated.Value(0)).current;
  const signUpPasswordScaleAnim = useRef(new Animated.Value(1)).current;
  const signUpConfirmPasswordBorderAnim = useRef(new Animated.Value(0)).current;
  const signUpConfirmPasswordScaleAnim = useRef(new Animated.Value(1)).current;

  // Animation handlers for Sign In
  const handleEmailFocus = () => {
    Animated.parallel([
      Animated.timing(emailBorderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.spring(emailScaleAnim, { toValue: 1.02, friction: 3, useNativeDriver: true }),
    ]).start();
  };
  const handleEmailBlur = () => {
    Animated.parallel([
      Animated.timing(emailBorderAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.spring(emailScaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handlePasswordFocus = () => {
    Animated.parallel([
      Animated.timing(passwordBorderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.spring(passwordScaleAnim, { toValue: 1.02, friction: 3, useNativeDriver: true }),
    ]).start();
  };
  const handlePasswordBlur = () => {
    Animated.parallel([
      Animated.timing(passwordBorderAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.spring(passwordScaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  // Animation handlers for Sign Up
  const handleSignUpFirstNameFocus = () => {
    Animated.parallel([
      Animated.timing(signUpFirstNameBorderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpFirstNameScaleAnim, { toValue: 1.02, friction: 3, useNativeDriver: true }),
    ]).start();
  };
  const handleSignUpFirstNameBlur = () => {
    Animated.parallel([
      Animated.timing(signUpFirstNameBorderAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpFirstNameScaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleSignUpLastNameFocus = () => {
    Animated.parallel([
      Animated.timing(signUpLastNameBorderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpLastNameScaleAnim, { toValue: 1.02, friction: 3, useNativeDriver: true }),
    ]).start();
  };
  const handleSignUpLastNameBlur = () => {
    Animated.parallel([
      Animated.timing(signUpLastNameBorderAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpLastNameScaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleSignUpEmailFocus = () => {
    Animated.parallel([
      Animated.timing(signUpEmailBorderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpEmailScaleAnim, { toValue: 1.02, friction: 3, useNativeDriver: true }),
    ]).start();
  };
  const handleSignUpEmailBlur = () => {
    Animated.parallel([
      Animated.timing(signUpEmailBorderAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpEmailScaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleSignUpConfirmEmailFocus = () => {
    Animated.parallel([
      Animated.timing(signUpConfirmEmailBorderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpConfirmEmailScaleAnim, { toValue: 1.02, friction: 3, useNativeDriver: true }),
    ]).start();
  };
  const handleSignUpConfirmEmailBlur = () => {
    Animated.parallel([
      Animated.timing(signUpConfirmEmailBorderAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpConfirmEmailScaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleSignUpPasswordFocus = () => {
    Animated.parallel([
      Animated.timing(signUpPasswordBorderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpPasswordScaleAnim, { toValue: 1.02, friction: 3, useNativeDriver: true }),
    ]).start();
  };
  const handleSignUpPasswordBlur = () => {
    Animated.parallel([
      Animated.timing(signUpPasswordBorderAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpPasswordScaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleSignUpConfirmPasswordFocus = () => {
    Animated.parallel([
      Animated.timing(signUpConfirmPasswordBorderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpConfirmPasswordScaleAnim, { toValue: 1.02, friction: 3, useNativeDriver: true }),
    ]).start();
  };
  const handleSignUpConfirmPasswordBlur = () => {
    Animated.parallel([
      Animated.timing(signUpConfirmPasswordBorderAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.spring(signUpConfirmPasswordScaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleSignIn = () => {
    console.log('Sign in pressed', { email, password, rememberMe });
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      setLoggedIn(true);
    }, 2000);
  };

  const handleSignUp = () => {
    console.log('Sign up pressed', { signUpFirstName, signUpLastName, signUpEmail, signUpPassword });
    setUserName(`${signUpFirstName} ${signUpLastName}`);
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      setLoggedIn(true);
    }, 2000);
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setSignUpFirstName('');
    setSignUpLastName('');
    setSignUpEmail('');
    setSignUpConfirmEmail('');
    setSignUpPassword('');
    setSignUpConfirmPassword('');
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in pressed');
  };

  const handleFacebookSignIn = () => {
    console.log('Facebook sign in pressed');
  };

  const handleAppleSignIn = () => {
    console.log('Apple sign in pressed');
  };

  const handleMicrosoftSignIn = () => {
    console.log('Microsoft sign in pressed');
  };

  const checkboxScale = useRef(new Animated.Value(1)).current;
  const animateCheckbox = (toValue) => {
    Animated.spring(checkboxScale, { toValue, useNativeDriver: true, friction: 6 }).start();
  };

  // Interpolate border colors
  const emailBorderColor = emailBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#3b82f6'],
  });
  const passwordBorderColor = passwordBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#3b82f6'],
  });
  const signUpFirstNameBorderColor = signUpFirstNameBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#3b82f6'],
  });
  const signUpLastNameBorderColor = signUpLastNameBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#3b82f6'],
  });
  const signUpEmailBorderColor = signUpEmailBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#3b82f6'],
  });
  const signUpConfirmEmailBorderColor = signUpConfirmEmailBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#3b82f6'],
  });
  const signUpPasswordBorderColor = signUpPasswordBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#3b82f6'],
  });
  const signUpConfirmPasswordBorderColor = signUpConfirmPasswordBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#3b82f6'],
  });

  if (loggedIn) {
    return <Home onLogout={() => setLoggedIn(false)} userName={userName} />;
  }

  if (showWelcome) {
    return (
      <LinearGradient
        colors={['#F3E095', '#DACC96', '#999999']}
        locations={[0, 0.28, 1.0]}
        style={styles.welcomeScreen}
      >
        <View style={styles.welcomeContent}>
          <Image
            source={require('./assets/cartoniq.png')}
            style={styles.welcomeLogo}
            contentFit="contain"
          />
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>{userName}</Text>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingDot} />
            <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
            <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Left Column - Background Image (65%) */}
      <View style={styles.imageColumn}>
        <Image
          source={require('./assets/carton.jpg')}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={0}
        />
      </View>

      {/* Right Column - Login/SignUp Container (35%) */}
      <LinearGradient
        colors={['#F3E095', '#DACC96', '#999999']}
        locations={[0, 0.28, 1.0]}
        style={styles.loginColumn}
      >
        {/* Inner card uses requested gradient (#EDD196 -> #877D55) */}
        <LinearGradient
          colors={['#EDD196', '#877D55']}
          start={[0, 0]}
          end={[0, 1]}
          style={styles.loginContainer}
        >
          {/* NEW: visible card border + stronger shadow */}
          <View style={styles.loginCardBorder}>
          {/* Logo and Title */}
          <View style={styles.logoSection}>
            <Image
              source={require('./assets/cartoniq.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.appName}>CartonIQ</Text>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeHeader}>
            <FontAwesome 
              name={isSignUp ? "user-plus" : "sign-in"} 
              size={20} 
              color="#1f2937" 
              style={styles.welcomeIcon} 
            />
            <Text style={styles.welcomeText}>
              {isSignUp ? 'Create an Account' : 'Welcome'}
            </Text>
          </View>

          {/* Conditional Render: Sign In or Sign Up Form */}
          {!isSignUp ? (
            // SIGN IN FORM
            <View style={styles.formContainer}>
              {/* Email Input with Animation */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <Animated.View
                  style={[
                    styles.animatedInputWrapper,
                    {
                      borderColor: emailBorderColor,
                      transform: [{ scale: emailScaleAnim }],
                    },
                  ]}
                >
                  <FontAwesome 
                    name="envelope-o" 
                    size={16} 
                    color="#6b7280" 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="Enter e-mail"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={handleEmailFocus}
                    onBlur={handleEmailBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Animated.View>
              </View>

              {/* Password Input with Animation */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <Animated.View
                  style={[
                    styles.animatedPasswordWrapper,
                    {
                      borderColor: passwordBorderColor,
                      transform: [{ scale: passwordScaleAnim }],
                    },
                  ]}
                >
                  <FontAwesome 
                    name="lock" 
                    size={16} 
                    color="#6b7280" 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.passwordInputWithIcon}
                    placeholder="Enter password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesome 
                      name={showPassword ? 'eye' : 'eye-slash'} 
                      size={18} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Remember Me and Forgot Password */}
              <View style={styles.optionsRow}>
                <View style={styles.rememberMeContainer}>
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    onPressIn={() => animateCheckbox(0.95)}
                    onPressOut={() => animateCheckbox(1)}
                    activeOpacity={0.8}
                  >
                    <Animated.View style={[styles.checkbox, rememberMe && styles.checkboxChecked, { transform: [{ scale: checkboxScale }] }] }>
                      {rememberMe && <FontAwesome name="check" size={10} color="#fff" />}
                    </Animated.View>
                  </TouchableOpacity>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity onPress={handleSignIn} activeOpacity={0.8}>
                <View style={styles.signInButton}>
                  <Text style={styles.signInButtonText}>SIGN IN</Text>
                </View>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or Sign in with Google</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In Button */}
              <TouchableOpacity
                style={styles.googleSignInButton}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
              >
                <FontAwesome name="google" size={18} color="#DB4437" style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={toggleSignUp}>
                  <Text style={styles.signUpLink}>Sign up now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // SIGN UP FORM
            <View style={styles.formContainer}>
              {/* First Name and Last Name Row */}
              <View style={styles.nameRow}>
                <View style={styles.nameInputGroup}>
                  <Text style={styles.label}>First Name</Text>
                  <Animated.View
                    style={[
                      styles.animatedInputWrapper,
                      {
                        borderColor: signUpFirstNameBorderColor,
                        transform: [{ scale: signUpFirstNameScaleAnim }],
                      },
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder=""
                      placeholderTextColor="#9ca3af"
                      value={signUpFirstName}
                      onChangeText={setSignUpFirstName}
                      onFocus={handleSignUpFirstNameFocus}
                      onBlur={handleSignUpFirstNameBlur}
                      autoCapitalize="words"
                    />
                  </Animated.View>
                </View>

                <View style={styles.nameInputGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <Animated.View
                    style={[
                      styles.animatedInputWrapper,
                      {
                        borderColor: signUpLastNameBorderColor,
                        transform: [{ scale: signUpLastNameScaleAnim }],
                      },
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder=""
                      placeholderTextColor="#9ca3af"
                      value={signUpLastName}
                      onChangeText={setSignUpLastName}
                      onFocus={handleSignUpLastNameFocus}
                      onBlur={handleSignUpLastNameBlur}
                      autoCapitalize="words"
                    />
                  </Animated.View>
                </View>
              </View>

              {/* Email Input with Animation */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <Animated.View
                  style={[
                    styles.animatedInputWrapper,
                    {
                      borderColor: signUpEmailBorderColor,
                      transform: [{ scale: signUpEmailScaleAnim }],
                    },
                  ]}
                >
                  <FontAwesome 
                    name="envelope-o" 
                    size={16} 
                    color="#6b7280" 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="Enter e-mail"
                    placeholderTextColor="#9ca3af"
                    value={signUpEmail}
                    onChangeText={setSignUpEmail}
                    onFocus={handleSignUpEmailFocus}
                    onBlur={handleSignUpEmailBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Animated.View>
              </View>

              {/* Confirm Email Input with Animation */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm E-mail</Text>
                <Animated.View
                  style={[
                    styles.animatedInputWrapper,
                    {
                      borderColor: signUpConfirmEmailBorderColor,
                      transform: [{ scale: signUpConfirmEmailScaleAnim }],
                    },
                  ]}
                >
                  <FontAwesome 
                    name="envelope-o" 
                    size={16} 
                    color="#6b7280" 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="Confirm e-mail"
                    placeholderTextColor="#9ca3af"
                    value={signUpConfirmEmail}
                    onChangeText={setSignUpConfirmEmail}
                    onFocus={handleSignUpConfirmEmailFocus}
                    onBlur={handleSignUpConfirmEmailBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Animated.View>
              </View>

              {/* Password Input with Animation */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Create Password</Text>
                <Animated.View
                  style={[
                    styles.animatedPasswordWrapper,
                    {
                      borderColor: signUpPasswordBorderColor,
                      transform: [{ scale: signUpPasswordScaleAnim }],
                    },
                  ]}
                >
                  <FontAwesome 
                    name="lock" 
                    size={16} 
                    color="#6b7280" 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.passwordInputWithIcon}
                    placeholder="Enter password"
                    placeholderTextColor="#9ca3af"
                    value={signUpPassword}
                    onChangeText={setSignUpPassword}
                    onFocus={handleSignUpPasswordFocus}
                    onBlur={handleSignUpPasswordBlur}
                    secureTextEntry={!showSignUpPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowSignUpPassword(!showSignUpPassword)}
                  >
                    <FontAwesome 
                      name={showSignUpPassword ? 'eye' : 'eye-slash'} 
                      size={18} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Confirm Password Input with Animation */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <Animated.View
                  style={[
                    styles.animatedPasswordWrapper,
                    {
                      borderColor: signUpConfirmPasswordBorderColor,
                      transform: [{ scale: signUpConfirmPasswordScaleAnim }],
                    },
                  ]}
                >
                  <FontAwesome 
                    name="lock" 
                    size={16} 
                    color="#6b7280" 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.passwordInputWithIcon}
                    placeholder="Enter password"
                    placeholderTextColor="#9ca3af"
                    value={signUpConfirmPassword}
                    onChangeText={setSignUpConfirmPassword}
                    onFocus={handleSignUpConfirmPasswordFocus}
                    onBlur={handleSignUpConfirmPasswordBlur}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesome 
                      name={showConfirmPassword ? 'eye' : 'eye-slash'} 
                      size={18} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity onPress={handleSignUp} activeOpacity={0.8} style={{ marginTop: 8 }}>
                <View style={styles.signInButton}>
                  <Text style={styles.signInButtonText}>SIGN UP</Text>
                </View>
              </TouchableOpacity>

              {/* Back to Sign In Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Have an account? </Text>
                <TouchableOpacity onPress={toggleSignUp}>
                  <Text style={styles.signUpLink}>Sign in now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          </View>
        </LinearGradient>
      </LinearGradient>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  imageColumn: {
    width: '65%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  loginColumn: {
    width: '35%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContainer: {
    width: '80%',
    maxWidth: 450,
    // gradient is the background; keep outer container lightweight so edge shows
    borderRadius: 16,
    padding: 12,
    overflow: 'visible',
  },
  loginCardBorder: {
    borderWidth: 3,
    borderColor: '#1f2937',
    borderRadius: 14,
    padding: 26,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeIcon: {
    marginRight: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  nameInputGroup: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  animatedInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEAE2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    padding: 10,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: 'transparent',
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: 'transparent',
  },
  animatedPasswordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEAE2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  passwordInputWithIcon: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  eyeIcon: {
    padding: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#EFEAE2',
  },
  checkboxChecked: {
    backgroundColor: '#1f2937',
    borderColor: '#1f2937',
  },
  rememberMeText: {
    fontSize: 12,
    color: '#1f2937',
  },
  forgotPassword: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '500',
  },
  signInButton: {
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#574C3A',
  },
  signInButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 12,
  },
  googleSignInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEAE2',
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 20,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  signUpText: {
    fontSize: 12,
    color: '#4b5563',
  },
  signUpLink: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '700',
  },
  welcomeScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeLogo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 32,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1f2937',
    opacity: 0.3,
  },
  loadingDotDelay1: {
    opacity: 0.6,
  },
  loadingDotDelay2: {
    opacity: 0.9,
  },
});