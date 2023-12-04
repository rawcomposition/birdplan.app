import React from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import Header from "components/Header";
import Head from "next/head";
import Sidebar from "components/Sidebar";
import Button from "components/Button";
import Footer from "components/Footer";
import Download from "icons/Download";
import { useUI } from "providers/ui";
import Feather from "icons/Feather";

type Item = {
  code: string;
  name: string;
  count: number;
};

export default function ImportLifelist() {
  const [items, setItems] = React.useState<Item[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { closeSidebar } = useUI();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        complete: async function (results: any) {
          // Extract the scientific names
          const sciNames = results.data
            .filter((it: any) => it.Countable === "1" && it.Category === "species")
            .map((it: any) => it["Scientific Name"]);
          fileInputRef.current?.value && (fileInputRef.current.value = "");

          // Convert to species codes
          const toastId = toast.loading("Importing...");
          const res = await fetch("/api/my-rarest-lifers", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sciNames),
          });
          const items = await res.json();
          setItems(items);
          toast.success("Life list uploaded");
          toast.dismiss(toastId);
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
      fileInputRef.current?.value && (fileInputRef.current.value = "");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>My Rarest Lifers | BirdPlan.app</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Sidebar className="sm:hidden" />
        <div className="p-4 md:p-0 mt-12" onClick={closeSidebar}>
          <h1 className="text-3xl font-bold text-gray-700 mb-8">
            <Feather className="text-2xl text-lime-600" /> My Rarest Lifers
          </h1>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">1. Download life list from eBird</h3>
            <Button
              href={`https://ebird.org/lifelist?r=world&time=life&fmt=csv`}
              target="_blank"
              color="primary"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <Download /> Download Life List
            </Button>
          </div>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">2. Upload file</h3>
            <p className="text-sm text-gray-600 mb-2">Upload the CSV file you downloaded in step 1.</p>
            <input ref={fileInputRef} type="file" accept=".csv" className="text-xs" onChange={handleFileUpload} />
          </div>

          {!!items.length && (
            <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
              <h3 className="text-lg font-medium mb-6 text-gray-700">3. See your rarest lifers</h3>
              <p className="mb-4 text-sm text-gray-600">
                Top 100 species on your life list with the fewist number of photos on eBird (as of August 2023).
              </p>
              <ol className="list-decimal list-inside text-gray-500 text-sm space-y-1.5">
                {items.map((item) => (
                  <li key={item.code}>
                    <a
                      href={`https://ebird.org/species/${item.code}`}
                      target="_blank"
                      className="text-lg text-gray-700 hover:text-sky-900 hover:underline ml-2"
                    >
                      {item.name}
                    </a>{" "}
                    <span className="rounded px-1 py-0.5 bg-gray-200 border ml-2 text-gray-900">{item.count}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
