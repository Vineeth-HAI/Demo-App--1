import { type PropsWithChildren, type ReactElement } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

type MotionDirection = "up" | "down";

type MotionProps = PropsWithChildren<{
  delay?: number;
  duration?: number;
  from?: MotionDirection;
  style?: StyleProp<ViewStyle>;
}>;

export function Motion({
  children,
  delay = 0,
  duration = 520,
  from = "up",
  style,
}: MotionProps): ReactElement {
  const entering = enteringFor(from, duration, delay);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

function enteringFor(from: MotionDirection, duration: number, delay: number) {
  switch (from) {
    case "down":
      return FadeInDown.duration(duration).delay(delay).springify().damping(18);
    case "up":
      return FadeInUp.duration(duration).delay(delay).springify().damping(18);
    default: {
      const _exhaustive: never = from;
      return _exhaustive;
    }
  }
}
