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
  TextInput,
  ActivityIndicator,
} from "react-native";

import {
  Bell,
  User,
  LogOut,
  UserCircle,
  Syringe,
  Plus,
  Trash2
} from "lucide-react-native";
import { auth, db } from "../../config/firebaseConfig";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

// Tipagem atualizada para receber a quantidade
interface Medicamento {
  id: string;
  title: string;
  quantity: string;
}

export default function UserScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Produtor");
  const [userId, setUserId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // Estados do CRUD
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loadingCrud, setLoadingCrud] = useState(false);
  const [modalCrudVisible, setModalCrudVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [medTitle, setMedTitle] = useState("");
  const [medQuantity, setMedQuantity] = useState(""); // Novo estado para a quantidade

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const handleMenuOption = (option: string) => {
    setMenuVisible(false); // Fecha o menu
    
    switch (option) {
      case "profile":
        // Verifica se há um usuário logado
        if (!auth.currentUser) {
          if (Platform.OS === "web") {
            window.alert("É necessário realizar o login para acessar o perfil.");
          } else {
            Alert.alert("Acesso Restrito", "É necessário realizar o login para acessar o perfil.");
          }
        } else {
          // Se tiver logado, vai para a tela
          router.push("/ownPerfil");
        }
        break;
      case "logout":
        handleLogout();
        break;
    }
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    if (Platform.OS === "web") {
      const confirmacao = window.confirm("Deseja realmente sair da sua conta?");
      if (confirmacao) {
        try {
          await signOut(auth);
        } catch (error) {
          window.alert("Erro: Não foi possível encerrar a sessão.");
        }
      }
    } else {
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

  // --- FUNÇÕES DO CRUD DE MEDICAMENTOS ---

  const fetchMedicamentos = async (uid: string) => {
    setLoadingCrud(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users", uid, "medicamentos"));
      const lista: Medicamento[] = [];
      querySnapshot.forEach((doc) => {
        // Agora busca a quantidade do banco também (com fallback para "0" caso não tenha)
        lista.push({ 
          id: doc.id, 
          title: doc.data().title, 
          quantity: doc.data().quantity || "0" 
        });
      });
      setMedicamentos(lista);
    } catch (error) {
      console.error("Erro ao buscar medicamentos:", error);
    } finally {
      setLoadingCrud(false);
    }
  };

  const handleSaveMedicamento = async () => {
    if (!medTitle.trim() || !userId) {
      Alert.alert("Aviso", "O nome do produto é obrigatório.");
      return;
    }
    
    // Se a quantidade estiver vazia, salva como "0"
    const qtdFinal = medQuantity.trim() ? medQuantity : "0";

    try {
      if (editingId) {
        const medRef = doc(db, "users", userId, "medicamentos", editingId);
        await updateDoc(medRef, { 
          title: medTitle,
          quantity: qtdFinal
        });
      } else {
        await addDoc(collection(db, "users", userId, "medicamentos"), {
          title: medTitle,
          quantity: qtdFinal
        });
      }
      
      closeCrudModal();
      fetchMedicamentos(userId);
    } catch (error) {
      console.error("Erro ao salvar medicamento:", error);
      Alert.alert("Erro", "Não foi possível salvar o medicamento.");
    }
  };

  const handleDeleteMedicamento = async () => {
    if (!editingId || !userId) return;

    try {
      await deleteDoc(doc(db, "users", userId, "medicamentos", editingId));
      closeCrudModal();
      fetchMedicamentos(userId);
    } catch (error) {
      console.error("Erro ao excluir medicamento:", error);
      Alert.alert("Erro", "Não foi possível excluir o medicamento.");
    }
  };

  const openEditModal = (med: Medicamento) => {
    setEditingId(med.id);
    setMedTitle(med.title);
    setMedQuantity(med.quantity); // Preenche a quantidade atual no modal
    setModalCrudVisible(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setMedTitle("");
    setMedQuantity(""); // Limpa o campo de quantidade ao abrir
    setModalCrudVisible(true);
  };

  const closeCrudModal = () => {
    setModalCrudVisible(false);
    setEditingId(null);
    setMedTitle("");
    setMedQuantity("");
  };

  // --- FIM DAS FUNÇÕES CRUD ---

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const fullName = userDoc.data().nome || "Produtor";
            setUserName(fullName.split(" ")[0]);
          }
          fetchMedicamentos(user.uid);
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
        }
      } else {
        router.replace("/(tabs)/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Olá, </Text>
          <Text style={styles.nameText}>{userName}</Text>
        </View>

        <TouchableOpacity style={styles.profileBtn} onPress={toggleMenu} activeOpacity={0.7}>
          <User color="#2D5A27" size={24} />
        </TouchableOpacity>

        <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={toggleMenu}>
          <Pressable style={styles.modalOverlay} onPress={toggleMenu}>
            <View style={styles.menuBar}>
              <TouchableOpacity style={styles.menuBarItem} onPress={() => handleMenuOption("profile")}>
                <UserCircle color="#2D5A27" size={20} />
                <Text style={styles.menuBarText}>Mostrar Perfil</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuBarItem} onPress={() => handleMenuOption("logout")}>
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

        {/* Grid de Produtos (CRUD) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produtos</Text>
          {loadingCrud && <ActivityIndicator size="small" color="#2D5A27" />}
        </View>

        <View style={styles.grid}>
          {medicamentos.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem}
              onPress={() => openEditModal(item)}
            >
              <View style={styles.iconContainer}>
                <Syringe color="#2D5A27" size={30} />
              </View>
              <Text style={styles.gridText} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.gridQuantity}>{item.quantity} un</Text>
            </TouchableOpacity>
          ))}

          {/* Botão de Adicionar Novo */}
          <TouchableOpacity style={styles.gridItemAdd} onPress={openAddModal}>
            <View style={[styles.iconContainer, { backgroundColor: "#FFF" }]}>
              <Plus color="#2D5A27" size={30} />
            </View>
            <Text style={[styles.gridText, { color: "#2D5A27" }]}>Adicionar</Text>
          </TouchableOpacity>
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

      {/* Modal CRUD (Criar/Editar Medicamento) */}
      <Modal visible={modalCrudVisible} transparent={true} animationType="slide" onRequestClose={closeCrudModal}>
        <View style={styles.crudModalOverlay}>
          <View style={styles.crudModalBox}>
            <Text style={styles.crudModalTitle}>
              {editingId ? "Editar Produto" : "Novo Produto"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite o nome do produto"
              value={medTitle}
              onChangeText={setMedTitle}
              autoCapitalize="words"
            />

            {/* Novo TextInput para a Quantidade */}
            <TextInput
              style={styles.input}
              placeholder="Quantidade (ex: 10)"
              value={medQuantity}
              onChangeText={setMedQuantity}
              keyboardType="numeric" // Abre o teclado numérico
            />

            <View style={styles.crudButtonsContainer}>
              <TouchableOpacity style={styles.btnCancel} onPress={closeCrudModal}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSave} onPress={handleSaveMedicamento}>
                <Text style={styles.btnSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>

            {editingId && (
              <TouchableOpacity style={styles.btnDelete} onPress={handleDeleteMedicamento}>
                <Trash2 color="#C62828" size={20} />
                <Text style={styles.btnDeleteText}>Excluir Produto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, marginBottom: 10, zIndex: 10 },
  welcomeText: { fontSize: 16, color: "#666" },
  nameText: { fontSize: 22, fontWeight: "bold", color: "#2D5A27" },
  profileBtn: { backgroundColor: "#E8F5E9", padding: 12, borderRadius: 50, minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.1)", justifyContent: "flex-start", alignItems: "flex-end" },
  menuBar: { backgroundColor: "#FFF", marginTop: 80, marginRight: 20, borderRadius: 15, width: 200, paddingVertical: 10, elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  menuBarItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 15 },
  menuBarText: { fontSize: 15, fontWeight: "500", color: "#333", marginLeft: 12 },
  menuDivider: { height: 1, backgroundColor: "#EEE", marginVertical: 5, marginHorizontal: 15 },
  bannerCard: { backgroundColor: "#2D5A27", borderRadius: 20, padding: 20, marginTop: 10 },
  bannerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  bannerSubtitle: { color: "#E8F5E9", fontSize: 14, marginTop: 5, marginBottom: 15 },
  bannerBtn: { backgroundColor: "#FFF", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, alignSelf: "flex-start" },
  bannerBtnText: { color: "#2D5A27", fontWeight: "bold", fontSize: 12 },
  
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 30, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  
  grid: { flexDirection: "row", flexWrap: "wrap", gap: "4%" },
  gridItem: { backgroundColor: "#FFF", width: "48%", height: 130, borderRadius: 15, padding: 15, justifyContent: "center", alignItems: "center", marginBottom: 15, elevation: 2 },
  gridItemAdd: { backgroundColor: "#E8F5E9", width: "48%", height: 130, borderRadius: 15, padding: 15, justifyContent: "center", alignItems: "center", marginBottom: 15, borderWidth: 1, borderColor: "#2D5A27", borderStyle: "dashed" },
  iconContainer: { backgroundColor: "#E8F5E9", padding: 12, borderRadius: 12, marginBottom: 10 },
  gridText: { fontSize: 14, fontWeight: "600", color: "#333", textAlign: "center" },
  gridQuantity: { fontSize: 12, color: "#666", marginTop: 4, fontWeight: "500" }, // Estilo adicionado para a quantidade no grid
  
  alertSection: { backgroundColor: "#FFF", borderRadius: 15, padding: 15, borderLeftWidth: 5, borderLeftColor: "#C62828", marginTop: 10 },
  alertHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  alertTitle: { fontSize: 15, fontWeight: "bold", color: "#C62828", marginLeft: 8 },
  alertText: { color: "#555", fontSize: 13, marginBottom: 3 },

  crudModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  crudModalBox: { backgroundColor: "#FFF", width: "100%", borderRadius: 20, padding: 20, elevation: 5 },
  crudModalTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, fontSize: 16, color: "#333", backgroundColor: "#F9F9F9", marginBottom: 15 }, // Ajustei a margem
  crudButtonsContainer: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 10 },
  btnCancel: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#EEE", alignItems: "center" },
  btnCancelText: { color: "#333", fontWeight: "bold", fontSize: 16 },
  btnSave: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#2D5A27", alignItems: "center" },
  btnSaveText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  btnDelete: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20, padding: 12, borderRadius: 10, backgroundColor: "#FFEBEE" },
  btnDeleteText: { color: "#C62828", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
});