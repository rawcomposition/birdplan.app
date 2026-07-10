import React from "react";
import PublicPage from "components/PublicPage";
import Heading from "components/Heading";
import { useUser } from "hooks/useUser";
import toast from "react-hot-toast";
import Field from "components/Field";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import useMutation from "hooks/useMutation";
import BackLink from "components/BackLink";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "components/ui/select";

export default function Contact() {
  const { user } = useUser();
  const [submitted, setSubmitted] = React.useState(false);
  const [type, setType] = React.useState<string | null>(null);

  const mutation = useMutation({
    url: "/contact",
    method: "POST",
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !type || !message) {
      toast.error("Please fill out all fields");
      return;
    }

    const browserInfo = {
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      userId: user?._id || "not logged in",
    };

    mutation.mutate({
      name,
      email,
      type,
      message,
      browserInfo,
    });
  };

  return (
    <PublicPage documentTitle="Contact | BirdPlan.app">
      <div className="max-w-2xl mx-auto py-12">
        <Heading title="Contact" className="mb-8" />

          {submitted ? (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-secondary-foreground mb-4">Thank you for your message!</h2>
              <p className="text-secondary-foreground mb-4">
                We&apos;ve received your request and will get back to you as soon as possible.
              </p>
              <BackLink
                to={user?._id ? "/trips" : "/"}
                label={user?._id ? "Back to trips" : "Back to home"}
                className="ml-4 md:ml-0"
              />
            </Card>
          ) : (
            <Card className="p-8">
              <p className="text-secondary-foreground mb-4">
                Do you have any questions, feedback, or bug reports? We would love to hear from you!
              </p>
              <p className="text-gray-600 mb-6">
                If you&apos;d like to help with maintenance costs, visit the{" "}
                <Link to="/support" className="text-link font-medium">
                  support page
                </Link>
                .
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Field label="Name">
                  <Input size="sm" type="text" name="name" defaultValue={user?.name || ""} required autoFocus />
                </Field>

                <Field label="Email">
                  <Input size="sm" type="email" name="email" defaultValue={user?.email || ""} required />
                </Field>

                <Field label="Type of Message">
                  <Select value={type} onValueChange={(value) => setType(value as string | null)}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Feature Request", "Bug Report", "Help Request", "Other"].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Message">
                  <Textarea name="message" rows={10} required />
                </Field>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    loading={mutation.isPending}
                    loadingText="Sending..."
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </Card>
          )}
      </div>
    </PublicPage>
  );
}
