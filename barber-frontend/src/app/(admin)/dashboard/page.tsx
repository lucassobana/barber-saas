"use client";

import { useState } from "react";
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
  HStack,
  VStack,
  Spinner,
  Center,
  Divider,
} from "@chakra-ui/react";
import { CalendarClock, Users, DollarSign, Scissors } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "AGENDADO" | "CONCLUIDO" | "CANCELADO";
  price?: number;
  client: { name: string; phone: string };
  barber: { name: string };
  service: { name: string; duration: number; price: number };
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONCLUIDO: "status-success",
    AGENDADO: "status-info",
    CANCELADO: "status-error",
  };
  return (
    <Box
      h="2.5"
      w="2.5"
      flexShrink={0}
      borderRadius="full"
      bg={map[status] || "gray.500"}
    />
  );
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    CONCLUIDO: "Concluído",
    AGENDADO: "Confirmado",
    CANCELADO: "Cancelado",
  };
  return labels[status] || status;
}

function DynamicChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Flex h="200px" alignItems="flex-end" gap={2} mt={4}>
      {data.map((item, i) => (
        <Flex
          key={i}
          flex="1"
          flexDir="column"
          alignItems="center"
          gap={2}
          h="100%"
        >
          <Flex
            w="full"
            h="100%"
            alignItems="flex-end"
            justify="center"
            position="relative"
          >
            <Box
              w="full"
              maxW="40px"
              bg="brand-primary"
              borderRadius="md"
              transition="all 0.2s"
              _hover={{ bg: "brand-hover", opacity: 1 }}
              style={{
                height: `${(item.value / max) * 100}%`,
                opacity: 0.6 + (item.value / max) * 0.4,
                minHeight: item.value > 0 ? "4px" : "0",
              }}
              title={`R$ ${item.value.toFixed(2)}`}
            />
          </Flex>
          <Text
            fontSize="10px"
            color="text-secondary"
            noOfLines={1}
            textAlign="center"
          >
            {item.label}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [faturamentoFilter, setFaturamentoFilter] = useState<
    "hoje" | "semana" | "mes"
  >("hoje");

  const isOwner =
    user?.memberships?.[0]?.role === "OWNER" ||
    user?.memberships?.[0]?.role === "ADMIN";

  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const { data: appointmentsToday = [], isLoading: isLoadingToday } = useQuery<
    Appointment[]
  >({
    queryKey: ["appointments", "today"],
    queryFn: async () => (await api.get("/appointments/today")).data,
  });

  const { data: chartAppointments = [], isLoading: isLoadingChart } = useQuery<
    Appointment[]
  >({
    queryKey: ["appointments", "chart", faturamentoFilter],
    queryFn: async () => {
      const endpointMap = { hoje: "today", semana: "week", mes: "month" };
      return (await api.get(`/appointments/${endpointMap[faturamentoFilter]}`))
        .data;
    },
  });

  // 1. Contador de Atendimentos: Conta tudo que não está cancelado para mostrar o fluxo do dia
  const validAppointmentsToday = appointmentsToday.filter(
    (a) => a.status !== "CANCELADO",
  );
  const totalAtendimentos = validAppointmentsToday.length;

  // 2. Faturamento Hoje: Soma APENAS os cortes já CONCLUÍDOS (Caixa Real)
  const faturamentoHoje = appointmentsToday
    .filter((a) => a.status === "CONCLUIDO")
    .reduce((acc, app) => acc + Number(app.price || app.service.price || 0), 0);

  // 3. Gráfico de Evolução: Usa APENAS os cortes já CONCLUÍDOS
  const chartData = (() => {
    // A MUDANÇA PRINCIPAL AQUI: Filtra estritamente por "CONCLUIDO"
    const validChartAppointments = chartAppointments.filter(
      (a) => a.status === "CONCLUIDO",
    );

    if (faturamentoFilter === "hoje") {
      const hours = [
        "08h",
        "09h",
        "10h",
        "11h",
        "12h",
        "13h",
        "14h",
        "15h",
        "16h",
        "17h",
        "18h",
        "19h",
      ];
      const dataMap = hours.reduce(
        (acc, hour) => ({ ...acc, [hour]: 0 }),
        {} as Record<string, number>,
      );
      validChartAppointments.forEach((app) => {
        const hourPrefix = app.startTime.split(":")[0] + "h";
        if (dataMap[hourPrefix] !== undefined)
          dataMap[hourPrefix] += Number(app.price || app.service.price || 0);
      });
      return hours.map((hour) => ({ label: hour, value: dataMap[hour] }));
    }

    if (faturamentoFilter === "semana") {
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const dataMap = days.reduce(
        (acc, day) => ({ ...acc, [day]: 0 }),
        {} as Record<string, number>,
      );
      validChartAppointments.forEach((app) => {
        const dayName = days[new Date(app.date).getUTCDay()];
        dataMap[dayName] += Number(app.price || app.service.price || 0);
      });
      return [
        { label: "Seg", value: dataMap["Seg"] },
        { label: "Ter", value: dataMap["Ter"] },
        { label: "Qua", value: dataMap["Qua"] },
        { label: "Qui", value: dataMap["Qui"] },
        { label: "Sex", value: dataMap["Sex"] },
        { label: "Sáb", value: dataMap["Sáb"] },
        { label: "Dom", value: dataMap["Dom"] },
      ];
    }

    if (faturamentoFilter === "mes") {
      const dataMap: Record<string, number> = {
        "Sem 1": 0,
        "Sem 2": 0,
        "Sem 3": 0,
        "Sem 4": 0,
        "Sem 5": 0,
      };
      validChartAppointments.forEach((app) => {
        const weekNum = Math.ceil(new Date(app.date).getUTCDate() / 7);
        dataMap[`Sem ${weekNum > 5 ? 5 : weekNum}`] += Number(
          app.price || app.service.price || 0,
        );
      });
      return Object.keys(dataMap).map((key) => ({
        label: key,
        value: dataMap[key],
      }));
    }
    return [];
  })();

  const totalFaturamentoCard = chartData.reduce(
    (acc, item) => acc + item.value,
    0,
  );

  const stats = [
    {
      label: "Atendimentos",
      value: totalAtendimentos.toString(),
      icon: Scissors,
    },
    {
      label: "Faturamento",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(faturamentoHoje),
      icon: DollarSign,
    },
    { label: "Agendamentos Futuros", value: "...", icon: CalendarClock },
    { label: "Novos Clientes", value: "...", icon: Users },
  ];

  if (isLoadingToday || isLoadingChart) {
    return (
      <Center h="100vh">
        <Spinner
          size="xl"
          color="brand-primary"
          thickness="4px"
          speed="0.65s"
        />
      </Center>
    );
  }

  return (
    <Box>
      {/* CABEÇALHO RESPONSIVO */}
      <Box textAlign={{ base: "center", sm: "left" }}>
        <Flex align="center" gap={2} mb={8} justify="space-between">
          <Heading size="lg" color="text-primary">
            Olá, {user?.name?.split(" ")[0] || "Administrador"}
          </Heading>

          <Text color="text-muted" textTransform="capitalize">
            {today}
          </Text>
        </Flex>
      </Box>

      {/* CARDS DE ESTATÍSTICAS */}
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4} mb={6}>
        {stats.map((s) => (
          <Box
            key={s.label}
            bg="bg-surface"
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border-subtle"
            shadow="card-shadow"
            _hover={{ borderColor: "border-hover" }}
            transition="all 0.2s"
          >
            <Flex align="start" justify="space-between">
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  color="text-secondary"
                >
                  {s.label}
                </Text>
                <Text
                  mt={2}
                  fontSize="2xl"
                  fontWeight="semibold"
                  letterSpacing="tight"
                  color="text-primary"
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
                bg="brand-soft"
                color="brand-primary"
              >
                <Icon as={s.icon} boxSize={5} />
              </Flex>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      <Grid
        templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
        gap={4}
        mb={6}
      >
        {/* GRÁFICO DE FATURAMENTO */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Box
            bg="bg-surface"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border-subtle"
            shadow="card-shadow"
            h="100%"
          >
            <Flex
              p={6}
              direction={{ base: "column", sm: "row" }}
              align={{ base: "stretch", sm: "center" }}
              justify="space-between"
              borderBottomWidth="1px"
              borderColor="border-subtle"
              gap={4}
            >
              <Box textAlign={{ base: "center", sm: "left" }}>
                <Heading size="md" color="text-primary">
                  Evolução do Faturamento
                </Heading>
                <Text
                  fontSize="sm"
                  color="text-secondary"
                  mt={1}
                  fontWeight="medium"
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalFaturamentoCard)}{" "}
                  <Text as="span" fontWeight="normal" color="text-muted">
                    no período
                  </Text>
                </Text>
              </Box>

              <HStack
                bg="bg-surface-secondary"
                p={1}
                borderRadius="lg"
                spacing={1}
                w={{ base: "full", sm: "auto" }}
                justify="center"
              >
                {(["hoje", "semana", "mes"] as const).map((filter) => (
                  <Button
                    key={filter}
                    size="xs"
                    flex={{ base: 1, sm: "none" }} // Ocupa espaço igual no mobile
                    variant={faturamentoFilter === filter ? "solid" : "ghost"}
                    bg={
                      faturamentoFilter === filter
                        ? "bg-surface-hover"
                        : "transparent"
                    }
                    shadow={faturamentoFilter === filter ? "sm" : "none"}
                    color={
                      faturamentoFilter === filter
                        ? "text-primary"
                        : "text-secondary"
                    }
                    borderRadius="md"
                    textTransform="capitalize"
                    onClick={() => setFaturamentoFilter(filter)}
                    _hover={{ bg: "bg-surface-hover", color: "text-primary" }}
                  >
                    {filter}
                  </Button>
                ))}
              </HStack>
            </Flex>
            <Box p={6}>
              {totalFaturamentoCard === 0 && faturamentoFilter === "hoje" ? (
                <Center h="200px">
                  <Text color="text-muted" textAlign="center">
                    Nenhum faturamento registrado para hoje ainda.
                  </Text>
                </Center>
              ) : (
                <DynamicChart data={chartData} />
              )}
            </Box>
          </Box>
        </GridItem>

        {/* AGENDA DO DIA (LISTA LATERAL) */}
        <GridItem colSpan={1}>
          <Box
            bg="bg-surface"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border-subtle"
            shadow="card-shadow"
            h="100%"
          >
            <Box
              p={6}
              pb={4}
              borderBottomWidth="1px"
              borderColor="border-subtle"
              textAlign={{ base: "center", sm: "left" }}
            >
              <Heading size="md" color="text-primary">
                Agenda do dia
              </Heading>
              <Text fontSize="sm" color="text-secondary" mt={1}>
                {appointmentsToday.length} clientes na fila
              </Text>
            </Box>

            <VStack
              p={0}
              spacing={0}
              align="stretch"
              divider={<Divider borderColor="border-subtle" />}
            >
              {appointmentsToday.length === 0 && (
                <Text
                  fontSize="sm"
                  color="text-muted"
                  textAlign="center"
                  py={10}
                >
                  Nenhum cliente agendado para hoje.
                </Text>
              )}
              {appointmentsToday.map((a) => (
                <Flex
                  key={a.id}
                  align="center"
                  gap={4}
                  p={4}
                  transition="background 0.2s"
                  _hover={{ bg: "bg-surface-secondary" }}
                >
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    bg="brand-soft"
                    color="brand-primary"
                    px={3}
                    py={2}
                    borderRadius="md"
                    minW="70px"
                  >
                    <Text fontSize="md" fontWeight="bold">
                      {a.startTime}
                    </Text>
                  </Flex>
                  <Box flex="1" minW="0">
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="text-primary"
                      isTruncated
                    >
                      {a.client.name}
                    </Text>
                    <Text fontSize="xs" color="text-secondary" isTruncated>
                      {a.service.name} {isOwner && `• ${a.barber.name}`}
                    </Text>
                  </Box>
                  <VStack align="end" spacing={1}>
                    <StatusDot status={a.status} />
                    <Text fontSize="2xs" color="text-muted">
                      {getStatusLabel(a.status)}
                    </Text>
                  </VStack>
                </Flex>
              ))}
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}
