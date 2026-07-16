'use client';

import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm" titleId="confirm-dialog-title">
      {/* Header */}
      <div className="px-5 lg:px-8 py-5 border-b border-token">
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-heading">{title}</h2>
      </div>

      {/* Body */}
      <div className="px-5 lg:px-8 py-4">
        <p className="text-base text-body-secondary leading-relaxed">{message}</p>
      </div>

      {/* Footer */}
      <div className="px-5 lg:px-8 py-4 bg-surface-alt flex items-center justify-end gap-3 border-t border-token">
        <Button
          variant="secondary"
          size="md"
          disabled={isLoading}
          onClick={onCancel}
        >
          {cancelText}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          size="md"
          loading={isLoading}
          className="font-bold"
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
