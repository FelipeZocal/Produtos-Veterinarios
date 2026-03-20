import React, { useState } from "react";
import { auth, db } from "../../config/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Link, useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "",
    celular: "",
    email: "",
    senha: "",
  });

  const handleSignUp = async () => {
    if (!form.email || !form.senha || !form.nome) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }
    try {
      // 1. Cria o usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.senha,
      );
      const user = userCredential.user;

      // 2. Salva dados adicionais no Firestore
      await setDoc(doc(db, "users", user.uid), {
        nome: form.nome,
        celular: form.celular,
        email: form.email,
        createdAt: new Date(),
      });
      console.log("Usuário cadastrado com sucesso:", user.uid);

      Alert.alert("Sucesso!", "Conta criada com sucesso.", [
        { text: "Ir para o Login", onPress: () => router.replace("/(tabs)/login") },
      ]);
    } catch (error: any) {
      console.error("ERRO COMPLETO:", error); // Isso vai mostrar o erro exato no VS Code

      let mensagem = "Ocorreu um erro inesperado.";

      if (error.code === "auth/weak-password")
        mensagem = "A senha deve ter pelo menos 6 dígitos.";
      if (error.code === "auth/email-already-in-use")
        mensagem = "Este e-mail já está cadastrado.";
      if (error.code === "permission-denied")
        mensagem = "Erro de permissão no banco de dados.";

      Alert.alert("Erro ao cadastrar", mensagem);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/agrovetbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Nova conta</Text>
          <Text style={styles.subtitle}>
            Cadastre-se para ter acesso a todos os produtos
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>

            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              placeholderTextColor="#999"
              value={form.nome}
              onChangeText={(val) => setForm({ ...form, nome: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Celular / WhatsApp</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={15}
              value={form.celular}
              onChangeText={(val) =>
                setForm({ ...form, celular: formatPhoneNumber(val) })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[
                styles.input,
                form.email.length > 0 &&
                !validateEmail(form.email) && { borderColor: "red" },
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
              <Text style={{ color: "red", fontSize: 12 }}>
                O e-mail precisa ser válido!
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="******"
              placeholderTextColor="#999"
              secureTextEntry
              value={form.senha}
              onChangeText={(val) => setForm({ ...form, senha: val })}
            />
          </View>

          <TouchableOpacity style={styles.btnFinalizar} onPress={handleSignUp}>
            <Text style={styles.btnText}>CRIAR CONTA</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>Ja possuí conta? </Text>
          <Link href="/login">
            <TouchableOpacity>
              <Text style={styles.linkText}>Realize o login!</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ImageBackground>
  );
}

const formatPhoneNumber = (text: string) => {
  const cleaned = text.replace(/\D/g, ""); // Remove tudo que não é número
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);

  if (!match) return cleaned;

  if (!match[2]) return match[1];
  return `(${match[1]}) ${match[2]}${match[3] ? "-" + match[3] : ""}`;
};

// Validação básica de e-mail
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "space-between",
    paddingHorizontal: "10%",
    paddingVertical: 50,
  },
  header: {
    alignItems: "center",
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#CCC",
    marginTop: 10,
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#2D5A27",
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "#F0F0F0",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  btnFinalizar: {
    backgroundColor: "#2D5A27",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  btnVoltar: {
    marginTop: 20,
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerText: {
    color: "#080808ef",
    fontSize: 15,
  },
  linkText: {
    color: "#050505cb",
    fontSize: 15,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
