type Props = {
  className?: string;
};

export default function MarkerPlusIcon({ className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`icon ${className}`} viewBox="0 0 384 512">
      <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM168 280V216H104c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V104c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H216v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
    </svg>
  );
}
