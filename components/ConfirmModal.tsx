'use client';
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl animate-slideUp relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-xl font-black text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 mt-4 pt-2">
            <button
              onClick={onConfirm}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-sm shadow-lg shadow-red-600/30 transition active:scale-95"
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm transition active:scale-95"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
