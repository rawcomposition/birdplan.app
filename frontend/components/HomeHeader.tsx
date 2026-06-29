import { Link } from "react-router-dom";
import clsx from "clsx";
import { Button } from "components/ui/button";
import { useUser } from "hooks/useUser";
import Logo from "components/Logo";
export default function HomeHeader() {
  const { user } = useUser();
  const isLoggedIn = !!user?._id;

  return (
    <header className="bg-white border-b border-gray-100 py-4 shrink-0 flex items-center">
      <div className="container flex items-center px-4">
        <Link to="/trips" className={clsx("flex items-center")}>
          <Logo className="w-[50px] mr-4" />
          <h1 className="text-center text-gray-700 font-logo text-2xl">BirdPlan.app</h1>
        </Link>
        {isLoggedIn ? (
          <Button variant="default" shape="pill" href="/trips" className="ml-auto">
            My Trips
          </Button>
        ) : (
          <>
            <Button variant="outline" shape="pill" href="/login" className="ml-auto">
              Login
            </Button>
            <Button variant="default" shape="pill" href="/signup" className="ml-4 hidden xs:flex">
              Signup
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
