import Styles from "miot/resources/Styles";
import { DarkMode, Device } from "miot";
import { Dimensions, Platform, NativeModules, PixelRatio } from "react-native";
const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

export const fontSize = 16;
export const iconSize = 40;
export const primaryColor = "#60b6bc";
export const defaultColor = "#dbdee3";
export const commonBgColor = DarkMode.getColorScheme() === "dark" ? "xm#000" : "#ffffff";

export const window = {
  get width() {
    return windowWidth;
  },

  get height() {
    if (Platform.OS === "android") {
      return windowHeight / windowWidth > 1.8
        ? windowHeight + NativeModules.StatusBarManager.HEIGHT
        : windowHeight;
    }

    return windowHeight;
  }
}; // UI尺寸适配

export const mScreenWidth = window.width; // 屏幕宽度
export const mScreenHeight = window.height; // 屏幕高度

// 3X图
export function adjustSize(n) {
  const calculateSize = ((n / 1080) * window.width * 2) / 2;
  const roundToNearestPixel = PixelRatio.roundToNearestPixel(calculateSize);
  return roundToNearestPixel;
}
export const cardMargin = adjustSize(36); // 米家卡片左右间距
export const cardWidth = mScreenWidth - cardMargin * 2; // 米家卡片的宽度

export default {
  fontSize,
  iconSize,
  primaryColor,
  defaultColor,
  commonBgColor,
  adjustSize,
  mScreenWidth,
  mScreenHeight,
  cardMargin,
  cardWidth
};
