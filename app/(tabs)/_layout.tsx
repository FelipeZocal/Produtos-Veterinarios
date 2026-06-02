import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ShoppingCart } from 'lucide-react-native';
import { CartProvider } from '../../context/cartContext'; 

// Importações para o Push Notification
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { auth, db } from '../../config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // Inicia o hook de notificações
  const { expoPushToken } = usePushNotifications();

  // Salva o token no Firestore sempre que ele for gerado e houver um usuário logado
  useEffect(() => {
    const saveTokenToUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && expoPushToken) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          // Atualiza o documento do usuário adicionando o token do dispositivo
          await updateDoc(userRef, {
            pushToken: expoPushToken,
            updatedAt: new Date()
          });
          console.log("Token salvo no Firestore com sucesso!");
        } catch (error) {
          console.log("Erro ao salvar token no Firestore:", error);
        }
      }
    };

    saveTokenToUser();
  }, [expoPushToken]); // Executa toda vez que o token for gerado

  return (
    <CartProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: 'Carrinho',
            tabBarIcon: ({ color }) => <ShoppingCart size={28} color={color} />,
          }}
        />
      </Tabs>
    </CartProvider>
  );
}