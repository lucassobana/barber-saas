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
  InputLeftAddon, Checkbox,
  CheckboxGroup,
  Wrap
} from "@chakra-ui/react";
import {
  Copy,
  Save,
  Store,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";
const BRAND_SOFT = "#F9F2ED";

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
        <Spinner size="xl" color={BRAND_COLOR} thickness="4px" />
      </Center>
    );
  if (!barbershopId || !barbershop)
    return (
      <Center h="60vh">
        <Text color="gray.500">Barbearia não encontrada.</Text>
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
    <Box maxW="4xl">
      <Flex direction="column" mb={8}>
        <Heading size="lg" color="gray.900">
          Configurações da Loja
        </Heading>
        <Text color="gray.500" mt={1}>
          Gerencie as informações públicas e horários de funcionamento
        </Text>
      </Flex>

      <Box
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="sm"
        overflow="hidden"
      >
        <Box p={6} bg="gray.50" borderBottomWidth="1px" borderColor="gray.100">
          <Flex
            direction={{ base: "column", sm: "row" }}
            align={{ base: "start", sm: "center" }}
            justify="space-between"
            gap={4}
          >
            <HStack spacing={3}>
              <Flex
                h="10"
                w="10"
                align="center"
                justify="center"
                bg={BRAND_SOFT}
                color={BRAND_COLOR}
                borderRadius="lg"
              >
                <LinkIcon size={20} />
              </Flex>
              <Box>
                <Text fontWeight="semibold" color="gray.900">
                  Seu link de agendamento
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Compartilhe com seus clientes
                </Text>
              </Box>
            </HStack>
            <HStack w={{ base: "full", sm: "auto" }}>
              <InputGroup size="md" w={{ base: "full", sm: "350px" }}>
                <Input
                  isReadOnly
                  value={currentFullUrl}
                  bg="white"
                  color="gray.600"
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Copiar link"
                    icon={<Copy size={16} />}
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      navigator.clipboard.writeText(currentFullUrl)
                    }
                  />
                </InputRightElement>
              </InputGroup>
              <IconButton
                as={Link}
                href={`/${slug}`}
                target="_blank"
                aria-label="Abrir vitrine"
                icon={<ExternalLink size={18} />}
                variant="outline"
                color={BRAND_COLOR}
                borderColor={BRAND_COLOR}
                _hover={{ bg: BRAND_SOFT }}
                isDisabled={!slug}
              />
            </HStack>
          </Flex>
        </Box>

        <Box p={6}>
          <HStack mb={6} spacing={2} color="gray.900">
            <Store size={20} />
            <Heading size="md">Dados Básicos</Heading>
          </HStack>
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel fontWeight="medium">Nome da Barbearia</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="lg"
                _focus={{
                  borderColor: BRAND_COLOR,
                  boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium">
                Link Personalizado (Slug)
              </FormLabel>
              <InputGroup size="lg">
                <InputLeftAddon bg="gray.100" color="gray.500">
                  {typeof window !== "undefined"
                    ? window.location.host
                    : "localhost:3000"}
                  /
                </InputLeftAddon>
                <Input
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)+/g, ""),
                    )
                  }
                  _focus={{
                    borderColor: BRAND_COLOR,
                    boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
                  }}
                />
              </InputGroup>
            </FormControl>
            <Divider my={2} />
            <FormControl>
              <FormLabel fontWeight="medium">Dias de Funcionamento</FormLabel>
              <CheckboxGroup
                colorScheme="orange"
                value={openDays}
                onChange={(values) => setOpenDays(values as string[])}
              >
                <Wrap spacing={4}>
                  {DAYS_OF_WEEK.map((day) => (
                    <Checkbox key={day.value} value={day.value} size="lg">
                      {day.label}
                    </Checkbox>
                  ))}
                </Wrap>
              </CheckboxGroup>
            </FormControl>
            <HStack w="full" spacing={4} align="start">
              <FormControl>
                <FormLabel fontWeight="medium">Horário de Abertura</FormLabel>
                <Input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  size="lg"
                  _focus={{
                    borderColor: BRAND_COLOR,
                    boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="medium">Horário de Fechamento</FormLabel>
                <Input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  size="lg"
                  _focus={{
                    borderColor: BRAND_COLOR,
                    boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
                  }}
                />
              </FormControl>
            </HStack>
            <Flex justify="flex-end" pt={4}>
              <Button
                size="lg"
                bg={BRAND_COLOR}
                color="white"
                _hover={{ bg: BRAND_HOVER }}
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
    </Box>
  );
}
