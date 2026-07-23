"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Divider,
  IconButton,
  HStack,
  Spinner,
  Center,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import { Plus, MoreHorizontal, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Tipagem do Cliente que vem do Backend
interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  notes: string | null;
}

export default function ClientesPage() {
  // Chamada à API utilizando o React Query
  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await api.get("/clients");
      return response.data;
    },
  });

  // Função para formatar o telefone
  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "-";
    const cleaned = ("" + phone).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  return (
    <Box>
      {/* Cabeçalho da Página */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        mb={6}
        gap={4}
      >
        <Box>
          <Heading size="lg" color="gray.900">
            Clientes
          </Heading>
          <Text color="gray.500" mt={1}>
            Gerencie a base de clientes da barbearia
          </Text>
        </Box>
        <Button size="sm" colorScheme="blue" leftIcon={<Plus size={16} />}>
          Novo cliente
        </Button>
      </Flex>

      {/* Container Principal */}
      <Box
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="sm"
        overflow="hidden"
      >
        {/* Loading State */}
        {isLoading && (
          <Center p={10}>
            <Spinner color="blue.500" size="xl" />
          </Center>
        )}

        {/* Error State */}
        {isError && (
          <Center p={10}>
            <Text color="red.500">
              Erro ao carregar os clientes. Tente novamente.
            </Text>
          </Center>
        )}

        {/* Lista de Clientes */}
        {!isLoading && !isError && (
          <>
            {/* === VISÃO DESKTOP (Tabela) === */}
            <Box display={{ base: "none", md: "block" }} overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Cliente</Th>
                    <Th>Telefone</Th>
                    <Th>WhatsApp</Th>
                    <Th>Anotações</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {clients.map((client) => (
                    <Tr key={client.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={client.name}
                            bg="gray.200"
                            color="gray.600"
                          />
                          <Text fontWeight="medium" color="gray.900">
                            {client.name}
                          </Text>
                        </HStack>
                      </Td>
                      <Td color="gray.600">{formatPhone(client.phone)}</Td>
                      <Td>
                        {client.whatsapp ? (
                          <Badge
                            colorScheme="green"
                            variant="subtle"
                            display="flex"
                            alignItems="center"
                            w="fit-content"
                            px={2}
                            py={1}
                            gap={1}
                          >
                            <MessageCircle size={12} />
                            {formatPhone(client.whatsapp)}
                          </Badge>
                        ) : (
                          <Text color="gray.400" fontSize="sm">
                            -
                          </Text>
                        )}
                      </Td>
                      <Td
                        color="gray.500"
                        fontSize="sm"
                        maxW="200px"
                        isTruncated
                      >
                        {client.notes || "-"}
                      </Td>
                      <Td textAlign="right">
                        <IconButton
                          aria-label="Opções"
                          icon={<MoreHorizontal size={16} />}
                          size="sm"
                          variant="ghost"
                          color="gray.400"
                        />
                      </Td>
                    </Tr>
                  ))}

                  {clients.length === 0 && (
                    <Tr>
                      <Td
                        colSpan={5}
                        textAlign="center"
                        py={6}
                        color="gray.500"
                      >
                        Nenhum cliente cadastrado.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>

            {/* === VISÃO MOBILE (Lista) === */}
            <Box display={{ base: "block", md: "none" }}>
              <VStack align="stretch" spacing={0} divider={<Divider />}>
                {clients.map((client) => (
                  <Box key={client.id} p={4}>
                    <Flex align="center" justify="space-between" mb={2}>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={client.name}
                          bg="gray.200"
                          color="gray.600"
                        />
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="gray.900"
                          >
                            {client.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatPhone(client.phone)}
                          </Text>
                        </Box>
                      </HStack>
                      <IconButton
                        aria-label="Opções"
                        icon={<MoreHorizontal size={16} />}
                        size="sm"
                        variant="ghost"
                        color="gray.400"
                      />
                    </Flex>

                    {client.whatsapp && (
                      <Badge
                        mt={2}
                        colorScheme="green"
                        variant="subtle"
                        display="inline-flex"
                        alignItems="center"
                        px={2}
                        py={1}
                        gap={1}
                      >
                        <MessageCircle size={12} />
                        WhatsApp: {formatPhone(client.whatsapp)}
                      </Badge>
                    )}
                  </Box>
                ))}

                {clients.length === 0 && (
                  <Box p={6} textAlign="center" color="gray.500">
                    Nenhum cliente cadastrado.
                  </Box>
                )}
              </VStack>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
