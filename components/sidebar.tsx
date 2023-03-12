import { useUser } from "providers/user";
import Select from "react-select";
import useFirebaseLogout from "hooks/useFirebaseLogout";
import Account from "components/Account";

type Props = {
  seenCount: number;
  showSeen: boolean;
  radius: number;
  onRadiusChange: (value: number) => void;
  onShowSeenChange: (value: boolean) => void;
  open: boolean;
};

export default function Sidebar({ seenCount, showSeen, radius, onRadiusChange, onShowSeenChange, open }: Props) {
  const { user } = useUser();

  const radiusOptions = [
    { label: "5 mi", value: 5 },
    { label: "10 mi", value: 10 },
    { label: "20 mi", value: 20 },
    { label: "50 mi", value: 50 },
    { label: "100 mi", value: 100 },
    { label: "250 mi", value: 250 },
    { label: "350 mi", value: 350 },
    { label: "500 mi", value: 500 },
  ];

  const selectedRadius = radius ? radiusOptions.find(({ value }) => value == radius) : null;

  const { logout, loading } = useFirebaseLogout();

  return (
    <aside
      className={`h-screen w-80 ${
        !open ? "-ml-96" : ""
      } md:ml-0 bg-slate-900 p-6 absolute md:relative aside-bg bg-bottom shadow-2xl md:shadow-none transition-all z-10`}
    >
      <img src="/icon.png" className="mx-auto" width="120" />
      <h1 className="text-center mb-6 text-[#757c8c] font-logo text-2xl">birdy alert</h1>
      <Account />
      <div className="mt-4">
        <label htmlFor="radius" className="text-white text-sm">
          Radius
        </label>
        <Select
          instanceId="radius-select"
          options={radiusOptions}
          value={selectedRadius}
          onChange={(option) => onRadiusChange(option?.value || radiusOptions[4].value)}
          defaultValue={radiusOptions[3]}
          placeholder="Select radius..."
        />
      </div>
      <div className="mt-4">
        <label className="text-white text-sm">
          <input type="checkbox" className="mr-2" checked={!showSeen} onChange={() => onShowSeenChange(!showSeen)} />
          &nbsp; Hide species I&apos;ve seen ({seenCount})
        </label>
      </div>
      {user?.uid && (
        <div className="absolute left-0 bottom-0 w-full p-6 text-center">
          <button
            type="button"
            onClick={logout}
            className="text-sm font-bold text-gray-400 border-2 border-gray-400 rounded-md p-1 w-full"
          >
            {loading ? "..." : "Sign Out"}
          </button>
        </div>
      )}
    </aside>
  );
}
