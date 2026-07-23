"use client";

import { Box } from "@chakra-ui/react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A segurança agora é feita 100% pelo middleware.ts no servidor!
  // Se o código chegou até aqui, é porque o usuário está logado.

  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      <Header />
      <Box ml="64" p="8">
        {children}
      </Box>
    </Box>
  );
}
