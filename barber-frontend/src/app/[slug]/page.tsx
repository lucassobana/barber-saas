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

const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";
const BRAND_LIGHT = "#FDF8F5";
const TEXT_DARK = "#3D3D3D";

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
      <Center h="100vh" bg={BRAND_LIGHT}>
        <Spinner size="xl" color={BRAND_COLOR} thickness="4px" />
      </Center>
    );
  }

  if (isError || !barbershop) {
    return (
      <Center h="100vh" bg={BRAND_LIGHT} p={4} textAlign="center">
        <Text color="gray.500" fontSize="lg">
          Barbearia não encontrada. Verifique o link e tente novamente.
        </Text>
      </Center>
    );
  }

  return (
    <Box bg={BRAND_LIGHT} minH="100vh" pb={20}>
      <Box
        bg="white"
        pt={12}
        pb={16}
        px={4}
        textAlign="center"
        borderBottomWidth="1px"
        borderColor="gray.200"
        shadow="sm"
      >
        <Flex justify="center" mb={4}>
          <Image
            src="/ProximoCorteLogo.png"
            alt="PróximoCorte"
            h="160px"
            objectFit="contain"
            fallback={
              <Heading size="xl" color={TEXT_DARK}>
                {barbershop.name}
              </Heading>
            }
          />
        </Flex>
        <Heading size="md" color={TEXT_DARK} mb={2}>
          {barbershop.name}
        </Heading>
        <Text color="gray.500" fontSize="sm" fontWeight="medium">
          Aberto das {barbershop.openTime} às {barbershop.closeTime}
        </Text>
      </Box>

      <Container maxW="md" mt={-8}>
        <Box
          bg="white"
          borderRadius="2xl"
          shadow="lg"
          overflow="hidden"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Box
            p={5}
            bg="gray.50"
            borderBottomWidth="1px"
            borderColor="gray.100"
          >
            <Heading size="sm" color="gray.700" textAlign="center">
              Escolha um serviço
            </Heading>
          </Box>

          <VStack
            align="stretch"
            spacing={0}
            divider={<Divider borderColor="gray.100" />}
          >
            {barbershop.services.map((service) => (
              <Flex
                key={service.id}
                p={5}
                align="center"
                justify="space-between"
                _hover={{ bg: "gray.50" }}
                transition="background 0.2s"
              >
                <Box>
                  <Text fontWeight="bold" color={TEXT_DARK}>
                    {service.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={0.5}>
                    ⏱ {service.duration} min
                  </Text>
                  <Text fontWeight="bold" color={BRAND_COLOR} mt={1}>
                    {formatPrice(service.price)}
                  </Text>
                </Box>
                <Button
                  bg={BRAND_COLOR}
                  color="white"
                  _hover={{ bg: BRAND_HOVER }}
                  size="sm"
                  borderRadius="full"
                  px={6}
                  onClick={() => handleOpenBooking(service)}
                >
                  Agendar
                </Button>
              </Flex>
            ))}

            {barbershop.services.length === 0 && (
              <Box p={8} textAlign="center">
                <Text color="gray.500">
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
