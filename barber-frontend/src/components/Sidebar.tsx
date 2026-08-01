"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Icon,
  Text,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from "@chakra-ui/react";
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

  const [isHovered, setIsHovered] = useState(false);

  const authorizedNavItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.memberships[0].role),
  );

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      bg="bg-app"
      borderColor="border-subtle"
      position={{ base: "fixed", md: "sticky" }}
      top={{ base: "auto", md: 0 }}
      bottom={{ base: 0, md: "auto" }}
      left="0"
      zIndex="999"
      w={{ base: "full", md: isHovered ? "64" : "20" }}
      h={{ base: "16", md: "100vh" }}
      borderRight={{ base: "none", md: "1px" }}
      borderTop={{ base: "1px", md: "none" }}
      boxShadow={{ base: "0 -4px 10px rgba(0,0,0,0.5)", md: "none" }}
      transition="width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      display="flex"
      flexDirection={{ base: "row", md: "column" }}
      alignItems="center"
    >
      {/* LOGO SEMPRE VISÍVEL: Apenas no Desktop */}
      <Flex
        h="20"
        w="full"
        alignItems="center"
        justifyContent="center"
        display={{ base: "none", md: "flex" }}
        mt={4}
        mb={4}
        overflow="hidden"
        whiteSpace="nowrap"
      >
        <Image
          src="/ProximoCorteLogo.png"
          alt="PróximoCorte"
          h={isHovered ? "180px" : "100px"}
          w="180px"
          objectFit="contain"
          transform="scale(1.25)"
        />
      </Flex>

      {/* MENU DE NAVEGAÇÃO */}
      <Flex
        flex="1"
        direction={{ base: "row", md: "column" }}
        align="center"
        justify={{ base: "space-between", md: "flex-start" }} // Distribui o espaço igualmente no celular
        px={{ base: 1, md: 2 }} // Menos padding nas laterais do container
        py={{ base: 0, md: 2 }}
        gap={{ base: 0, md: 2 }} // Sem buracos entre os ícones no mobile
        w="full"
        h="full"
        overflow="hidden" // Bloqueia o scroll lateral
      >
        {authorizedNavItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Box
              as={Link}
              href={item.path}
              key={item.name}
              p={{ base: 1, md: 3 }} // Padding interno bem reduzido no mobile
              mx={{ base: 0, md: 2 }}
              borderRadius="lg"
              role="group"
              cursor="pointer"
              bg={isActive ? "brand-primary" : "transparent"}
              color={isActive ? "white" : "text-secondary"}
              _hover={{
                bg: isActive ? "brand-hover" : "bg-surface-hover",
                color: isActive ? "white" : "text-primary",
              }}
              display="flex"
              flexDirection={{ base: "column", md: "row" }}
              alignItems="center"
              justifyContent={{
                base: "center",
                md: isHovered ? "flex-start" : "center",
              }}
              flex={{ base: 1, md: "none" }} // MÁGICA AQUI: Força todos os botões a terem a mesma largura exata dividindo a tela
              minW="0" // Evita que os textos forcem o bloco a crescer e gerar scroll
              w={{ base: "auto", md: "calc(100% - 16px)" }}
              transition="all 0.2s"
              overflow="hidden"
              whiteSpace="nowrap"
            >
              <Icon
                mr={{ base: 0, md: isHovered ? 4 : 0 }}
                mb={{ base: 1, md: 0 }}
                fontSize={{ base: 18, md: 20 }} // Ícone pouca coisa menor no celular
                as={item.icon}
                transition="margin 0.3s ease"
              />

              <Text
                display={{ base: "block", md: "none" }}
                fontSize="9px" // Fonte reduzida para caber "Configurações" ou afins
                fontWeight={isActive ? "semibold" : "medium"}
                isTruncated // Coloca "..." se o nome for grande demais em celulares muito finos
                w="full"
                textAlign="center"
              >
                {item.name}
              </Text>

              <Text
                display={{ base: "none", md: "block" }}
                fontSize="md"
                fontWeight={isActive ? "semibold" : "medium"}
                opacity={isHovered ? 1 : 0}
                w={isHovered ? "auto" : 0}
                transition="opacity 0.3s ease, width 0.3s ease"
              >
                {item.name}
              </Text>
            </Box>
          );
        })}
      </Flex>

      {/* BLOCO DO USUÁRIO */}
      <Box
        p={{ base: 2, md: 4 }}
        borderTopWidth={{ base: 0, md: "1px" }}
        borderLeftWidth={{ base: "1px", md: 0 }}
        borderColor="border-subtle"
        display={{ base: "none", md: "flex" }}
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Menu placement="top-start">
          <MenuButton
            as={Flex}
            w={{ base: "auto", md: "full" }}
            p={{ base: 1, md: 2 }}
            borderRadius="lg"
            _hover={{ bg: "bg-surface-hover" }}
            cursor="pointer"
            alignItems="center"
            justifyContent="center"
            transition="all 0.2s"
          >
            <Flex
              align="center"
              justify={{
                base: "center",
                md: isHovered ? "flex-start" : "center",
              }}
              w="full"
            >
              <Avatar
                size="sm"
                name={user?.name}
                bg="brand-primary"
                color="white"
              />

              <Box
                display={{ base: "none", md: "block" }}
                ml={isHovered ? 3 : 0}
                textAlign="left"
                overflow="hidden"
                opacity={isHovered ? 1 : 0}
                w={isHovered ? "auto" : 0}
                transition="opacity 0.3s ease, width 0.3s ease, margin 0.3s ease"
                whiteSpace="nowrap"
              >
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color="text-primary"
                  isTruncated
                >
                  {user?.name || "Carregando..."}
                </Text>
                <Text
                  fontSize="xs"
                  color="text-muted"
                  isTruncated
                  textTransform="capitalize"
                >
                  {user?.memberships?.[0]?.role?.toLowerCase() || "Usuário"}
                </Text>
              </Box>
            </Flex>
          </MenuButton>
          <MenuList
            bg="bg-surface"
            borderColor="border-subtle"
            shadow="card-shadow"
            zIndex={9999}
          >
            <MenuItem
              bg="bg-surface"
              _hover={{ bg: "bg-surface-hover" }}
              icon={<FiLogOut />}
              onClick={signOut}
              color="status-error"
              fontWeight="medium"
            >
              Sair
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Box>
  );
}
