import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../config/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  UserCircle2,
  Pencil
} from "lucide-react-native";

export default function UserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    celular: "",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editType, setEditType] = useState<"email" | "celular" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData({
              nome: data.nome || "Nome não informado",
              email: currentUser.email || "Email não informado",
              celular: data.celular || "Celular não informado",
            });
          } else {
            setUserData((prev) => ({
              ...prev,
              email: currentUser.email || "Email não informado",
            }));
          }
        } catch (error) {
          console.error("Erro ao buscar dados do perfil:", error);
        } finally {
          setLoading(false);
        }
      } else {
        router.replace("/(tabs)/login");
      }
    };

    fetchUserData();
  }, [router]);

  // Função para abrir o modal no campo correto
  const openEditModal = (type: "email" | "celular", currentValue: string) => {
    setEditType(type);
    setEditValue(currentValue !== "Email não informado" && currentValue !== "Celular não informado" ? currentValue : "");
    setModalVisible(true);
  };

  const closeEditModal = () => {
    setModalVisible(false);
    setEditType(null);
    setEditValue("");
  };

  // Função para salvar as alterações no Firebase
  const handleSave = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !editValue.trim()) return;

    setIsSaving(true);

    try {
      if (editType === "celular") {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { celular: editValue });
        
        setUserData((prev) => ({ ...prev, celular: editValue }));
        Alert.alert("Sucesso", "Celular atualizado com sucesso!");
        
      } else if (editType === "email") {
        // Usa a nova função de segurança do Firebase
        await verifyBeforeUpdateEmail(currentUser, editValue);
        
        // Mostra um aviso de que o link foi enviado
        Alert.alert(
          "Verifique seu e-mail", 
          "Enviamos um link de confirmação para o novo e-mail. A alteração só será concluída após você clicar no link."
        );
      }
      
      closeEditModal();
    } catch (error: any) {
      console.error("Erro completo:", error); // Isso vai imprimir o erro real no seu terminal/console
      
      let mensagemErro = "Não foi possível atualizar o e-mail.";
      
      if (error.code === "auth/requires-recent-login") {
        mensagemErro = "Por segurança, você precisa SAIR do app e fazer login novamente para alterar o e-mail.";
      } else if (error.code === "auth/invalid-email") {
        mensagemErro = "O formato do e-mail é inválido.";
      } else if (error.code === "auth/email-already-in-use") {
        mensagemErro = "Este e-mail já está cadastrado em outra conta.";
      } else {
        // Vai mostrar a mensagem original do Firebase na tela para ajudar a debugar
        mensagemErro = error.message; 
      }

      Alert.alert("Erro", mensagemErro);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/userPage")} style={styles.backButton}>
          <ArrowLeft color="#333" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D5A27" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <UserCircle2 color="#2D5A27" size={80} strokeWidth={1.5} />
            </View>
            <Text style={styles.avatarName}>{userData.nome}</Text>
          </View>

          {/* Card com os dados do usuário */}
          <View style={styles.infoCard}>
            {/* Nome Completo (Apenas leitura) */}
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <User color="#2D5A27" size={20} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Nome Completo</Text>
                <Text style={styles.infoValue}>{userData.nome}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* E-mail (Editável) */}
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Mail color="#2D5A27" size={20} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>E-mail</Text>
                <Text style={styles.infoValue}>{userData.email}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editBtn} 
                onPress={() => openEditModal("email", userData.email)}
              >
                <Pencil color="#666" size={18} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Celular (Editável) */}
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Phone color="#2D5A27" size={20} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Celular</Text>
                <Text style={styles.infoValue}>{userData.celular}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editBtn} 
                onPress={() => openEditModal("celular", userData.celular)}
              >
                <Pencil color="#666" size={18} />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      )}

      {/* MODAL DE EDIÇÃO */}
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={closeEditModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Editar {editType === "email" ? "E-mail" : "Celular"}
            </Text>

            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType={editType === "email" ? "email-address" : "phone-pad"}
              autoCapitalize="none"
              placeholder={editType === "email" ? "Digite o novo e-mail" : "Digite o novo celular"}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={closeEditModal} disabled={isSaving}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.btnSaveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  backButton: { padding: 8, backgroundColor: "#E8F5E9", borderRadius: 50 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  content: { padding: 20 },
  avatarContainer: { alignItems: "center", marginTop: 20, marginBottom: 30 },
  avatarCircle: { width: 120, height: 120, backgroundColor: "#E8F5E9", borderRadius: 60, justifyContent: "center", alignItems: "center", marginBottom: 15, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  avatarName: { fontSize: 22, fontWeight: "bold", color: "#2D5A27", textAlign: "center" },
  infoCard: { backgroundColor: "#FFF", borderRadius: 15, padding: 20, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  iconBox: { width: 40, height: 40, backgroundColor: "#E8F5E9", borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 15 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#888", marginBottom: 2, textTransform: "uppercase", fontWeight: "600" },
  infoValue: { fontSize: 16, color: "#333", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 5, marginLeft: 55 },
  
  editBtn: {
    padding: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#FFF",
    width: "100%",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F9F9F9",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  btnCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#EEE",
    alignItems: "center",
  },
  btnCancelText: { color: "#333", fontWeight: "bold", fontSize: 16 },
  btnSave: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#2D5A27",
    alignItems: "center",
  },
  btnSaveText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});