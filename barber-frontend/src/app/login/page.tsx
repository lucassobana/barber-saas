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

const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";
const BRAND_LIGHT = "#FDF8F5";

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
    <Flex minH="100vh" align="center" justify="center" bg={BRAND_LIGHT}>
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius="xl"
        boxShadow="lg"
        bg="white"
        w="100%"
        borderColor="gray.100"
      >
        <Stack spacing={4} mb={6} align="center">
          <Image
            src="/ProximoCorteLogo.png"
            alt="PróximoCorte"
            h="240px"
            objectFit="contain"
            fallback={
              <Heading fontSize="2xl" color="#3D3D3D">
                PróximoCorte
              </Heading>
            }
          />
          <Box color="gray.500" fontSize="sm">
            Faça login para gerenciar sua barbearia
          </Box>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={5}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel color="gray.700" fontWeight="medium">
                E-mail
              </FormLabel>
              <Input
                type="email"
                placeholder="admin@barbearia.com"
                _focus={{
                  borderColor: BRAND_COLOR,
                  boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
                }}
                {...register("email")}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel color="gray.700" fontWeight="medium">
                Senha
              </FormLabel>
              <Input
                type="password"
                placeholder="********"
                _focus={{
                  borderColor: BRAND_COLOR,
                  boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
                }}
                {...register("password")}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              bg={BRAND_COLOR}
              color="white"
              _hover={{ bg: BRAND_HOVER }}
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
