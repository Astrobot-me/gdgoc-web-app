export const certificateTypeValues = ["PARTICIPATION", "WINNER"] as const;

export type CertificateTypeValue = (typeof certificateTypeValues)[number];

export const certificateTypeLabels: Record<CertificateTypeValue, string> = {
  PARTICIPATION: "Participant",
  WINNER: "Winner",
};

export const normalizeCertificateType = (
  value: unknown,
): CertificateTypeValue => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ");

  if (
    [
      "winner",
      "winning",
      "achievement",
      "award",
      "first place",
      "1st place",
      "runner up",
      "runner-up",
    ].includes(normalized)
  ) {
    return "WINNER";
  }

  return "PARTICIPATION";
};

export const getCertificateHeadline = ({
  certificateType,
  label,
}: {
  certificateType: CertificateTypeValue;
  label?: string | null;
}) => {
  if (certificateType === "WINNER") {
    return label || certificateTypeLabels.WINNER;
  }

  return certificateTypeLabels.PARTICIPATION;
};
