import React from "react";
import Head from "next/head";
import Footer from "components/Footer";
import HomeHeader from "components/HomeHeader";
import { useUser } from "providers/user";
import toast from "react-hot-toast";
import Field from "components/Field";
import Input from "components/Input";
import Button from "components/Button";
import Icon from "components/Icon";
import useMutation from "hooks/useMutation";
import Link from "next/link";

export default function Support() {
  const { user } = useUser();
  const [submitted, setSubmitted] = React.useState(false);

  const mutation = useMutation({
    url: "/api/v1/support",
    method: "POST",
    onSuccess: () => {
      toast.success("Your message has been sent!");
      setSubmitted(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const type = formData.get("type") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !type || !message) {
      toast.error("Please fill out all fields");
      return;
    }

    const browserInfo = {
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      userId: user?.uid || "not logged in",
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
    <div className="flex flex-col h-full">
      <Head>
        <title>Support | BirdPlan.app</title>
      </Head>

      <HomeHeader />
      <main className="container px-4">
        <div className="max-w-2xl mx-auto py-12">
          <h1 className="text-4xl text-gray-800 leading-normal font-bold mb-8">Support</h1>

          {submitted ? (
            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Thank you for your message!</h2>
              <p className="text-gray-600 mb-4">
                We&apos;ve received your request and will get back to you as soon as possible.
              </p>
              <Link
                href={user?.uid ? `/trips` : "/"}
                className="text-gray-500 hover:text-gray-600 ml-4 md:ml-0 inline-flex items-center"
              >
                {user?.uid ? "← Back to trips" : "← Back to home"}
              </Link>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow">
              <p className="text-gray-600 mb-4">
                Do you have any questions, feedback, or bug reports? We would love to hear from you!
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Field label="Name">
                  <Input type="text" name="name" defaultValue={user?.displayName || ""} required autoFocus />
                </Field>

                <Field label="Email">
                  <Input type="email" name="email" defaultValue={user?.email || ""} required />
                </Field>

                <Field label="Type of Message">
                  <select name="type" required className="input" defaultValue="">
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Help Request">Help Request</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <Field label="Message">
                  <Input isTextarea name="message" rows={10} required />
                </Field>

                <div className="flex justify-end">
                  <Button type="submit" color="primary" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <>
                        <Icon name="loading" className="animate-spin text-md text-white" />
                        <span className="ml-2">Sending...</span>
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
