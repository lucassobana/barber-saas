"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";
import { ReactNode } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave: () => void;
  isLoading?: boolean;
  saveText?: string;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  isLoading = false,
  saveText = "Salvar",
}: BaseModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent
        bg="bg-surface"
        borderColor="border-subtle"
        borderWidth="1px"
        shadow="card-shadow"
      >
        <ModalHeader color="text-primary">{title}</ModalHeader>
        <ModalCloseButton color="text-secondary" />

        <ModalBody>{children}</ModalBody>

        <ModalFooter
          bg="bg-surface-secondary"
          borderTopWidth="1px"
          borderColor="border-subtle"
          borderBottomRadius="md"
        >
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            isDisabled={isLoading}
            color="text-primary"
            _hover={{ bg: "bg-surface-hover" }}
          >
            Cancelar
          </Button>
          <Button
            bg="brand-primary"
            color="white"
            _hover={{ bg: "brand-hover" }}
            _active={{ bg: "brand-active" }}
            onClick={onSave}
            isLoading={isLoading}
          >
            {saveText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
