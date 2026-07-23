"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [isMounted, setIsMounted] = useState(false);

  // Força a aplicação a esperar o navegador assumir o controle (Client-Side)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Só carrega o Chakra e a Autenticação DEPOIS que sair do servidor */}
      {isMounted ? (
        <ChakraProvider>
          <AuthProvider>{children}</AuthProvider>
        </ChakraProvider>
      ) : (
        <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }} />
      )}
    </QueryClientProvider>
  );
}