import React, { Component } from 'react';

import {
  BackAndroid,
  BackHandler, DeviceEventEmitter,
  Dimensions,
  PixelRatio, Platform
} from 'react-native';

import Toast from 'react-native-root-toast';

class BaseComponent extends React.Component {

    mScreenWidth = Dimensions.get('window').width;

    mScreenHeight = Dimensions.get('window').height;

    // 最小显示单位
    mOnePixel = (PixelRatio.get() == 3 ? 2 : 1) / PixelRatio.get();

    constructor(props) {
      super(props);
    }

    /**
     * return 當前分辨率下的數值
     * @param {*} size 375标注图下的值
     */
    getSize(size) {
      return parseInt(this.mScreenWidth * size / 375);
    }

    calculateDP(dp) {
      return Platform.select({
        ios: dp,
        android: dp / 2.75 * 3
      });
    }

    useSize(pt, dp) {
      return Platform.select({
        ios: pt,
        android: dp / 2.75 * 3
      });
    }


    componentWillMount() {
      if (Platform.OS === 'android') {
        BackHandler.addEventListener("back", this.onBackClicked);
      } else {

      }
    }

    componentWillUnmount() {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener("back", this.onBackClicked);
      } else {
        // this.propstManger.addLengeData(this.props.navigator.getCurrentRoutes().length);
      }
    }

    // 返回 ;//return  true 表示返回上一页  false  表示跳出RN
    onBackClicked = () => { // 默认 表示跳出RN
      return false;
    }

    onShowToast = (message) => {
      Toast.show(message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
        shadow: false,
        backgroundColor: 'rgba(122,122,122,0.9)',
        textColor: '#fff',
        onShow: () => {

        },
        onShown: () => {

        },
        onHide: () => {

        },
        onHidden: () => {

        }
      });
    }

}

export default BaseComponent;
