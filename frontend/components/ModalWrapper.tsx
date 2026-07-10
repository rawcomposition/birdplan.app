import React from "react";
import { Dialog, DialogContent } from "components/ui/dialog";
import { Sheet, SheetContent } from "components/ui/sheet";
import ErrorBoundary from "components/ErrorBoundary";
import { ModalPosition } from "stores/modals";

type Props = {
  open: boolean;
  position?: ModalPosition;
  maxHeight?: number | string;
  dismissable?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ModalWrapper({ position = "right", ...props }: Props) {
  return position === "center" ? <CenterDialog {...props} /> : <RightSheet {...props} />;
}

type RoleProps = Omit<Props, "position">;

function CenterDialog({ open, onClose, maxHeight = "auto", dismissable = true, children }: RoleProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && dismissable) onClose();
      }}
    >
      <DialogContent
        showCloseButton={dismissable}
        style={{ maxHeight }}
        className="flex flex-col gap-0 overflow-hidden rounded-2xl p-0 w-[calc(100%-2rem)] max-w-[460px] sm:max-w-[460px]"
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}

function RightSheet({ open, onClose, dismissable = true, children }: RoleProps) {
  return (
    <Sheet
      open={open}
      modal={false}
      disablePointerDismissal
      onOpenChange={(nextOpen) => {
        if (!nextOpen && dismissable) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={dismissable}
        initialFocus={false}
        finalFocus={false}
        className="gap-0 p-0 shadow-left data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        overlayProps={{
          className: "z-40 bg-black/50 sm:hidden",
          onClick: () => dismissable && onClose(),
        }}
      >
        <div className="grow overflow-y-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </SheetContent>
    </Sheet>
  );
}
