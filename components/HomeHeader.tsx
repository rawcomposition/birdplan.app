import Link from "next/link";
import clsx from "clsx";
import Button from "components/Button";
import { useUser } from "providers/user";

export default function HomeHeader() {
  const { user } = useUser();
  const isLoggedIn = !!user?.uid;

  return (
    <header className="bg-white border-b border-gray-100 py-4 shrink-0 flex items-center">
      <div className="container flex items-center px-4">
        <Link href="/trips" className={clsx("flex items-center")}>
          <img src="/icon.png" className="w-[50px] mr-4" width="50" height="50" />
          <h1 className="text-center text-gray-700 font-logo text-2xl">BirdPlan.app</h1>
        </Link>
        {isLoggedIn ? (
          <Button color="pillPrimary" href="/trips" className="ml-auto">
            My Trips
          </Button>
        ) : (
          <>
            <Button color="pillOutlineGray" href="/login" className="ml-auto">
              Login
            </Button>
            <Button color="pillPrimary" href="/signup" className="ml-4 hidden xs:flex">
              Signup
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
