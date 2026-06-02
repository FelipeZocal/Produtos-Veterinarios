import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Platform, SafeAreaView, StatusBar } from 'react-native';
import { useCart } from '../../context/cartContext';
import { Trash2, ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  // Importando as novas funções do Contexto
  const { cart, totalCart, clearCart, incrementQuantity, decrementQuantity, removeFromCart } = useCart();
  const [cep, setCep] = useState("");
  const [frete, setFrete] = useState(0);
  const router = useRouter();

  const calcularFrete = () => {
    if (cep.length !== 8) {
      Alert.alert("Aviso", "Digite um CEP válido com 8 dígitos.");
      return;
    }
    const valorFrete = cep.startsWith("15") ? 15.00 : 35.00;
    setFrete(valorFrete);
  };

  const handleClearCart = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm("Deseja realmente excluir os itens do seu carrinho?");
      if (confirm) clearCart();
    } else {
      Alert.alert(
        "Limpar Carrinho",
        "Deseja realmente excluir os itens do seu carrinho?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: clearCart }
        ]
      );
    }
  };

  const handleRemoveItem = (id: string, nome: string) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm(`Deseja realmente remover "${nome}" do carrinho?`);
      if (confirm) removeFromCart(id);
    } else {
      Alert.alert(
        "Remover Produto",
        `Deseja realmente remover "${nome}" do carrinho?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Remover", style: "destructive", onPress: () => removeFromCart(id) }
        ]
      );
    }
  };

  const valorTotalComFrete = totalCart + frete;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/userPage")} style={styles.backButton}>
            <ArrowLeft color="#333" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Meu Carrinho</Text>
          <View style={{ width: 40 }} />
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingCart size={50} color="#CCC" />
            <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={cart}
              keyExtractor={(item) => item.cartId}
              renderItem={({ item }) => {
                const precoFormatado = parseFloat(item.preco ? String(item.preco).replace(",", ".") : "0");
                const precoTotalItem = precoFormatado * item.qtdSelecionada;

                return (
                  <View style={styles.cartItem}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.nome}</Text>
                    <Text style={styles.itemUnit}>Valor un: R$ {precoFormatado.toFixed(2)}</Text>
                    
                    <View style={styles.controlsRow}>
                      {/* Controladores de Quantidade */}
                      <View style={styles.qtyContainer}>
                        <TouchableOpacity 
                          onPress={() => decrementQuantity(item.id!)} 
                          style={styles.qtyBtn}
                        >
                          <Minus size={16} color="#555" />
                        </TouchableOpacity>
                        
                        <Text style={styles.qtyText}>{item.qtdSelecionada}</Text>
                        
                        <TouchableOpacity 
                          onPress={() => incrementQuantity(item.id!)} 
                          style={styles.qtyBtn}
                        >
                          <Plus size={16} color="#555" />
                        </TouchableOpacity>
                      </View>

                      {/* Preço Total do Item e Botão de Excluir */}
                      <View style={styles.priceActionContainer}>
                        <Text style={styles.itemPrice}>R$ {precoTotalItem.toFixed(2)}</Text>
                        
                        {/* ESTE É O BOTÃO QUE CHAMA A CONFIRMAÇÃO */}
                        <TouchableOpacity 
                          onPress={() => handleRemoveItem(item.id!, item.nome)} 
                          style={styles.deleteBtn}
                        >
                          <Trash2 size={20} color="#C62828" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
              <View style={styles.cepContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu CEP (apenas números)"
                  keyboardType="numeric"
                  maxLength={8}
                  value={cep}
                  onChangeText={setCep}
                />
                <TouchableOpacity style={styles.btnCep} onPress={calcularFrete}>
                  <Text style={styles.btnCepText}>Calcular</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.totalsContainer}>
                <Text style={styles.totalText}>Subtotal Produtos: R$ {totalCart.toFixed(2)}</Text>
                <Text style={styles.totalText}>Frete: R$ {frete.toFixed(2)}</Text>
                <Text style={styles.finalTotalText}>
                  Total a Pagar: R$ {valorTotalComFrete.toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity style={styles.btnClear} onPress={handleClearCart}>
                <Trash2 color="#FFF" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.btnClearText}>Limpar Carrinho</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, marginTop: Platform.OS === 'android' ? 20 : 0 },
  backButton: { padding: 8, backgroundColor: "#E8F5E9", borderRadius: 50 },
  title: { fontSize: 22, fontWeight: "bold", color: "#2D5A27" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 10, fontSize: 16, color: "#999" },
  list: { flex: 1 },
  
  // Estilos do Item do Carrinho
  cartItem: { backgroundColor: "#FFF", padding: 15, borderRadius: 10, marginBottom: 12, elevation: 2 },
  itemName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  itemUnit: { fontSize: 13, color: "#666", marginTop: 2, marginBottom: 10 },
  controlsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  
  // Controles de Quantidade (+ e -)
  qtyContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5", borderRadius: 8, paddingHorizontal: 5 },
  qtyBtn: { padding: 8 },
  qtyText: { fontSize: 16, fontWeight: "600", marginHorizontal: 12, color: "#333" },
  
  priceActionContainer: { flexDirection: "row", alignItems: "center" },
  itemPrice: { fontSize: 16, color: "#2D5A27", fontWeight: "bold", marginRight: 15 },
  deleteBtn: { padding: 5 },

  footer: { backgroundColor: "#FFF", padding: 20, borderRadius: 15, elevation: 5, marginTop: 10 },
  cepContainer: { flexDirection: "row", marginBottom: 15 },
  input: { flex: 1, borderWidth: 1, borderColor: "#DDD", borderRadius: 8, paddingHorizontal: 12, height: 45, backgroundColor: "#F9F9F9" },
  btnCep: { backgroundColor: "#2D5A27", justifyContent: "center", paddingHorizontal: 15, borderRadius: 8, marginLeft: 10 },
  btnCepText: { color: "#FFF", fontWeight: "bold" },
  totalsContainer: { marginBottom: 20, borderTopWidth: 1, borderTopColor: "#EEE", paddingTop: 15 },
  totalText: { fontSize: 16, color: "#555", marginBottom: 5 },
  finalTotalText: { fontSize: 20, fontWeight: "bold", color: "#2D5A27", marginTop: 5 },
  btnClear: { flexDirection: "row", backgroundColor: "#C62828", padding: 15, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  btnClearText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});