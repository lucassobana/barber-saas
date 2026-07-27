"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  Flex,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PublicBarbershop } from "@/app/[slug]/page";

interface BookingPayload {
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceId: string;
  barberId: string;
  barbershopId: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbershop: PublicBarbershop;
  service: { id: string; name: string; price: number; duration: number } | null;
}

export function BookingModal({
  isOpen,
  onClose,
  barbershop,
  service,
}: BookingModalProps) {
  const toast = useToast();

  const [step, setStep] = useState(0);

  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // NOVA LÓGICA: Busca os horários livres no backend
  const { data: availableTimes = [], isLoading: isLoadingTimes } = useQuery<
    string[]
  >({
    queryKey: ["availability", selectedBarber, selectedDate, service?.id],
    queryFn: async () => {
      const response = await api.get("/public/availability", {
        params: {
          barberId: selectedBarber,
          date: selectedDate,
          serviceId: service?.id,
        },
      });
      return response.data;
    },
    // Só dispara a busca se o barbeiro, a data e o serviço estiverem selecionados
    enabled: !!selectedBarber && !!selectedDate && !!service?.id,
  });

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0);
    date.setMinutes(date.getMinutes() + duration);

    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const mutation = useMutation({
    mutationFn: async (data: BookingPayload) => {
      return await api.post("/public/appointments", data);
    },
    onSuccess: () => {
      toast({
        title: "Agendamento confirmado!",
        description: "Te esperamos no horário marcado.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      handleClose();
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro ao agendar.",
        description:
          error?.response?.data?.message || "O horário pode já estar ocupado.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
  });

  const handleNextStep = () => setStep((s) => s + 1);
  const handlePrevStep = () => setStep((s) => s - 1);

  const handleClose = () => {
    setStep(0);
    setSelectedBarber("");
    setSelectedDate("");
    setSelectedTime("");
    setClientName("");
    setClientPhone("");
    onClose();
  };

  const handleConfirm = () => {
    if (!service) return;

    mutation.mutate({
      clientName,
      clientPhone,
      date: selectedDate,
      startTime: selectedTime,
      endTime: calculateEndTime(selectedTime, service.duration),
      serviceId: service.id,
      barberId: selectedBarber,
      barbershopId: barbershop.id,
    });
  };

  const isNextDisabled = () => {
    if (step === 0 && !selectedBarber) return true;
    if (step === 1 && (!selectedDate || !selectedTime)) return true;
    if (step === 2 && (!clientName || !clientPhone)) return true;
    return false;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottomWidth="1px" borderColor="gray.100">
          <Text fontSize="lg">Agendar {service?.name}</Text>
          <Text fontSize="sm" color="gray.500" fontWeight="normal">
            Passo {step + 1} de 3
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          {step === 0 && (
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="medium" color="gray.900" mb={2}>
                Com quem você quer cortar?
              </Text>
              {barbershop.barbers.map((barber) => (
                <Flex
                  key={barber.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor={
                    selectedBarber === barber.id ? "blue.500" : "gray.200"
                  }
                  bg={selectedBarber === barber.id ? "blue.50" : "white"}
                  align="center"
                  gap={4}
                  cursor="pointer"
                  onClick={() => setSelectedBarber(barber.id)}
                  _hover={{ borderColor: "blue.500" }}
                >
                  <Avatar size="sm" name={barber.name} bg="blue.500" />
                  <Text fontWeight="medium" color="gray.900">
                    {barber.name}
                  </Text>
                </Flex>
              ))}
            </VStack>
          )}

          {step === 1 && (
            <VStack align="stretch" spacing={5}>
              <FormControl isRequired>
                <FormLabel>Escolha a Data</FormLabel>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(""); // Reseta o horário selecionado ao trocar de data
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormControl>

              {selectedDate && (
                <Box>
                  <Text fontWeight="medium" color="gray.900" mb={3}>
                    Horários disponíveis
                  </Text>

                  {isLoadingTimes ? (
                    <Center py={4}>
                      <Spinner color="blue.500" />
                    </Center>
                  ) : availableTimes.length > 0 ? (
                    <SimpleGrid columns={3} spacing={3}>
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "solid" : "outline"}
                          colorScheme={selectedTime === time ? "blue" : "gray"}
                          onClick={() => setSelectedTime(time)}
                          size="sm"
                        >
                          {time}
                        </Button>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Text
                      color="red.500"
                      fontSize="sm"
                      textAlign="center"
                      py={4}
                    >
                      Nenhum horário disponível para este dia.
                    </Text>
                  )}
                </Box>
              )}
            </VStack>
          )}

          {step === 2 && (
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Seu Nome</FormLabel>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Lucas Sawada"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>WhatsApp / Telefone</FormLabel>
                <Input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(00) 90000-0000"
                />
              </FormControl>

              <Box bg="gray.50" p={4} borderRadius="md" mt={2}>
                <Text fontSize="sm" color="gray.600">
                  <strong>Resumo:</strong> {service?.name} dia{" "}
                  {selectedDate.split("-").reverse().join("/")} às{" "}
                  {selectedTime}.
                </Text>
              </Box>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.100">
          <Flex w="full" justify={step === 0 ? "flex-end" : "space-between"}>
            {step > 0 && (
              <Button
                variant="ghost"
                onClick={handlePrevStep}
                isDisabled={mutation.isPending}
              >
                Voltar
              </Button>
            )}

            {step < 2 ? (
              <Button
                colorScheme="blue"
                onClick={handleNextStep}
                isDisabled={isNextDisabled()}
              >
                Avançar
              </Button>
            ) : (
              <Button
                colorScheme="green"
                onClick={handleConfirm}
                isDisabled={isNextDisabled()}
                isLoading={mutation.isPending}
              >
                Confirmar Agendamento
              </Button>
            )}
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
