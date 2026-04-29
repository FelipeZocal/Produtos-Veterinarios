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
  Image,
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
import { doc, getDoc } from "firebase/firestore"; 
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

// Importando Model e Service atualizados
import { ProdutoVet } from "../model/ProdutoVet";
import { produtoService } from "../services/produtoService";

export default function UserScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Produtor");
  const [userId, setUserId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // Estados do CRUD
  const [medicamentos, setMedicamentos] = useState<ProdutoVet[]>([]);
  const [loadingCrud, setLoadingCrud] = useState(false);
  const [modalCrudVisible, setModalCrudVisible] = useState(false);
  
  // Estados do Formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [medNome, setMedNome] = useState("");
  const [medQuantidade, setMedQuantidade] = useState("");
  const [medDescricao, setMedDescricao] = useState("");
  const [medPreco, setMedPreco] = useState("");
  const [medCategoria, setMedCategoria] = useState("");
  const [medImagemUrl, setMedImagemUrl] = useState("");

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const handleMenuOption = (option: string) => {
    setMenuVisible(false);
    switch (option) {
      case "profile":
        if (!auth.currentUser) {
          if (Platform.OS === "web") {
            window.alert("É necessário realizar o login para acessar o perfil.");
          } else {
            Alert.alert("Acesso Restrito", "É necessário realizar o login para acessar o perfil.");
          }
        } else {
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
        try { await signOut(auth); } catch (error: any) { window.alert("Erro ao encerrar sessão."); }
      }
    } else {
      Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: async () => await signOut(auth) },
      ]);
    }
  };

  // --- FUNÇÕES DO CRUD USANDO O SERVICE ---

  const carregarProdutos = async (uid: string) => {
    setLoadingCrud(true);
    try {
      const lista = await produtoService.buscarTodos(uid);
      setMedicamentos(lista);
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
    } finally {
      setLoadingCrud(false);
    }
  };

  const handleSalvar = async () => {
    if (!medNome.trim() || !userId) {
      Alert.alert("Aviso", "O nome do produto é obrigatório.");
      return;
    }
    
    const qtdFinal = medQuantidade.trim() ? medQuantidade : "0";
    setLoadingCrud(true);

    try {
      if (editingId) {
        // UPDATE
        await produtoService.atualizar(userId, editingId, {
          nome: medNome,
          quantidade: qtdFinal,
          descricao: medDescricao,
          preco: medPreco,
          categoria: medCategoria,
          imagemUrl: medImagemUrl,
        });
      } else {
        // CREATE
        await produtoService.adicionar(userId, {
          nome: medNome,
          quantidade: qtdFinal,
          descricao: medDescricao,
          preco: medPreco,
          categoria: medCategoria,
          imagemUrl: medImagemUrl,
        });
      }
      
      closeCrudModal();
      carregarProdutos(userId);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o produto.");
    } finally {
      setLoadingCrud(false);
    }
  };

  const handleDeletar = async () => {
    if (!editingId || !userId) return;
    
    setLoadingCrud(true);
    try {
      // DELETE
      await produtoService.deletar(userId, editingId);
      closeCrudModal();
      carregarProdutos(userId);
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível excluir o produto.");
    } finally {
      setLoadingCrud(false);
    }
  };

  const openEditModal = (produto: ProdutoVet) => {
    setEditingId(produto.id!);
    setMedNome(produto.nome);
    setMedQuantidade(produto.quantidade);
    setMedDescricao(produto.descricao || "");
    setMedPreco(produto.preco || "");
    setMedCategoria(produto.categoria || "");
    setMedImagemUrl(produto.imagemUrl || "");
    setModalCrudVisible(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setMedNome("");
    setMedQuantidade("");
    setMedDescricao("");
    setMedPreco("");
    setMedCategoria("");
    setMedImagemUrl("");
    setModalCrudVisible(true);
  };

  const closeCrudModal = () => {
    setModalCrudVisible(false);
    setEditingId(null);
    setMedNome("");
    setMedQuantidade("");
    setMedDescricao("");
    setMedPreco("");
    setMedCategoria("");
    setMedImagemUrl("");
  };

  // --- EFEITOS ---

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
          carregarProdutos(user.uid);
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
          <Text style={styles.sectionTitle}>Produtos Veterinários</Text>
          {loadingCrud && <ActivityIndicator size="small" color="#2D5A27" />}
        </View>

        <View style={styles.grid}>
          {medicamentos.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem}
              onPress={() => openEditModal(item)}
            >
              {/* Exibe a imagem se houver, caso contrário exibe o ícone padrão */}
              {item.imagemUrl ? (
                <Image source={{ uri: item.imagemUrl }} style={styles.productImage} />
              ) : (
                <View style={styles.iconContainer}>
                  <Syringe color="#2D5A27" size={30} />
                </View>
              )}
              
              <Text style={styles.gridText} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.gridQuantity}>
                {item.quantidade} un {item.preco ? `• R$ ${item.preco}` : ""}
              </Text>
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
          <Text style={styles.alertText}>• Vacinação do rebanho em 5 dias.</Text>
        </View>
      </ScrollView>

      {/* Modal CRUD (Criar/Editar Produto) */}
      <Modal visible={modalCrudVisible} transparent={true} animationType="slide" onRequestClose={closeCrudModal}>
        <View style={styles.crudModalOverlay}>
          <View style={styles.crudModalBox}>
            <Text style={styles.crudModalTitle}>
              {editingId ? "Editar Produto" : "Novo Produto"}
            </Text>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Nome do produto (obrigatório)"
                value={medNome}
                onChangeText={setMedNome}
                autoCapitalize="words"
              />

              <TextInput
                style={styles.input}
                placeholder="Quantidade (ex: 10)"
                value={medQuantidade}
                onChangeText={setMedQuantidade}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Preço (ex: 150.00)"
                value={medPreco}
                onChangeText={setMedPreco}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Categoria (ex: Vacina, Ração)"
                value={medCategoria}
                onChangeText={setMedCategoria}
                autoCapitalize="words"
              />

              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Descrição rápida"
                value={medDescricao}
                onChangeText={setMedDescricao}
                multiline
                textAlignVertical="top"
              />

              <TextInput
                style={styles.input}
                placeholder="Link da Imagem (URL)"
                value={medImagemUrl}
                onChangeText={setMedImagemUrl}
                autoCapitalize="none"
              />
            </ScrollView>

            <View style={styles.crudButtonsContainer}>
              <TouchableOpacity style={styles.btnCancel} onPress={closeCrudModal} disabled={loadingCrud}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSave} onPress={handleSalvar} disabled={loadingCrud}>
                {loadingCrud ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.btnSaveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>

            {editingId && (
              <TouchableOpacity style={styles.btnDelete} onPress={handleDeletar} disabled={loadingCrud}>
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
  gridItem: { backgroundColor: "#FFF", width: "48%", height: 140, borderRadius: 15, padding: 15, justifyContent: "center", alignItems: "center", marginBottom: 15, elevation: 2 },
  gridItemAdd: { backgroundColor: "#E8F5E9", width: "48%", height: 140, borderRadius: 15, padding: 15, justifyContent: "center", alignItems: "center", marginBottom: 15, borderWidth: 1, borderColor: "#2D5A27", borderStyle: "dashed" },
  iconContainer: { backgroundColor: "#E8F5E9", padding: 12, borderRadius: 12, marginBottom: 10 },
  
  // Novo estilo para a imagem do produto
  productImage: { width: 60, height: 60, borderRadius: 12, marginBottom: 10, resizeMode: "cover" },

  gridText: { fontSize: 14, fontWeight: "600", color: "#333", textAlign: "center" },
  gridQuantity: { fontSize: 12, color: "#666", marginTop: 4, fontWeight: "500" },
  alertSection: { backgroundColor: "#FFF", borderRadius: 15, padding: 15, borderLeftWidth: 5, borderLeftColor: "#C62828", marginTop: 10 },
  alertHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  alertTitle: { fontSize: 15, fontWeight: "bold", color: "#C62828", marginLeft: 8 },
  alertText: { color: "#555", fontSize: 13, marginBottom: 3 },
  crudModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  crudModalBox: { backgroundColor: "#FFF", width: "100%", borderRadius: 20, padding: 20, elevation: 5 },
  crudModalTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, fontSize: 16, color: "#333", backgroundColor: "#F9F9F9", marginBottom: 15 },
  crudButtonsContainer: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 10 },
  btnCancel: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#EEE", alignItems: "center" },
  btnCancelText: { color: "#333", fontWeight: "bold", fontSize: 16 },
  btnSave: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#2D5A27", alignItems: "center" },
  btnSaveText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  btnDelete: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20, padding: 12, borderRadius: 10, backgroundColor: "#FFEBEE" },
  btnDeleteText: { color: "#C62828", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
});