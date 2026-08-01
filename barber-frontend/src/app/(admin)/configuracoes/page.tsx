"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  Spinner,
  Center,
  InputLeftAddon,
  Checkbox,
  CheckboxGroup,
  Wrap,
} from "@chakra-ui/react";
import {
  Copy,
  Save,
  Store,
  Link as LinkIcon,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Barbershop {
  id: string;
  name: string;
  openTime: string;
  closeTime: string;
  slug: string;
  openDays?: string[];
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Dom" },
  { value: "1", label: "Seg" },
  { value: "2", label: "Ter" },
  { value: "3", label: "Qua" },
  { value: "4", label: "Qui" },
  { value: "5", label: "Sex" },
  { value: "6", label: "Sáb" },
];

export default function ConfiguracoesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const barbershopId = user?.memberships?.[0]?.barbershopId;

  const { data: barbershop, isLoading: queryLoading } = useQuery<Barbershop>({
    queryKey: ["barbershop", barbershopId],
    queryFn: async () =>
      (await api.get(`/platform/barbershops/${barbershopId}`)).data,
    enabled: !authLoading && !!barbershopId,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  if (authLoading || queryLoading)
    return (
      <Center h="60vh">
        <Spinner size="xl" color="brand-primary" thickness="4px" />
      </Center>
    );
  if (!barbershopId || !barbershop)
    return (
      <Center h="60vh">
        <Text color="text-muted">Barbearia não encontrada.</Text>
      </Center>
    );
  return (
    <ConfiguracoesForm
      barbershop={barbershop}
      barbershopId={barbershopId}
      key={barbershop.id}
    />
  );
}

function ConfiguracoesForm({
  barbershop,
  barbershopId,
}: {
  barbershop: Barbershop;
  barbershopId: string;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();

  const [name, setName] = useState(barbershop.name || "");
  const [openTime, setOpenTime] = useState(barbershop.openTime || "");
  const [closeTime, setCloseTime] = useState(barbershop.closeTime || "");
  const [slug, setSlug] = useState(barbershop.slug || "");
  const [openDays, setOpenDays] = useState<string[]>(barbershop.openDays || []);

  const mutation = useMutation({
    mutationFn: async (data: Partial<Barbershop>) =>
      await api.patch(`/platform/barbershops/${barbershopId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbershop", barbershopId] });
      toast({ title: "Salvo!", status: "success", duration: 3000 });
    },
  });

  const currentFullUrl =
    typeof window !== "undefined"
      ? slug
        ? `${window.location.origin}/${slug}`
        : window.location.origin
      : "";

  return (
    <Box maxW="4xl" pb={{ base: 8, md: 0 }}>
      {/* CABEÇALHO */}
      <Flex
        direction="column"
        mb={{ base: 6, sm: 8 }}
        textAlign={{ base: "center", sm: "left" }}
      >
        <Heading size="lg" color="text-primary">
          Configurações da Loja
        </Heading>
        <Text color="text-secondary" mt={1}>
          Gerencie as informações públicas e horários de funcionamento
        </Text>
      </Flex>

      <Box
        bg="bg-surface"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border-subtle"
        shadow="card-shadow"
        overflow="hidden"
      >
        {/* SESSÃO DO LINK DA VITRINE */}
        <Box
          p={{ base: 4, sm: 6 }}
          bg="bg-surface-secondary"
          borderBottomWidth="1px"
          borderColor="border-subtle"
        >
          <Flex
            direction={{ base: "column", lg: "row" }}
            align={{ base: "stretch", lg: "center" }}
            justify="space-between"
            gap={4}
          >
            <HStack spacing={3} justify={{ base: "center", sm: "flex-start" }}>
              <Flex
                h="10"
                w="10"
                align="center"
                justify="center"
                bg="brand-soft"
                color="brand-primary"
                borderRadius="lg"
                flexShrink={0}
              >
                <LinkIcon size={20} />
              </Flex>
              <Box>
                <Text fontWeight="semibold" color="text-primary">
                  Seu link de agendamento
                </Text>
                <Text fontSize="sm" color="text-secondary">
                  Compartilhe com seus clientes
                </Text>
              </Box>
            </HStack>

            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={3}
              w={{ base: "full", lg: "auto" }}
            >
              <InputGroup size="md" w="full">
                <Input
                  isReadOnly
                  value={currentFullUrl}
                  bg="bg-surface"
                  color="text-primary"
                  borderColor="border-subtle"
                  textOverflow="ellipsis"
                  _focus={{ borderColor: "border-subtle", boxShadow: "none" }}
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Copiar link"
                    icon={<Copy size={16} />}
                    size="sm"
                    variant="ghost"
                    color="text-secondary"
                    _hover={{ bg: "bg-surface-hover", color: "text-primary" }}
                    onClick={() => {
                      navigator.clipboard.writeText(currentFullUrl);
                      toast({
                        title: "Link copiado!",
                        status: "info",
                        duration: 2000,
                      });
                    }}
                  />
                </InputRightElement>
              </InputGroup>

              <Button
                as={Link}
                href={`/${slug}`}
                target="_blank"
                leftIcon={<ExternalLink size={18} />}
                variant="outline"
                color="brand-primary"
                borderColor="brand-primary"
                _hover={{ bg: "brand-soft" }}
                isDisabled={!slug}
                w={{ base: "full", sm: "auto" }}
                px={6}
              >
                Abrir Vitrine
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* FORMULÁRIO DE DADOS */}
        <Box p={{ base: 4, sm: 6 }}>
          <HStack
            mb={6}
            spacing={2}
            color="text-primary"
            justify={{ base: "center", sm: "flex-start" }}
          >
            <Store size={20} />
            <Heading size="md">Dados Básicos</Heading>
          </HStack>

          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel fontWeight="medium" color="text-secondary">
                Nome da Barbearia
              </FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="lg"
                bg="bg-surface"
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
              <FormLabel fontWeight="medium" color="text-secondary">
                Link Personalizado (Slug)
              </FormLabel>
              <InputGroup size="lg">
                <InputLeftAddon
                  bg="bg-surface-secondary"
                  color="text-secondary"
                  borderColor="border-subtle"
                  px={{ base: 2, sm: 4 }}
                  fontSize={{ base: "sm", sm: "md" }}
                >
                  {typeof window !== "undefined"
                    ? window.location.host
                    : "localhost:3000"}
                  /
                </InputLeftAddon>
                <Input
                  value={slug}
                  bg="bg-surface"
                  color="text-primary"
                  borderColor="border-subtle"
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)+/g, ""),
                    )
                  }
                  _hover={{ borderColor: "border-hover" }}
                  _focus={{
                    borderColor: "brand-primary",
                    boxShadow: "focus-glow",
                  }}
                />
              </InputGroup>
            </FormControl>

            <Divider my={2} borderColor="border-subtle" />

            <FormControl>
              <FormLabel fontWeight="medium" color="text-secondary">
                Dias de Funcionamento
              </FormLabel>
              <CheckboxGroup
                value={openDays}
                onChange={(values) => setOpenDays(values as string[])}
              >
                <Wrap
                  spacing={4}
                  justify={{ base: "center", sm: "flex-start" }}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <Checkbox
                      key={day.value}
                      value={day.value}
                      size="lg"
                      color="text-primary"
                      sx={{
                        "span.chakra-checkbox__control[data-checked]": {
                          backgroundColor: "brand-primary",
                          borderColor: "brand-primary",
                        },
                      }}
                    >
                      {day.label}
                    </Checkbox>
                  ))}
                </Wrap>
              </CheckboxGroup>
            </FormControl>

            <Flex direction={{ base: "column", sm: "row" }} w="full" gap={4}>
              <FormControl>
                <FormLabel fontWeight="medium" color="text-secondary">
                  Horário de Abertura
                </FormLabel>
                <Input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  size="lg"
                  bg="bg-surface"
                  color="text-primary"
                  borderColor="border-subtle"
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
              <FormControl>
                <FormLabel fontWeight="medium" color="text-secondary">
                  Horário de Fechamento
                </FormLabel>
                <Input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  size="lg"
                  bg="bg-surface"
                  color="text-primary"
                  borderColor="border-subtle"
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
            </Flex>

            <Flex justify={{ base: "stretch", sm: "flex-end" }} pt={4}>
              <Button
                w={{ base: "full", sm: "auto" }}
                size="lg"
                bg="brand-primary"
                color="white"
                _hover={{ bg: "brand-hover" }}
                _active={{ bg: "brand-active" }}
                leftIcon={<Save size={18} />}
                onClick={() =>
                  mutation.mutate({ name, openTime, closeTime, slug, openDays })
                }
                isLoading={mutation.isPending}
              >
                Salvar Alterações
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Box>

      {/* BOTÃO DE SAIR DA CONTA - EXCLUSIVO PARA O MOBILE */}
      <Box display={{ base: "block", md: "none" }} mt={6}>
        <Button
          w="full"
          size="lg"
          variant="outline"
          color="status-error"
          borderColor="status-error"
          bg="transparent"
          _hover={{ bg: "rgba(248, 81, 73, 0.1)" }}
          leftIcon={<LogOut size={20} />}
          onClick={signOut}
        >
          Sair da Conta
        </Button>
      </Box>
    </Box>
  );
}
