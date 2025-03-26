import React, { Component } from 'react';

import {
  View,
  Animated,
  PanResponder,
  Alert, Platform, Modal, TouchableOpacity, Text
} from 'react-native';

import BaseComponent from '../Base/BaseComponent';
import LinearGradient from 'react-native-linear-gradient';
import HomeLocalizableString from '../HomeLocalizableString';
import { Device } from "miot";

const touchIconWH = 40;
let mColorPec = -1;
let mBrightPec = -1;
let colorMax = Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 5700 : 6500;
let colorMin = 2700;


export default class BrightnessLightDialog extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      panelWidth: this.mScreenWidth * 0.88, // 画板宽高
      touchIconLeft: 0,
      touchIconTop: 0,
      init: true
    };
  }

  componentWillReceiveProps(props) {
    if (props.dialogInit) {
      if (props.colorP != mColorPec) {
        this.setState({
          touchIconLeft: ((props.colorP / 100) * (this.state.panelWidth - touchIconWH))
        });
        mColorPec = props.colorP;
      }

      if (props.brightP != mBrightPec) {
        this.setState({
          touchIconTop: ((props.brightP / 100) * (this.state.panelWidth - touchIconWH))
        });
        mBrightPec = props.brightP;
      }
      this.setState({ init: false });
    }
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
        for (let x in this._touches) {
          if (evt.nativeEvent.touches[x]) {
            this._touches[x].x = evt.nativeEvent.touches[x].pageX;
            this._touches[x].y = evt.nativeEvent.touches[x].pageY;
            this._touches[x].identifier = evt.nativeEvent.touches[x].identifier;
          }
        }

        this._setData(evt.nativeEvent.locationX - touchIconWH / 2, evt.nativeEvent.locationY - touchIconWH / 2);
      },
      onPanResponderMove: (evt, gestureState) => {
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

        let moveX = evt.nativeEvent.touches[0].pageX - this._touches[0].x;
        this.state.touchIconLeft += moveX;
        let moveY = evt.nativeEvent.touches[0].pageY - this._touches[0].y;
        this.state.touchIconTop += moveY;

        this._setData(this.state.touchIconLeft, this.state.touchIconTop);

        for (let x in this._touches) {
          if (evt.nativeEvent.touches[x]) {
            this._touches[x].x = evt.nativeEvent.touches[x].pageX;
            this._touches[x].y = evt.nativeEvent.touches[x].pageY;
            this._touches[x].identifier = evt.nativeEvent.touches[x].identifier;
          }
        }


      },
      onPanResponderRelease: (evt, gestureState) => {

      },
      onPanResponderTerminate: (evt, gestureState) => {
      }
    });
  }

  _setData(leftValue, topValue) {
    let x = this._overRangeValue(leftValue);
    let y = this._overRangeValue(topValue);
    this.setState({
      touchIconLeft: x,
      touchIconTop: y
    });
    let bPec = x / (this.state.panelWidth - touchIconWH);
    let cPec = y / (this.state.panelWidth - touchIconWH);
    mColorPec = parseInt((bPec * 100).toFixed(0));
    mBrightPec = parseInt((cPec * 100).toFixed(0));
    if (this.props.sliderEvent) {
      this.props.sliderEvent(mColorPec, mBrightPec);
    }
  }

  _overRangeValue(value) {
    let newValue = value;
    if (value < 0) {
      newValue = 0;
    } else if (value > this.state.panelWidth - touchIconWH) {
      newValue = this.state.panelWidth - touchIconWH;
    }
    return newValue;
  }

  render() {
    return (
      <Modal
        transparent={true}
        visible={this.props.modalVisible}
        onRequestClose={(_) => {
          if (this.props.onRequestClose) {
            this.props.onRequestClose();
          }
        }}>

        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)' // 蒙层背景色
          }}>
          <TouchableOpacity
            activeOpacity={1}
            /* onPress={() => {
                                                    if (this.props.modalClose) {
                                                        this.props.modalClose();
                                                    }
                                                }} */
            style={{ flex: 1 }}/>

          {this._mainContainerView()}
        </View>

      </Modal>
    );
  }

  _mainContainerView() {
    return (
      <View
        style={{
          width: this.mScreenWidth,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          paddingTop: 24,
          paddingBottom: 17,
          paddingLeft: 20,
          paddingRight: 20
        }}>
        {this.props.title ? this._titleView() : null}
        {this.props.value ? this._valueView() : null}
        {this._panelView()}
        {this._btnView()}
      </View>
    );
  }

  _titleView() {
    return (
      <View>
        <Text style={{
          color: '#000000',
          textAlign: 'center',
          fontSize: 16
        }}>
          {this.props.title}
        </Text>
      </View>
    );
  }

  _valueView() {
    return (
      <View>
        <Text style={{
          color: '#999',
          textAlign: 'center',
          fontSize: 12,
          marginTop: 5
        }}>
          {`${ HomeLocalizableString.brightness2((100 - mBrightPec) < 1 ? 1 : (100 - mBrightPec) > 100 ? 100 : 100 - mBrightPec) } ${ HomeLocalizableString.temp2(colorMin + ((colorMax - colorMin) * (mColorPec / 100))) }`}
        </Text>
      </View>
    );
  }

  _panelView() {
    return (
      <View
        pointerEvents={'box-only'}
        style={{
          width: this.state.panelWidth,
          height: this.state.panelWidth,
          marginTop: 27
        }}
        {...this._panResponder.panHandlers}>
        <LinearGradient
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          colors={['#FFBB15', 'rgba(255,255,255,0.28)']}
          style={{
            width: this.state.panelWidth,
            height: this.state.panelWidth,
            borderRadius: 18,
            borderWidth: 0.5,
            borderColor: '#E4E4E4'
          }}>

        </LinearGradient>
        {this._touchIconView()}
      </View>
    );
  }

  _btnView() {
    return (
      <View
        style={{
          paddingLeft: 27,
          paddingRight: 27,
          flexDirection: 'row',
          width: this.mScreenWidth,
          marginTop: 37
        }}>
        {this._btnItemView(this.props.cancelText, this.props.cancelTextColor, this.props.cancelEvent)}
        <View
          style={{
            width: 12,
            height: 1
          }}/>
        {this._sureBtnItemView(this.props.sureText, this.props.sureTextColor, this.props.sureEvent)}
      </View>
    );
  }

  _sureBtnItemView(text, textColor, clickEvent) {
    return (
      <TouchableOpacity
        style={{
          height: 46,
          flex: 1,
          backgroundColor: '#4396EB',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 23
        }}
        onPress={() => {
          if (clickEvent) {
            clickEvent(mBrightPec, mColorPec);
          }
        }}>
        <Text style={{
          color: '#fff',
          textAlign: 'center',
          fontSize: 16
        }}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }

  _btnItemView(text, textColor, clickEvent) {
    return (
      <TouchableOpacity
        style={{
          height: 46,
          flex: 1,
          backgroundColor: '#F5F5F5',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 23
        }}
        onPress={() => {
          if (clickEvent) {
            clickEvent(mBrightPec, mColorPec);
          }
        }}>
        <Text style={{
          color: textColor ? textColor : '#4C4C4C',
          textAlign: 'center',
          fontSize: 16
        }}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }

  _touchIconView() {
    return (
      <View
        style={{
          borderRadius: touchIconWH / 2,
          width: touchIconWH,
          height: touchIconWH,
          borderWidth: 4,
          borderColor: '#FFFFFF',
          position: 'absolute',
          left: this.state.touchIconLeft,
          top: this.state.touchIconTop
        }}/>
    );
  }
}