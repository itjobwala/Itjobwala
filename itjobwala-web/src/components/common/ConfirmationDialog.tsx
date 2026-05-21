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
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 id="confirm-dialog-title" className="text-[16px] font-bold text-[#0f172a]">{title}</h2>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        <p className="text-[14px] text-gray-600 leading-relaxed">{message}</p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
        <Button
          variant="secondary"
          size="md"
          rounded="lg"
          disabled={isLoading}
          onClick={onCancel}
        >
          {cancelText}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          size="md"
          rounded="lg"
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
