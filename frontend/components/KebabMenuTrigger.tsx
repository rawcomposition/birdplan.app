import React from "react";
import { DropdownMenuTrigger } from "components/ui/dropdown-menu";
import { Button } from "components/ui/button";
import Icon from "components/Icon";

type Props = Omit<React.ComponentProps<typeof DropdownMenuTrigger>, "render"> & {
  buttonClassName?: string;
};

export default function KebabMenuTrigger({ buttonClassName, ...props }: Props) {
  return (
    <DropdownMenuTrigger
      render={<Button variant="outline-white" size="icon-lg" className={buttonClassName} />}
      {...props}
    >
      <Icon name="verticalDots" />
    </DropdownMenuTrigger>
  );
}
