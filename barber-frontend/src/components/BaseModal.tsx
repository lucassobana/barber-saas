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

const BRAND_COLOR = "#904D22";
const BRAND_HOVER = "#733c19";

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
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>{children}</ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            isDisabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            bg={BRAND_COLOR}
            color="white"
            _hover={{ bg: BRAND_HOVER }}
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
