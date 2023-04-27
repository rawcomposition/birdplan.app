import React from "react";
import { Header, Body } from "providers/modals";
import { useProfile } from "providers/profile";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { useModal } from "providers/modals";

type Props = {
  isCountry?: string;
};

export default function UploadLifelist({ isCountry }: Props) {
  const [loading, setLoading] = React.useState(false);
  const { setCountryLifelist, setLifelist } = useProfile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { close } = useModal();

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
          setLoading(true);
          const res = await fetch("/api/lifelist-codes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sciNames),
          });
          const codes = await res.json();
          if (Array.isArray(codes)) {
            isCountry ? setCountryLifelist(codes) : setLifelist(codes);
            toast.success("Life list uploaded");
          } else {
            toast.error("Error uploading life list");
          }
          close();
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
      fileInputRef.current?.value && (fileInputRef.current.value = "");
      setLoading(false);
    }
  };

  return (
    <>
      <Header>{isCountry ? "Import US Life List" : "Import Life List"}</Header>
      <Body>
        <p className="text-sm mb-2">
          <a
            href={`https://ebird.org/lifelist?r=${isCountry ? "US" : "world"}&time=life&fmt=csv`}
            className="text-sky-600"
            target="_blank"
            rel="noreferrer"
          >
            Click here
          </a>{" "}
          to download your life list as a CSV file. Upload the file below.
        </p>
        <input ref={fileInputRef} type="file" accept=".csv" className="text-xs" onChange={handleFileUpload} />
      </Body>
    </>
  );
}
