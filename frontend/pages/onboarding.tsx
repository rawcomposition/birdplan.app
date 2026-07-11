import React from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import UtilityPage from "components/UtilityPage";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import Field from "components/Field";
import LoadingState from "components/LoadingState";
import { useUser } from "hooks/useUser";
import useMutation from "hooks/useMutation";
import { withReturnTo } from "lib/helpers";

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, refreshUser } = useUser();
  const [name, setName] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const returnTo = searchParams.get("returnTo") || "/trips";

  const nameMutation = useMutation({
    url: "/profile",
    method: "PATCH",
    onSuccess: async () => {
      setSubmitted(true);
      await refreshUser();
      navigate(`${withReturnTo("/import-lifelist", returnTo)}&onboarding=1`);
    },
  });

  if (loading) {
    return (
      <UtilityPage heading="Welcome">
        <LoadingState className="py-0" />
      </UtilityPage>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.name && !submitted) {
    return <Navigate to={returnTo} replace />;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    nameMutation.mutate({ name: name.trim() });
  };

  return (
    <UtilityPage heading="Welcome to BirdPlan" title="Welcome">
      <p className="text-sm text-muted-foreground text-center mb-6">What should we call you?</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Your name">
          <Input size="sm"
            type="text"
            name="name"
            placeholder="Name"
            required
            autoFocus
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
        </Field>
        <Button
          type="submit"
          variant="default"
          className="w-full"
          loading={nameMutation.isPending}
          loadingText="Saving..."
          disabled={!name.trim()}
        >
          Continue
        </Button>
      </form>
    </UtilityPage>
  );
}
