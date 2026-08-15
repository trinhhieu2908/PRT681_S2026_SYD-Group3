import React, { ReactNode } from "react";

type DRAWER_VIEWS = string;

interface State {
  view?: DRAWER_VIEWS;
  data?: any;
  isOpen: boolean;
}

type Action =
  | { type: "open"; view: DRAWER_VIEWS; payload?: any }
  | { type: "close" }
  | { type: "toggle"; payload: boolean }
  | { type: "update"; payload: any }
  | { type: "reset" };

const initialState: State = {
  view: undefined,
  isOpen: false,
  data: null,
};

function drawerReducer(state: State, action: Action): State {
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
      throw new Error("Unknown Drawer Action!");
  }
}

const DrawerStateContext = React.createContext<State>(initialState);
DrawerStateContext.displayName = "DrawerStateContext";

const DrawerActionContext = React.createContext<
  React.Dispatch<Action> | undefined
>(undefined);
DrawerActionContext.displayName = "DrawerActionContext";

export const DrawerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(drawerReducer, initialState);

  return (
    <DrawerStateContext.Provider value={state}>
      <DrawerActionContext.Provider value={dispatch}>
        {children}
      </DrawerActionContext.Provider>
    </DrawerStateContext.Provider>
  );
};

export function useDrawerState() {
  const context = React.useContext(DrawerStateContext);
  if (context === undefined) {
    throw new Error("useDrawerState must be used within a DrawerProvider");
  }
  return context;
}

export function useDrawerAction() {
  const dispatch = React.useContext(DrawerActionContext);
  if (dispatch === undefined) {
    throw new Error("useDrawerAction must be used within a DrawerProvider");
  }

  return {
    openDrawer(view: DRAWER_VIEWS, payload?: any) {
      dispatch({ type: "open", view, payload });
    },
    closeDrawer() {
      dispatch({ type: "close" });
    },
    toggleDrawer(payload: boolean) {
      dispatch({ type: "toggle", payload });
    },
    resetDrawer() {
      dispatch({ type: "reset" });
    },
    updateDrawerData(payload: any) {
      dispatch({ type: "update", payload });
    },
  };
}
