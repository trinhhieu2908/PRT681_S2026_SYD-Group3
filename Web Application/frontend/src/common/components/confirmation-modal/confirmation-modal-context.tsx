import ConfirmationModal from "@/common/components/confirmation-modal/confirmation-modal";
import React, { ReactNode, createContext, useContext, useState } from "react";

export type ConfirmationVariant =
  | "default"
  | "destructive"
  | "warning"
  | "success"
  | "error";

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
}

interface ConfirmationState {
  isOpen: boolean;
  data: ConfirmationData | null;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmationContextType {
  confirm: (data: ConfirmationData) => Promise<boolean>;
  closeConfirmation: () => void;
  state: ConfirmationState;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(
  undefined,
);

export const ConfirmationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    data: null,
    resolve: null,
  });

  const confirm = (data: ConfirmationData): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        data,
        resolve,
      });
    });
  };

  const closeConfirmation = () => {
    setState({
      isOpen: false,
      data: null,
      resolve: null,
    });
  };

  const handleConfirm = () => {
    if (state.resolve) {
      state.resolve(true);
    }
    closeConfirmation();
  };

  const handleCancel = () => {
    if (state.resolve) {
      state.resolve(false);
    }
    closeConfirmation();
  };

  return (
    <ConfirmationContext.Provider
      value={{
        confirm,
        closeConfirmation,
        state: {
          ...state,
          resolve: null,
        },
      }}
    >
      {children}
      {state.isOpen && state.data && (
        <ConfirmationModal
          data={state.data}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirmation must be used within ConfirmationProvider");
  }
  return context.confirm;
};
