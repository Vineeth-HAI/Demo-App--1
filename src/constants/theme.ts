export const colors = {
  background: "#E8F0ED",
  surface: "#FFFFFF",
  surfaceMuted: "#F3F8F6",
  text: "#0B1F1C",
  textMuted: "#5B6F6A",
  border: "#D0DDD8",
  primary: "#0F766E",
  primaryDark: "#0A5A54",
  primaryMuted: "#D7F3EE",
  accent: "#C45C26",
  danger: "#B42318",
  warning: "#B54708",
  success: "#067647",
  info: "#175CD3",
  onPrimary: "#F4FBF9",
} as const;

export const fonts = {
  display: "Fraunces_700Bold",
  displaySemi: "Fraunces_600SemiBold",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodyBold: "DMSans_700Bold",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  brand: {
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 24,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  button: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
} as const;
