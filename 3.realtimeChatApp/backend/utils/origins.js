export const parseOrigins = (value, fallback = []) => {
  const source = typeof value === "string" && value.trim() ? value : fallback.join(",");

  return [
    ...new Set(
      source
        .split(",")
        .map((origin) => origin.trim().replace(/\/$/, ""))
        .filter(Boolean)
    ),
  ];
};

export const isOriginAllowed = (origin, allowedOrigins) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};
