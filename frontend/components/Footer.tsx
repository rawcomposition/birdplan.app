import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto text-center text-[12px] opacity-90 text-gray-500 border-t py-4">
      <Link to="/contact">Contact</Link>
      <span className="mx-2">•</span>
      <Link to="/support">Support</Link>
      <span className="mx-2">•</span>
      <Link to="/whats-new">What&apos;s New</Link>
      <span className="mx-2">•</span>
      <a href="https://github.com/rawcomposition/birdplan.app" target="_blank" rel="noreferrer">
        Github
      </a>
    </footer>
  );
}
