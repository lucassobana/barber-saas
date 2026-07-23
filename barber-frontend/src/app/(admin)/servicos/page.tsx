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
  Switch,
  VStack,
  Divider,
  IconButton,
  HStack,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Plus, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Tipagem do Serviço que vem do Backend
interface Service {
  id: string;
  name: string;
  price: string | number;
  duration: number;
}

export default function ServicosPage() {
  // Chamada à API utilizando o React Query
  const {
    data: services = [],
    isLoading,
    isError,
  } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await api.get("/services");
      return response.data;
    },
  });

  // Função para formatar o preço padrão Brasil (BRL)
  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(price));
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
            Serviços
          </Heading>
          <Text color="gray.500" mt={1}>
            Catálogo de atendimentos oferecidos
          </Text>
        </Box>
        <Button size="sm" colorScheme="blue" leftIcon={<Plus size={16} />}>
          Novo serviço
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
              Erro ao carregar os serviços. Tente novamente.
            </Text>
          </Center>
        )}

        {/* Lista de Serviços (Só renderiza quando termina de carregar) */}
        {!isLoading && !isError && (
          <>
            {/* === VISÃO DESKTOP (Tabela) === */}
            <Box display={{ base: "none", md: "block" }} overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Serviço</Th>
                    <Th>Preço</Th>
                    <Th>Duração</Th>
                    <Th>Status</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {services.map((s) => (
                    <Tr key={s.id} _hover={{ bg: "gray.50" }}>
                      <Td fontWeight="medium" color="gray.900">
                        {s.name}
                      </Td>
                      <Td fontWeight="semibold" color="gray.900">
                        {formatPrice(s.price)}
                      </Td>
                      <Td color="gray.500">{s.duration} min</Td>
                      <Td>
                        <HStack spacing={3}>
                          {/* Nota: Como não criamos a coluna status no backend ainda, deixaremos visualmente como Ativo */}
                          <Switch isChecked={true} colorScheme="green" />
                          <Badge
                            colorScheme="green"
                            variant="subtle"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                          >
                            Ativo
                          </Badge>
                        </HStack>
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

                  {services.length === 0 && (
                    <Tr>
                      <Td
                        colSpan={5}
                        textAlign="center"
                        py={6}
                        color="gray.500"
                      >
                        Nenhum serviço encontrado.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>

            {/* === VISÃO MOBILE (Lista) === */}
            <Box display={{ base: "block", md: "none" }}>
              <VStack align="stretch" spacing={0} divider={<Divider />}>
                {services.map((s) => (
                  <Box key={s.id} p={4}>
                    <Flex align="start" justify="space-between">
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="gray.900"
                        >
                          {s.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={0.5}>
                          {s.duration} min
                        </Text>
                      </Box>
                      <Text fontSize="md" fontWeight="bold" color="gray.900">
                        {formatPrice(s.price)}
                      </Text>
                    </Flex>

                    <Flex mt={3} align="center" justify="space-between">
                      <Badge
                        colorScheme="green"
                        variant="subtle"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                      >
                        Ativo
                      </Badge>
                      <Switch isChecked={true} colorScheme="green" />
                    </Flex>
                  </Box>
                ))}

                {services.length === 0 && (
                  <Box p={6} textAlign="center" color="gray.500">
                    Nenhum serviço encontrado.
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
