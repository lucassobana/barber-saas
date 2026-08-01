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
  Image,
} from "@chakra-ui/react";
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
} from "lucide-react";
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
  openTime: string;
  closeTime: string;
  openDays?: string[];
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
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

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
  const [clientPhone, setClientPhone] = useState("");
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

  // --- LÓGICA DINÂMICA DE HORÁRIOS ---
  const isDayOpen = () => {
    if (!date || !barbershop?.openDays) return true;
    const dayOfWeek = new Date(`${date}T00:00:00`).getDay().toString();
    return barbershop.openDays.includes(dayOfWeek);
  };

  const isOpen = isDayOpen();

  const generateAvailableSlots = () => {
    if (!barbershop?.openTime || !barbershop?.closeTime) return [];

    const slots = [];
    const [openH, openM] = barbershop.openTime.split(":").map(Number);
    const [closeH, closeM] = barbershop.closeTime.split(":").map(Number);

    const current = new Date();
    current.setHours(openH, openM, 0, 0);
    const end = new Date();
    end.setHours(closeH, closeM, 0, 0);

    while (current < end) {
      slots.push(
        `${String(current.getHours()).padStart(2, "0")}:${String(
          current.getMinutes(),
        ).padStart(2, "0")}`,
      );
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  const timeSlots = generateAvailableSlots();

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

  if (isLoading)
    return (
      <Center h="100vh" bg="bg-app">
        <Spinner size="xl" color="brand-primary" thickness="4px" />
      </Center>
    );
  if (isError || !barbershop)
    return (
      <Center h="100vh" bg="bg-app">
        <Text color="status-error" fontWeight="medium">
          Barbearia não encontrada.
        </Text>
      </Center>
    );

  if (isSuccess) {
    return (
      <Center h="100vh" bg="bg-app" p={4}>
        <VStack
          spacing={6}
          bg="bg-surface"
          p={{ base: 6, md: 8 }}
          borderRadius="xl"
          shadow="card-shadow"
          textAlign="center"
          maxW="md"
          w="full"
          borderTopWidth="4px"
          borderColor="brand-primary"
        >
          <Center w={16} h={16} bg="brand-soft" borderRadius="full">
            <Icon as={CheckCircle} size={32} color="brand-primary" />
          </Center>
          <Heading size="lg" color="text-primary">
            Tudo Certo!
          </Heading>
          <Text color="text-secondary">
            Seu horário foi agendado com sucesso na{" "}
            <Text as="span" color="text-primary" fontWeight="bold">
              {barbershop.name}
            </Text>
            . Te esperamos lá!
          </Text>
          <Button
            w="full"
            bg="brand-primary"
            color="white"
            _hover={{ bg: "brand-hover" }}
            _active={{ bg: "brand-active" }}
            mt={4}
            size="lg"
            onClick={() => window.location.reload()}
          >
            Fazer outro agendamento
          </Button>
        </VStack>
      </Center>
    );
  }

  const selectedService = barbershop.services.find((s) => s.id === serviceId);

  return (
    <Box minH="100vh" bg="bg-app" py={{ base: 6, md: 10 }} px={4}>
      <Container
        maxW="md"
        bg="bg-surface"
        p={{ base: 5, sm: 8 }}
        borderRadius="2xl"
        shadow="card-shadow"
        borderWidth="1px"
        borderColor="border-subtle"
      >
        <VStack spacing={6} align="stretch">
          {/* HEADER COM A LOGO RESPONSIVA */}
          <Box textAlign="center" mb={4}>
            <Flex justify="center" mb={6}>
              <Image
                src="/ProximoCorteLogo.png"
                alt="Logo PróximoCorte"
                h={{ base: "120px", md: "160px" }} // Menor no celular
                objectFit="contain"
                fallback={
                  <Heading size="lg" color="text-primary">
                    PróximoCorte
                  </Heading>
                }
              />
            </Flex>

            <Heading size="md" color="text-primary" mb={2}>
              Agendamento - {barbershop.name}
            </Heading>
            <Text color="text-secondary" fontSize="sm">
              Preencha os dados abaixo para reservar o seu horário.
            </Text>
          </Box>

          <Divider borderColor="border-subtle" />

          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
              <FormLabel
                display="flex"
                alignItems="center"
                gap={2}
                color="text-primary"
                fontWeight="semibold"
              >
                <Icon as={Scissors} size={18} color="brand-primary" /> Serviço
              </FormLabel>
              <Select
                placeholder="Escolha um serviço"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                size="lg"
                _hover={{ borderColor: "border-hover" }}
                _focus={{
                  borderColor: "brand-primary",
                  boxShadow: "focus-glow",
                }}
                sx={{
                  "> option": {
                    bg: "bg-surface",
                    color: "text-primary",
                  },
                }}
              >
                {barbershop.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {formatPrice(s.price)}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel
                display="flex"
                alignItems="center"
                gap={2}
                color="text-primary"
                fontWeight="semibold"
              >
                <Icon as={User} size={18} color="brand-primary" /> Profissional
              </FormLabel>
              <Select
                placeholder="Escolha o barbeiro"
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                size="lg"
                _hover={{ borderColor: "border-hover" }}
                _focus={{
                  borderColor: "brand-primary",
                  boxShadow: "focus-glow",
                }}
                sx={{
                  "> option": {
                    bg: "bg-surface",
                    color: "text-primary",
                  },
                }}
              >
                {barbershop.barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>

          {/* DATA E HORA: Lado a lado no Tablet/Desktop, Empilhados no Celular */}
          <Flex direction={{ base: "column", sm: "row" }} gap={4} mt={2}>
            <FormControl isRequired>
              <FormLabel
                display="flex"
                alignItems="center"
                gap={2}
                color="text-primary"
                fontWeight="semibold"
              >
                <Icon as={Calendar} size={18} color="brand-primary" /> Data
              </FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                size="lg"
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
            <FormControl isRequired>
              <FormLabel
                display="flex"
                alignItems="center"
                gap={2}
                color="text-primary"
                fontWeight="semibold"
              >
                <Icon as={Clock} size={18} color="brand-primary" /> Hora
              </FormLabel>
              <Select
                placeholder="Horário"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                size="lg"
                _hover={{ borderColor: "border-hover" }}
                _focus={{
                  borderColor: "brand-primary",
                  boxShadow: "focus-glow",
                }}
                isDisabled={!isOpen || !date}
                sx={{
                  "> option": {
                    bg: "bg-surface",
                    color: "text-primary",
                  },
                }}
              >
                {timeSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              {!isOpen && date && (
                <Text
                  color="status-error"
                  fontSize="xs"
                  mt={1.5}
                  fontWeight="medium"
                >
                  Fechado neste dia.
                </Text>
              )}
            </FormControl>
          </Flex>

          <Divider borderColor="border-subtle" mt={2} mb={2} />

          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
              <FormLabel color="text-primary" fontWeight="semibold">
                Seu Nome
              </FormLabel>
              <Input
                placeholder="Ex: João Silva"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                size="lg"
                _hover={{ borderColor: "border-hover" }}
                _focus={{
                  borderColor: "brand-primary",
                  boxShadow: "focus-glow",
                }}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel
                display="flex"
                alignItems="center"
                gap={2}
                color="text-primary"
                fontWeight="semibold"
              >
                <Icon as={Phone} size={18} color="brand-primary" /> WhatsApp
              </FormLabel>
              <Input
                type="tel"
                placeholder="Ex: 11999999999"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                size="lg"
                _hover={{ borderColor: "border-hover" }}
                _focus={{
                  borderColor: "brand-primary",
                  boxShadow: "focus-glow",
                }}
              />
            </FormControl>
          </VStack>

          {selectedService && (
            <Box
              bg="brand-soft"
              p={4}
              borderRadius="lg"
              mt={2}
              borderWidth="1px"
              borderColor="border-subtle"
            >
              <Flex justify="space-between" align="center">
                <Text
                  color="text-primary"
                  fontWeight="medium"
                  fontSize={{ base: "sm", sm: "md" }}
                >
                  Total a pagar no local:
                </Text>
                <Heading size="md" color="brand-primary">
                  {formatPrice(selectedService.price)}
                </Heading>
              </Flex>
            </Box>
          )}

          <Button
            w="full"
            size="lg"
            bg="brand-primary"
            color="white"
            _hover={{
              bg: "brand-hover",
              transform: "translateY(-1px)",
            }}
            _active={{
              bg: "brand-active",
              transform: "translateY(0)",
            }}
            transition="all 0.2s"
            onClick={handleSubmit}
            isLoading={bookMutation.isPending}
            isDisabled={!isOpen}
            loadingText="Agendando..."
            mt={4}
            h="56px"
            fontSize="lg"
            shadow="card-shadow"
          >
            Confirmar Agendamento
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
