'use client';

import React from 'react';
import { Button } from './button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from './modal';

// Verified: No external CSS module needed as Modal components handle styling.

interface ConfirmModalProps {
  content?: React.ReactNode;
  show: boolean;
  onOk: () => void;
  onHide: () => void;
  title: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ content, show, onOk, onHide, title }) => (
  <Modal open={show} onOpenChange={onHide}>
    <ModalContent>
      <ModalHeader style={{ border: "0px" }}>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      {content &&
        <ModalBody>
          {content}
        </ModalBody>
      }
      <ModalFooter style={{ border: "0px" }}>
        <Button onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant='outline-danger'
          onClick={() => {
            onOk();
            onHide();
          }}
        >
          OK
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
