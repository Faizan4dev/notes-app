import { supabase } from "@/lib/supabase";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserPlus,
  UserRound,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedTextInput = ({
  icon: Icon,
  placeholder,
  isPassword = false,
  value,
  onChangeText,
  ...rest
}: any) => {
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
    <Animated.View
      style={[styles.inputContainer, animatedBorderStyle, animatedShadowStyle]}
    >
      <Icon
        size={20}
        color={isFocused ? "#6C63FF" : "#A0A0A0"}
        style={styles.inputIcon}
      />
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
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          {showPassword ? (
            <EyeOff size={20} color="#A0A0A0" />
          ) : (
            <Eye size={20} color="#A0A0A0" />
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default function RegisterScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withSpring(1, { damping: 15, stiffness: 80 });
  }, []);

  const pageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    console.log("SIGNUP DATA:", data);
    console.log("SIGNUP ERROR:", error);
    setIsLoading(false);

    if (error) {
      Alert.alert("Registration Failed", error.message);
    } else {
      Alert.alert(
        "Check Your Email! 📧",
        "We sent you a confirmation link. Please verify your account before logging in.",
      );
      router.replace("/login");
    }
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={["#F8F9FF", "#EBEBFF"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.inner, pageAnimatedStyle]}>
            <View style={styles.illustrationContainer}>
              <View style={styles.illustrationCircle}>
                <UserPlus size={50} color="#6C63FF" strokeWidth={1.5} />
              </View>
            </View>
            <BlurView intensity={60} tint="light" style={styles.glassCard}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>
              </View>
              <View style={styles.formContainer}>
                <AnimatedTextInput
                  icon={UserRound}
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
                <AnimatedTextInput
                  icon={Mail}
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <AnimatedTextInput
                  icon={Lock}
                  placeholder="Password"
                  isPassword
                  value={password}
                  onChangeText={setPassword}
                />
                <AnimatedTextInput
                  icon={Lock}
                  placeholder="Confirm Password"
                  isPassword
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <Pressable
                  disabled={isLoading}
                  onPressIn={() => (buttonScale.value = withSpring(0.96))}
                  onPressOut={() => (buttonScale.value = withSpring(1))}
                  onPress={handleRegister}
                >
                  <Animated.View
                    style={[styles.registerButtonWrapper, buttonAnimatedStyle]}
                  >
                    <LinearGradient
                      colors={["#6C63FF", "#A084FF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.registerButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.registerButtonText}>
                          Create Account
                        </Text>
                      )}
                    </LinearGradient>
                  </Animated.View>
                </Pressable>

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={() => router.replace("/login")}>
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  inner: { width: "100%", alignItems: "center" },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: -40,
    zIndex: 10,
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  glassCard: {
    width: "100%",
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
  },
  headerContainer: { alignItems: "center", marginBottom: 32 },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, color: "#666666" },
  formContainer: { width: "100%" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 60,
    borderColor: "transparent",
    borderWidth: 1.5,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#1A1A1A",
    height: "100%",
  },
  eyeIcon: { padding: 8 },
  registerButtonWrapper: {
    width: "100%",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  registerButton: {
    borderRadius: 16,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#666666" },
  loginLink: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#6C63FF" },
});
