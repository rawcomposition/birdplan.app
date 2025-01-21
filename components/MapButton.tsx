import clsx from "clsx";
import { Menu, Transition } from "@headlessui/react";

type Props = {
  className?: string;
  type?: "submit" | "reset" | "button" | undefined;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip?: string;
  active?: boolean;
  childItems?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[];
  [x: string]: any;
};

export default function MapButton({
  className,
  disabled,
  type = "button",
  children,
  tooltip,
  active,
  childItems,
  ...props
}: Props) {
  if (!childItems?.length) {
    return (
      <button
        type={type}
        className={clsx(
          className,
          "w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg text-[20px] group relative",
          active ? "text-[#1172ab]" : "text-gray-700",
          disabled ? "opacity-60" : "hover:bg-gray-100"
        )}
        disabled={disabled}
        {...props}
      >
        {children}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </button>
    );
  }
  return (
    <Menu as="div" className="relative z-20 ml-auto">
      <Menu.Button
        className={clsx(
          className,
          "w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg text-[20px] group relative",
          active ? "text-[#1172ab]" : "text-gray-700",
          disabled ? "opacity-60" : "hover:bg-gray-100"
        )}
      >
        {children}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </Menu.Button>

      <Transition>
        <Transition.Child
          enter="transition duration-200 ease-out"
          enterFrom="scale-95 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="transition duration-150 ease-in"
          leaveFrom="scale-100 opacity-100"
          leaveTo="scale-95 opacity-0"
          className="right-14 top-2 absolute  z-50 min-w-[200px] origin-top-right ring-[0.5px] ring-gray-700/10 overflow-hidden rounded-lg bg-white text-gray-700 shadow-md py-2"
        >
          <Menu.Items>
            {childItems.map(({ label, onClick, icon }) => (
              <Menu.Item key={label}>
                <button
                  type="button"
                  className="flex items-center gap-3 p-2.5 pl-5 text-[15px] text-gray-900 hover:bg-gray-50 w-full"
                  onClick={onClick}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition.Child>
      </Transition>
    </Menu>
  );
}

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="absolute top-1/2 right-14 transform -translate-y-1/2 bg-black/80 text-white text-sm whitespace-nowrap px-2.5 py-1 rounded-lg hidden sm:group-hover:block">
      {children}
    </span>
  );
};
