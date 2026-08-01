"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Spinner,
  Center,
  Flex,
  Button,
  Divider,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { BookingModal } from "@/components/BookingModal";

export interface PublicBarbershop {
  id: string;
  name: string;
  openTime: string;
  closeTime: string;
  services: { id: string; name: string; price: number; duration: number }[];
  barbers: { id: string; name: string }[];
}

export default function VitrinePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedService, setSelectedService] = useState<
    PublicBarbershop["services"][0] | null
  >(null);

  const {
    data: barbershop,
    isLoading,
    isError,
  } = useQuery<PublicBarbershop>({
    queryKey: ["public-barbershop", slug],
    queryFn: async () => {
      const response = await api.get(`/public/barbershops/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleOpenBooking = (service: PublicBarbershop["services"][0]) => {
    setSelectedService(service);
    onOpen();
  };

  if (isLoading) {
    return (
      <Center h="100vh" bg="bg-app">
        <Spinner size="xl" color="brand-primary" thickness="4px" />
      </Center>
    );
  }

  if (isError || !barbershop) {
    return (
      <Center h="100vh" bg="bg-app" p={4} textAlign="center">
        <Text color="status-error" fontSize="lg">
          Barbearia não encontrada. Verifique o link e tente novamente.
        </Text>
      </Center>
    );
  }

  return (
    <Box bg="bg-app" minH="100vh" pb={20}>
      {/* CABEÇALHO RESPONSIVO */}
      <Box
        bg="bg-surface"
        pt={{ base: 8, sm: 12 }} // Menos padding no topo para mobile
        pb={{ base: 12, sm: 16 }}
        px={4}
        textAlign="center"
        borderBottomWidth="1px"
        borderColor="border-subtle"
        shadow="card-shadow"
      >
        <Flex justify="center" mb={4}>
          <Image
            src="/ProximoCorteLogo.png"
            alt="PróximoCorte"
            h={{ base: "100px", sm: "140px" }} // Logo menor no celular para dar espaço ao conteúdo
            objectFit="contain"
            fallback={
              <Heading size={{ base: "lg", sm: "xl" }} color="text-primary">
                {barbershop.name}
              </Heading>
            }
          />
        </Flex>
        <Heading size={{ base: "sm", sm: "md" }} color="text-primary" mb={1}>
          {barbershop.name}
        </Heading>
        <Text
          color="text-secondary"
          fontSize={{ base: "xs", sm: "sm" }}
          fontWeight="medium"
        >
          Aberto das {barbershop.openTime} às {barbershop.closeTime}
        </Text>
      </Box>

      {/* CONTAINER DE SERVIÇOS */}
      <Container maxW="md" mt={{ base: -6, sm: -8 }} px={{ base: 4, sm: 0 }}>
        <Box
          bg="bg-surface"
          borderRadius="2xl"
          shadow="card-shadow"
          overflow="hidden"
          borderWidth="1px"
          borderColor="border-subtle"
        >
          <Box
            p={{ base: 4, sm: 5 }}
            bg="bg-surface-secondary"
            borderBottomWidth="1px"
            borderColor="border-subtle"
          >
            <Heading size="sm" color="text-primary" textAlign="center">
              Escolha um serviço
            </Heading>
          </Box>

          <VStack
            align="stretch"
            spacing={0}
            divider={<Divider borderColor="border-subtle" />}
          >
            {barbershop.services.map((service) => (
              <Flex
                key={service.id}
                p={{ base: 4, sm: 5 }} // Ajuste de padding interno no mobile
                align="center"
                justify="space-between"
                gap={3} // Garante espaço mínimo entre texto e botão
                _hover={{ bg: "bg-surface-hover" }}
                transition="background 0.2s"
              >
                <Box flex="1" minW="0">
                  {" "}
                  {/* minW="0" permite o text-truncation funcionar */}
                  <Text
                    fontWeight="bold"
                    color="text-primary"
                    fontSize={{ base: "sm", sm: "md" }}
                    noOfLines={2} // Impede que o título seja gigantesco e quebre a tela
                  >
                    {service.name}
                  </Text>
                  <Text
                    fontSize={{ base: "xs", sm: "sm" }}
                    color="text-secondary"
                    mt={0.5}
                  >
                    ⏱ {service.duration} min
                  </Text>
                  <Text
                    fontWeight="bold"
                    color="brand-primary"
                    mt={1}
                    fontSize={{ base: "sm", sm: "md" }}
                  >
                    {formatPrice(service.price)}
                  </Text>
                </Box>

                <Button
                  bg="brand-primary"
                  color="white"
                  _hover={{ bg: "brand-hover" }}
                  _active={{ bg: "brand-active" }}
                  size={{ base: "md", sm: "sm" }} // Botão mais gordinho no mobile para facilitar o toque
                  borderRadius="full"
                  px={{ base: 5, sm: 6 }}
                  flexShrink={0} // Impede que o botão seja espremido
                  onClick={() => handleOpenBooking(service)}
                >
                  Agendar
                </Button>
              </Flex>
            ))}

            {barbershop.services.length === 0 && (
              <Box p={8} textAlign="center">
                <Text color="text-muted" fontSize="sm">
                  Nenhum serviço disponível no momento.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Container>

      <BookingModal
        isOpen={isOpen}
        onClose={onClose}
        barbershop={barbershop}
        service={selectedService}
      />
    </Box>
  );
}
