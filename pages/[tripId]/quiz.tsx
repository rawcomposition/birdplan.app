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
import Link from "next/link";

type StepT = {
  code: string;
  name: string;
  mlId: number;
  guessName: string;
  isCorrect: boolean;
};

const quizLength = 10;

export default function Quiz() {
  const [index, setIndex] = React.useState(0);
  const [steps, setSteps] = React.useState<StepT[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { trip, targets } = useTrip();
  const { lifelist } = useProfile();
  const { closeSidebar } = useUI();
  const selectRef = React.useRef<any>(null);

  const liferTargets = targets.items.filter((target) => !lifelist.includes(target.code));
  const options = liferTargets.map(({ code, name }) => ({ value: code, label: name }));
  const step = steps[index];

  const initQuiz = React.useCallback(async () => {
    console.log("Initializing quiz...");
    setSteps([]);
    setIndex(0);
    const targetCodes = targets.items.filter((target) => !lifelist.includes(target.code)).map((target) => target.code);

    const randomCodes = getRandomItemsFromArray(targetCodes, quizLength);
    try {
      const res = await fetch(`/api/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: randomCodes }),
      });
      const data = await res.json();
      setSteps(data);
      setTimeout(() => {
        selectRef.current?.focus();
      }, 100);
    } catch (error) {
      toast.error("Error generating quiz");
      return;
    }
  }, [targets, lifelist]);

  React.useEffect(() => {
    if (!trip || !lifelist?.length || isInitialized) return;
    initQuiz();
    setIsInitialized(true);
  }, [trip, lifelist, initQuiz, isInitialized]);

  const isComplete = index === steps.length && steps.length > 0;

  const handleNext = () => {
    setIndex(index + 1);
    setTimeout(() => {
      selectRef.current?.focus();
    }, 100);
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

  React.useEffect(() => {
    const handleLeft = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setIndex((prevIndex) => prevIndex - 1);
      }
    };
    const handleRight = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setIndex((prevIndex) => prevIndex + 1);
        setTimeout(() => {
          selectRef.current?.focus();
        }, 500);
      }
    };
    window.addEventListener("keydown", handleLeft);
    window.addEventListener("keydown", handleRight);
    return () => {
      window.removeEventListener("keydown", handleLeft);
      window.removeEventListener("keydown", handleRight);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Quiz | BirdPlan.app</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="max-w-2xl w-full mx-auto">
        <Sidebar className="sm:hidden" />
        <div className="p-4 md:p-0 mt-6 mb-52" onClick={closeSidebar}>
          <Link href={`/${trip?.id}`} className="text-gray-500 hover:text-gray-600 mb-8 inline-flex items-center">
            ← Back to trip
          </Link>
          <h1 className="text-3xl font-bold text-gray-700 mb-8">🤔 Bird Quiz</h1>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            {isComplete ? (
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Quiz complete!</h2>
                <p className="mb-6 text-gray-700 text-lg">
                  You answered {steps.filter((step) => step.isCorrect).length} out of {steps.length} correctly.
                </p>
                <Button color="primary" className="inline-flex items-center" onClick={initQuiz}>
                  Play Again
                </Button>
              </div>
            ) : !!step ? (
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">
                  {step.guessName ? step.name : "What species is this?"}
                </h2>
                <img
                  src={`https://cdn.download.ams.birds.cornell.edu/api/v1/asset/${step.mlId}/1200`}
                  className="w-full aspect-[1.5] object-contain"
                />
                {step.guessName && (
                  <div className="flex flex-col gap-2 mt-4">
                    <p className="font-bold text-gray-700">{step.isCorrect ? "✅ Correct!" : "❌ Incorrect"}</p>
                    <p className="text-sm">
                      <Link href={`https://ebird.org/species/${step.code}`} target="_blank">
                        {step.name}
                      </Link>
                      &nbsp; • &nbsp;
                      <Link href={`https://macaulaylibrary.org/asset/${step.mlId}`} target="_blank">
                        ML{step.mlId}
                      </Link>
                    </p>
                  </div>
                )}
                {!step.guessName && (
                  <div className="px-10 py-6">
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
              <div className="flex flex-col items-center gap-1">
                <Button color="primary" className="w-48 text-center" onClick={handleNext}>
                  Continue
                </Button>
                <span className="text-xs text-gray-600">(right arrow key)</span>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
