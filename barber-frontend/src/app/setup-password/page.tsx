"use client";

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Center,
  Spinner,
  Image,
  Flex,
} from "@chakra-ui/react";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";
const BRAND_LIGHT = "#FDF8F5";
const TEXT_DARK = "#3D3D3D";

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <Center h="full" py={20}>
        <Text color="red.500" fontWeight="medium" fontSize="lg">
          Link de convite ausente ou inválido.
        </Text>
      </Center>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "As senhas não coincidem",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/auth/setup-password", { token, newPassword: password });
      toast({
        title: "Senha criada com sucesso!",
        description: "Você já pode acessar o sistema.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      router.push("/login");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Erro ao criar senha",
        description: err.response?.data?.message || "O link pode ter expirado.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={{ base: 12, md: 24 }}>
      <Box
        bg="white"
        p={8}
        borderRadius="xl"
        shadow="lg"
        borderWidth="1px"
        borderColor="gray.100"
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Flex justify="center" mb={4}>
              <Image
                src="/ProximoCorteLogo.png"
                alt="PróximoCorte"
                h="240px"
                objectFit="contain"
                fallback={
                  <Heading size="lg" color={TEXT_DARK}>
                    PróximoCorte
                  </Heading>
                }
              />
            </Flex>
            <Heading size="md" color={TEXT_DARK}>
              Crie sua senha
            </Heading>
            <Text color="gray.500" mt={2} fontSize="sm">
              Defina uma senha segura para acessar sua conta na plataforma.
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nova Senha</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  _focus={{
                    borderColor: BRAND_COLOR,
                    boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirme a Senha</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  _focus={{
                    borderColor: BRAND_COLOR,
                    boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
                  }}
                />
              </FormControl>

              <Button
                type="submit"
                bg={BRAND_COLOR}
                color="white"
                _hover={{ bg: BRAND_HOVER }}
                w="full"
                size="lg"
                mt={4}
                isLoading={isLoading}
              >
                Salvar Senha
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
}

export default function SetupPasswordPage() {
  return (
    <Box minH="100vh" bg={BRAND_LIGHT}>
      <Suspense
        fallback={
          <Center h="100vh">
            <Spinner color={BRAND_COLOR} size="xl" />
          </Center>
        }
      >
        <SetupPasswordForm />
      </Suspense>
    </Box>
  );
}
