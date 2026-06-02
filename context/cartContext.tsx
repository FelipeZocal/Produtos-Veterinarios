import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ProdutoVet } from '../model/ProdutoVet';

export interface CartItem extends ProdutoVet {
  cartId: string;
  qtdSelecionada: number;
}

interface CartContextData {
  cart: CartItem[];
  addToCart: (produto: ProdutoVet) => void;
  removeFromCart: (id: string) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  clearCart: () => void;
  totalCart: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (produto: ProdutoVet) => {
    setCart((prev) => {
      const indexProduto = prev.findIndex((item) => item.id === produto.id);

      if (indexProduto >= 0) {
        const novoCart = [...prev];
        novoCart[indexProduto] = {
          ...novoCart[indexProduto],
          qtdSelecionada: novoCart[indexProduto].qtdSelecionada + 1
        };
        return novoCart;
      } else {
        return [
          ...prev,
          { ...produto, cartId: Math.random().toString(36).substring(7), qtdSelecionada: 1 }
        ];
      }
    });
  };

  // Remove o item completamente da lista
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Aumenta a quantidade em +1
  const incrementQuantity = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qtdSelecionada: item.qtdSelecionada + 1 } : item
      )
    );
  };

  // Diminui a quantidade em -1 (com limite mínimo de 1 para não ficar negativo)
  const decrementQuantity = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.qtdSelecionada > 1
          ? { ...item, qtdSelecionada: item.qtdSelecionada - 1 }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalCart = cart.reduce((acc, item) => {
    const precoFormatado = item.preco ? String(item.preco).replace(",", ".") : "0";
    const preco = parseFloat(precoFormatado);
    return acc + (preco * item.qtdSelecionada);
  }, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        incrementQuantity, 
        decrementQuantity, 
        clearCart, 
        totalCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);