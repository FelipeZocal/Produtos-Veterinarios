import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Link } from "expo-router";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    nome: "",
    celular: "",
    email: "",
    senha: "",
  });

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

            Cadastre-se para ter acesso a todos os protudos

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
    maxLength={15} // Limita o tamanho para o formato brasileiro
    value={form.celular}
    onChangeText={(val) => setForm({ ...form, celular: val})}
  />
</View>

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
    <Text style={{ color: 'red', fontSize: 12 }}>O e-mail precisa ser válido!</Text>
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

          <TouchableOpacity
            style={styles.btnFinalizar}
            onPress={() => console.log("Dados:", form)}
          >
            <Text style={styles.btnText}>CRIAR CONTA</Text>
          </TouchableOpacity>
          <Link href="/(tabs)/login" asChild>
            <TouchableOpacity style={styles.btnVoltar}>
              <Text style={styles.textVoltar}>
                Já possui uma conta? Faça o Login
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ImageBackground>
  );
}

const formatPhoneNumber = (text: string) => {
  const cleaned = text.replace(/\D/g, ''); // Remove tudo que não é número
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);

  if (!match) return cleaned;
  
  if (!match[2]) return match[1];
  return `(${match[1]}) ${match[2]}${match[3] ? '-' + match[3] : ''}`;
};

const validatePhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, ''); // Remove ( ) - e espaços
  return cleaned.length === 11; //Verifica se tem 11 números (DDD e o restante)
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
  textVoltar: {
    color: "#666",
    fontSize: 14,
  },
});
