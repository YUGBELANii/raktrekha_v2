import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// ✅ Use iPhone 11 as reference (375 × 812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// ✅ Aliases for clarity
export const ms = moderateScale;
export const vs = verticalScale;
