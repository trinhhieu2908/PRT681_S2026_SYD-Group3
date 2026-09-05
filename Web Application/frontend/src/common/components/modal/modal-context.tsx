import React, { ReactNode } from "react";

export const MODAL_VIEWS = {
  CREATE_JOB_APPLICATION: "CREATE_JOB_APPLICATION",
} as const;

export type MODAL_VIEWS = (typeof MODAL_VIEWS)[keyof typeof MODAL_VIEWS];

interface State {
  view?: MODAL_VIEWS;
  data?: unknown;
  isOpen: boolean;
}

type Action =
  | { type: "open"; view: MODAL_VIEWS; payload?: unknown }
  | { type: "close" }
  | { type: "toggle"; payload: boolean }
  | { type: "reset" };

const initialState: State = {
  view: undefined,
  isOpen: false,
  data: null,
};

function modalReducer(state: State, action: Action): State {
  switch (action.type) {
    case "open":
      return {
        ...state,
        view: action.view,
        data: action.payload,
        isOpen: true,
      };
    case "close":
      return {
        ...state,
        isOpen: false,
      };
    case "toggle":
      return {
        ...state,
        isOpen: action.payload,
        data: action.payload ? state.data : null,
      };
    case "reset":
      return {
        ...state,
        view: undefined,
        data: null,
        isOpen: false,
      };
    default:
      throw new Error("Unknown Modal Action!");
  }
}

const ModalStateContext = React.createContext<State>(initialState);
ModalStateContext.displayName = "ModalStateContext";

const ModalActionContext = React.createContext<
  React.Dispatch<Action> | undefined
>(undefined);
ModalActionContext.displayName = "ModalActionContext";

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(modalReducer, initialState);

  return (
    <ModalStateContext.Provider value={state}>
      <ModalActionContext.Provider value={dispatch}>
        {children}
      </ModalActionContext.Provider>
    </ModalStateContext.Provider>
  );
};

export function useModalState() {
  const context = React.useContext(ModalStateContext);
  if (context === undefined) {
    throw new Error("useModalState must be used within a ModalProvider");
  }
  return context;
}

export function useModalAction() {
  const dispatch = React.useContext(ModalActionContext);
  if (dispatch === undefined) {
    throw new Error("useModalAction must be used within a ModalProvider");
  }

  return {
    openModal(view: MODAL_VIEWS, payload?: unknown) {
      dispatch({ type: "open", view, payload });
    },
    closeModal() {
      dispatch({ type: "close" });
    },
    toggleModal(payload: boolean) {
      dispatch({ type: "toggle", payload });
    },
    resetModal() {
      dispatch({ type: "reset" });
    },
  };
}
