import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Pressable,
  Platform,
} from "react-native";

import {
  Hospital,
  Package,
  ShoppingCart,
  ClipboardList,
  Bell,
  User,
  Settings, // Adicionado
  LogOut,   // Adicionado
  UserCircle // Adicionado
} from "lucide-react-native";
import { auth, db } from "../../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

export default function UserScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Produtor");
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const handleMenuOption = (option: string) => {
    setMenuVisible(false);
    switch (option) {
      case "profile":
        router.push("/userPage"); // Ajuste para sua rota real
        break;
      case "settings":
        router.push("/userPage"); // Ajuste para sua rota real
        break;
      case "logout":
        handleLogout();
        break;
    }
  };

  const handleLogout = async () => {
    setMenuVisible(false); // Fecha o menu na hora

    // Se estiver rodando no navegador (Web)
    if (Platform.OS === "web") {
      const confirmacao = window.confirm("Deseja realmente sair da sua conta?");
      if (confirmacao) {
        try {
          await signOut(auth);
        } catch (error) {
          window.alert("Erro: Não foi possível encerrar a sessão.");
        }
      }
    } 
    // Se estiver rodando no Celular (Android/iOS)
    else {
      Alert.alert(
        "Sair", 
        "Deseja realmente sair da sua conta?", 
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            style: "destructive",
            onPress: async () => {
              try {
                await signOut(auth);
              } catch (error) {
                Alert.alert("Erro", "Não foi possível encerrar a sessão.");
              }
            },
          },
        ]
      );
    }
  };


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const fullName = userDoc.data().nome || "Produtor";
            setUserName(fullName.split(" ")[0]);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
        }
      } else {
        // Usa o caminho exato que você usou na WelcomeScreen
        router.replace("/(tabs)/login"); 
      }
    });

    return () => unsubscribe();
  }, [router]);

  const menuItems = [
    { id: 1, title: "Produtos", icon: <Package color="#2D5A27" size={30} /> },
    { id: 2, title: "Meus Pedidos", icon: <ShoppingCart color="#2D5A27" size={30} /> },
    { id: 3, title: "Vacinação", icon: <Hospital color="#2D5A27" size={30} /> },
    { id: 4, title: "Relatórios", icon: <ClipboardList color="#2D5A27" size={30} /> },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Olá, </Text>
          <Text style={styles.nameText}>{userName}</Text>
        </View>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={toggleMenu} // Agora abre o menu em vez de deslogar direto
          activeOpacity={0.7}
        >
          <User color="#2D5A27" size={24} />
        </TouchableOpacity>

        {/* Modal do Menu (BAR) */}
        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={toggleMenu}
        >
          <Pressable style={styles.modalOverlay} onPress={toggleMenu}>
            <View style={styles.menuBar}>
              <TouchableOpacity
                style={styles.menuBarItem}
                onPress={() => handleMenuOption("profile")}
              >
                <UserCircle color="#2D5A27" size={20} />
                <Text style={styles.menuBarText}>Mostrar Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuBarItem}
                onPress={() => handleMenuOption("settings")}
              >
                <Settings color="#2D5A27" size={20} />
                <Text style={styles.menuBarText}>Configurações</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuBarItem}
                onPress={() => handleMenuOption("logout")}
              >
                <LogOut color="#C62828" size={20} />
                <Text style={[styles.menuBarText, { color: "#C62828" }]}>Sair</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>Suplementação Mineral</Text>
          <Text style={styles.bannerSubtitle}>Confira as ofertas da semana.</Text>
          <TouchableOpacity style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Ver Ofertas</Text>
          </TouchableOpacity>
        </View>

        {/* Grid de Acesso Rápido */}
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.gridItem}>
              <View style={styles.iconContainer}>{item.icon}</View>
              <Text style={styles.gridText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Avisos */}
        <View style={styles.alertSection}>
          <View style={styles.alertHeader}>
            <Bell color="#C62828" size={20} />
            <Text style={styles.alertTitle}>Lembretes</Text>
          </View>
          <Text style={styles.alertText}>• Vacinação em 5 dias.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
    zIndex: 10,
  },
  welcomeText: { fontSize: 16, color: "#666" },
  nameText: { fontSize: 22, fontWeight: "bold", color: "#2D5A27" },
  profileBtn: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 50,
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  // --- ESTILOS DO MENU BAR ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)", // Sombra leve no fundo
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menuBar: {
    backgroundColor: "#FFF",
    marginTop: 80, // Distância do topo para alinhar com o botão
    marginRight: 20,
    borderRadius: 15,
    width: 200,
    paddingVertical: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  menuBarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuBarText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 5,
    marginHorizontal: 15,
  },
  // --- FIM DOS ESTILOS MENU ---
  bannerCard: { backgroundColor: "#2D5A27", borderRadius: 20, padding: 20, marginTop: 10 },
  bannerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  bannerSubtitle: { color: "#E8F5E9", fontSize: 14, marginTop: 5, marginBottom: 15 },
  bannerBtn: { backgroundColor: "#FFF", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, alignSelf: "flex-start" },
  bannerBtnText: { color: "#2D5A27", fontWeight: "bold", fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 30, marginBottom: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: { backgroundColor: "#FFF", width: "47%", height: 120, borderRadius: 15, padding: 15, justifyContent: "center", alignItems: "center", marginBottom: 20, elevation: 2 },
  iconContainer: { backgroundColor: "#E8F5E9", padding: 12, borderRadius: 12, marginBottom: 10 },
  gridText: { fontSize: 14, fontWeight: "600", color: "#333" },
  alertSection: { backgroundColor: "#FFF", borderRadius: 15, padding: 15, borderLeftWidth: 5, borderLeftColor: "#C62828", marginTop: 10 },
  alertHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  alertTitle: { fontSize: 15, fontWeight: "bold", color: "#C62828", marginLeft: 8 },
  alertText: { color: "#555", fontSize: 13, marginBottom: 3 },
});