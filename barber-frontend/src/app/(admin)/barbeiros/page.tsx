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
  IconButton,
  HStack,
  useDisclosure,
  Avatar,
  Switch,
  useToast,
  VStack,
  Divider,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { Plus, MoreHorizontal, Clock, Mail } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Barber, BarberModal } from "@/components/BarberModal";

export default function BarbeirosPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    data: barbers = [],
    isLoading,
    isError,
  } = useQuery<Barber[]>({
    queryKey: ["barbers"],
    queryFn: async () => (await api.get("/barbers")).data,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) =>
      api.patch(`/barbers/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
      toast({
        title: "Status atualizado!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    onError: () =>
      toast({
        title: "Erro ao atualizar status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      }),
  });

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
            Equipe
          </Heading>
          <Text color="text-secondary" mt={1}>
            Gerencie os barbeiros e seus horários
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
          onClick={() => {
            setSelectedBarber(null);
            onOpen();
          }}
        >
          Novo barbeiro
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
        {isLoading ? (
          <Center p={10}>
            <Spinner color="brand-primary" size="xl" />
          </Center>
        ) : isError ? (
          <Center p={10}>
            <Text color="status-error">Erro ao carregar barbeiros.</Text>
          </Center>
        ) : (
          <>
            {/* VISUALIZAÇÃO DESKTOP: TABELA */}
            <Box display={{ base: "none", md: "block" }} overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg="bg-surface-secondary">
                  <Tr>
                    <Th color="text-secondary" borderColor="border-subtle">
                      Profissional
                    </Th>
                    <Th color="text-secondary" borderColor="border-subtle">
                      E-mail
                    </Th>
                    <Th color="text-secondary" borderColor="border-subtle">
                      Horário
                    </Th>
                    <Th color="text-secondary" borderColor="border-subtle">
                      Status
                    </Th>
                    <Th borderColor="border-subtle"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {barbers.length === 0 && (
                    <Tr>
                      <Td
                        colSpan={5}
                        textAlign="center"
                        py={6}
                        color="text-muted"
                        borderColor="border-subtle"
                      >
                        Nenhum barbeiro cadastrado.
                      </Td>
                    </Tr>
                  )}
                  {barbers.map((b) => (
                    <Tr
                      key={b.id}
                      _hover={{ bg: "bg-surface-secondary" }}
                      transition="background 0.2s"
                    >
                      <Td borderColor="border-subtle">
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={b.name}
                            bg="brand-primary"
                            color="white"
                          />
                          <Text fontWeight="medium" color="text-primary">
                            {b.name}
                          </Text>
                        </HStack>
                      </Td>
                      <Td color="text-secondary" borderColor="border-subtle">
                        {b.email || "Não informado"}
                      </Td>
                      <Td color="text-secondary" borderColor="border-subtle">
                        {b.openTime} às {b.closeTime}
                      </Td>
                      <Td borderColor="border-subtle">
                        <Switch
                          colorScheme="green"
                          sx={{
                            "span.chakra-switch__track[data-checked]": {
                              backgroundColor: "status-success",
                            },
                          }}
                          isChecked={b.status}
                          onChange={(e) =>
                            toggleStatusMutation.mutate({
                              id: b.id,
                              status: e.target.checked,
                            })
                          }
                          isDisabled={toggleStatusMutation.isPending}
                        />
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
                          onClick={() => {
                            setSelectedBarber(b);
                            onOpen();
                          }}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* VISUALIZAÇÃO MOBILE: CARDS */}
            <Box display={{ base: "block", md: "none" }} p={4}>
              <VStack
                spacing={4}
                align="stretch"
                divider={<Divider borderColor="border-subtle" />}
              >
                {barbers.length === 0 && (
                  <Text textAlign="center" color="text-muted" py={4}>
                    Nenhum barbeiro cadastrado.
                  </Text>
                )}
                {barbers.map((b) => (
                  <Box key={b.id}>
                    <Flex justify="space-between" align="start" mb={3}>
                      <HStack spacing={3}>
                        <Avatar
                          size="md"
                          name={b.name}
                          bg="brand-primary"
                          color="white"
                        />
                        <Box>
                          <Text
                            fontWeight="bold"
                            color="text-primary"
                            fontSize="md"
                          >
                            {b.name}
                          </Text>
                          <HStack color="text-muted" mt={1} spacing={1}>
                            <Mail size={12} />
                            <Text fontSize="xs" isTruncated maxW="150px">
                              {b.email || "Sem e-mail"}
                            </Text>
                          </HStack>
                        </Box>
                      </HStack>
                      <IconButton
                        aria-label="Editar barbeiro"
                        icon={<MoreHorizontal size={20} />}
                        size="sm"
                        variant="ghost"
                        color="text-muted"
                        _hover={{
                          color: "text-primary",
                          bg: "bg-surface-hover",
                        }}
                        onClick={() => {
                          setSelectedBarber(b);
                          onOpen();
                        }}
                      />
                    </Flex>

                    <Flex
                      justify="space-between"
                      align="center"
                      bg="bg-surface-secondary"
                      p={3}
                      borderRadius="md"
                    >
                      <HStack color="text-secondary">
                        <Clock size={16} />
                        <Text fontSize="sm" fontWeight="medium">
                          {b.openTime} às {b.closeTime}
                        </Text>
                      </HStack>
                      <HStack>
                        <Text
                          fontSize="xs"
                          color="text-muted"
                          fontWeight="medium"
                        >
                          {b.status ? "Ativo" : "Inativo"}
                        </Text>
                        <Switch
                          colorScheme="green"
                          size="md"
                          sx={{
                            "span.chakra-switch__track[data-checked]": {
                              backgroundColor: "status-success",
                            },
                          }}
                          isChecked={b.status}
                          onChange={(e) =>
                            toggleStatusMutation.mutate({
                              id: b.id,
                              status: e.target.checked,
                            })
                          }
                          isDisabled={toggleStatusMutation.isPending}
                        />
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>
          </>
        )}
      </Box>

      <BarberModal isOpen={isOpen} onClose={onClose} barber={selectedBarber} />
    </Box>
  );
}
