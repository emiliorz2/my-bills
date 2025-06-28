'use client';
import React from 'react';

interface FloatingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export default function FloatingButton({ onClick, children }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-16 right-4 sm:bottom-8 sm:right-8 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg transition text-sm font-semibold"
    >
      {children}
    </button>
  );
}
