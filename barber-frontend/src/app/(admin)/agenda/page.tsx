"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  IconButton,
  Tabs,
  TabList,
  Tab,
  Select,
  Avatar,
  Badge,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Divider,
  HStack,
  VStack,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  MessageCircle,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  subWeeks,
  addWeeks,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";
const BRAND_SOFT = "#F9F2ED";

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "AGENDADO" | "CONCLUIDO" | "CANCELADO";
  client: { name: string; phone: string };
  barber: { id: string; name: string };
  service: { name: string; duration: number; price: number };
};

export default function AgendaPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const barbershopId = user?.memberships?.[0]?.barbershopId;
  const userRole = user?.memberships?.[0]?.role || "ADMIN";

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const startDateStr = format(currentWeekStart, "yyyy-MM-dd");
  const endDateStr = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");
  const [selectedBarber, setSelectedBarber] = useState<string>("todos");
  const [openEvent, setOpenEvent] = useState<Appointment | null>(null);

  const { data: barbershop, isLoading: isBarbershopLoading } = useQuery({
    queryKey: ["barbershop", barbershopId],
    queryFn: async () =>
      (await api.get(`/platform/barbershops/${barbershopId}`)).data,
    enabled: !!barbershopId,
  });

  const { data: appointments = [], isLoading: isAppointmentsLoading } =
    useQuery<Appointment[]>({
      queryKey: ["appointments", startDateStr, endDateStr],
      queryFn: async () =>
        (
          await api.get("/appointments", {
            params: { startDate: startDateStr, endDate: endDateStr },
          })
        ).data,
    });

  const { data: barbers = [] } = useQuery({
    queryKey: ["barbers"],
    queryFn: async () => (await api.get("/barbers")).data,
    enabled: userRole === "OWNER" || userRole === "ADMIN",
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.patch(`/appointments/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Status atualizado!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setOpenEvent(null);
    },
    onError: () =>
      toast({
        title: "Erro ao atualizar.",
        status: "error",
        duration: 3000,
        isClosable: true,
      }),
  });

  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToday = () =>
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i),
  );
  const filteredAppointments = appointments.filter((app) =>
    selectedBarber === "todos" ? true : app.barber.id === selectedBarber,
  );

  const startHour = barbershop?.openTime
    ? parseInt(barbershop.openTime.split(":")[0])
    : 8;
  const endHour = barbershop?.closeTime
    ? parseInt(barbershop.closeTime.split(":")[0])
    : 20;
  const hoursCount = endHour - startHour + 1;
  const hours = Array.from(
    { length: hoursCount > 0 ? hoursCount : 14 },
    (_, i) => startHour + i,
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "AGENDADO":
        return { bg: BRAND_SOFT, border: BRAND_COLOR, color: BRAND_COLOR };
      case "CONCLUIDO":
        return { bg: "green.100", border: "green.400", color: "green.900" };
      case "CANCELADO":
        return {
          bg: "red.100",
          border: "red.400",
          color: "red.900",
          opacity: 0.6,
        };
      default:
        return { bg: "gray.100", border: "gray.400", color: "gray.900" };
    }
  };

  const calculatePosition = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h + m / 60;
  };

  const isPageLoading = isBarbershopLoading || isAppointmentsLoading;

  return (
    <Box>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        mb={6}
        gap={4}
      >
        <Box>
          <Heading size="lg" color="gray.900">
            Agenda
          </Heading>
          <Text color="gray.500" mt={1}>
            Semana de {format(currentWeekStart, "dd")} a{" "}
            {format(addDays(currentWeekStart, 6), "dd 'de' MMMM", {
              locale: ptBR,
            })}
          </Text>
        </Box>
        <HStack spacing={3}>
          {(userRole === "OWNER" || userRole === "ADMIN") && (
            <Select
              w="170px"
              bg="white"
              size="sm"
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
            >
              <option value="todos">Todos os barbeiros</option>
              {barbers.map((b: { id: string; name: string }) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          )}
          <Button
            size="sm"
            bg={BRAND_COLOR}
            color="white"
            _hover={{ bg: BRAND_HOVER }}
            leftIcon={<Plus size={16} />}
          >
            Novo Agendamento
          </Button>
        </HStack>
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        mb={4}
        flexWrap="wrap"
        gap={3}
      >
        <HStack
          bg="white"
          borderWidth="1px"
          borderRadius="lg"
          p={1}
          shadow="sm"
        >
          <IconButton
            aria-label="Semana anterior"
            icon={<ChevronLeft size={20} />}
            variant="ghost"
            size="sm"
            onClick={prevWeek}
          />
          <Text
            px={2}
            fontSize="sm"
            fontWeight="medium"
            textTransform="capitalize"
          >
            {format(currentWeekStart, "MMMM yyyy", { locale: ptBR })}
          </Text>
          <IconButton
            aria-label="Próxima semana"
            icon={<ChevronRight size={20} />}
            variant="ghost"
            size="sm"
            onClick={nextWeek}
          />
          <Divider orientation="vertical" h="20px" />
          <Button variant="ghost" size="sm" onClick={goToday}>
            Hoje
          </Button>
        </HStack>
        <Tabs variant="soft-rounded" colorScheme="orange" size="sm">
          <TabList bg="white" borderWidth="1px" borderRadius="full" p={1}>
            <Tab>Dia</Tab>
            <Tab isDisabled>Semana</Tab>
          </TabList>
        </Tabs>
      </Flex>

      <Box
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="sm"
        overflowX="auto"
      >
        {isPageLoading ? (
          <Center p={10}>
            <Spinner color={BRAND_COLOR} size="xl" />
          </Center>
        ) : (
          <Box minW="900px">
            <Flex borderBottomWidth="1px" bg="gray.50">
              <Box w="70px" flexShrink={0} />
              {weekDays.map((day, i) => {
                const isToday =
                  format(day, "yyyy-MM-dd") ===
                  format(new Date(), "yyyy-MM-dd");
                return (
                  <Box
                    key={i}
                    flex="1"
                    textAlign="center"
                    py={3}
                    borderRightWidth="1px"
                    _last={{ borderRightWidth: 0 }}
                  >
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textTransform="capitalize"
                      fontWeight="medium"
                    >
                      {format(day, "EEEEEE", { locale: ptBR })}
                    </Text>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={isToday ? BRAND_COLOR : "gray.900"}
                      mt={0.5}
                    >
                      {format(day, "dd")}
                    </Text>
                  </Box>
                );
              })}
            </Flex>

            <Flex position="relative">
              <Box w="70px" flexShrink={0} borderRightWidth="1px">
                {hours.map((h) => (
                  <Box
                    key={h}
                    h="64px"
                    textAlign="right"
                    pr={2}
                    pt={1}
                    fontSize="xs"
                    color="gray.400"
                    fontWeight="medium"
                  >
                    {String(h).padStart(2, "0")}:00
                  </Box>
                ))}
              </Box>

              {weekDays.map((day, dayIndex) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayAppointments = filteredAppointments.filter((app) =>
                  app.date.startsWith(dateStr),
                );
                return (
                  <Box
                    key={dayIndex}
                    flex="1"
                    position="relative"
                    borderRightWidth="1px"
                    _last={{ borderRightWidth: 0 }}
                  >
                    {hours.map((h) => (
                      <Box
                        key={h}
                        h="64px"
                        borderBottomWidth="1px"
                        borderColor="gray.100"
                      />
                    ))}
                    {dayAppointments.map((app) => {
                      const startFloat = calculatePosition(app.startTime);
                      const endFloat = calculatePosition(app.endTime);
                      const duration = endFloat - startFloat;
                      const top = (startFloat - startHour) * 64;
                      const height = duration * 64 - 4;
                      const style = getStatusStyle(app.status);

                      return (
                        <Box
                          key={app.id}
                          as="button"
                          onClick={() => setOpenEvent(app)}
                          position="absolute"
                          left="4px"
                          right="4px"
                          top={`${top}px`}
                          height={`${height}px`}
                          bg={style.bg}
                          borderColor={style.border}
                          borderWidth="1px"
                          borderRadius="md"
                          p={1.5}
                          textAlign="left"
                          shadow="sm"
                          _hover={{ shadow: "md", filter: "brightness(0.95)" }}
                          transition="all 0.2s"
                          overflow="hidden"
                        >
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color={style.color}
                            noOfLines={1}
                          >
                            {app.client.name}
                          </Text>
                          <Text
                            fontSize="2xs"
                            color={style.color}
                            opacity={0.8}
                            noOfLines={1}
                          >
                            {app.service.name} • {app.barber.name}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}
      </Box>

      <Drawer
        isOpen={!!openEvent}
        placement="right"
        onClose={() => setOpenEvent(null)}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          {openEvent && (
            <>
              <DrawerHeader borderBottomWidth="1px">
                <HStack mb={2}>
                  <Badge
                    bg={
                      openEvent.status === "AGENDADO" ? BRAND_SOFT : undefined
                    }
                    color={
                      openEvent.status === "AGENDADO" ? BRAND_COLOR : undefined
                    }
                    colorScheme={
                      openEvent.status === "CONCLUIDO"
                        ? "green"
                        : openEvent.status === "CANCELADO"
                          ? "red"
                          : undefined
                    }
                  >
                    {openEvent.status}
                  </Badge>
                </HStack>
                <Heading size="md">{openEvent.client.name}</Heading>
                <Text fontSize="sm" color="gray.500" fontWeight="normal" mt={1}>
                  {openEvent.service.name} • Barbeiro {openEvent.barber.name}
                </Text>
              </DrawerHeader>

              <DrawerBody py={6}>
                <VStack align="stretch" spacing={6}>
                  <HStack
                    bg="gray.50"
                    p={3}
                    borderRadius="lg"
                    borderWidth="1px"
                    spacing={4}
                  >
                    <Avatar
                      size="sm"
                      name={openEvent.client.name}
                      bg={BRAND_COLOR}
                      color="white"
                    />
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="semibold">
                        {openEvent.client.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {openEvent.client.phone}
                      </Text>
                    </Box>
                    <IconButton
                      as="a"
                      href={`tel:${openEvent.client.phone}`}
                      aria-label="Ligar"
                      icon={<Phone size={16} />}
                      variant="ghost"
                      size="sm"
                      color={BRAND_COLOR}
                    />
                    <IconButton
                      as="a"
                      href={`https://wa.me/55${openEvent.client.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      aria-label="WhatsApp"
                      icon={<MessageCircle size={16} />}
                      variant="ghost"
                      size="sm"
                      color={BRAND_COLOR}
                    />
                  </HStack>
                  <Box borderWidth="1px" borderRadius="lg" p={4}>
                    <VStack align="stretch" spacing={3} divider={<Divider />}>
                      <Flex justify="space-between" fontSize="sm">
                        <Text color="gray.500">Data</Text>
                        <Text fontWeight="medium" textTransform="capitalize">
                          {format(
                            parseISO(openEvent.date),
                            "EEEE, dd 'de' MMMM",
                            { locale: ptBR },
                          )}
                        </Text>
                      </Flex>
                      <Flex justify="space-between" fontSize="sm">
                        <Text color="gray.500">Horário</Text>
                        <Text fontWeight="medium">
                          {openEvent.startTime} – {openEvent.endTime}
                        </Text>
                      </Flex>
                      <Flex justify="space-between" fontSize="sm">
                        <Text color="gray.500">Serviço</Text>
                        <Text fontWeight="medium">
                          {openEvent.service.name}
                        </Text>
                      </Flex>
                      <Flex justify="space-between" fontSize="sm">
                        <Text color="gray.500">Valor</Text>
                        <Text fontWeight="bold">
                          R$ {Number(openEvent.service.price).toFixed(2)}
                        </Text>
                      </Flex>
                    </VStack>
                  </Box>

                  {openEvent.status === "AGENDADO" && (
                    <HStack>
                      <Button
                        flex="1"
                        variant="outline"
                        colorScheme="red"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: openEvent.id,
                            status: "CANCELADO",
                          })
                        }
                        isLoading={updateStatusMutation.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button
                        flex="1"
                        colorScheme="green"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: openEvent.id,
                            status: "CONCLUIDO",
                          })
                        }
                        isLoading={updateStatusMutation.isPending}
                      >
                        Concluir Corte
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
