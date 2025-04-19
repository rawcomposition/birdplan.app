import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto text-center text-[12px] opacity-80 text-gray-500 border-t py-4 hidden md:block">
      Developed by{" "}
      <a href="https://rawcomposition.com" target="_blank">
        RawComposition
      </a>
      <span className="mx-2">•</span>
      <Link href="/support">Feedback</Link>
      <span className="mx-2">•</span>
      <Link href="/whats-new">What&apos;s New</Link>
      <span className="mx-2">•</span>
      <a href="https://github.com/rawcomposition/birdplan.app" target="_blank">
        Github
      </a>
    </footer>
  );
}
