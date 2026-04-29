import { db } from "../../config/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ProdutoVet } from "../model/ProdutoVet";

// ==========================================
// CONFIGURAÇÕES DO JSONBIN.IO
// ==========================================
const BIN_ID = "69f1512c856a682189849727"; // Cole o ID do seu Bin
const API_KEY = "$2a$10$pnulouZc41jNP9YhnMZ.NewlzETi8jPqwTUWUgix3aEu3tcRBUylu"; // Cole sua Master Key (Começa com $2a$10$...)
const BASE_URL = `https://api.jsonbin.io/v3/b/${"69f1512c856a682189849727"}`;

const headers = {
  "Content-Type": "application/json",
  "X-Master-Key": API_KEY,
};

// --- Funções Auxiliares JSONBin ---
const fetchJsonBin = async () => {
  try {
    const response = await fetch(BASE_URL, { headers });
    if (!response.ok) return [];
    const data = await response.json();
    return data.record.produtos || [];
  } catch (error) {
    console.error("Falha ao ler JSONBin:", error);
    return [];
  }
};

const updateJsonBin = async (produtos: any[]) => {
  try {
    await fetch(BASE_URL, {
      method: "PUT",
      headers,
      body: JSON.stringify({ produtos }),
    });
  } catch (error) {
    console.error("Falha ao atualizar JSONBin:", error);
  }
};
// ==========================================

export const produtoService = {
  
  // CREATE: Adicionar no Firebase e espelhar no JSONBin
  adicionar: async (userId: string, produto: ProdutoVet) => {
    try {
      // 1. SALVA NO FIREBASE (Original)
      const docRef = await addDoc(collection(db, "users", userId, "medicamentos"), {
        nome: produto.nome,
        quantidade: produto.quantidade,
        descricao: produto.descricao || "",
        preco: produto.preco || "",
        categoria: produto.categoria || "",
        imagemUrl: produto.imagemUrl || "",
      });

      // 2. SALVA NO JSONBIN (Nova Integração)
      const produtosBin = await fetchJsonBin();
      produtosBin.push({
        id: docRef.id, // Usa o mesmo ID gerado pelo Firebase para manter sincronizado
        userId: userId, // Identificador de quem é o dono do produto
        nome: produto.nome,
        quantidade: produto.quantidade,
        descricao: produto.descricao || "",
        preco: produto.preco || "",
        categoria: produto.categoria || "",
        imagemUrl: produto.imagemUrl || "",
      });
      await updateJsonBin(produtosBin);

      console.log("Produto salvo com sucesso no Firebase e JSONBin!");
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar produto no Service:", error);
      throw error;
    }
  },

  // READ: Busca do Firebase (mantido para performance)
  buscarTodos: async (userId: string): Promise<ProdutoVet[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "users", userId, "medicamentos"));
      const lista: ProdutoVet[] = [];
      
      querySnapshot.forEach((documento) => {
        const data = documento.data();
        lista.push({
          id: documento.id,
          nome: data.nome,
          quantidade: data.quantidade || "0",
          descricao: data.descricao || "",
          preco: data.preco || "",
          categoria: data.categoria || "",
          imagemUrl: data.imagemUrl || "",
        });
      });
      return lista;
    } catch (error) {
      console.error("Erro ao buscar produtos no Service:", error);
      throw error;
    }
  },

  // UPDATE: Atualiza no Firebase e reflete no JSONBin
  atualizar: async (userId: string, produtoId: string, dadosAtualizados: Partial<ProdutoVet>) => {
    try {
      // 1. ATUALIZA NO FIREBASE
      const docRef = doc(db, "users", userId, "medicamentos", produtoId);
      await updateDoc(docRef, dadosAtualizados);

      // 2. ATUALIZA NO JSONBIN
      const produtosBin = await fetchJsonBin();
      const index = produtosBin.findIndex((p: any) => p.id === produtoId && p.userId === userId);
      
      if (index !== -1) {
        produtosBin[index] = { ...produtosBin[index], ...dadosAtualizados };
        await updateJsonBin(produtosBin);
      }

      console.log("Produto atualizado com sucesso em ambas as bases!");
    } catch (error) {
      console.error("Erro ao atualizar produto no Service:", error);
      throw error;
    }
  },

  // DELETE: Exclui no Firebase e no JSONBin
  deletar: async (userId: string, produtoId: string) => {
    try {
      // 1. DELETA NO FIREBASE
      await deleteDoc(doc(db, "users", userId, "medicamentos", produtoId));

      // 2. DELETA NO JSONBIN
      const produtosBin = await fetchJsonBin();
      const produtosFiltrados = produtosBin.filter(
        (p: any) => !(p.id === produtoId && p.userId === userId)
      );
      await updateJsonBin(produtosFiltrados);

      console.log("Produto deletado com sucesso de ambas as bases!");
    } catch (error) {
      console.error("Erro ao deletar produto no Service:", error);
      throw error;
    }
  },
};