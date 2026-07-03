import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ModalRoot } from "components/Modal";
import { TooltipProvider } from "components/ui/tooltip";
import { useClearSelectedSpeciesOnNavigate } from "hooks/useTrip";

export default function RootLayout() {
  useClearSelectedSpeciesOnNavigate();

  return (
    <TooltipProvider>
      <Toaster containerStyle={{ zIndex: 10001 }} />
      <Outlet />
      <ModalRoot />
    </TooltipProvider>
  );
}
