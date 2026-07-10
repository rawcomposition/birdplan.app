import React from "react";
import { Card } from "components/ui/card";
import Footer from "components/Footer";
import Heading from "components/Heading";
import HomeHeader from "components/HomeHeader";
import { Button } from "components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "components/ui/dialog";

export default function Support() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col h-full">
      <title>Support | BirdPlan.app</title>

      <HomeHeader />
      <main className="container px-4">
        <div className="max-w-3xl mx-auto py-12">
          <Heading title="Support BirdPlan.app" className="mb-6" />
          <Card className="rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
              <img
                src="/me.jpg"
                alt="RawComposition"
                className="w-40 h-40 rounded-full object-cover shadow-sm shrink-0 self-center sm:self-start"
              />
              <div className="flex-1">
                <div className="prose prose-gray max-w-none">
                  <p>
                    Hey, I&apos;m the person behind BirdPlan.app. I&apos;m a dedicated birder, and I originally built
                    this app to help plan my own birding trips. I still use it for my own planning, so I plan to keep
                    maintaining and improving it long-term.
                  </p>
                  <p>
                    I&apos;m a firm believer in keeping resources free and open. I&apos;ll never charge for
                    BirdPlan.app and I&apos;ll never put ads in it. This is my way of giving back to the birding
                    community.
                  </p>
                  <p>
                    Running the app isn&apos;t free, though I try to keep costs to a minimum. There are still some base
                    operating costs of around $25/month. If you&apos;ve found BirdPlan.app useful and want to show a
                    little appreciation or help cover those costs, I&apos;d genuinely appreciate it. It&apos;s
                    completely optional, and BirdPlan.app will always stay free, open, and ad-free for everyone.
                  </p>
                  <p>
                    Thanks for being part of the birding community. Happy birding!
                  </p>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button variant="default" size="lg" onClick={() => setOpen(true)} className="justify-center sm:justify-start">
                    <img src="/ko-fi-logomark.png" alt="" className="h-6 w-6" aria-hidden="true" />
                    <span>Support</span>
                  </Button>
                  <Button variant="outline" size="lg" href="/contact">
                    Send a Message
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Support BirdPlan.app</DialogTitle>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-[#f9f9f9]">
            <iframe
              id="kofiframe"
              src="https://ko-fi.com/rawcomposition/?hidefeed=true&widget=true&embed=true&preview=true"
              style={{ border: "none", width: "100%", background: "#f9f9f9" }}
              height="620"
              title="rawcomposition"
            />
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
