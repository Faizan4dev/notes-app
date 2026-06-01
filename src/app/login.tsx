import { supabase } from '@/lib/supabase';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const AnimatedTextInput = ({ icon: Icon, placeholder, isPassword = false, value, onChangeText, ...rest }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderOpacity = useSharedValue(0);
  const shadowOpacity = useSharedValue(0);

  useEffect(() => {
    borderOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    shadowOpacity.value = withTiming(isFocused ? 0.1 : 0, { duration: 200 });
  }, [isFocused]);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(108, 99, 255, ${borderOpacity.value})`,
    borderWidth: 1.5,
  }));

  const animatedShadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
    elevation: isFocused ? 5 : 0,
  }));

  return (
    <Animated.View style={[styles.inputContainer, animatedBorderStyle, animatedShadowStyle]}>
      <Icon size={20} color={isFocused ? '#6C63FF' : '#A0A0A0'} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        secureTextEntry={isPassword && !showPassword}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        {...rest}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          {showPassword ? <EyeOff size={20} color="#A0A0A0" /> : <Eye size={20} color="#A0A0A0" />}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default function LoginScreen() {
  const [fontsLoaded] = useFonts({ Poppins_700Bold, Poppins_600SemiBold, Inter_400Regular, Inter_500Medium });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 14, stiffness: 90 });
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  const pageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = email.trim(); 
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      setIsLoading(false);

      if (error) {
        console.error("SUPABASE LOGIN ERROR:", error.message);
        Alert.alert('Login Failed', error.message);
      } else if (data.session) {
        router.replace('/home');
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Unexpected error:", err);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.inner, pageAnimatedStyle]}>
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationCircle}>
              <UserRound size={60} color="#6C63FF" strokeWidth={1.5} />
            </View>
          </View>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue your journey</Text>
          </View>
          <View style={styles.formContainer}>
            <AnimatedTextInput icon={Mail} placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <AnimatedTextInput icon={Lock} placeholder="Password" isPassword value={password} onChangeText={setPassword} />
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            <Pressable disabled={isLoading} onPressIn={() => buttonScale.value = withSpring(0.96)} onPressOut={() => buttonScale.value = withSpring(1)} onPress={handleLogin}>
              <Animated.View style={[styles.loginButtonWrapper, buttonAnimatedStyle]}>
                <LinearGradient colors={['#6C63FF', '#A084FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginButton}>
                  {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.loginButtonText}>Login</Text>}
                </LinearGradient>
              </Animated.View>
            </Pressable>
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  inner: { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },
  illustrationContainer: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
  illustrationCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  headerContainer: { marginBottom: 40 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 32, color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#666666' },
  formContainer: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, paddingHorizontal: 16, height: 60, borderColor: 'transparent', borderWidth: 1.5, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 16, color: '#1A1A1A', height: '100%' },
  eyeIcon: { padding: 8 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 32 },
  forgotPasswordText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#6C63FF' },
  loginButtonWrapper: { width: '100%', shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8, marginBottom: 32 },
  loginButton: { borderRadius: 16, height: 60, justifyContent: 'center', alignItems: 'center' },
  loginButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#FFFFFF' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#666666' },
  registerLink: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#6C63FF' },
});