import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useState, useRef } from 'react';
import Home from './Home';
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
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Sign up form states
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [token, setToken] = useState(null);

  function getApiBase() {
    const override = process.env.EXPO_PUBLIC_API_BASE;
    if (override) return override;
    if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
    if (Platform.OS === 'ios') return 'http://localhost:4000';
    return 'http://localhost:4000';
  }
  const API = getApiBase();
  if (__DEV__) console.log('API base:', API);

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
  const handleSignIn = async () => {
  try {
    setAuthError('');
    setSubmitting(true);
    const body = { email: (email || '').trim(), password };
    if (!body.email || !body.password) throw new Error('Please enter email and password');
    const { token: t, user } = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setToken(t);
    setUserName(user.name || 'User');
    // Prompt user that the app will use the camera (native). On web just proceed.
    if (Platform.OS === 'web') {
      setShowWelcome(true);
      setTimeout(() => { setShowWelcome(false); setLoggedIn(true); }, 800);
    } else {
      Alert.alert(
        'Camera usage',
        'This app will use your device camera to capture product images. Please allow camera access when prompted.',
        [
          { text: 'OK', onPress: () => { setShowWelcome(true); setTimeout(() => { setShowWelcome(false); setLoggedIn(true); }, 800); } }
        ],
        { cancelable: false }
      );
    }
  } catch (e) {
    console.warn('Login error:', e.message);
    setAuthError(e.message || 'Login failed');
  } finally { setSubmitting(false); }
};

  const handleSignUp = async () => {
  try {
    setAuthError('');
    setSubmitting(true);
    if (signUpPassword !== signUpConfirmPassword) throw new Error('Passwords do not match');
    const body = { name: (signUpName || '').trim(), email: (signUpEmail || '').trim(), password: signUpPassword };
    if (!body.name || !body.email || !body.password) throw new Error('Please enter name, email, and password');
    const { token: t, user } = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setToken(t);
    setUserName(user.name || 'User');
    // Prompt user that the app will use the camera (native). On web just proceed.
    if (Platform.OS === 'web') {
      setShowWelcome(true);
      setTimeout(() => { setShowWelcome(false); setLoggedIn(true); }, 800);
    } else {
      Alert.alert(
        'Camera usage',
        'This app will use your device camera to capture product images. Please allow camera access when prompted.',
        [
          { text: 'OK', onPress: () => { setShowWelcome(true); setTimeout(() => { setShowWelcome(false); setLoggedIn(true); }, 800); } }
        ],
        { cancelable: false }
      );
    }
  } catch (e) {
    console.warn('Signup error:', e.message);
    setAuthError(e.message || 'Signup failed');
  } finally { setSubmitting(false); }
};

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    // Reset forms when switching
    setEmail('');
    setPassword('');
    setSignUpName('');
    setSignUpEmail('');
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

  // animated scale for checkbox press feedback
  const checkboxScale = useRef(new Animated.Value(1)).current;
  const animateCheckbox = (toValue) => {
    Animated.spring(checkboxScale, { toValue, useNativeDriver: true, friction: 6 }).start();
  };

  // Always show login immediately (no landing screen)
  if (loggedIn) {
  return <Home onLogout={() => { setToken(null); setLoggedIn(false); }} userName={userName} />;
}

  // Show welcome screen
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
      {/* Left Column - Background Image (70%) */}
      <View style={styles.imageColumn}>
        <Image
          source={require('./assets/carton.jpg')}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={0}
        />
      </View>

      {/* Right Column - Login/SignUp Container (30%) */}
      <LinearGradient
        colors={['#F3E095', '#DACC96', '#999999']}
        locations={[0, 0.28, 1.0]}
        style={styles.loginColumn}
      >
        <View style={styles.loginContainer}>
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
          <Text style={styles.welcomeText}>
            {isSignUp ? 'Create Your Account' : 'Welcome to CartonIQ'}
          </Text>

          {/* Conditional Render: Sign In or Sign Up Form */}
          {!isSignUp ? (
            // SIGN IN FORM
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Login</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email or phone number"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
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
                </View>
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
              <TouchableOpacity onPress={handleSignIn} activeOpacity={0.8} disabled={submitting}>
                <LinearGradient
                  colors={['#F3E095', '#DACC96']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signInButton}
                >
                  <Text style={styles.signInButtonText}>{submitting ? 'Signing in…' : 'Sign in'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Social icon-only buttons */}
              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={[styles.socialIconButton, styles.googleButton]}
                  onPress={handleGoogleSignIn}
                  activeOpacity={0.8}
                  accessibilityLabel="Sign in with Google"
                >
                  <FontAwesome name="google" size={18} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, styles.facebookButton]}
                  onPress={handleFacebookSignIn}
                  activeOpacity={0.8}
                  accessibilityLabel="Sign in with Facebook"
                >
                  <FontAwesome name="facebook" size={18} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={handleAppleSignIn}
                  activeOpacity={0.8}
                  accessibilityLabel="Sign in with Apple"
                >
                  <FontAwesome name="apple" size={18} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, styles.microsoftButton]}
                  onPress={handleMicrosoftSignIn}
                  activeOpacity={0.8}
                  accessibilityLabel="Sign in with Microsoft"
                >
                  <FontAwesome name="windows" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {authError ? (
                <Text style={styles.errorText}>{authError}</Text>
              ) : null}

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
              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                  value={signUpName}
                  onChangeText={setSignUpName}
                  autoCapitalize="words"
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={signUpEmail}
                  onChangeText={setSignUpEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create password"
                    placeholderTextColor="#9ca3af"
                    value={signUpPassword}
                    onChangeText={setSignUpPassword}
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
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9ca3af"
                    value={signUpConfirmPassword}
                    onChangeText={setSignUpConfirmPassword}
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
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity onPress={handleSignUp} activeOpacity={0.8} style={{ marginTop: 8 }} disabled={submitting}>
                <LinearGradient
                  colors={['#F3E095', '#DACC96']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signInButton}
                >
                  <Text style={styles.signInButtonText}>{submitting ? 'Creating…' : 'Create account'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              {authError ? (
                <Text style={styles.errorText}>{authError}</Text>
              ) : null}

              {/* Back to Sign In Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Already have an account? </Text>
                <TouchableOpacity onPress={toggleSignUp}>
                  <Text style={styles.signUpLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
    width: '80%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  loginColumn: {
    width: '20%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContainer: {
    width: '85%',
    maxWidth: 420,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 28,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  eyeIcon: {
    padding: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  rememberMeText: {
    fontSize: 13,
    color: '#4b5563',
  },
  forgotPassword: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
  },
  signInButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginVertical: 16,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    width: '100%',
  },
  socialIconButton: {
    backgroundColor: '#262626',
    width: 60,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  microsoftButton: {
    backgroundColor: '#00A4EF',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signUpText: {
    fontSize: 13,
    color: '#4b5563',
  },
  signUpLink: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
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