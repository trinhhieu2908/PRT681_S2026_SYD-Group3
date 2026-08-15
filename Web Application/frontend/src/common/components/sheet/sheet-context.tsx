import React, { ReactNode } from "react";

type SHEET_VIEWS = string;

interface State {
  view?: SHEET_VIEWS;
  data?: any;
  isOpen: boolean;
}

type Action =
  | { type: "open"; view: SHEET_VIEWS; payload?: any }
  | { type: "close" }
  | { type: "toggle"; payload: boolean }
  | { type: "update"; payload: any }
  | { type: "reset" };

const initialState: State = {
  view: undefined,
  isOpen: false,
  data: null,
};

function sheetReducer(state: State, action: Action): State {
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
    case "update":
      return {
        ...state,
        data: action.payload,
      };
    case "toggle":
      return {
        ...state,
        isOpen: action.payload,
      };
    case "reset":
      return {
        ...state,
        view: undefined,
        data: null,
        isOpen: false,
      };
    default:
      throw new Error("Unknown Sheet Action!");
  }
}

const SheetStateContext = React.createContext<State>(initialState);
SheetStateContext.displayName = "SheetStateContext";

const SheetActionContext = React.createContext<
  React.Dispatch<Action> | undefined
>(undefined);
SheetActionContext.displayName = "SheetActionContext";

export const SheetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(sheetReducer, initialState);

  return (
    <SheetStateContext.Provider value={state}>
      <SheetActionContext.Provider value={dispatch}>
        {children}
      </SheetActionContext.Provider>
    </SheetStateContext.Provider>
  );
};

export function useSheetState() {
  const context = React.useContext(SheetStateContext);
  if (context === undefined) {
    throw new Error("useSheetState must be used within a SheetProvider");
  }
  return context;
}

export function useSheetAction() {
  const dispatch = React.useContext(SheetActionContext);
  if (dispatch === undefined) {
    throw new Error("useSheetAction must be used within a SheetProvider");
  }

  return {
    openSheet(view: SHEET_VIEWS, payload?: any) {
      dispatch({ type: "open", view, payload });
    },
    closeSheet() {
      dispatch({ type: "close" });
    },
    toggleSheet(payload: boolean) {
      dispatch({ type: "toggle", payload });
    },
    resetSheet() {
      dispatch({ type: "reset" });
    },
    updateSheetData(payload: any) {
      dispatch({ type: "update", payload });
    },
  };
}
