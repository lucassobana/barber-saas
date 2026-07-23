"use client";

import { Box, Flex, Icon, Text, VStack } from "@chakra-ui/react";
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

// 1. Adicionamos a propriedade 'roles' definindo quem pode ver cada item
const NAV_ITEMS = [
  {
    name: "Dashboard",
    icon: FiHome,
    path: "/dashboard",
    roles: ["ADMIN", "BARBER"],
  },
  {
    name: "Agenda",
    icon: FiCalendar,
    path: "/agenda",
    roles: ["ADMIN", "BARBER"],
  },
  {
    name: "Clientes",
    icon: FiUsers,
    path: "/clientes",
    roles: ["ADMIN", "BARBER"],
  },
  { name: "Barbeiros", icon: FiScissors, path: "/barbeiros", roles: ["ADMIN"] }, // Apenas Admin
  {
    name: "Serviços",
    icon: FiList,
    path: "/servicos",
    roles: ["ADMIN", "BARBER"],
  },
  {
    name: "Configurações",
    icon: FiSettings,
    path: "/configuracoes",
    roles: ["ADMIN"],
  }, // Apenas Admin
];

export function Sidebar() {
  const pathname = usePathname();

  // 2. Extraímos também o 'user' do AuthContext
  const { user, signOut } = useAuth();

  // 3. Filtramos a lista de links baseada no 'role' do usuário logado
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
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
          Barber SaaS
        </Text>
      </Flex>

      <VStack spacing={2} align="stretch" mt={6} px={4}>
        {/* 4. Usamos a lista filtrada no .map */}
        {authorizedNavItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link key={item.name} href={item.path} passHref legacyBehavior>
              <Box
                as="a"
                p="3"
                mx="2"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                bg={isActive ? "blue.500" : "transparent"}
                color={isActive ? "white" : "gray.600"}
                _hover={{
                  bg: isActive ? "blue.600" : "gray.100",
                  color: isActive ? "white" : "gray.900",
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
            </Link>
          );
        })}

        {/* Botão de Logout separado (sempre visível) */}
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
