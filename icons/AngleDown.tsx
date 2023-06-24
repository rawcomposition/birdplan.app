type Props = {
  className?: string;
};

export default function AngleDown({ className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" className={`icon ${className || ""}`}>
      <path d="M224 353.9l17-17L401 177l17-17L384 126.1l-17 17-143 143L81 143l-17-17L30.1 160l17 17L207 337l17 17z" />
    </svg>
  );
}
