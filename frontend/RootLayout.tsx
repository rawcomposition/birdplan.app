import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "providers/user";
import { ModalProvider } from "providers/modals";
import { ProfileProvider } from "providers/profile";
import { TripProvider } from "providers/trip";
import { SpeciesImagesProvider } from "providers/species-images";

export default function RootLayout() {
  return (
    <SpeciesImagesProvider>
      <UserProvider>
        <Toaster containerStyle={{ zIndex: 10001 }} />
        <ProfileProvider>
          <TripProvider>
            <ModalProvider>
              <Outlet />
            </ModalProvider>
          </TripProvider>
        </ProfileProvider>
      </UserProvider>
    </SpeciesImagesProvider>
  );
}
