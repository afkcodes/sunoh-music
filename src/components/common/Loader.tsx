import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';

// 1. Convert SVG Path to an Animated Component
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Your SVG Path Data
const PATH_DATA = "M297.714 346.468C287.037 350.11 275.557 350.609 264.737 347.901C253.916 345.194 244.244 339.403 236.953 331.267C229.662 323.13 225.082 313.015 223.796 302.211C222.51 291.407 224.576 280.403 229.732 270.6L284.357 165.251C286.097 162.531 287.242 159.503 287.72 156.358C288.197 153.214 287.996 150.022 287.13 146.987C286.264 143.951 284.751 141.139 282.688 138.728C280.625 136.318 278.057 134.363 275.148 132.988C272.24 131.613 269.054 130.847 265.793 130.741C262.533 130.634 259.27 131.188 256.213 132.369C253.156 133.549 250.371 135.329 248.036 137.595C245.701 139.862 243.867 142.565 242.652 145.532L169.629 285.781C162.564 298.736 150.668 308.65 136.434 313.444C122.199 318.239 106.73 317.544 93.266 311.503C79.9066 305.15 69.8054 293.862 65.1725 280.109C60.5396 266.355 61.7524 251.256 68.5454 238.115L159.814 62.5124C161.554 59.7931 162.699 56.7646 163.177 53.62C163.654 50.4754 163.453 47.2836 162.587 44.2482C161.72 41.2128 160.208 38.4004 158.145 35.9902C156.082 33.5799 153.514 31.6249 150.605 30.2496C147.697 28.8743 144.511 28.1089 141.25 28.0023C137.99 27.8957 134.727 28.4502 131.67 29.6304C128.613 30.8106 125.828 32.5907 123.493 34.8571C121.158 37.1235 119.324 39.8265 118.109 42.7938L29.3509 212.317L-2.37065e-06 198.567L88.1323 28.7481C95.3947 16.3223 107.242 6.97577 121.22 2.64483C135.197 -1.68611 150.234 -0.66946 163.214 5.48415C176.194 11.6378 186.124 22.4567 190.944 35.6994C195.765 48.9422 195.108 63.5938 189.109 76.6186L97.9474 252.016C95.1522 257.448 94.6574 263.683 96.5707 269.363C98.484 275.044 102.65 279.709 108.163 282.342C113.719 284.806 120.088 285.078 125.95 283.104C131.813 281.129 136.719 277.058 139.652 271.735L212.624 131.335C215.773 124.46 220.314 118.246 225.972 113.069C231.629 107.893 238.285 103.861 245.535 101.22C252.786 98.5786 260.481 97.3821 268.153 97.7029C275.825 98.0238 283.314 99.8554 290.167 103.087C297.019 106.318 303.092 110.882 308.017 116.501C312.942 122.12 316.617 128.678 318.818 135.776C321.019 142.875 321.701 150.366 320.823 157.796C319.944 165.227 317.524 172.44 313.708 179.001L258.925 284.403C256.742 289.734 256.673 295.62 258.734 300.904C260.794 306.188 264.834 310.488 270.06 312.959C275.286 315.43 281.321 315.894 286.977 314.258C292.634 312.623 297.504 309.007 300.63 304.122L347.911 213.402L377.939 227.599L330.709 318.471C327.355 324.991 322.709 330.825 317.044 335.633C311.378 340.44 304.806 344.124 297.714 346.468Z";

// Length of the path
const PATH_LENGTH = 8000; 

interface LogoAnimationProps {
  size?: number;
}

export default function LogoAnimation({ size = 80 }: LogoAnimationProps) {
  const { colors } = useTheme();
  
  // Shared values
  const drawProgress = useSharedValue(0);
  const fillOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Draw Loop
    drawProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 0 }) 
      ),
      -1,
      false
    );

    // 2. Fill Loop (Syncs with draw)
    fillOpacity.value = withRepeat(
        withSequence(
            withDelay(2400, withTiming(1, { duration: 800 })),
            withTiming(0, { duration: 0 })
        ),
        -1,
        false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    // Dash Offset: PATH_LENGTH -> 0
    const dashOffset = interpolate(
      drawProgress.value,
      [0, 1],
      [PATH_LENGTH, 0]
    );

    return {
      strokeDashoffset: dashOffset,
      fillOpacity: fillOpacity.value,
      strokeWidth: 5,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 378 350" fill="none">
        <AnimatedPath
          d={PATH_DATA}
          stroke={colors.primaryBase}
          fill={colors.primaryBase} 
          strokeDasharray={[PATH_LENGTH, PATH_LENGTH]}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
