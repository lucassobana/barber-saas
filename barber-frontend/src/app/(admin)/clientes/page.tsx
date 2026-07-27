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
  useDisclosure,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import { Plus, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Client, ClientModal } from "@/components/ClientModal";

const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";

export default function ClientesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => (await api.get("/clients")).data,
  });

  const handleOpenCreateModal = () => {
    setSelectedClient(null);
    onOpen();
  };
  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    onOpen();
  };

  return (
    <Box>
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
            Sua base de clientes e histórico
          </Text>
        </Box>
        <Button
          size="sm"
          bg={BRAND_COLOR}
          color="white"
          _hover={{ bg: BRAND_HOVER }}
          leftIcon={<Plus size={16} />}
          onClick={handleOpenCreateModal}
        >
          Novo cliente
        </Button>
      </Flex>

      <Box
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="sm"
        overflow="hidden"
      >
        {isLoading && (
          <Center p={10}>
            <Spinner color={BRAND_COLOR} size="xl" />
          </Center>
        )}
        {isError && (
          <Center p={10}>
            <Text color="red.500">Erro ao carregar os clientes.</Text>
          </Center>
        )}
        {!isLoading && !isError && (
          <>
            <Box display={{ base: "none", md: "block" }} overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Cliente</Th>
                    <Th>Telefone</Th>
                    <Th>Info</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {clients.map((c) => (
                    <Tr key={c.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={c.name}
                            bg={BRAND_COLOR}
                            color="white"
                          />
                          <Text fontWeight="medium" color="gray.900">
                            {c.name}
                          </Text>
                        </HStack>
                      </Td>
                      <Td color="gray.600">{c.phone}</Td>
                      <Td>
                        {c.notes ? (
                          <Badge colorScheme="orange" variant="subtle">
                            Tem observações
                          </Badge>
                        ) : (
                          <Text color="gray.400" fontSize="sm">
                            -
                          </Text>
                        )}
                      </Td>
                      <Td textAlign="right">
                        <IconButton
                          aria-label="Opções"
                          icon={<MoreHorizontal size={16} />}
                          size="sm"
                          variant="ghost"
                          color="gray.400"
                          onClick={() => handleOpenEditModal(c)}
                        />
                      </Td>
                    </Tr>
                  ))}
                  {clients.length === 0 && (
                    <Tr>
                      <Td
                        colSpan={4}
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
            <Box display={{ base: "block", md: "none" }}>
              <VStack align="stretch" spacing={0} divider={<Divider />}>
                {clients.map((c) => (
                  <Box
                    key={c.id}
                    p={4}
                    onClick={() => handleOpenEditModal(c)}
                    cursor="pointer"
                  >
                    <Flex align="center" gap={3}>
                      <Avatar
                        size="sm"
                        name={c.name}
                        bg={BRAND_COLOR}
                        color="white"
                      />
                      <Box flex="1">
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="gray.900"
                        >
                          {c.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={0.5}>
                          {c.phone}
                        </Text>
                      </Box>
                      {c.notes && (
                        <Badge
                          colorScheme="orange"
                          variant="subtle"
                          fontSize="2xs"
                        >
                          Obs
                        </Badge>
                      )}
                    </Flex>
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
      <ClientModal isOpen={isOpen} onClose={onClose} client={selectedClient} />
    </Box>
  );
}
