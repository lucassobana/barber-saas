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
} from "@chakra-ui/react";
import { Plus, MoreHorizontal } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Barber, BarberModal } from "@/components/BarberModal";

const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";

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
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        mb={6}
        gap={4}
      >
        <Box>
          <Heading size="lg" color="gray.900">
            Equipe
          </Heading>
          <Text color="gray.500" mt={1}>
            Gerencie os barbeiros e seus horários
          </Text>
        </Box>
        <Button
          size="sm"
          bg={BRAND_COLOR}
          color="white"
          _hover={{ bg: BRAND_HOVER }}
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
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="sm"
        overflow="hidden"
      >
        {!isLoading && !isError && (
          <>
            <Box display={{ base: "none", md: "block" }} overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Profissional</Th>
                    <Th>E-mail</Th>
                    <Th>Horário</Th>
                    <Th>Status</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {barbers.map((b) => (
                    <Tr key={b.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={b.name}
                            bg={BRAND_COLOR}
                            color="white"
                          />
                          <Text fontWeight="medium" color="gray.900">
                            {b.name}
                          </Text>
                        </HStack>
                      </Td>
                      <Td color="gray.600">{b.email || "Não informado"}</Td>
                      <Td color="gray.600">
                        {b.openTime} às {b.closeTime}
                      </Td>
                      <Td>
                        <Switch
                          colorScheme="green"
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
                      <Td textAlign="right">
                        <IconButton
                          aria-label="Opções"
                          icon={<MoreHorizontal size={16} />}
                          size="sm"
                          variant="ghost"
                          color="gray.400"
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
          </>
        )}
      </Box>
      <BarberModal isOpen={isOpen} onClose={onClose} barber={selectedBarber} />
    </Box>
  );
}
