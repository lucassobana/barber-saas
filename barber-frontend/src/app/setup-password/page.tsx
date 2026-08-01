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
        <Text color="status-error" fontWeight="medium" fontSize="lg">
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
    <Container maxW="md" py={{ base: 12, md: 24 }} px={4}>
      <Box
        bg="bg-surface"
        p={{ base: 6, md: 8 }} // Padding responsivo do card
        borderRadius="xl"
        shadow="card-shadow"
        borderWidth="1px"
        borderColor="border-subtle"
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Flex justify="center" mb={4}>
              <Image
                src="/ProximoCorteLogo.png"
                alt="PróximoCorte"
                h={{ base: "180px", md: "200px" }} // Altura da logo responsiva
                objectFit="contain"
                fallback={
                  <Heading size="lg" color="text-primary">
                    PróximoCorte
                  </Heading>
                }
              />
            </Flex>
            <Heading size="md" color="text-primary">
              Crie sua senha
            </Heading>
            <Text
              color="text-secondary"
              mt={2}
              fontSize={{ base: "xs", md: "sm" }}
            >
              Defina uma senha segura para acessar sua conta na plataforma.
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="text-primary">Nova Senha</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  size="lg" // Inputs maiores para touch
                  bg="bg-surface-secondary"
                  borderColor="border-subtle"
                  color="text-primary"
                  _hover={{ borderColor: "border-hover" }}
                  _focus={{
                    borderColor: "brand-primary",
                    boxShadow: "focus-glow",
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="text-primary">Confirme a Senha</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  size="lg" // Inputs maiores para touch
                  bg="bg-surface-secondary"
                  borderColor="border-subtle"
                  color="text-primary"
                  _hover={{ borderColor: "border-hover" }}
                  _focus={{
                    borderColor: "brand-primary",
                    boxShadow: "focus-glow",
                  }}
                />
              </FormControl>

              <Button
                type="submit"
                bg="brand-primary"
                color="white"
                _hover={{ bg: "brand-hover" }}
                _active={{ bg: "brand-active" }}
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
    <Box minH="100vh" bg="bg-app">
      <Suspense
        fallback={
          <Center h="100vh">
            <Spinner color="brand-primary" size="xl" />
          </Center>
        }
      >
        <SetupPasswordForm />
      </Suspense>
    </Box>
  );
}
