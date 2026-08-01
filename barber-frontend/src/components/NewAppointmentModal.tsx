"use client";

import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Flex,
  useToast,
  SimpleGrid,
  Center,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Barber {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbers: Barber[];
}

interface CreateAppointmentPayload {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  barberId: string;
  barbershopId?: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const calculateEndTime = (startTime: string, durationMinutes: number) => {
  if (!startTime) return "";
  const [hours, minutes] = startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + durationMinutes);
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

export function NewAppointmentModal({
  isOpen,
  onClose,
  barbers,
}: NewAppointmentModalProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const barbershopId = user?.memberships?.[0]?.barbershopId;

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => (await api.get("/services")).data,
    enabled: isOpen,
  });

  const { data: availableTimes = [], isLoading: isLoadingTimes } = useQuery<
    string[]
  >({
    queryKey: ["availability", barberId, date, serviceId],
    queryFn: async () => {
      const response = await api.get("/public/availability", {
        params: {
          barberId,
          date,
          serviceId,
        },
      });
      return response.data;
    },
    enabled: !!barberId && !!date && !!serviceId && isOpen,
  });

  const resetForm = () => {
    setClientName("");
    setClientPhone("");
    setDate("");
    setStartTime("");
    setServiceId("");
    setBarberId("");
  };

  const createMutation = useMutation({
    mutationFn: async (payload: CreateAppointmentPayload) =>
      await api.post("/public/appointments", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Agendamento criado!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetForm();
      onClose();
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro ao criar agendamento.",
        description:
          error?.response?.data?.message ||
          "O horário pode estar ocupado. Verifique e tente novamente.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
  });

  const handleSave = () => {
    if (!clientName || !date || !startTime || !serviceId || !barberId) {
      toast({
        title: "Preencha os campos obrigatórios.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const selectedService = services.find((s) => s.id === serviceId);
    const duration = selectedService?.duration || 30;

    createMutation.mutate({
      clientName,
      clientPhone,
      serviceId,
      barberId,
      barbershopId,
      date: new Date(`${date}T00:00:00`).toISOString(),
      startTime,
      endTime: calculateEndTime(startTime, duration),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      size="md"
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        mx={4}
        bg="bg-surface"
        borderColor="border-subtle"
        borderWidth="1px"
        shadow="card-shadow"
      >
        <ModalHeader
          color="text-primary"
          borderBottomWidth="1px"
          borderColor="border-subtle"
        >
          Novo Agendamento
        </ModalHeader>
        <ModalCloseButton color="text-secondary" />
        <ModalBody py={6}>
          <VStack spacing={5}>
            <FormControl isRequired>
              <FormLabel color="text-primary" fontWeight="medium">
                Cliente
              </FormLabel>
              <Input
                placeholder="Nome do cliente"
                size="lg"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                _hover={{ borderColor: "border-hover" }}
                _focus={{
                  borderColor: "brand-primary",
                  boxShadow: "focus-glow",
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="text-primary" fontWeight="medium">
                Telefone / WhatsApp
              </FormLabel>
              <Input
                placeholder="Ex: 11999999999"
                size="lg"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                _hover={{ borderColor: "border-hover" }}
                _focus={{
                  borderColor: "brand-primary",
                  boxShadow: "focus-glow",
                }}
              />
            </FormControl>

            <Flex gap={4} w="full" direction={{ base: "column", sm: "row" }}>
              <FormControl isRequired>
                <FormLabel color="text-primary" fontWeight="medium">
                  Serviço
                </FormLabel>
                <Select
                  placeholder="Selecione..."
                  size="lg"
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    setStartTime("");
                  }}
                  bg="bg-surface-secondary"
                  borderColor="border-subtle"
                  color="text-primary"
                  _hover={{ borderColor: "border-hover" }}
                  _focus={{
                    borderColor: "brand-primary",
                    boxShadow: "focus-glow",
                  }}
                  sx={{
                    "> option": { bg: "bg-surface", color: "text-primary" },
                  }}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration} min)
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="text-primary" fontWeight="medium">
                  Barbeiro
                </FormLabel>
                <Select
                  placeholder="Selecione..."
                  size="lg"
                  value={barberId}
                  onChange={(e) => {
                    setBarberId(e.target.value);
                    setStartTime("");
                  }}
                  bg="bg-surface-secondary"
                  borderColor="border-subtle"
                  color="text-primary"
                  _hover={{ borderColor: "border-hover" }}
                  _focus={{
                    borderColor: "brand-primary",
                    boxShadow: "focus-glow",
                  }}
                  sx={{
                    "> option": { bg: "bg-surface", color: "text-primary" },
                  }}
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Flex>

            <FormControl isRequired>
              <FormLabel color="text-primary" fontWeight="medium">
                Data
              </FormLabel>
              <Input
                type="date"
                size="lg"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setStartTime("");
                }}
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                _hover={{ borderColor: "border-hover" }}
                _focus={{
                  borderColor: "brand-primary",
                  boxShadow: "focus-glow",
                }}
                sx={{
                  "::-webkit-calendar-picker-indicator": {
                    filter: "invert(0.8)",
                  },
                }}
              />
            </FormControl>

            {date && barberId && serviceId && (
              <FormControl isRequired>
                <FormLabel color="text-primary" fontWeight="medium" mb={3}>
                  Horários Disponíveis
                </FormLabel>
                {isLoadingTimes ? (
                  <Center py={4}>
                    <Spinner color="brand-primary" />
                  </Center>
                ) : availableTimes.length > 0 ? (
                  <SimpleGrid columns={4} spacing={2}>
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={startTime === time ? "solid" : "outline"}
                        bg={
                          startTime === time ? "brand-primary" : "transparent"
                        }
                        color={startTime === time ? "white" : "text-secondary"}
                        borderColor={
                          startTime === time ? "brand-primary" : "border-subtle"
                        }
                        _hover={{
                          bg:
                            startTime === time
                              ? "brand-hover"
                              : "bg-surface-hover",
                          color: startTime === time ? "white" : "text-primary",
                        }}
                        onClick={() => setStartTime(time)}
                        size="md"
                      >
                        {time}
                      </Button>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text
                    color="status-error"
                    fontSize="sm"
                    textAlign="center"
                    py={2}
                  >
                    Nenhum horário livre.
                  </Text>
                )}
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter
          bg="bg-surface-secondary"
          borderBottomRadius="md"
          borderTopWidth="1px"
          borderColor="border-subtle"
        >
          <Button
            variant="ghost"
            mr={3}
            onClick={() => {
              resetForm();
              onClose();
            }}
            color="text-primary"
            _hover={{ bg: "bg-surface-hover" }}
          >
            Cancelar
          </Button>
          <Button
            bg="brand-primary"
            color="white"
            _hover={{ bg: "brand-hover" }}
            _active={{ bg: "brand-active" }}
            onClick={handleSave}
            isLoading={createMutation.isPending}
            isDisabled={!startTime}
          >
            Agendar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
