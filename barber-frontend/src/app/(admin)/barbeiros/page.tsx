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
  Badge,
  VStack,
  Divider,
  IconButton,
  HStack,
  Spinner,
  Center,
  Avatar,
} from "@chakra-ui/react";
import { Plus, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Tipagem do Barbeiro que vem do Backend
interface Barber {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  openTime: string;
  closeTime: string;
}

export default function BarbeirosPage() {
  // Chamada à API utilizando o React Query
  const {
    data: barbers = [],
    isLoading,
    isError,
  } = useQuery<Barber[]>({
    queryKey: ["barbers"],
    queryFn: async () => {
      const response = await api.get("/barbers");
      return response.data;
    },
  });

  // Função simples para formatar o telefone (Ex: 11999999999 -> (11) 99999-9999)
  const formatPhone = (phone: string | null) => {
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
            Barbeiros
          </Heading>
          <Text color="gray.500" mt={1}>
            Gerencie a equipe e horários de atendimento
          </Text>
        </Box>
        <Button size="sm" colorScheme="blue" leftIcon={<Plus size={16} />}>
          Novo barbeiro
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
              Erro ao carregar os barbeiros. Tente novamente.
            </Text>
          </Center>
        )}

        {/* Lista de Barbeiros */}
        {!isLoading && !isError && (
          <>
            {/* === VISÃO DESKTOP (Tabela) === */}
            <Box display={{ base: "none", md: "block" }} overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Profissional</Th>
                    <Th>Contato</Th>
                    <Th>Expediente</Th>
                    <Th>Status</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {barbers.map((barber) => (
                    <Tr key={barber.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={barber.name}
                            bg="blue.500"
                            color="white"
                          />
                          <Text fontWeight="medium" color="gray.900">
                            {barber.name}
                          </Text>
                        </HStack>
                      </Td>
                      <Td color="gray.600">{formatPhone(barber.phone)}</Td>
                      <Td color="gray.600">
                        {barber.openTime} - {barber.closeTime}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme="green"
                          variant="subtle"
                          px={2}
                          py={0.5}
                          borderRadius="md"
                        >
                          Ativo
                        </Badge>
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

                  {barbers.length === 0 && (
                    <Tr>
                      <Td
                        colSpan={5}
                        textAlign="center"
                        py={6}
                        color="gray.500"
                      >
                        Nenhum profissional encontrado.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>

            {/* === VISÃO MOBILE (Lista) === */}
            <Box display={{ base: "block", md: "none" }}>
              <VStack align="stretch" spacing={0} divider={<Divider />}>
                {barbers.map((barber) => (
                  <Box key={barber.id} p={4}>
                    <Flex align="center" justify="space-between" mb={2}>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={barber.name}
                          bg="blue.500"
                          color="white"
                        />
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="gray.900"
                          >
                            {barber.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatPhone(barber.phone)}
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

                    <Flex
                      align="center"
                      justify="space-between"
                      mt={3}
                      bg="gray.50"
                      p={2}
                      borderRadius="md"
                    >
                      <Text fontSize="xs" color="gray.600">
                        {barber.openTime} às {barber.closeTime}
                      </Text>
                      <Badge
                        colorScheme="green"
                        variant="subtle"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                      >
                        Ativo
                      </Badge>
                    </Flex>
                  </Box>
                ))}

                {barbers.length === 0 && (
                  <Box p={6} textAlign="center" color="gray.500">
                    Nenhum profissional encontrado.
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
