"use client";

import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BaseModal } from "./BaseModal";

export interface Client {
  id: string;
  name: string;
  phone: string;
  notes?: string;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

export function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [prevClient, setPrevClient] = useState<Client | null | undefined>(
    undefined,
  );

  if (isOpen !== prevIsOpen || client !== prevClient) {
    setPrevIsOpen(isOpen);
    setPrevClient(client);

    if (isOpen) {
      setName(client?.name || "");
      setPhone(client?.phone || "");
      setNotes(client?.notes || "");
    }
  }

  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: Partial<Client>) => {
      if (client) {
        return await api.patch(`/clients/${client.id}`, data);
      } else {
        return await api.post("/clients", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: client
          ? "Cliente atualizado!"
          : "Cliente cadastrado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro ao salvar o cliente.",
        description: "Verifique os dados e tente novamente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSave = () => mutation.mutate({ name, phone, notes });

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? "Editar Cliente" : "Novo Cliente"}
      onSave={handleSave}
      isLoading={mutation.isPending}
    >
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel color="text-primary">Nome Completo</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Carlos Almeida"
            bg="bg-surface-secondary"
            borderColor="border-subtle"
            color="text-primary"
            _hover={{ borderColor: "border-hover" }}
            _focus={{
              borderColor: "brand-primary",
              boxShadow: `0 0 0 1px {brand-primary}`,
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel color="text-primary">Telefone / WhatsApp</FormLabel>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
            bg="bg-surface-secondary"
            borderColor="border-subtle"
            color="text-primary"
            _hover={{ borderColor: "border-hover" }}
            _focus={{
              borderColor: "brand-primary",
              boxShadow: `0 0 0 1px {brand-primary}`,
            }}
          />
        </FormControl>

        <FormControl>
          <FormLabel color="text-primary">Observações (Opcional)</FormLabel>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alergias, preferências de corte, etc."
            rows={3}
            resize="none"
            bg="bg-surface-secondary"
            borderColor="border-subtle"
            color="text-primary"
            _hover={{ borderColor: "border-hover" }}
            _focus={{
              borderColor: "brand-primary",
              boxShadow: `0 0 0 1px {brand-primary}`,
            }}
          />
        </FormControl>
      </VStack>
    </BaseModal>
  );
}
