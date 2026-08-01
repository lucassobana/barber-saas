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
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  MessageCircle,
  CheckCircle2,
  Calendar,
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
import { NewAppointmentModal } from "@/components/NewAppointmentModal";

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

  // Modal de Novo Agendamento (Admin)
  const {
    isOpen: isNewAppointmentOpen,
    onOpen: onOpenNewAppointment,
    onClose: onCloseNewAppointment,
  } = useDisclosure();

  // Estados de Data
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  // Estados EXCLUSIVOS para o Mobile
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

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

  // Funções de navegação do Desktop
  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    setSelectedDate(today);
    setReferenceDate(today);
  };

  const weekDaysDesktop = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i),
  );

  // Geração de Dias para o Mobile (Filtra apenas os dias que a barbearia abre)
  const mobileDays = Array.from({ length: 90 }, (_, i) =>
    addDays(referenceDate, i - 15),
  ).filter((day) => {
    if (!barbershop?.openDays || barbershop.openDays.length === 0) return true;
    return barbershop.openDays.includes(day.getDay().toString());
  });

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

  // Status Style adaptado para o novo Dark Theme com opacidade suave
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "AGENDADO":
        return {
          bg: "brand-soft",
          border: "brand-primary",
          color: "brand-primary",
        };
      case "CONCLUIDO":
        return {
          bg: "rgba(63, 185, 80, 0.15)",
          border: "status-success",
          color: "status-success",
        };
      case "CANCELADO":
        return {
          bg: "rgba(248, 81, 73, 0.15)",
          border: "status-error",
          color: "status-error",
          opacity: 0.7,
        };
      default:
        return {
          bg: "bg-surface-secondary",
          border: "border-subtle",
          color: "text-primary",
        };
    }
  };

  const calculatePosition = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h + m / 60;
  };

  const isPageLoading = isBarbershopLoading || isAppointmentsLoading;

  return (
    <Box position="relative" minH="100vh">
      {/* ========================================== */}
      {/* LAYOUT MOBILE (TIMELINE E SELETOR DE DIAS) */}
      {/* ========================================== */}
      <Box display={{ base: "block", lg: "none" }}>
        {/* Cabeçalho Mobile */}
        <Flex justify="space-between" align="flex-end" mb={6}>
          <Box>
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="text-secondary"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Agenda
            </Text>
            <HStack align="center" spacing={1} mt={1}>
              <Heading
                size="lg"
                color="text-primary"
                textTransform="capitalize"
              >
                {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
              </Heading>

              <Box position="relative">
                <IconButton
                  aria-label="Escolher mês"
                  icon={<Calendar size={22} />}
                  variant="ghost"
                  size="sm"
                  color="brand-primary"
                  _hover={{ bg: "transparent" }}
                />
                <Input
                  type="date"
                  position="absolute"
                  top={0}
                  left={0}
                  opacity={0}
                  w="100%"
                  h="100%"
                  cursor="pointer"
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split("-");
                      const date = new Date(
                        Number(y),
                        Number(m) - 1,
                        Number(d),
                      );
                      setSelectedDate(date);
                      setReferenceDate(date);
                      setCurrentWeekStart(
                        startOfWeek(date, { weekStartsOn: 1 }),
                      );
                    }
                  }}
                />
              </Box>
            </HStack>
          </Box>
          {(userRole === "OWNER" || userRole === "ADMIN") && (
            <Select
              w="160px"
              bg="bg-surface-secondary"
              borderColor="border-subtle"
              size="sm"
              borderRadius="full"
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              iconColor="text-secondary"
              _hover={{ borderColor: "border-hover" }}
            >
              <option value="todos">Todos Barbeiros</option>
              {barbers.map((b: { id: string; name: string }) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          )}
        </Flex>

        {/* Seletor Horizontal de Dias */}
        <HStack
          overflowX="auto"
          spacing={3}
          pb={4}
          mb={6}
          sx={{ "&::-webkit-scrollbar": { display: "none" } }}
        >
          {mobileDays.map((day) => {
            const isSelected =
              format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            return (
              <Flex
                key={day.toISOString()}
                direction="column"
                align="center"
                justify="center"
                minW="72px"
                h="90px"
                borderRadius="2xl"
                cursor="pointer"
                bg={isSelected ? "brand-primary" : "bg-surface"}
                color={isSelected ? "white" : "text-secondary"}
                borderWidth="1px"
                borderColor={isSelected ? "brand-primary" : "border-subtle"}
                shadow={isSelected ? "focus-glow" : "card-shadow"}
                onClick={() => {
                  setSelectedDate(day);
                  if (
                    day < currentWeekStart ||
                    day > addDays(currentWeekStart, 6)
                  ) {
                    setCurrentWeekStart(startOfWeek(day, { weekStartsOn: 1 }));
                  }
                }}
                transition="all 0.2s"
              >
                <Text fontSize="sm" fontWeight="bold" textTransform="uppercase">
                  {format(day, "EEE", { locale: ptBR }).substring(0, 3)}
                </Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>
                  {format(day, "dd")}
                </Text>
              </Flex>
            );
          })}
        </HStack>

        {/* Timeline Vertical do Dia Selecionado */}
        {isPageLoading ? (
          <Center p={10}>
            <Spinner color="brand-primary" size="xl" />
          </Center>
        ) : (
          <VStack spacing={6} align="stretch" pb="120px">
            {hours.map((h) => {
              const hourPrefix = String(h).padStart(2, "0");
              const appsInThisHour = filteredAppointments.filter(
                (app) =>
                  app.date.startsWith(format(selectedDate, "yyyy-MM-dd")) &&
                  app.startTime.startsWith(hourPrefix),
              );

              return (
                <Flex key={h} align="flex-start" gap={4}>
                  <Text
                    w="45px"
                    fontSize="sm"
                    fontWeight="medium"
                    color="text-secondary"
                    pt={4}
                  >
                    {hourPrefix}:00
                  </Text>

                  <Box flex="1">
                    {appsInThisHour.length > 0 ? (
                      <VStack align="stretch" spacing={3}>
                        {appsInThisHour.map((app) => (
                          <Box
                            key={app.id}
                            bg="bg-surface"
                            borderRadius="xl"
                            borderWidth="1px"
                            borderColor="border-subtle"
                            borderLeftWidth="4px"
                            borderLeftColor={
                              app.status === "AGENDADO"
                                ? "brand-primary"
                                : app.status === "CONCLUIDO"
                                  ? "status-success"
                                  : "status-error"
                            }
                            shadow="card-shadow"
                            p={4}
                            onClick={() => setOpenEvent(app)}
                          >
                            <Flex justify="space-between" align="start" mb={2}>
                              <Text
                                fontWeight="bold"
                                color="text-primary"
                                fontSize="md"
                              >
                                {app.client.name}
                              </Text>
                              <Badge
                                bg={
                                  app.status === "AGENDADO"
                                    ? "brand-soft"
                                    : "bg-surface-secondary"
                                }
                                color={
                                  app.status === "AGENDADO"
                                    ? "brand-primary"
                                    : "text-secondary"
                                }
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize="xs"
                                textTransform="none"
                                fontWeight="semibold"
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                              >
                                {app.status === "CONCLUIDO" && (
                                  <CheckCircle2 size={12} />
                                )}
                                {app.status === "AGENDADO"
                                  ? "Confirmado"
                                  : app.status.toLowerCase()}
                              </Badge>
                            </Flex>
                            <Text fontSize="sm" color="text-secondary" mb={3}>
                              {app.service.name}
                            </Text>
                            <HStack spacing={2}>
                              <Avatar
                                size="xs"
                                name={app.barber.name}
                                bg="brand-primary"
                              />
                              <Text
                                fontSize="xs"
                                color="text-secondary"
                                fontWeight="medium"
                              >
                                Barbeiro: {app.barber.name}
                              </Text>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Flex
                        h="72px"
                        w="full"
                        borderRadius="xl"
                        borderWidth="2px"
                        borderStyle="dashed"
                        borderColor="border-subtle"
                        bg="bg-surface-secondary"
                        align="center"
                        justify="center"
                        color="text-muted"
                        cursor="pointer"
                        _hover={{ bg: "bg-surface-hover" }}
                        _active={{ bg: "bg-surface-hover" }}
                        onClick={onOpenNewAppointment} // Ao clicar no espaço vazio, abre o modal
                      >
                        <Plus size={24} strokeWidth={1.5} />
                      </Flex>
                    )}
                  </Box>
                </Flex>
              );
            })}
          </VStack>
        )}
      </Box>

      {/* ========================================== */}
      {/* LAYOUT DESKTOP (GRADE CLÁSSICA)            */}
      {/* ========================================== */}
      <Box display={{ base: "none", lg: "block" }}>
        <Flex
          direction="row"
          justify="space-between"
          align="center"
          mb={6}
          gap={4}
        >
          <Box>
            <Heading size="lg" color="text-primary">
              Agenda
            </Heading>
            <Text color="text-secondary" mt={1}>
              Semana de {format(currentWeekStart, "dd")} a{" "}
              {format(addDays(currentWeekStart, 6), "dd 'de' MMMM", {
                locale: ptBR,
              })}
            </Text>
          </Box>

          <Flex direction="row" gap={3}>
            {(userRole === "OWNER" || userRole === "ADMIN") && (
              <Select
                w="200px"
                bg="bg-surface"
                borderColor="border-subtle"
                size="md"
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
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center" mb={4}>
          <HStack
            bg="bg-surface"
            borderWidth="1px"
            borderColor="border-subtle"
            borderRadius="lg"
            p={1}
            shadow="card-shadow"
          >
            <IconButton
              aria-label="Semana anterior"
              icon={<ChevronLeft size={20} />}
              variant="ghost"
              size="sm"
              onClick={prevWeek}
              color="text-primary"
            />
            <Text
              px={2}
              fontSize="sm"
              fontWeight="medium"
              textTransform="capitalize"
              color="text-primary"
            >
              {format(currentWeekStart, "MMMM yyyy", { locale: ptBR })}
            </Text>
            <IconButton
              aria-label="Próxima semana"
              icon={<ChevronRight size={20} />}
              variant="ghost"
              size="sm"
              onClick={nextWeek}
              color="text-primary"
            />
            <Divider
              orientation="vertical"
              h="20px"
              borderColor="border-subtle"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={goToday}
              color="text-primary"
            >
              Hoje
            </Button>
          </HStack>

          <Tabs variant="soft-rounded" colorScheme="orange" size="sm">
            <TabList
              bg="bg-surface"
              borderWidth="1px"
              borderColor="border-subtle"
              borderRadius="full"
              p={1}
            >
              <Tab
                color="text-primary"
                _selected={{ color: "white", bg: "brand-primary" }}
              >
                Dia
              </Tab>
              <Tab isDisabled color="text-muted">
                Semana
              </Tab>
            </TabList>
          </Tabs>
        </Flex>

        <Box
          bg="bg-surface"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border-subtle"
          shadow="card-shadow"
          overflowX="auto"
          pb="100px" // Respiro no fundo da tabela para o FAB não cobrir o conteúdo
        >
          {isPageLoading ? (
            <Center p={10}>
              <Spinner color="brand-primary" size="xl" />
            </Center>
          ) : (
            <Box minW="900px">
              <Flex
                borderBottomWidth="1px"
                borderBottomColor="border-subtle"
                bg="bg-surface-secondary"
              >
                <Box w="70px" flexShrink={0} />
                {weekDaysDesktop.map((day, i) => {
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
                      borderRightColor="border-subtle"
                      _last={{ borderRightWidth: 0 }}
                    >
                      <Text
                        fontSize="xs"
                        color="text-secondary"
                        textTransform="capitalize"
                        fontWeight="medium"
                      >
                        {format(day, "EEEEEE", { locale: ptBR })}
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={isToday ? "brand-primary" : "text-primary"}
                        mt={0.5}
                      >
                        {format(day, "dd")}
                      </Text>
                    </Box>
                  );
                })}
              </Flex>

              <Flex position="relative">
                <Box
                  w="70px"
                  flexShrink={0}
                  borderRightWidth="1px"
                  borderRightColor="border-subtle"
                >
                  {hours.map((h) => (
                    <Box
                      key={h}
                      h="64px"
                      textAlign="right"
                      pr={2}
                      pt={1}
                      fontSize="xs"
                      color="text-muted"
                      fontWeight="medium"
                    >
                      {String(h).padStart(2, "0")}:00
                    </Box>
                  ))}
                </Box>

                {weekDaysDesktop.map((day, dayIndex) => {
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
                      borderRightColor="border-subtle"
                      _last={{ borderRightWidth: 0 }}
                    >
                      {hours.map((h) => (
                        <Box
                          key={h}
                          h="64px"
                          borderBottomWidth="1px"
                          borderColor="border-subtle"
                          onClick={onOpenNewAppointment} // Permite clique em espaços vazios
                          cursor="pointer"
                          _hover={{ bg: "bg-surface-secondary" }}
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
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setOpenEvent(app);
                            }}
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
                            shadow="card-shadow"
                            _hover={{
                              filter: "brightness(1.1)",
                            }}
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
      </Box>

      {/* ========================================== */}
      {/* BOTÃO FLUTUANTE (FAB) GLOBAL DAS TELAS     */}
      {/* ========================================== */}
      <IconButton
        aria-label="Novo Agendamento"
        icon={<Plus size={28} />}
        position="fixed"
        bottom={{ base: "100px", md: "40px" }} // Sobe no mobile para não conflitar com a sidebar de baixo
        right={{ base: "24px", md: "40px" }}
        bg="brand-primary"
        color="white"
        _hover={{ bg: "brand-hover", transform: "scale(1.05)" }}
        _active={{ transform: "scale(0.95)" }}
        size="lg"
        h="64px"
        w="64px"
        borderRadius="full"
        shadow="focus-glow"
        zIndex={99}
        onClick={onOpenNewAppointment}
        transition="all 0.2s"
      />

      {/* ========================================== */}
      {/* MODAL DE NOVO AGENDAMENTO (ADMIN)          */}
      {/* ========================================== */}
      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={onCloseNewAppointment}
        barbers={barbers}
      />

      {/* ========================================== */}
      {/* GAVETA DE DETALHES (MOBILE E DESKTOP)      */}
      {/* ========================================== */}
      <Drawer
        isOpen={!!openEvent}
        placement="right"
        onClose={() => setOpenEvent(null)}
        size={{ base: "full", sm: "md" }}
      >
        <DrawerOverlay />
        <DrawerContent bg="bg-surface">
          <DrawerCloseButton mt={{ base: 2, sm: 0 }} color="text-primary" />
          {openEvent && (
            <>
              <DrawerHeader
                borderBottomWidth="1px"
                borderBottomColor="border-subtle"
                pt={{ base: 10, sm: 4 }}
              >
                <HStack mb={2}>
                  <Badge
                    bg={getStatusStyle(openEvent.status).bg}
                    color={getStatusStyle(openEvent.status).color}
                    borderColor={getStatusStyle(openEvent.status).border}
                    borderWidth="1px"
                  >
                    {openEvent.status}
                  </Badge>
                </HStack>
                <Heading size="md" color="text-primary">
                  {openEvent.client.name}
                </Heading>
                <Text
                  fontSize="sm"
                  color="text-secondary"
                  fontWeight="normal"
                  mt={1}
                >
                  {openEvent.service.name} • Barbeiro {openEvent.barber.name}
                </Text>
              </DrawerHeader>

              <DrawerBody py={6}>
                <VStack align="stretch" spacing={6}>
                  <HStack
                    bg="bg-surface-secondary"
                    p={3}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="border-subtle"
                    spacing={4}
                  >
                    <Avatar
                      size="md"
                      name={openEvent.client.name}
                      bg="brand-primary"
                      color="white"
                    />
                    <Box flex="1">
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="text-primary"
                      >
                        {openEvent.client.name}
                      </Text>
                      <Text fontSize="xs" color="text-secondary">
                        {openEvent.client.phone}
                      </Text>
                    </Box>
                    <IconButton
                      as="a"
                      href={`tel:${openEvent.client.phone}`}
                      aria-label="Ligar"
                      icon={<Phone size={18} />}
                      variant="ghost"
                      size="md"
                      color="brand-primary"
                    />
                    <IconButton
                      as="a"
                      href={`https://wa.me/55${openEvent.client.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      aria-label="WhatsApp"
                      icon={<MessageCircle size={18} />}
                      variant="ghost"
                      size="md"
                      color="brand-primary"
                    />
                  </HStack>
                  <Box
                    borderWidth="1px"
                    borderColor="border-subtle"
                    borderRadius="lg"
                    p={4}
                    shadow="card-shadow"
                  >
                    <VStack
                      align="stretch"
                      spacing={4}
                      divider={<Divider borderColor="border-subtle" />}
                    >
                      <Flex justify="space-between" fontSize="sm">
                        <Text color="text-secondary">Data</Text>
                        <Text
                          fontWeight="medium"
                          textTransform="capitalize"
                          color="text-primary"
                        >
                          {format(
                            parseISO(openEvent.date),
                            "EEEE, dd 'de' MMMM",
                            { locale: ptBR },
                          )}
                        </Text>
                      </Flex>
                      <Flex justify="space-between" fontSize="sm">
                        <Text color="text-secondary">Horário</Text>
                        <Text fontWeight="medium" color="text-primary">
                          {openEvent.startTime} – {openEvent.endTime}
                        </Text>
                      </Flex>
                      <Flex justify="space-between" fontSize="sm">
                        <Text color="text-secondary">Serviço</Text>
                        <Text fontWeight="medium" color="text-primary">
                          {openEvent.service.name}
                        </Text>
                      </Flex>
                      <Flex justify="space-between" fontSize="sm">
                        <Text color="text-secondary">Valor</Text>
                        <Text
                          fontWeight="bold"
                          fontSize="md"
                          color="brand-primary"
                        >
                          R$ {Number(openEvent.service.price).toFixed(2)}
                        </Text>
                      </Flex>
                    </VStack>
                  </Box>

                  {openEvent.status === "AGENDADO" && (
                    <Flex
                      direction={{ base: "column", sm: "row" }}
                      gap={3}
                      mt={4}
                    >
                      <Button
                        flex="1"
                        size="lg"
                        variant="outline"
                        color="status-error"
                        borderColor="status-error"
                        _hover={{ bg: "rgba(248, 81, 73, 0.1)" }}
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
                        size="lg"
                        bg="status-success"
                        color="white"
                        _hover={{ filter: "brightness(1.1)" }}
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
                    </Flex>
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
