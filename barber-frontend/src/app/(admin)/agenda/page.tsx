"use client";

import { useState } from "react";
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Input,
  useToast,
} from "@chakra-ui/react";
import {
  Plus,
  MoreVertical,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

// --- Tipagens ---
interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  client: { name: string };
  service: { name: string };
  barber: { name: string };
}
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}
interface Barber {
  id: string;
  name: string;
}

interface CreateAppointmentPayload {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  barberId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

// Tipagem do erro padrão retornado pelo NestJS
interface ApiErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

// --- Utilitários de Formatação ---
const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    price,
  );
const formatDate = (isoString: string) => {
  const [year, month, day] = isoString.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};
const getStatusColor = (status: string) => {
  switch (status) {
    case "AGENDADO":
      return "blue";
    case "CONCLUÍDO":
      return "green";
    case "NÃO COMPARECEU":
      return "orange";
    case "CANCELADO":
      return "red";
    default:
      return "gray";
  }
};

// Função para calcular o horário de término baseado na duração do serviço
const calculateEndTime = (startTime: string, durationMinutes: number) => {
  if (!startTime) return "";
  const [hours, minutes] = startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + durationMinutes);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// Gerador de horários (08:00 às 19:00 de 30 em 30 min)
const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

export default function AgendaPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();

  // --- Estados do Formulário ---
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // --- Buscas na API (Queries) ---
  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => (await api.get("/appointments")).data,
  });
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => (await api.get("/services")).data,
  });
  const { data: barbers = [] } = useQuery<Barber[]>({
    queryKey: ["barbers"],
    queryFn: async () => (await api.get("/barbers")).data,
  });

  // --- Lógica de Criação (Mutation) ---
  const createMutation = useMutation({
    // Substituímos o (newAppointment: any) pelo tipo CreateAppointmentPayload
    mutationFn: async (newAppointment: CreateAppointmentPayload) => {
      return api.post("/appointments", newAppointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Agendamento criado com sucesso!",
        status: "success",
        duration: 3000,
        position: "top-right",
      });
      handleCloseModal();
    },
    // Substituímos o (error: any) pelo AxiosError tipado
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const backendMessage = error.response?.data?.message;

      const errorMessage = Array.isArray(backendMessage)
        ? backendMessage[0]
        : backendMessage || "Ocorreu um erro interno de conexão.";

      toast({
        title: "Falha no agendamento",
        description: errorMessage,
        status: "error",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });
    },
  });

  const handleSave = () => {
    // Validação nova baseada no nome e telefone
    if (
      !clientName ||
      !clientPhone ||
      !serviceId ||
      !barberId ||
      !date ||
      !startTime
    ) {
      toast({
        title: "Preencha todos os campos obrigatórios.",
        status: "warning",
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    const selectedService = services.find((s) => s.id === serviceId);
    if (!selectedService) return;

    createMutation.mutate({
      clientName,
      clientPhone,
      serviceId,
      barberId,
      date: new Date(`${date}T00:00:00`).toISOString(),
      startTime,
      endTime: calculateEndTime(startTime, selectedService.duration),
      price: Number(selectedService.price),
    });
  };

  const handleCloseModal = () => {
    setClientName("");
    setClientPhone("");
    setServiceId("");
    setBarberId("");
    setDate("");
    setStartTime("");
    onClose();
  };

  // Encontra detalhes do serviço selecionado para exibir informações dinâmicas
  const selectedServiceDetails = services.find((s) => s.id === serviceId);

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
            Agenda
          </Heading>
          <Text color="gray.500" mt={1}>
            Controle de horários e agendamentos
          </Text>
        </Box>
        <Button
          size="sm"
          colorScheme="blue"
          leftIcon={<Plus size={16} />}
          onClick={onOpen}
        >
          Novo agendamento
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
            <Spinner color="blue.500" size="xl" />
          </Center>
        )}
        {isError && (
          <Center p={10}>
            <Text color="red.500">Erro ao carregar a agenda.</Text>
          </Center>
        )}

        {!isLoading && !isError && (
          <>
            <Box display={{ base: "none", md: "block" }} overflowX="auto">
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Data e Hora</Th>
                    <Th>Cliente</Th>
                    <Th>Serviço</Th>
                    <Th>Profissional</Th>
                    <Th>Status</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {appointments.map((apt) => (
                    <Tr key={apt.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <HStack color="gray.900" fontWeight="medium">
                            <CalendarIcon size={14} />
                            <Text>{formatDate(apt.date)}</Text>
                          </HStack>
                          <HStack color="gray.500" fontSize="sm">
                            <Clock size={14} />
                            <Text>
                              {apt.startTime} às {apt.endTime}
                            </Text>
                          </HStack>
                        </VStack>
                      </Td>
                      <Td fontWeight="medium" color="gray.900">
                        {apt.client.name}
                      </Td>
                      <Td>
                        <Text color="gray.900">{apt.service.name}</Text>
                        <Text color="gray.500" fontSize="xs">
                          {formatPrice(apt.price)}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Avatar
                            size="2xs"
                            name={apt.barber.name}
                            bg="blue.500"
                            color="white"
                          />
                          <Text color="gray.600" fontSize="sm">
                            {apt.barber.name}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(apt.status)}
                          variant="subtle"
                          px={2}
                          py={0.5}
                          borderRadius="md"
                        >
                          {apt.status}
                        </Badge>
                      </Td>
                      <Td textAlign="right">
                        <IconButton
                          aria-label="Opções"
                          icon={<MoreVertical size={16} />}
                          size="sm"
                          variant="ghost"
                          color="gray.400"
                        />
                      </Td>
                    </Tr>
                  ))}
                  {appointments.length === 0 && (
                    <Tr>
                      <Td
                        colSpan={6}
                        textAlign="center"
                        py={8}
                        color="gray.500"
                      >
                        Nenhum agendamento encontrado.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>

            {/* Versão Mobile omitida para brevidade (mesmo código da anterior) */}
            <Box display={{ base: "block", md: "none" }}>
              <VStack align="stretch" spacing={0} divider={<Divider />}>
                {appointments.map((apt) => (
                  <Box key={apt.id} p={4}>
                    <Flex align="start" justify="space-between" mb={3}>
                      <Box>
                        <Text fontWeight="bold" color="gray.900">
                          {apt.client.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {apt.service.name}
                        </Text>
                      </Box>
                      <Badge
                        colorScheme={getStatusColor(apt.status)}
                        variant="subtle"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                      >
                        {apt.status}
                      </Badge>
                    </Flex>
                    <Flex
                      bg="gray.50"
                      p={3}
                      borderRadius="md"
                      align="center"
                      justify="space-between"
                    >
                      <VStack align="start" spacing={1}>
                        <HStack
                          color="gray.700"
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          <CalendarIcon size={14} />
                          <Text>{formatDate(apt.date)}</Text>
                        </HStack>
                        <HStack color="gray.500" fontSize="sm">
                          <Clock size={14} />
                          <Text>{apt.startTime}</Text>
                        </HStack>
                      </VStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>
          </>
        )}
      </Box>

      {/* MODAL DE NOVO AGENDAMENTO */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Novo Agendamento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nome do Cliente</FormLabel>
                <Input
                  placeholder="Ex: João Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>WhatsApp / Telefone</FormLabel>
                <Input
                  placeholder="Ex: 11999999999"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Serviço</FormLabel>
                <Select
                  placeholder="Selecione o serviço"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatPrice(s.price)})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Profissional</FormLabel>
                <Select
                  placeholder="Selecione o barbeiro"
                  value={barberId}
                  onChange={(e) => setBarberId(e.target.value)}
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack w="full" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Data</FormLabel>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Horário</FormLabel>
                  <Select
                    placeholder="Hora"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {TIME_SLOTS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              {/* Exibe o resumo do agendamento se serviço e horário estiverem preenchidos */}
              {selectedServiceDetails && startTime && (
                <Box
                  w="full"
                  p={3}
                  bg="blue.50"
                  color="blue.700"
                  borderRadius="md"
                  fontSize="sm"
                >
                  <Text fontWeight="bold">Resumo do atendimento:</Text>
                  <Text>
                    Término previsto:{" "}
                    <b>
                      {calculateEndTime(
                        startTime,
                        selectedServiceDetails.duration,
                      )}
                    </b>
                  </Text>
                  <Text>
                    Duração: {selectedServiceDetails.duration} minutos
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isLoading={createMutation.isPending}
            >
              Salvar Agendamento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
