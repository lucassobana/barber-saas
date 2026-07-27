"use client";

import { Box, Flex, Icon, Text, VStack, Image } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiScissors,
  FiList,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

// === CORES DA MARCA ===
const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";
const BRAND_LIGHT = "#FDF8F5"; // Fundo leve para o hover
const TEXT_DARK = "#3D3D3D";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    icon: FiHome,
    path: "/dashboard",
    roles: ["ADMIN", "BARBER", "OWNER"],
  },
  {
    name: "Agenda",
    icon: FiCalendar,
    path: "/agenda",
    roles: ["ADMIN", "BARBER", "OWNER"],
  },
  {
    name: "Clientes",
    icon: FiUsers,
    path: "/clientes",
    roles: ["ADMIN", "BARBER", "OWNER"],
  },
  {
    name: "Barbeiros",
    icon: FiScissors,
    path: "/barbeiros",
    roles: ["ADMIN", "OWNER"],
  },
  {
    name: "Serviços",
    icon: FiList,
    path: "/servicos",
    roles: ["ADMIN", "BARBER", "OWNER"],
  },
  {
    name: "Configurações",
    icon: FiSettings,
    path: "/configuracoes",
    roles: ["ADMIN", "OWNER"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const authorizedNavItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.memberships[0].role),
  );

  return (
    <Box
      w="64"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      h="100vh"
      position="fixed"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="center">
        {/* LOGO ADICIONADA AQUI */}
        <Image
          src="/ProximoCorteLogo.png"
          alt="PróximoCorte"
          h="180px"
          objectFit="contain"
          fallback={
            <Text fontSize="xl" fontWeight="bold" color={BRAND_COLOR}>
              PróximoCorte
            </Text>
          }
        />
      </Flex>

      <VStack spacing={2} align="stretch" mt={6} px={4}>
        {authorizedNavItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Box
              as={Link}
              href={item.path}
              key={item.name}
              p="3"
              mx="2"
              borderRadius="lg"
              role="group"
              cursor="pointer"
              bg={isActive ? BRAND_COLOR : "transparent"}
              color={isActive ? "white" : "gray.600"}
              _hover={{
                bg: isActive ? BRAND_HOVER : BRAND_LIGHT,
                color: isActive ? "white" : TEXT_DARK,
              }}
              display="flex"
              alignItems="center"
              transition="all 0.2s"
            >
              <Icon mr="4" fontSize="16" as={item.icon} />
              <Text fontWeight={isActive ? "semibold" : "medium"}>
                {item.name}
              </Text>
            </Box>
          );
        })}

        <Box
          as="a"
          onClick={signOut}
          p="3"
          mx="2"
          mt={8}
          borderRadius="lg"
          role="group"
          cursor="pointer"
          color="red.500"
          _hover={{ bg: "red.50", color: "red.600" }}
          display="flex"
          alignItems="center"
          transition="all 0.2s"
        >
          <Icon mr="4" fontSize="16" as={FiLogOut} />
          <Text fontWeight="medium">Sair</Text>
        </Box>
      </VStack>
    </Box>
  );
}
