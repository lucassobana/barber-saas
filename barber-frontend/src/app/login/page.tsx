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
  Image,
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
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutateAsync: handleLogin, isPending } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      await signIn(data);
    },
    onSuccess: () => {
      toast({
        title: "Login realizado com sucesso!",
        status: "success",
        duration: 2000,
        position: "top-right",
      });
      router.push("/agenda");
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await handleLogin(data);
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="bg-app"
      p={4} // Impede que o card encoste nas bordas do celular
    >
      <Box
        p={{ base: 6, md: 8 }} // Padding menor no celular, maior no desktop
        maxWidth="400px"
        borderWidth={1}
        borderRadius="xl"
        shadow="card-shadow"
        bg="bg-surface"
        w="100%"
        borderColor="border-subtle"
      >
        <Stack spacing={4} mb={6} align="center">
          <Image
            src="/ProximoCorteLogo.png"
            alt="PróximoCorte"
            h={{ base: "180px", md: "200px" }} // Altura responsiva para a logo
            objectFit="contain"
            fallback={
              <Heading fontSize="2xl" color="text-primary">
                PróximoCorte
              </Heading>
            }
          />
          <Box
            color="text-secondary"
            fontSize={{ base: "xs", md: "sm" }}
            textAlign="center"
          >
            Faça login para gerenciar sua barbearia
          </Box>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={5}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel color="text-primary" fontWeight="medium">
                E-mail
              </FormLabel>
              <Input
                type="email"
                placeholder="admin@barbearia.com"
                size="lg" // Inputs maiores são mais fáceis de tocar no celular
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                _hover={{ borderColor: "border-hover" }}
                _focus={{
                  borderColor: "brand-primary",
                  boxShadow: "focus-glow",
                }}
                {...register("email")}
              />
              <FormErrorMessage color="status-error">
                {errors.email?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel color="text-primary" fontWeight="medium">
                Senha
              </FormLabel>
              <Input
                type="password"
                placeholder="********"
                size="lg" // Inputs maiores são mais fáceis de tocar no celular
                bg="bg-surface-secondary"
                borderColor="border-subtle"
                color="text-primary"
                _hover={{ borderColor: "border-hover" }}
                _focus={{
                  borderColor: "brand-primary",
                  boxShadow: "focus-glow",
                }}
                {...register("password")}
              />
              <FormErrorMessage color="status-error">
                {errors.password?.message}
              </FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              bg="brand-primary"
              color="white"
              _hover={{ bg: "brand-hover" }}
              _active={{ bg: "brand-active" }}
              size="lg"
              fontSize="md"
              w="100%" // Garante que o botão preencha toda a largura disponível
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
