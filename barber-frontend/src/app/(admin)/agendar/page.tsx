"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
  Spinner,
  Center,
  Flex,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { Scissors, Calendar, Clock, User, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

// --- Tipagens ---
interface Service {
  id: string;
  name: string;
  price: string;
  duration: number;
}
interface Barber {
  id: string;
  name: string;
}
interface Barbershop {
  id: string;
  name: string;
  services: Service[];
  barbers: Barber[];
}

interface AppointmentPayload {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  barberId: string;
  date: string;
  startTime: string;
  endTime: string;
  price?: number;
  barbershopId?: string;
}

interface ApiErrorResponse {
  message: string | string[];
}

// --- Utilitários ---
const formatPrice = (price: string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(price),
  );
const calculateEndTime = (startTime: string, durationMinutes: number) => {
  if (!startTime) return "";
  const [hours, minutes] = startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + durationMinutes);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};
const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const toast = useToast();

  // --- Estados do Formulário ---
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState(""); // WhatsApp
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Buscas na API Pública ---
  const {
    data: barbershop,
    isLoading,
    isError,
  } = useQuery<Barbershop>({
    queryKey: ["public-barbershop", slug],
    queryFn: async () => (await api.get(`/public/barbershops/${slug}`)).data,
    enabled: !!slug,
  });

  // --- Mutação de Agendamento ---
  const bookMutation = useMutation({
    mutationFn: async (payload: AppointmentPayload) =>
      api.post("/public/appointments", payload),
    onSuccess: () => {
      setIsSuccess(true);
      window.scrollTo(0, 0);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg =
        error.response?.data?.message || "Erro ao processar agendamento.";
      const desc = Array.isArray(msg) ? msg[0] : msg;

      toast({
        title: "Ops!",
        description: desc,
        status: "error",
        duration: 5000,
        position: "top",
      });
    },
  });

  const handleSubmit = () => {
    if (
      !serviceId ||
      !barberId ||
      !date ||
      !startTime ||
      !clientName ||
      !clientPhone
    ) {
      toast({
        title: "Preencha todos os campos.",
        status: "warning",
        duration: 3000,
        position: "top",
      });
      return;
    }

    const selectedService = barbershop?.services.find(
      (s) => s.id === serviceId,
    );
    if (!selectedService || !barbershop) return;

    bookMutation.mutate({
      clientName,
      clientPhone,
      serviceId,
      barberId,
      barbershopId: barbershop.id,
      date: new Date(`${date}T00:00:00`).toISOString(),
      startTime,
      endTime: calculateEndTime(startTime, selectedService.duration),
    });
  };

  // --- Renderização de Loading / Erro ---
  if (isLoading)
    return (
      <Center h="100vh" bg="gray.50">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  if (isError || !barbershop)
    return (
      <Center h="100vh" bg="gray.50">
        <Text color="red.500">Barbearia não encontrada.</Text>
      </Center>
    );

  // --- Tela de Sucesso ---
  if (isSuccess) {
    return (
      <Center h="100vh" bg="gray.50" p={4}>
        <VStack
          spacing={6}
          bg="white"
          p={8}
          borderRadius="xl"
          shadow="md"
          textAlign="center"
          maxW="md"
          w="full"
        >
          <Center w={16} h={16} bg="green.100" borderRadius="full">
            <Icon as={Calendar} size={32} color="green.500" />
          </Center>
          <Heading size="lg" color="gray.900">
            Tudo Certo!
          </Heading>
          <Text color="gray.600">
            Seu horário foi agendado com sucesso na <b>{barbershop.name}</b>. Te
            esperamos lá!
          </Text>
          <Button
            w="full"
            colorScheme="blue"
            mt={4}
            onClick={() => window.location.reload()}
          >
            Fazer outro agendamento
          </Button>
        </VStack>
      </Center>
    );
  }

  // --- Tela Principal de Agendamento ---
  const selectedService = barbershop.services.find((s) => s.id === serviceId);

  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <Container maxW="md" bg="white" p={6} borderRadius="xl" shadow="sm">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center" mb={2}>
            <Heading size="xl" color="gray.900">
              {barbershop.name}
            </Heading>
            <Text color="gray.500" mt={2}>
              Agende seu horário de forma rápida e fácil.
            </Text>
          </Box>

          <Divider />

          {/* Passo 1: O que e Com Quem */}
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel display="flex" alignItems="center" gap={2}>
                <Icon as={Scissors} size={16} /> Serviço
              </FormLabel>
              <Select
                placeholder="Escolha um serviço"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                bg="gray.50"
              >
                {barbershop.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {formatPrice(s.price)}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel display="flex" alignItems="center" gap={2}>
                <Icon as={User} size={16} /> Profissional
              </FormLabel>
              <Select
                placeholder="Escolha o barbeiro"
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                bg="gray.50"
              >
                {barbershop.barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>

          {/* Passo 2: Quando */}
          <Flex gap={4}>
            <FormControl isRequired>
              <FormLabel display="flex" alignItems="center" gap={2}>
                <Icon as={Calendar} size={16} /> Data
              </FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                bg="gray.50"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel display="flex" alignItems="center" gap={2}>
                <Icon as={Clock} size={16} /> Hora
              </FormLabel>
              <Select
                placeholder="Horário"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                bg="gray.50"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Flex>

          <Divider />

          {/* Passo 3: Seus Dados */}
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Seu Nome</FormLabel>
              <Input
                placeholder="Ex: João Silva"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                bg="gray.50"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel display="flex" alignItems="center" gap={2}>
                <Icon as={Phone} size={16} /> WhatsApp
              </FormLabel>
              <Input
                type="tel"
                placeholder="Ex: 11999999999"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                bg="gray.50"
              />
            </FormControl>
          </VStack>

          {/* Resumo e Botão */}
          {selectedService && (
            <Box bg="blue.50" p={4} borderRadius="md" mt={2}>
              <Flex justify="space-between" align="center">
                <Text color="blue.800" fontWeight="medium">
                  Total a pagar no local:
                </Text>
                <Heading size="md" color="blue.600">
                  {formatPrice(selectedService.price)}
                </Heading>
              </Flex>
            </Box>
          )}

          <Button
            size="lg"
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={bookMutation.isPending}
            loadingText="Agendando..."
            mt={2}
          >
            Confirmar Agendamento
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
