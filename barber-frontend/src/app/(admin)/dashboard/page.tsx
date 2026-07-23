"use client";

import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  SimpleGrid,
  GridItem,
  Grid,
  Icon,
  Avatar,
  Badge,
  Divider,
  HStack,
  VStack,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
  Users,
  DollarSign,
  Scissors,
  MoreHorizontal,
  Plus,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// --- TIPAGEM DA API ---
// Ajuste os campos caso o seu backend retorne nomes diferentes (ex: client_id, service_id)
interface Appointment {
  id: string;
  time: string;
  clientName: string;
  serviceName: string;
  barberName: string;
  status: "CONFIRMED" | "PENDING" | "IN_PROGRESS" | "CANCELED";
}

// --- FUNÇÃO DE BUSCA (FETCH) ---
async function fetchTodayAppointments(): Promise<Appointment[]> {
  // Ajuste a rota '/appointments/today' para a rota real do seu backend
  const response = await api.get("/appointments/today");
  return response.data;
}

// --- MOCK DATA PARA ESTATÍSTICAS (Mantenha até criar a rota de métricas) ---
const stats = [
  {
    label: "Atendimentos hoje",
    value: "28",
    delta: "+12%",
    trend: "up",
    hint: "vs. ontem",
    icon: Scissors,
  },
  {
    label: "Faturamento hoje",
    value: "R$ 2.480",
    delta: "+8,4%",
    trend: "up",
    hint: "meta 84%",
    icon: DollarSign,
  },
  {
    label: "Agendamentos futuros",
    value: "142",
    delta: "-3%",
    trend: "down",
    hint: "próx. 7 dias",
    icon: CalendarClock,
  },
  {
    label: "Novos clientes",
    value: "17",
    delta: "+22%",
    trend: "up",
    hint: "no mês",
    icon: Users,
  },
];

