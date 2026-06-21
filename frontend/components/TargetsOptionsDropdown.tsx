import { Menu, Transition } from "@headlessui/react";
import { Trip } from "@birdplan/shared";
import useDownloadGroupLifelist from "hooks/useDownloadGroupLifelist";
import Icon from "components/Icon";

type Props = {
  trip?: Trip | null;
};

export default function TargetsOptionsDropdown({ trip }: Props) {
  const { isGroup, download } = useDownloadGroupLifelist(trip);

  const items = [
    {
      name: "Download group life list",
      icon: "download",
      onClick: download,
      hidden: !isGroup,
    },
  ].filter((it) => !it.hidden);

  if (!items.length) return null;

  return (
    <Menu as="div" className="relative shrink-0">
      <Menu.Button
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-xs hover:bg-gray-50"
        title="Options"
      >
        <Icon name="verticalDots" className="text-lg" />
      </Menu.Button>

      <Transition>
        <Transition.Child
          as="div"
          enter="transition duration-200 ease-out"
          enterFrom="scale-95 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="transition duration-150 ease-in"
          leaveFrom="scale-100 opacity-100"
          leaveTo="scale-95 opacity-0"
          className="right-0 top-11 absolute z-50 min-w-[220px] origin-top-right ring-[0.5px] ring-gray-700/10 overflow-hidden rounded-lg bg-white text-gray-700 shadow-md py-2"
        >
          <Menu.Items>
            {items.map(({ name, icon, onClick }) => (
              <Menu.Item key={name}>
                <button
                  type="button"
                  onClick={onClick}
                  className="flex w-full items-center gap-2 p-2 pl-4 text-[13px] text-gray-900 hover:bg-gray-50"
                >
                  <Icon name={icon as any} />
                  <span>{name}</span>
                </button>
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition.Child>
      </Transition>
    </Menu>
  );
}
