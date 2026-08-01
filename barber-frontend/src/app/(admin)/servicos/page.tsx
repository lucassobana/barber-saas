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
  IconButton,
  HStack,
  Spinner,
  Center,
  useDisclosure,
  useToast,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { Plus, MoreHorizontal, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { ServiceModal, Service } from "@/components/ServiceModal";

export default function ServicosPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    data: services = [],
    isLoading,
    isError,
  } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => (await api.get("/services")).data,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) =>
      api.patch(`/services/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Status atualizado!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
  });

  const formatPrice = (price: string | number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(price));

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
            Serviços
          </Heading>
          <Text color="text-secondary" mt={1}>
            Catálogo de atendimentos oferecidos
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
            setSelectedService(null);
            onOpen();
          }}
        >
          Novo serviço
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
            <Text color="status-error">Erro ao carregar serviços.</Text>
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
                      Serviço
                    </Th>
                    <Th color="text-secondary" borderColor="border-subtle">
                      Preço
                    </Th>
                    <Th color="text-secondary" borderColor="border-subtle">
                      Duração
                    </Th>
                    <Th color="text-secondary" borderColor="border-subtle">
                      Status
                    </Th>
                    <Th borderColor="border-subtle"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {services.length === 0 && (
                    <Tr>
                      <Td
                        colSpan={5}
                        textAlign="center"
                        py={6}
                        color="text-muted"
                        borderColor="border-subtle"
                      >
                        Nenhum serviço cadastrado.
                      </Td>
                    </Tr>
                  )}
                  {services.map((s) => {
                    const isActive = s.status !== false;
                    return (
                      <Tr
                        key={s.id}
                        _hover={{ bg: "bg-surface-secondary" }}
                        transition="background 0.2s"
                      >
                        <Td
                          fontWeight="medium"
                          color="text-primary"
                          borderColor="border-subtle"
                        >
                          {s.name}
                        </Td>
                        <Td
                          fontWeight="semibold"
                          color="text-primary"
                          borderColor="border-subtle"
                        >
                          {formatPrice(s.price)}
                        </Td>
                        <Td color="text-secondary" borderColor="border-subtle">
                          {s.duration} min
                        </Td>
                        <Td borderColor="border-subtle">
                          <HStack spacing={3}>
                            <Switch
                              isChecked={isActive}
                              colorScheme="green"
                              sx={{
                                "span.chakra-switch__track[data-checked]": {
                                  backgroundColor: "status-success",
                                },
                              }}
                              onChange={(e) =>
                                toggleStatusMutation.mutate({
                                  id: s.id,
                                  status: e.target.checked,
                                })
                              }
                              isDisabled={toggleStatusMutation.isPending}
                            />
                            <Badge
                              bg={
                                isActive
                                  ? "rgba(63, 185, 80, 0.15)"
                                  : "rgba(248, 81, 73, 0.15)"
                              }
                              color={
                                isActive ? "status-success" : "status-error"
                              }
                              borderWidth="1px"
                              borderColor={
                                isActive ? "status-success" : "status-error"
                              }
                              px={2}
                              py={0.5}
                              borderRadius="md"
                            >
                              {isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </HStack>
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
                              setSelectedService(s);
                              onOpen();
                            }}
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>

            {/* VISUALIZAÇÃO MOBILE: CARDS */}
            <Box display={{ base: "block", md: "none" }} p={2}>
              <VStack
                align="stretch"
                spacing={2}
                divider={<Divider borderColor="border-subtle" />}
              >
                {services.length === 0 && (
                  <Box p={6} textAlign="center" color="text-muted">
                    Nenhum serviço cadastrado.
                  </Box>
                )}
                {services.map((s) => {
                  const isActive = s.status !== false;
                  return (
                    <Box
                      key={s.id}
                      p={3}
                      onClick={() => {
                        setSelectedService(s);
                        onOpen();
                      }}
                      cursor="pointer"
                      _hover={{ bg: "bg-surface-secondary" }}
                      borderRadius="md"
                      transition="background 0.2s"
                    >
                      <Flex justify="space-between" align="start" mb={3}>
                        <Box>
                          <Text
                            fontWeight="bold"
                            color="text-primary"
                            fontSize="md"
                          >
                            {s.name}
                          </Text>
                          <Text
                            fontWeight="bold"
                            color="brand-primary"
                            fontSize="sm"
                            mt={0.5}
                          >
                            {formatPrice(s.price)}
                          </Text>
                        </Box>
                        <IconButton
                          aria-label="Editar serviço"
                          icon={<MoreHorizontal size={20} />}
                          size="sm"
                          variant="ghost"
                          color="text-muted"
                          _hover={{
                            color: "text-primary",
                            bg: "bg-surface-hover",
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Evita clique duplo no card
                            setSelectedService(s);
                            onOpen();
                          }}
                        />
                      </Flex>

                      <Flex
                        justify="space-between"
                        align="center"
                        bg="bg-surface-secondary"
                        p={2.5}
                        borderRadius="md"
                        onClick={(e) => e.stopPropagation()} // Permite clicar no switch sem abrir o modal
                      >
                        <HStack color="text-secondary">
                          <Clock size={16} />
                          <Text fontSize="sm" fontWeight="medium">
                            {s.duration} min
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Badge
                            bg={
                              isActive
                                ? "rgba(63, 185, 80, 0.15)"
                                : "rgba(248, 81, 73, 0.15)"
                            }
                            color={isActive ? "status-success" : "status-error"}
                            borderWidth="1px"
                            borderColor={
                              isActive ? "status-success" : "status-error"
                            }
                            px={2}
                            borderRadius="md"
                          >
                            {isActive ? "Ativo" : "Inativo"}
                          </Badge>
                          <Switch
                            isChecked={isActive}
                            colorScheme="green"
                            sx={{
                              "span.chakra-switch__track[data-checked]": {
                                backgroundColor: "status-success",
                              },
                            }}
                            onChange={(e) =>
                              toggleStatusMutation.mutate({
                                id: s.id,
                                status: e.target.checked,
                              })
                            }
                            isDisabled={toggleStatusMutation.isPending}
                          />
                        </HStack>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          </>
        )}
      </Box>
      <ServiceModal
        isOpen={isOpen}
        onClose={onClose}
        service={selectedService}
      />
    </Box>
  );
}
