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
} from "react-native";
import {
  Beef, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Bell, 
  User 
} from "lucide-react-native";
import { auth, db } from "../../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth"; // Importe o signOut
import { useRouter } from "expo-router"; // Para redirecionar

export default function UserScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Produtor");

  const handleLogout = () => {
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
              router.replace("../(tabs)/index"); 
            } catch (_error) {
              Alert.alert("Erro", "Não foi possível sair.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          // Garante que o nome existe antes de dar o split
          const fullName = userDoc.data().nome || "Produtor";
          setUserName(fullName.split(" ")[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    } else {
      // Se não houver usuário, manda para a tela inicial
      router.replace("../(tabs)/index");
    }
  });

  return () => unsubscribe();
}, [router]);

  const menuItems = [
    { id: 1, title: "Produtos", icon: <Package color="#2D5A27" size={30} />, route: "/products" },
    { id: 2, title: "Meus Pedidos", icon: <ShoppingCart color="#2D5A27" size={30} />, route: "/orders" },
    { id: 3, title: "Vacinação", icon: <Beef color="#2D5A27" size={30} />, route: "/vaccines" },
    { id: 4, title: "Relatórios", icon: <ClipboardList color="#2D5A27" size={30} />, route: "/reports" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Personalizado */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}> {/* O flex: 1 garante que o texto não "atropele" o botão */}
          <Text style={styles.welcomeText}>Olá, </Text>
          <Text style={styles.nameText}>{userName}</Text>
        </View>

        {/* Use apenas um TouchableOpacity para evitar sobreposição */}
        <TouchableOpacity 
          style={styles.profileBtn} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <User color="#2D5A27" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Card de Destaque / Promoção */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>Suplementação Mineral</Text>
          <Text style={styles.bannerSubtitle}>Confira as ofertas da semana para o seu rebanho.</Text>
          <TouchableOpacity style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Ver Ofertas</Text>
          </TouchableOpacity>
        </View>

        {/* Grade de Menu (Grid) */}
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.gridItem}>
              <View style={styles.iconContainer}>{item.icon}</View>
              <Text style={styles.gridText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seção de Avisos */}
        <View style={styles.alertSection}>
          <View style={styles.alertHeader}>
            <Bell color="#C62828" size={20} />
            <Text style={styles.alertTitle}>Lembretes Importantes</Text>
          </View>
          <Text style={styles.alertText}>• Vacinação contra Aftosa em 5 dias.</Text>
          <Text style={styles.alertText}>• Reposição de estoque: Vermífugos.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20, // Aumente se o botão estiver muito colado no topo
    marginBottom: 10,
    zIndex: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D5A27",
    maxWidth: "100%",
  },
  profileBtn: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 50,
    // Garante uma área de clique mínima de 44x44 (padrão Apple/Google)
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCard: {
    backgroundColor: "#2D5A27",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    elevation: 5,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  bannerSubtitle: {
    color: "#E8F5E9",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
  },
  bannerBtn: {
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  bannerBtnText: {
    color: "#2D5A27",
    fontWeight: "bold",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 30,
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    backgroundColor: "#FFF",
    width: "47%",
    height: 120,
    borderRadius: 15,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  gridText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  alertSection: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    borderLeftWidth: 5,
    borderLeftColor: "#C62828",
    marginTop: 10,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#C62828",
    marginLeft: 8,
  },
  alertText: {
    color: "#555",
    fontSize: 13,
    marginBottom: 3,
  },
});