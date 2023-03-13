import { useUser } from "providers/user";
import Avatar from "components/Avatar";

type Props = {
  title: string;
};

export default function Header({ title }: Props) {
  const { user } = useUser();

  return (
    <header className="bg-slate-900 h-[60px] shrink-0 flex items-center">
      <img src="/icon.png" className="w-[50px] ml-4 mr-4" width="50" height="50" />
      <h1 className="text-center mr-auto text-[#757c8c] font-logo text-2xl">{title}</h1>
      {user && (
        <div className="text-gray-400 gap-3 mr-6 flex items-center">
          <Avatar />
          <div className="flex flex-col">
            <span className="font-bold">{user.displayName}</span>
            <span className="text-xs">My Account</span>
          </div>
        </div>
      )}
    </header>
  );
}
