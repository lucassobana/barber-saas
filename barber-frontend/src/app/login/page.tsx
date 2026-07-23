"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z
    .string()
    .email("Digite um e-mail válido")
    .min(1, "E-mail obrigatório"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn } = useAuth();
  const toast = useToast();
  const router = useRouter(); // Adicionado para fazer o redirecionamento

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutateAsync: handleLogin, isPending } = useMutation({
    // A mutation agora apenas repassa os dados para o Contexto
    mutationFn: async (data: LoginFormData) => {
      await signIn(data);
    },
    onSuccess: () => {
      // Como o contexto já salvou o token, agora é só avisar e redirecionar
      toast({
        title: "Login realizado com sucesso!",
        status: "success",
        duration: 2000,
        position: "top-right",
      });
      router.push("/dashboard"); // Redireciona para a página interna
    },
    onError: () => {
      toast({
        title: "Erro de autenticação",
        description: "E-mail ou senha inválidos.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await handleLogin(data);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg="white"
        w="100%"
      >
        <Stack spacing={4} mb={6} align="center">
          <Heading fontSize="2xl">Barber SaaS</Heading>
          <Box color="gray.500">Faça login para gerenciar sua barbearia</Box>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>E-mail</FormLabel>
              <Input
                type="email"
                placeholder="admin@barbearia.com"
                {...register("email")}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Senha</FormLabel>
              <Input
                type="password"
                placeholder="********"
                {...register("password")}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              fontSize="md"
              isLoading={isPending}
              mt={2}
            >
              Entrar
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
