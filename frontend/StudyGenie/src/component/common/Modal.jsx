import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm'>
      <div className='relative w-full max-w-3xl bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 p-8'>
        <button
          type='button'
          onClick={onClose}
          aria-label='Close modal'
          className='absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200'
        >
          <X className='w-5 h-5' strokeWidth={2} />
        </button>

        {title && (
          <div className='mb-6 pr-10'>
            <h2 className='text-xl font-medium text-slate-900 tracking-tight'>
              {title}
            </h2>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default Modal;
