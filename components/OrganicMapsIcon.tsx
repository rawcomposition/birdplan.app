type Props = {
  className?: string;
};

export default function OrganicMapsIcon({ className }: Props) {
  return (
    <svg
      version="1.1"
      viewBox="125 115 770 770"
      xmlns="http://www.w3.org/2000/svg"
      className={`icon ${className || ""}`}
    >
      <path
        fill="#006c35"
        d="m861.3562052 256.9139426c18.220574 48.4374573-79.2585233 166.2022835-172.1806378 196.4226995-168.0803471-58.2153969-173.5457836 39.5504743-311.1096159 132.4296677 162.6149552 112.4329497 332.9737882 24.8856325 329.7844002-85.7673036-127.9956457 73.3254376-208.1650824 81.3238121-254.1719349 79.1032962 154.8710218-30.6636026 322.0404219-125.7633124 357.0667834-165.7616685 0.032202 1.7749817 0.049863 3.5523114 0.049863 5.33456 0 191.0905993-295.1650572 474.6148576-295.1650572 474.6148576s-154.5086464-147.95159-239.9499331-302.4701423c-11.943516-0.1614425-83.8230022 25.9633002-110.3310391-9.051445-29.6082623-39.1049397 80.1693081-170.2028122 175.3699196-209.3102117 170.3563508 77.3261904 263.7351577-123.0971499 317.0292402-134.2068293-158.9688193-94.2135154-316.1183714-55.5493358-333.8847017 84.4353407 88.3675802-50.2172465 196.7775505-78.65765 246.8822227-76.4346744-140.7606999 28.7623957-301.9981102 132.8752019-350.2809443 172.4255642 0-159.041983 132.1505407-287.9677052 295.1650569-287.9677052 96.4018995 0 182.0095151 45.0859887 235.8744518 114.8252613 0.00335 0 96.1884344-31.2834041 109.851981 11.3787329zm-33.7059144 14.218972c-12.6607646-17.2289278-56.7341326 2.8936807-56.7341326 2.8936807 6.1678152 10.3446685 11.7002555 21.0960758 16.5352245 32.2084942 4.8995467 11.2622344 9.0867303 22.8954305 12.5044868 34.8382086 0 0 45.0041042-46.3863227 27.6944213-69.9403835zm-629.5734431 294.3797539c13.6858848 18.6189721 61.3258973-3.1309266 61.3258973-3.1309266-6.6716772-11.1802827-12.6484216-22.8033047-17.8755617-34.8139472-5.2966478-12.1727565-9.8213865-24.7454316-13.5171072-37.6545218 0 0-48.6427553 50.1397674-29.9332284 75.5993956z"
      />
    </svg>
  );
}