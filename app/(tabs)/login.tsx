import React, { useState } from "react";
import { auth } from "../../config/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, Link } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    senha: "",
  })
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, form.email, form.senha);
      // Se der certo, redireciona para a home (tabs)
      router.replace("../(tabs)/userPage"); 
    } catch (Alert){
      console.log("Erro de Login", "E-mail ou senha incorretos.", Alert);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/agrovetbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        {/* Cabeçalho de Login */}
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
        </View>

        {/* Cartão de Login */}
        <View style={styles.loginCard}>
          <View style={styles.inputGroup}>
  <Text style={styles.label}>E-mail</Text>
  <TextInput
    style={[
      styles.input, 
      form.email.length > 0 && !validateEmail(form.email) && { borderColor: 'red' }
    ]}
    placeholder="Seu e-mail"
    placeholderTextColor="#999"
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    value={form.email}
    onChangeText={(val) => setForm({ ...form, email: val })}
  />
  {form.email.length > 0 && !validateEmail(form.email) && (
    <Text style={{ color: 'red', fontSize: 12 }}>E-mail inválido</Text>
  )}
</View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="********"
              placeholderTextColor="#999"
              secureTextEntry
              value={form.senha}
              onChangeText={(val) => setForm({ ...form, senha: val })}
            />
          </View>

          <TouchableOpacity style={styles.forgotPass}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnLogin}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Acessar sua conta</Text>
          </TouchableOpacity>
        </View>

        {/* Link para Cadastro */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem conta? </Text>
          <Link href="/register">
            <TouchableOpacity>
              <Text style={styles.linkText}>Cadastre-se</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
  
}

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%"
    
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoMini: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  logoEmoji: {
    fontSize: 35,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
  },
  subtitle: {
    fontSize: 15,
    color: "#DDD",
    marginTop: 5,
  },
  loginCard: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 25,
    padding: 25,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#2D5A27",
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  forgotPass: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotText: {
    color: "#2D5A27",
    fontSize: 13,
    fontWeight: "600",
  },
  btnLogin: {
    backgroundColor: "#2D5A27",
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerText: {
    color: "#FFF",
    fontSize: 15,
  },
  linkText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
