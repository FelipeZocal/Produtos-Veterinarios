import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  SafeAreaView, // Importante para responsividade em telas com "notch"
} from "react-native";
import { Beef, LogIn, UserPlus } from "lucide-react-native"; // Usei Beef por segurança, conforme erro anterior
import { Link } from "expo-router";

export default function WelcomeScreen() {
  return (
    // SafeAreaView garante que o conteúdo não fique sob a barra de status ou 'notch'
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ImageBackground
        source={require("../../assets/images/agrovetbackground.png")}
        style={styles.background}
        resizeMode="cover" // Importante: Garante que a imagem cubra a tela sem distorcer
      >
        <View style={styles.overlay}>
          {/* Logo e Título */}
          <View style={styles.header}>
            /
            <View style={styles.iconCircle}>
              <Beef size={60} color="#2D5A27" />
            </View>
            <Text style={styles.title}>Soluções Veterinárias</Text>
          </View>

          {/* Área de Botões */}
          <View style={styles.buttonContainer}>
            <Link href="/(tabs)/login">
              <TouchableOpacity
                style={[styles.button, styles.buttonLogin]}
                onPress={() => console.log("Entrar")}
                activeOpacity={0.8}
              >
                <LogIn size={20} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Entrar</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(tabs)/register">
              <TouchableOpacity
                style={[styles.button, styles.buttonRegister]}
                onPress={() => console.log("Cadastrar")}
                activeOpacity={0.8}
              >
                <UserPlus size={20} color="#2D5A27" style={styles.buttonIcon} />
                <Text style={[styles.buttonText, styles.textRegister]}>
                  Cadastrar
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa 100% da altura e largura da tela
    backgroundColor: "#000", // Fundo preto caso a imagem demore a carregar
  },
  background: {
    flex: 1, 
    width: "100%",
    height: "100%"
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)", // Camada escura para dar contraste ao texto
    justifyContent: "space-between",
    paddingVertical: 50, // Espaçamento vertical responsivo
    paddingHorizontal: "10%", // Espaçamento horizontal em porcentagem para responsividade
  },
  header: {
    alignItems: "center",
    marginTop: 30,
  },
  iconCircle: {
    width: 1,
    height: 1,
    borderRadius: 1,
    backgroundColor: "rgba(4, 82, 27, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 10,
  },
  title: {
    justifyContent: "flex-start",
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffffff",
    letterSpacing: 1,
    top: 100,
  },
  buttonContainer: {
    gap: 15,
    width: "100%", // Botões ocupam toda a largura disponível (dentro do padding do overlay)
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    width: "100%",
  },
  buttonLogin: {
    backgroundColor: "#2D5A27",
  },
  buttonRegister: {
    backgroundColor: "#FFF",
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  textRegister: {
    color: "#2D5A27",
  },
});
