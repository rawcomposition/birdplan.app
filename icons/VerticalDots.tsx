type Props = {
  className?: string;
};

export default function VerticalDots({ className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512" className={`icon ${className}`}>
      <path d="M56 472a56 56 0 1 1 0-112 56 56 0 1 1 0 112zm0-160a56 56 0 1 1 0-112 56 56 0 1 1 0 112zM0 96a56 56 0 1 1 112 0A56 56 0 1 1 0 96z" />
    </svg>
  );
}
