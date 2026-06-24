import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UtilityPage from "components/UtilityPage";
import Button from "components/Button";
import Alert from "components/Alert";
import Icon from "components/Icon";
import useRedeemMagicLink from "hooks/useRedeemMagicLink";

export default function Magic() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const redeem = useRedeemMagicLink();
  const [error, setError] = React.useState<string | null>(null);

  const handleContinue = async () => {
    if (!token) return;
    setError(null);
    try {
      await redeem.mutateAsync({ token });
      navigate("/trips", { replace: true });
    } catch (err: any) {
      setError(err.message || "This link is invalid or has expired.");
    }
  };

  return (
    <UtilityPage heading="Sign in to BirdPlan">
      {error ? (
        <>
          <Alert style="error" className="mb-4">
            {error}
          </Alert>
          <p className="text-sm text-gray-500 text-center">
            Ask for a new link, or{" "}
            <Link to="/login" className="text-link font-medium">
              sign in with your email
            </Link>
            .
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 text-center mb-6">
            Click below to securely sign in to your account.
          </p>
          <Button
            color="primary"
            className="w-full"
            onClick={handleContinue}
            disabled={redeem.isPending || !token}
          >
            {redeem.isPending ? <Icon name="loading" className="animate-spin" /> : "Continue"}
          </Button>
        </>
      )}
    </UtilityPage>
  );
}
