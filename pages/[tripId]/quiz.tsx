import React from "react";
import Header from "components/Header";
import Head from "next/head";
import { useTrip } from "providers/trip";
import toast from "react-hot-toast";
import Button from "components/Button";
import Sidebar from "components/Sidebar";
import { useUI } from "providers/ui";
import { useProfile } from "providers/profile";
import LoginModal from "components/LoginModal";
import Footer from "components/Footer";
import Select from "components/ReactSelectStyled";
import { getRandomItemsFromArray } from "lib/helpers";

type StepT = {
  code: string;
  name: string;
  mlId: number;
  guessName: string;
  isCorrect: boolean;
};

export default function Quiz() {
  const [index, setIndex] = React.useState(0);
  const [steps, setSteps] = React.useState<StepT[]>([]);
  const { trip, targets } = useTrip();
  const { lifelist } = useProfile();
  const { closeSidebar } = useUI();
  const selectRef = React.useRef<any>(null);

  const liferTargets = targets.items.filter((target) => !lifelist.includes(target.code));
  const options = liferTargets.map(({ code, name }) => ({ value: code, label: name }));
  const step = steps[index];

  React.useEffect(() => {
    if (!trip || !lifelist?.length) return;
    console.log("Initializing quiz...");
    (async () => {
      const targetCodes = targets.items
        .filter((target) => !lifelist.includes(target.code))
        .map((target) => target.code);

      const randomCodes = getRandomItemsFromArray(targetCodes, 2);
      try {
        const res = await fetch(`/api/generate-quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codes: randomCodes }),
        });
        const data = await res.json();
        setSteps(data);
      } catch (error) {
        toast.error("Error generating quiz");
        return;
      }
    })();
  }, [trip, targets, lifelist]);

  const isComplete = index === steps.length && steps.length > 0;

  const handleNext = () => {
    setIndex(index + 1);
    setTimeout(() => {
      selectRef.current?.focus();
    }, 100);
  };

  const handleStartOver = () => {
    setIndex(0);
  };

  const handleGuess = (code: string, name: string) => {
    setSteps((prevSteps) => {
      return prevSteps.map((step, i) => {
        if (i === index) {
          const isCorrect = step.code === code;
          if (!isCorrect) {
            toast.error(`Incorrect`);
          } else {
            toast.success("Correct!");
          }
          return { ...step, guessName: name, isCorrect };
        }
        return step;
      });
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Quiz | BirdPlan.app</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Sidebar className="sm:hidden" />
        <div className="p-4 md:p-0 mt-12" onClick={closeSidebar}>
          <h1 className="text-3xl font-bold text-gray-700 mb-8">🤔 Bird Quiz</h1>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            {isComplete ? (
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Quiz complete!</h2>
                <p className="mb-6 text-gray-700 text-lg">
                  You answered {steps.filter((step) => step.isCorrect).length} out of {steps.length} correctly.
                </p>
                <Button color="primary" className="inline-flex items-center" onClick={handleStartOver}>
                  Start Over
                </Button>
              </div>
            ) : !!step ? (
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">
                  {step.guessName ? step.name : "What species is this?"}
                </h2>
                <iframe
                  src={`https://macaulaylibrary.org/asset/${step.mlId}/embed`}
                  height="555"
                  width="640"
                  className="w-full"
                  allowFullScreen
                  key={step.mlId}
                />
                {!step.guessName && (
                  <div className="absolute bottom-0 left-0 right-0 z-10 bg-white h-32 p-10">
                    <label className="max-w-2xl mx-auto">
                      <Select
                        ref={selectRef}
                        options={options}
                        placeholder="Select a species..."
                        onChange={(option: any) => {
                          handleGuess(option.value, option.label);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="my-6 text-gray-700 text-xl">Initializing quiz...</p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            {step?.guessName && (
              <Button color="primary" className="w-48 text-center" onClick={handleNext}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
