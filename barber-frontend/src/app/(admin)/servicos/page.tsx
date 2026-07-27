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
  Switch, IconButton,
  HStack,
  Spinner,
  Center,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import { Plus, MoreHorizontal } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { ServiceModal, Service } from "@/components/ServiceModal";

const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";

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
        <Button
          size="sm"
          bg={BRAND_COLOR}
          color="white"
          _hover={{ bg: BRAND_HOVER }}
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
        {!isLoading && !isError && (
          <Box overflowX="auto">
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
                {services.map((s) => {
                  const isActive = s.status !== false;
                  return (
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
                          <Switch
                            isChecked={isActive}
                            colorScheme="green"
                            onChange={(e) =>
                              toggleStatusMutation.mutate({
                                id: s.id,
                                status: e.target.checked,
                              })
                            }
                            isDisabled={toggleStatusMutation.isPending}
                          />
                          <Badge
                            colorScheme={isActive ? "green" : "red"}
                            variant="subtle"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                          >
                            {isActive ? "Ativo" : "Inativo"}
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
