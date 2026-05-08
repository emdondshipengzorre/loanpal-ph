import { useColorScheme } from "react-native";
import { colors } from "./colors";
import { darkColors } from "./darkColors";

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : colors;
}
