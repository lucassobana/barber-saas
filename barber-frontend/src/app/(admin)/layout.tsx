"use client";

import { Box, Flex, Image } from "@chakra-ui/react";
import { Sidebar } from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex
      minH="100vh"
      bg="bg-app"
      direction={{ base: "column", md: "row" }}
    >
      {/* TOPO MOBILE: Altura travada para nunca engolir a tela */}
      <Flex
        display={{ base: "flex", md: "none" }}
        w="full"
        h="80px" // Altura exata da barra travada aqui
        bg="bg-app"
        justify="center"
        align="center"
        borderBottomWidth="1px"
        borderColor="border-subtle"
        position="sticky"
        top={0}
        zIndex={90}
        shadow="sm"
        overflow="hidden" // Se a imagem for gigante, ela não vai "vazar" pela tela
      >
        <Image
          src="/ProximoCorteLogo.png"
          alt="PróximoCorte"
          w="180px" // Focamos na largura para 180px
          h="100%"
          objectFit="contain"
          transform="scale(2.5)" // Esse é o "zoom". Pode aumentar para 1.5, 1.8 se ainda estiver pequena
        />
      </Flex>

      {/* SIDEBAR INTELIGENTE (Bottom Nav no Mobile, Sticky/Hover no Desktop) */}
      <Sidebar />

      {/* CONTEÚDO PRINCIPAL (Main Content) */}
      <Box
        as="main"
        flex="1"
        minW="0"
        p={{ base: 4, md: 8 }}
        pb={{ base: 24, md: 8 }}
        transition="all 0.3s ease"
      >
        {children}
      </Box>
    </Flex>
  );
}
