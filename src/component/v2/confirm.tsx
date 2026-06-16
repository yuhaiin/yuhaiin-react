'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from './modal';

interface ConfirmModalProps {
  content?: React.ReactNode;
  show: boolean;
  onOk: () => void;
  onHide: () => void;
  title: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ content, show, onOk, onHide, title }) => {
  const { t } = useTranslation('common');

  return (
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
            {t('action.cancel')}
          </Button>
          <Button
            variant='outline-danger'
            onClick={() => {
              onOk();
              onHide();
            }}
          >
            {t('action.ok')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
