import BaseComponent from '../../Main/Base/BaseComponent';
import { Device, DeviceEvent, Host, Package, Service } from "../../../../miot-sdk";
import React from "react";
import {
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  Slider,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  PanResponder,
  ART,
  StatusBar,
  Dimensions,
  Animated,
  TouchableHighlight,
  Modal,
  DeviceEventEmitter,
  AppState,
  ToastAndroid
} from 'react-native';

let lightPec = -1;
let colorPec = -1;
export default class LightBarView extends BaseComponent {

  constructor(props) {
    super(props);
    this.state = {
      lightBarProgress: this.mScreenHeight / 4, // 亮度bar进度
      lightBarHeight: this.mScreenHeight / 4, // 亮度bar高度
      lightSwitchMarTop: 0, // 亮度icon距顶距离


      lightIconHeight: 0, // 亮度icon高度
      colorIconWidth: 0, // 色温icon宽度
      colorBarWidth: this.mScreenWidth - 100, // 色温bar宽度
      colorBarSwitchMarLeft: 0,

      isUpDownScroll: false,
      isLRScroll: false,

      lightBarVisible: false,
      colorBarVisible: false,
      scrollFlag: false
    };

    this.lastDx = 0;
    this.lastDy = 0;
  }

  componentWillReceiveProps(props) {

    if (!this.state.scrollFlag) {
      if (props.lightValue != (lightPec) * 100) {
        let tempHeight = (this.state.lightBarHeight - this.state.lightIconHeight);
        this.setState({
          lightSwitchMarTop: parseInt(props.lightValue) == 0 ? tempHeight : tempHeight * (1 - (props.lightValue / 100)),
          lightBarProgress: this.state.lightBarHeight * (props.lightValue / 100)
        });
      }

      if (parseFloat(props.colorValue) != (colorPec)) {

        let tempWidth = (this.state.colorBarWidth - this.state.colorIconWidth);
        this.setState({
          colorBarSwitchMarLeft: tempWidth * parseFloat(props.colorValue)
        });
      }
    }

  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0)'
        }}
        {...this._panResponder.panHandlers}>

        {this.state.lightBarVisible ? this._lightBar() : null}

        {this.state.colorBarVisible ? this._colorBar() : null}

      </View>
    );
  }

  componentWillMount() {
    this._touches = [{}, {}];

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return true;
      },
      onStartShouldSetPanResponderCapture: (evt, gestureState) => { // 表示，是否成为事件的劫持者，如果返回是，则不会把事件传递给它的子元素
        return true;
      },
      onPanResponderGrant: (evt, gestureState) => {
        if (!this.props.enable)
          return;
        this.setState({ scrollFlag: true });

        for (let x in this._touches) {
          if (evt.nativeEvent.touches[x]) {
            this._touches[x].x = evt.nativeEvent.touches[x].pageX;
            this._touches[x].y = evt.nativeEvent.touches[x].pageY;
            this._touches[x].identifier = evt.nativeEvent.touches[x].identifier;
          }
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!this.props.enable)
          return;

        if (this._touches[0].identifier === undefined) {
          // haven marked before, mark and return
          for (let x in this._touches) {
            if (evt.nativeEvent.touches[x]) {
              this._touches[x].x = evt.nativeEvent.touches[x].pageX;
              this._touches[x].y = evt.nativeEvent.touches[x].pageY;
              this._touches[x].identifier = evt.nativeEvent.touches[x].identifier;
            }
          }
          return false;
        }

        this.setState({ scrollFlag: true });

        if (!this.state.isUpDownScroll && Math.abs(gestureState.dx) > 5) {
          this._stopColorTime();
          this.setState({
            isLRScroll: true,
            colorBarVisible: true
          });

          let moveX = evt.nativeEvent.touches[0].pageX - this._touches[0].x;
          this.state.colorBarSwitchMarLeft += moveX;
          let tempWidth = (this.state.colorBarWidth - this.state.colorIconWidth);
          let tempMarLeft = this.state.colorBarSwitchMarLeft < 0 ? 0 : (this.state.colorBarSwitchMarLeft > tempWidth ? tempWidth : this.state.colorBarSwitchMarLeft);
          this.setState({
            colorBarSwitchMarLeft: tempMarLeft
          });

          var pec = parseFloat((tempMarLeft / (tempWidth)).toFixed(4));
          colorPec = pec;
          this.props.colorValueChange(pec);
        } else if (!this.state.isLRScroll && Math.abs(gestureState.dy) > 5) {
          this._stopLightTime();
          this.setState({
            isUpDownScroll: true,
            lightBarVisible: true
          });

          let moveY = evt.nativeEvent.touches[0].pageY - this._touches[0].y;
          this.state.lightSwitchMarTop += moveY;
          let tempHeight = (this.state.lightBarHeight - this.state.lightIconHeight);
          let tempMarTop = this.state.lightSwitchMarTop < 0 ? 0 : (this.state.lightSwitchMarTop > tempHeight ? tempHeight : this.state.lightSwitchMarTop);

          var pec = parseFloat((tempMarTop / (tempHeight)).toFixed(2));
          this.setState({
            lightSwitchMarTop: tempMarTop,
            lightBarProgress: this.state.lightBarHeight * (1 - pec)
          });


          lightPec = pec;
          this.props.lightValueChange(pec);
        }

        for (let x in this._touches) {
          if (evt.nativeEvent.touches[x]) {
            this._touches[x].x = evt.nativeEvent.touches[x].pageX;
            this._touches[x].y = evt.nativeEvent.touches[x].pageY;
            this._touches[x].identifier = evt.nativeEvent.touches[x].identifier;
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.lastDx = 0;
        this.lastDy = 0;


        this.setState({
          isUpDownScroll: false,
          isLRScroll: false
        });

        if (this.state.isUpDownScroll && this.props.enable) {
          this._startLightTime();
          this.props.lightValueComplete(lightPec);
        }

        if (this.state.isLRScroll && this.props.enable) {
          this._startColorTime();
          this.props.colorValueComplete(colorPec);
        }
        this.setState({ scrollFlag: false });
      },
      onPanResponderTerminate: (evt, gestureState) => {
      }
    });
  }


  _lightBar() {
    return (
      <View style={{
        flexDirection: 'column',
        // position: 'absolute',
        // top: this.mScreenHeight / 4,
        // left: 5,
        flex: 1,
        width: 40
      }}>
        <View style={{ flex: 1 }}/>
        <View>
          <Image
            style={{ marginLeft: 3, marginBottom: 5 }}
            source={require('../../resources/brightress_high_ic.png')}/>

          <View style={{ flexDirection: 'row' }}>
            <View
              style={{
                marginTop: this.state.lightIconHeight / 2,
                marginBottom: this.state.lightIconHeight / 2
              }}>
              <View style={{
                height: this.mScreenHeight / 4 - this.state.lightIconHeight,
                width: 2,
                backgroundColor: '#fcbe94',
                marginLeft: 11
              }}
                // onLayout={(event) => this.onLayoutLightBar(event)}
              />
              <View style={{
                height: (this.mScreenHeight / 4 - this.state.lightIconHeight) - this.state.lightSwitchMarTop,
                width: 2,
                backgroundColor: '#fff',
                marginLeft: 11,
                position: 'absolute',
                bottom: 0
              }}/>
            </View>

            <Image
              style={{ marginTop: this.state.lightSwitchMarTop }}
              source={require('../../resources/birght_switcher_ic.png')}
              onLayout={(event) => this.onLayoutLightBarIcon(event)}/>
          </View>

          <Image
            style={{ marginLeft: 5, marginTop: 5 }}
            source={require('../../resources/brightress_low_ic.png')}/>
        </View>
        <View style={{ flex: 1 }}/>
      </View>
    );
  }

  _colorBar() {
    return (
      <View style={{
        flexDirection: 'row',
        top: 30,
        position: 'absolute',
        width: this.mScreenWidth
      }}
      >
        <View style={{ flex: 1 }}/>
        <View
          style={{
            width: this.mScreenWidth - 100
          }}>
          <Image
            style={{ marginLeft: this.state.colorBarSwitchMarLeft }}
            source={require('../../resources/temp_switcher_ic.png')}
            onLayout={(event) => this.onLayoutColorBarIcon(event)}/>
          <Image
            style={{
              alignSelf: 'center',
              width: this.mScreenWidth - 100 - this.state.colorIconWidth
            }}
            source={require('../../resources/temp_bar_img.png')}
          />
        </View>
        <View style={{ flex: 1 }}/>
      </View>
    );
  }

    onLayoutColorBarIcon = (event) => { // 获取ColorBarIcon的宽度
      const viewWidth = event.nativeEvent.layout.width;
      this.setState({
        colorIconWidth: viewWidth
      });
    }

    onLayoutLightBarIcon = (event) => { // 获取LightBarIcon的高度
      const viewHeight = event.nativeEvent.layout.height;
      this.setState({
        lightIconHeight: viewHeight
      });
    }

    _startLightTime() { // 手势触发后出现bar，手离开屏幕两秒隐藏bar
      this.intervalLight = setInterval(() => {
        this.setState((previousState) => {
          return {
            lightBarVisible: false
          };
        });
        this._stopLightTime();
      }, 3000);
    }

    _stopLightTime() { // 停止计时
      if (this.intervalLight) {
        clearInterval(this.intervalLight);
      }
    }

    _startColorTime() { // 手势触发后出现bar，手离开屏幕两秒隐藏bar
      this.intervalColor = setInterval(() => {
        this.setState((previousState) => {
          return {
            colorBarVisible: false
          };
        });
        this._stopColorTime();
      }, 3000);
    }

    _stopColorTime() { // 停止计时
      if (this.intervalColor) {
        clearInterval(this.intervalColor);
      }
    }
}