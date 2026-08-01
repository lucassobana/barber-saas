"use client";

import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  useToast,
  Switch,
  FormHelperText,
  Checkbox,
  CheckboxGroup,
  Wrap,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BaseModal } from "./BaseModal";

export interface Barber {
  id: string;
  name: string;
  phone?: string;
  email: string;
  openTime: string;
  closeTime: string;
  status: boolean;
  openDays?: string[];
}

interface BarberModalProps {
  isOpen: boolean;
  onClose: () => void;
  barber?: Barber | null;
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

export function BarberModal({ isOpen, onClose, barber }: BarberModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [status, setStatus] = useState(true);
  const [openDays, setOpenDays] = useState<string[]>([]);

  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [prevBarber, setPrevBarber] = useState<Barber | null | undefined>(
    undefined,
  );

  if (isOpen !== prevIsOpen || barber !== prevBarber) {
    setPrevIsOpen(isOpen);
    setPrevBarber(barber);

    if (isOpen) {
      setName(barber?.name || "");
      setPhone(barber?.phone || "");
      setEmail(barber?.email || "");
      setOpenTime(barber?.openTime || "09:00");
      setCloseTime(barber?.closeTime || "19:00");
      setStatus(barber ? barber.status : true);
      setOpenDays(barber?.openDays || []);
    }
  }

  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: Partial<Barber>) => {
      if (barber) {
        return await api.patch(`/barbers/${barber.id}`, data);
      } else {
        return await api.post("/users/invite", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
      toast({
        title: barber
          ? "Barbeiro atualizado!"
          : "Barbeiro cadastrado e convite enviado!",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      onClose();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Verifique os dados e tente novamente.";
      toast({
        title: "Ação não permitida",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSave = () => {
    mutation.mutate({
      name,
      phone,
      email,
      openTime,
      closeTime,
      status,
      openDays,
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={barber ? "Editar Barbeiro" : "Novo Barbeiro"}
      onSave={handleSave}
      isLoading={mutation.isPending}
    >
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel color="text-primary">Nome</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
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

        <FormControl isRequired={!barber}>
          <FormLabel color="text-primary">E-mail de Acesso</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="barbeiro@email.com"
            isDisabled={!!barber}
            bg="bg-surface-secondary"
            borderColor="border-subtle"
            color="text-primary"
            _hover={{ borderColor: "border-hover" }}
            _focus={{
              borderColor: "brand-primary",
              boxShadow: `0 0 0 1px {brand-primary}`,
            }}
          />
          {!barber && (
            <FormHelperText color="text-muted">
              O barbeiro receberá um link neste e-mail para criar a senha de
              acesso.
            </FormHelperText>
          )}
        </FormControl>

        <FormControl>
          <FormLabel color="text-primary">Telefone</FormLabel>
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
          <FormLabel color="text-primary">Dias de Trabalho</FormLabel>
          <CheckboxGroup
            value={openDays}
            onChange={(values) => setOpenDays(values as string[])}
          >
            <Wrap spacing={4}>
              {DAYS_OF_WEEK.map((day) => (
                <Checkbox
                  key={day.value}
                  value={day.value}
                  color="text-primary"
                  sx={{
                    "span.chakra-checkbox__control[data-checked]": {
                      backgroundColor: "brand-primary",
                      borderColor: "brand-primary",
                    },
                  }}
                >
                  {day.label}
                </Checkbox>
              ))}
            </Wrap>
          </CheckboxGroup>
        </FormControl>

        <HStack w="full" spacing={4}>
          <FormControl isRequired>
            <FormLabel color="text-primary">Horário Entrada</FormLabel>
            <Input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              bg="bg-surface-secondary"
              borderColor="border-subtle"
              color="text-primary"
              _hover={{ borderColor: "border-hover" }}
              _focus={{
                borderColor: "brand-primary",
                boxShadow: `0 0 0 1px {brand-primary}`,
              }}
              sx={{
                "::-webkit-calendar-picker-indicator": {
                  filter: "invert(0.8)",
                },
              }}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="text-primary">Horário Saída</FormLabel>
            <Input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              bg="bg-surface-secondary"
              borderColor="border-subtle"
              color="text-primary"
              _hover={{ borderColor: "border-hover" }}
              _focus={{
                borderColor: "brand-primary",
                boxShadow: `0 0 0 1px {brand-primary}`,
              }}
              sx={{
                "::-webkit-calendar-picker-indicator": {
                  filter: "invert(0.8)",
                },
              }}
            />
          </FormControl>
        </HStack>

        {barber && (
          <FormControl display="flex" alignItems="center" mt={2}>
            <FormLabel mb="0" color="text-primary">
              Status da Conta (Ativo)
            </FormLabel>
            <Switch
              isChecked={status}
              onChange={(e) => setStatus(e.target.checked)}
              colorScheme="green"
              sx={{
                "span.chakra-switch__track[data-checked]": {
                  backgroundColor: "status-success",
                },
              }}
            />
          </FormControl>
        )}
      </VStack>
    </BaseModal>
  );
}