// --- COMPONENTES AUXILIARES ---
function MiniChart() {
  const bars = [42, 55, 38, 72, 60, 80, 68, 90, 74, 82, 65, 88];
  const max = Math.max(...bars);
  return (
    <Flex h="40" alignItems="flex-end" gap={2}>
      {bars.map((v, i) => (
        <Flex key={i} flex="1" flexDir="column" alignItems="center" gap={2}>
          <Box
            w="full"
            bg="blue.500"
            borderRadius="md"
            transition="all 0.2s"
            _hover={{ bg: "blue.600", opacity: 1 }}
            style={{
              height: `${(v / max) * 100}%`,
              opacity: 0.2 + (i / bars.length) * 0.8,
            }}
          />
          <Text fontSize="10px" color="gray.500">
            {i + 8}h
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED: "green.500",
    IN_PROGRESS: "blue.500",
    PENDING: "yellow.500",
    CANCELED: "red.500",
  };
  return (
    <Box
      h="2"
      w="2"
      flexShrink={0}
      borderRadius="full"
      bg={map[status] || "gray.500"}
    />
  );
}

// Converte o status do banco para o texto amigável na tela
function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    CONFIRMED: "Confirmado",
    IN_PROGRESS: "Em progresso",
    PENDING: "Aguardando",
    CANCELED: "Cancelado",
  };
  return labels[status] || status;
}

function Kpi({
  label,
  value,
  hint,
  positive,
}: {
  label: string;
  value: string;
  hint: string;
  positive?: boolean;
}) {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Box>
        <Text fontSize="xs" color="gray.500">
          {label}
        </Text>
        <Text mt={0.5} fontSize="lg" fontWeight="semibold" color="gray.900">
          {value}
        </Text>
      </Box>
      <Text
        fontSize="xs"
        fontWeight="medium"
        color={positive ? "green.500" : "red.500"}
      >
        {hint}
      </Text>
    </Flex>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function DashboardPage() {
  const { user } = useAuth();

  // Chamada na API usando o React Query
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", "today"],
    queryFn: fetchTodayAppointments,
  });

  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  // Tela de Loading enquanto busca os dados
  if (isLoading) {
    return (
      <Center h="100%">
        <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
      </Center>
    );
  }

  return (
    <Box>
      {/* Cabeçalho da Página */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        mb={8}
        gap={4}
      >
        <Box>
          <Heading size="lg" color="gray.900">
            Bom dia, {user?.name?.split(" ")[0] || "Administrador"}
          </Heading>
          <Text color="gray.500" mt={1} textTransform="capitalize">
            {today} · Barbearia Vintage
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button variant="outline" size="sm" bg="white">
            Relatório do dia
          </Button>
          <Button size="sm" colorScheme="blue" leftIcon={<Plus size={16} />}>
            Novo agendamento
          </Button>
        </HStack>
      </Flex>

      {/* Grid de Estatísticas */}
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4} mb={6}>
        {stats.map((s) => (
          <Box
            key={s.label}
            bg="white"
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            shadow="sm"
          >
            <Flex align="start" justify="space-between">
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="medium"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  color="gray.500"
                >
                  {s.label}
                </Text>
                <Text
                  mt={2}
                  fontSize="3xl"
                  fontWeight="semibold"
                  letterSpacing="tight"
                  color="gray.900"
                >
                  {s.value}
                </Text>
              </Box>
              <Flex
                h="10"
                w="10"
                align="center"
                justify="center"
                borderRadius="lg"
                bg="gray.100"
                color="gray.700"
              >
                <Icon as={s.icon} boxSize={4} />
              </Flex>
            </Flex>
            <Flex mt={3} align="center" gap={2}>
              <Badge
                display="flex"
                alignItems="center"
                gap={0.5}
                px={1.5}
                py={0.5}
                borderRadius="md"
                textTransform="none"
                colorScheme={s.trend === "up" ? "green" : "red"}
                variant="subtle"
              >
                <Icon
                  as={s.trend === "up" ? ArrowUpRight : ArrowDownRight}
                  boxSize={3}
                />
                {s.delta}
              </Badge>
              <Text fontSize="xs" color="gray.500">
                {s.hint}
              </Text>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      {/* Seção Central */}
      <Grid
        templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
        gap={4}
        mb={6}
      >
        {/* Gráfico */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Box
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            shadow="sm"
            h="100%"
          >
            <Flex p={6} align="center" justify="space-between">
              <Box>
                <Heading size="md" color="gray.900">
                  Faturamento por hora
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Hoje · R$ 2.480 acumulado
                </Text>
              </Box>
              <HStack bg="gray.100" p={1} borderRadius="lg" spacing={1}>
                <Button
                  size="xs"
                  variant="solid"
                  bg="white"
                  shadow="sm"
                  borderRadius="md"
                >
                  Hoje
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.500"
                  _hover={{ bg: "white" }}
                >
                  Semana
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.500"
                  _hover={{ bg: "white" }}
                >
                  Mês
                </Button>
              </HStack>
            </Flex>
            <Box px={6} pb={6}>
              <MiniChart />
            </Box>
          </Box>
        </GridItem>

        {/* Agenda do Dia */}
        <GridItem colSpan={1}>
          <Box
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            shadow="sm"
            h="100%"
          >
            <Flex p={6} pb={2} align="center" justify="space-between">
              <Box>
                <Heading size="md" color="gray.900">
                  Agenda do dia
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  {appointments?.length || 0} agendamentos
                </Text>
              </Box>
              <Button variant="ghost" size="sm" px={2}>
                <Icon as={MoreHorizontal} boxSize={4} />
              </Button>
            </Flex>
            <VStack p={6} pt={2} spacing={3} align="stretch">
              {/* Mensagem caso não tenha nenhum agendamento */}
              {(!appointments || appointments.length === 0) && (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                  Nenhum cliente agendado para hoje.
                </Text>
              )}

              {/* Lista mapeada da API */}
              {appointments?.map((a) => (
                <Flex
                  key={a.id}
                  align="center"
                  gap={3}
                  p={3}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.100"
                  bg="gray.50"
                >
                  <Flex
                    w="14"
                    direction="column"
                    align="center"
                    borderRadius="md"
                    bg="white"
                    py={1.5}
                    shadow="xs"
                  >
                    <Text fontSize="sm" fontWeight="bold" color="gray.900">
                      {a.time}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                      40 min
                    </Text>
                  </Flex>
                  <Box flex="1" minW="0">
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.900"
                      isTruncated
                    >
                      {a.clientName}
                    </Text>
                    <Text fontSize="xs" color="gray.500" isTruncated>
                      {a.serviceName} · {a.barberName}
                    </Text>
                  </Box>
                  <StatusDot status={a.status} />
                </Flex>
              ))}
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {/* Seção Inferior */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={4}>
        {/* Próximos Clientes */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Box
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            shadow="sm"
            h="100%"
          >
            <Box p={6} borderBottomWidth="1px" borderColor="gray.100">
              <Heading size="md" color="gray.900">
                Próximos clientes
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Chegando nas próximas horas
              </Text>
            </Box>
            <VStack align="stretch" spacing={0} divider={<Divider />}>
              {(!appointments || appointments.length === 0) && (
                <Text fontSize="sm" color="gray.500" p={6}>
                  Nenhuma agenda pendente no momento.
                </Text>
              )}

              {/* Limita para mostrar apenas os 4 primeiros */}
              {appointments?.slice(0, 4).map((a) => (
                <Flex key={a.id} align="center" gap={4} px={6} py={4}>
                  <Avatar
                    size="sm"
                    name={a.clientName}
                    bg="gray.200"
                    color="gray.600"
                  />
                  <Box flex="1" minW="0">
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.900"
                      isTruncated
                    >
                      {a.clientName}
                    </Text>
                    <Text fontSize="xs" color="gray.500" isTruncated>
                      {a.serviceName} · {a.barberName}
                    </Text>
                  </Box>
                  <HStack
                    display={{ base: "none", sm: "flex" }}
                    color="gray.500"
                    fontSize="xs"
                    mr={4}
                  >
                    <Icon as={Clock} boxSize={3.5} />
                    <Text>{a.time}</Text>
                  </HStack>
                  <Badge
                    variant="outline"
                    colorScheme="gray"
                    display={{ base: "none", sm: "inline-flex" }}
                  >
                    {getStatusLabel(a.status)}
                  </Badge>
                </Flex>
              ))}
            </VStack>
          </Box>
        </GridItem>

        {/* Indicadores */}
        <GridItem colSpan={1}>
          <Box
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            shadow="sm"
            h="100%"
          >
            <Box p={6} pb={4}>
              <Heading size="md" color="gray.900">
                Indicadores
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Semana atual
              </Text>
            </Box>
            <VStack p={6} pt={0} spacing={4} align="stretch">
              <Kpi
                label="Ticket médio"
                value="R$ 88,50"
                hint="+4,2%"
                positive
              />
              <Divider />
              <Kpi
                label="Taxa de ocupação"
                value="76%"
                hint="+6 pts"
                positive
              />
              <Divider />
              <Kpi label="Cancelamentos" value="3,1%" hint="-1,2%" />
              <Divider />
              <Kpi label="Retenção" value="82%" hint="+2,4%" positive />
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}
