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
import { CalendarClock, Users, DollarSign, Scissors, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";
const BRAND_SOFT = "#F9F2ED";

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
    CONCLUIDO: "green.500",
    AGENDADO: BRAND_COLOR,
    CANCELADO: "red.500",
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
              bg={BRAND_COLOR}
              borderRadius="md"
              transition="all 0.2s"
              _hover={{ bg: BRAND_HOVER, opacity: 1 }}
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
            color="gray.500"
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

  const validAppointmentsToday = appointmentsToday.filter(
    (a) => a.status !== "CANCELADO",
  );
  const totalAtendimentos = validAppointmentsToday.length;

  const faturamentoHoje = validAppointmentsToday.reduce(
    (acc, app) => acc + Number(app.price || app.service.price || 0),
    0,
  );

  const chartData = (() => {
    const validChartAppointments = chartAppointments.filter(
      (a) => a.status !== "CANCELADO",
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
        <Spinner size="xl" color={BRAND_COLOR} thickness="4px" speed="0.65s" />
      </Center>
    );
  }

  return (
    <Box>
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        mb={8}
        gap={4}
      >
        <Box>
          <Heading size="lg" color="gray.900">
            Olá, {user?.name?.split(" ")[0] || "Administrador"}
          </Heading>
          <Text color="gray.500" mt={1} textTransform="capitalize">
            {today} · {isOwner ? "Visão Geral" : "Resumo do Dia"}
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            size="sm"
            bg={BRAND_COLOR}
            color="white"
            _hover={{ bg: BRAND_HOVER }}
            leftIcon={<Plus size={16} />}
          >
            Novo agendamento
          </Button>
        </HStack>
      </Flex>

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
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  color="gray.500"
                >
                  {s.label}
                </Text>
                <Text
                  mt={2}
                  fontSize="2xl"
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
                bg={BRAND_SOFT}
                color={BRAND_COLOR}
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
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Box
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            shadow="sm"
            h="100%"
          >
            <Flex
              p={6}
              align="center"
              justify="space-between"
              borderBottomWidth="1px"
              borderColor="gray.50"
            >
              <Box>
                <Heading size="md" color="gray.900">
                  Evolução do Faturamento
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={1} fontWeight="medium">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalFaturamentoCard)}{" "}
                  <Text as="span" fontWeight="normal">
                    no período
                  </Text>
                </Text>
              </Box>
              <HStack bg="gray.100" p={1} borderRadius="lg" spacing={1}>
                {(["hoje", "semana", "mes"] as const).map((filter) => (
                  <Button
                    key={filter}
                    size="xs"
                    variant={faturamentoFilter === filter ? "solid" : "ghost"}
                    bg={faturamentoFilter === filter ? "white" : "transparent"}
                    shadow={faturamentoFilter === filter ? "sm" : "none"}
                    color={
                      faturamentoFilter === filter ? BRAND_COLOR : "gray.500"
                    }
                    borderRadius="md"
                    textTransform="capitalize"
                    onClick={() => setFaturamentoFilter(filter)}
                  >
                    {filter}
                  </Button>
                ))}
              </HStack>
            </Flex>
            <Box p={6}>
              {totalFaturamentoCard === 0 && faturamentoFilter === "hoje" ? (
                <Center h="200px">
                  <Text color="gray.500">
                    Nenhum faturamento registrado para hoje ainda.
                  </Text>
                </Center>
              ) : (
                <DynamicChart data={chartData} />
              )}
            </Box>
          </Box>
        </GridItem>

        <GridItem colSpan={1}>
          <Box
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            shadow="sm"
            h="100%"
          >
            <Box p={6} pb={4} borderBottomWidth="1px" borderColor="gray.50">
              <Heading size="md" color="gray.900">
                Agenda do dia
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {appointmentsToday.length} clientes na fila
              </Text>
            </Box>

            <VStack p={0} spacing={0} align="stretch" divider={<Divider />}>
              {appointmentsToday.length === 0 && (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={10}>
                  Nenhum cliente agendado para hoje.
                </Text>
              )}
              {appointmentsToday.map((a) => (
                <Flex
                  key={a.id}
                  align="center"
                  gap={4}
                  p={4}
                  _hover={{ bg: "gray.50" }}
                  transition="background 0.2s"
                >
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    bg={BRAND_SOFT}
                    color={BRAND_COLOR}
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
                      color="gray.900"
                      isTruncated
                    >
                      {a.client.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500" isTruncated>
                      {a.service.name} {isOwner && `• ${a.barber.name}`}
                    </Text>
                  </Box>
                  <VStack align="end" spacing={1}>
                    <StatusDot status={a.status} />
                    <Text fontSize="2xs" color="gray.400">
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
