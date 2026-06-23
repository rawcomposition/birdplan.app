import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ModalRoot } from "components/Modal";
import { useClearSelectedSpeciesOnNavigate } from "hooks/useTrip";

export default function RootLayout() {
  useClearSelectedSpeciesOnNavigate();

  return (
    <>
      <Toaster containerStyle={{ zIndex: 10001 }} />
      <Outlet />
      <ModalRoot />
    </>
  );
}
