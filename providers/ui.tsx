import React from "react";

export const UIContext = React.createContext<{
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}>({
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

type Props = {
  children: React.ReactNode;
};

const UIProvider = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return <UIContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar }}>{children}</UIContext.Provider>;
};

const useUI = () => {
  const state = React.useContext(UIContext);
  return { ...state };
};

export { UIProvider, useUI };
