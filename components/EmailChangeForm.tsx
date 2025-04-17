import React, { useState } from "react";
import Button from "components/Button";
import Input from "components/Input";
import useMutation from "hooks/useMutation";
import toast from "react-hot-toast";
import Field from "components/Field";
import { useUser } from "providers/user";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  currentEmail: string;
};

export default function EmailChangeForm({ currentEmail }: Props) {
  const { refreshUser } = useUser();
  const [email, setEmail] = useState(currentEmail);
  const queryClient = useQueryClient();

  const updateEmailMutation = useMutation({
    url: "/api/v1/account/update-email",
    method: "POST",
    onSuccess: () => {
      toast.success("Email updated successfully");
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/my-profile"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    updateEmailMutation.mutate({ email });
  };

  const isDirty = currentEmail !== email;

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Field label="New Email">
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </Field>
        </div>
        <Button type="submit" color="primary" disabled={updateEmailMutation.isPending || !isDirty || !email}>
          Update Email
        </Button>
      </form>
    </div>
  );
}
