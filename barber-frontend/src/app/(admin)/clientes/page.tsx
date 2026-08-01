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
      {/* CABEÇALHO RESPONSIVO */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        mb={6}
        gap={4}
      >
        <Box textAlign={{ base: "center", sm: "left" }}>
          <Heading size="lg" color="text-primary">
            Clientes
          </Heading>
          <Text color="text-secondary" mt={1}>
            Sua base de clientes e histórico
          </Text>
        </Box>
        <Button
          size="md"
          w={{ base: "full", sm: "auto" }}
          bg="brand-primary"
          color="white"
          _hover={{ bg: "brand-hover" }}
          _active={{ bg: "brand-active" }}
          leftIcon={<Plus size={16} />}
          onClick={handleOpenCreateModal}
        >
          Novo cliente
        </Button>
      </Flex>

      <Box
        bg="bg-surface"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border-subtle"
        shadow="card-shadow"
        overflow="hidden"
      >
        {isLoading && (
          <Center p={10}>
            <Spinner color="brand-primary" size="xl" />
          </Center>
        )}
        {isError && (
          <Center p={10}>
            <Text color="status-error">Erro ao carregar os clientes.</Text>
          </Center>
        )}
        {!isLoading && !isError && (
          <>
            {/* VISUALIZAÇÃO DESKTOP: TABELA */}
            <Box display={{ base: "none", md: "block" }} overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg="bg-surface-secondary">
                  <Tr>
                    <Th color="text-secondary" borderColor="border-subtle">
                      Cliente
                    </Th>
                    <Th color="text-secondary" borderColor="border-subtle">
                      Telefone
                    </Th>
                    <Th color="text-secondary" borderColor="border-subtle">
                      Info
                    </Th>
                    <Th borderColor="border-subtle"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {clients.length === 0 && (
                    <Tr>
                      <Td
                        colSpan={4}
                        textAlign="center"
                        py={6}
                        color="text-muted"
                        borderColor="border-subtle"
                      >
                        Nenhum cliente cadastrado.
                      </Td>
                    </Tr>
                  )}
                  {clients.map((c) => (
                    <Tr
                      key={c.id}
                      _hover={{ bg: "bg-surface-secondary" }}
                      transition="background 0.2s"
                    >
                      <Td borderColor="border-subtle">
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={c.name}
                            bg="brand-primary"
                            color="white"
                          />
                          <Text fontWeight="medium" color="text-primary">
                            {c.name}
                          </Text>
                        </HStack>
                      </Td>
                      <Td color="text-secondary" borderColor="border-subtle">
                        {c.phone}
                      </Td>
                      <Td borderColor="border-subtle">
                        {c.notes ? (
                          <Badge
                            bg="brand-soft"
                            color="brand-primary"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                          >
                            Tem observações
                          </Badge>
                        ) : (
                          <Text color="text-muted" fontSize="sm">
                            -
                          </Text>
                        )}
                      </Td>
                      <Td textAlign="right" borderColor="border-subtle">
                        <IconButton
                          aria-label="Opções"
                          icon={<MoreHorizontal size={16} />}
                          size="sm"
                          variant="ghost"
                          color="text-muted"
                          _hover={{
                            color: "text-primary",
                            bg: "bg-surface-hover",
                          }}
                          onClick={() => handleOpenEditModal(c)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* VISUALIZAÇÃO MOBILE: CARDS/LISTA */}
            <Box display={{ base: "block", md: "none" }} p={2}>
              <VStack
                align="stretch"
                spacing={2}
                divider={<Divider borderColor="border-subtle" />}
              >
                {clients.length === 0 && (
                  <Box p={6} textAlign="center" color="text-muted">
                    Nenhum cliente cadastrado.
                  </Box>
                )}
                {clients.map((c) => (
                  <Flex
                    key={c.id}
                    p={3}
                    align="center"
                    justify="space-between"
                    onClick={() => handleOpenEditModal(c)}
                    cursor="pointer"
                    _hover={{ bg: "bg-surface-secondary" }}
                    borderRadius="md"
                    transition="background 0.2s"
                  >
                    <Flex align="center" gap={4}>
                      <Avatar
                        size="md"
                        name={c.name}
                        bg="brand-primary"
                        color="white"
                      />
                      <Box>
                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          color="text-primary"
                        >
                          {c.name}
                        </Text>
                        <Text fontSize="sm" color="text-secondary">
                          {c.phone}
                        </Text>
                        {c.notes && (
                          <Badge
                            bg="brand-soft"
                            color="brand-primary"
                            px={2}
                            borderRadius="md"
                            fontSize="2xs"
                            mt={1}
                          >
                            Obs
                          </Badge>
                        )}
                      </Box>
                    </Flex>
                    <IconButton
                      aria-label="Opções"
                      icon={<MoreHorizontal size={20} />}
                      size="sm"
                      variant="ghost"
                      color="text-muted"
                      _hover={{ color: "text-primary", bg: "bg-surface-hover" }}
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que o modal abra duas vezes
                        handleOpenEditModal(c);
                      }}
                    />
                  </Flex>
                ))}
              </VStack>
            </Box>
          </>
        )}
      </Box>
      <ClientModal isOpen={isOpen} onClose={onClose} client={selectedClient} />
    </Box>
  );
}
