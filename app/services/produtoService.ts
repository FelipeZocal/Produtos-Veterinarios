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

export const produtoService = {
  // CREATE: Adicionar um novo produto com os novos campos
  adicionar: async (userId: string, produto: ProdutoVet) => {
    try {
      const docRef = await addDoc(collection(db, "users", userId, "medicamentos"), {
        nome: produto.nome,
        quantidade: produto.quantidade,
        descricao: produto.descricao || "",
        preco: produto.preco || "",
        categoria: produto.categoria || "",
        imagemUrl: produto.imagemUrl || "",
      });
      console.log("Produto salvo com sucesso!");
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar produto no Service:", error);
      throw error;
    }
  },

  // READ: Buscar todos os produtos, agora trazendo a imagem e detalhes
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

  // UPDATE: Atualizar um produto existente
  atualizar: async (userId: string, produtoId: string, dadosAtualizados: Partial<ProdutoVet>) => {
    try {
      const docRef = doc(db, "users", userId, "medicamentos", produtoId);
      await updateDoc(docRef, dadosAtualizados);
      console.log("Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar produto no Service:", error);
      throw error;
    }
  },

  // DELETE: Excluir um produto
  deletar: async (userId: string, produtoId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId, "medicamentos", produtoId));
      console.log("Produto deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar produto no Service:", error);
      throw error;
    }
  },
};