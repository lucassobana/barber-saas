"use client";

import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  NumberInput,
  NumberInputField,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BaseModal } from "./BaseModal";

const BRAND_COLOR = "#904D22";

export interface Service {
  id: string;
  name: string;
  price: string | number;
  duration: number;
  status?: boolean;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
}

export function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [prevService, setPrevService] = useState<Service | null | undefined>(
    undefined,
  );

  if (isOpen !== prevIsOpen || service !== prevService) {
    setPrevIsOpen(isOpen);
    setPrevService(service);

    if (isOpen) {
      setName(service?.name || "");
      setPrice(service?.price?.toString() || "");
      setDuration(service?.duration?.toString() || "");
    }
  }

  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: {
      name: string;
      price: number;
      duration: number;
    }) => {
      if (service) {
        return await api.patch(`/services/${service.id}`, data);
      } else {
        return await api.post("/services", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: service ? "Serviço atualizado!" : "Serviço criado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
  });

  const handleSave = () => {
    mutation.mutate({ name, price: Number(price), duration: Number(duration) });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? "Editar Serviço" : "Novo Serviço"}
      onSave={handleSave}
      isLoading={mutation.isPending}
    >
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Nome do serviço</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Corte Clássico"
            _focus={{
              borderColor: BRAND_COLOR,
              boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Preço (R$)</FormLabel>
          <NumberInput
            min={0}
            precision={2}
            step={1}
            value={price}
            onChange={(val) => setPrice(val)}
          >
            <NumberInputField
              placeholder="Ex: 45.00"
              _focus={{
                borderColor: BRAND_COLOR,
                boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
              }}
            />
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Duração (minutos)</FormLabel>
          <NumberInput
            min={0}
            step={5}
            value={duration}
            onChange={(val) => setDuration(val)}
          >
            <NumberInputField
              placeholder="Ex: 40"
              _focus={{
                borderColor: BRAND_COLOR,
                boxShadow: `0 0 0 1px ${BRAND_COLOR}`,
              }}
            />
          </NumberInput>
        </FormControl>
      </VStack>
    </BaseModal>
  );
}
