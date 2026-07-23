"use client";

import { Flex, Text, Avatar, Box } from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user } = useAuth();

  return (
    <Flex
      ml="64"
      px="8"
      height="20"
      alignItems="center"
      bg="white"
      borderBottomWidth="1px"
      borderBottomColor="gray.200"
      justifyContent="flex-end"
    >
      <Flex alignItems="center">
        <Box textAlign="right" mr={4}>
          <Text fontSize="sm" fontWeight="bold" color="gray.700">
            {user?.name || "Carregando..."}
          </Text>
          <Text fontSize="xs" color="gray.500">
            Administrador
          </Text>
        </Box>
        <Avatar size="sm" name={user?.name} bg="blue.500" />
      </Flex>
    </Flex>
  );
}
