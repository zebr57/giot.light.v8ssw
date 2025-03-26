import React, { Component } from 'react';

import {
  View,
  Animated,
  PanResponder,
  Alert, Platform, Modal, TouchableOpacity, Text, Image
} from 'react-native';

import BaseComponent from '../Base/BaseComponent';
import LinearGradient from 'react-native-linear-gradient';
import HomeLocalizableString from '../HomeLocalizableString';
import { Device, Service } from "miot";
import SlideGear from "miot/ui/Gear/SlideGear";

const touchIconWH = 40;
let mColorPec = 0;
let mBrightPec = 0;
let colorMax = Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 5700 : 6500;
let colorMin = 2700;

export default class BrightnessLightDialog extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      panelWidth: this.mScreenWidth * 0.88, // 画板宽高
      brightness: 0,
      color_temperature: 0,

      init: true
    };
  }

  componentWillReceiveProps(props) {
    if (props.dialogInit) {
      console.log(`11111111111 props.brightP=${ props.brightP }`);
      if (props.colorP) {
        mColorPec = props.colorP;
        this.setState({ color_temperature: mColorPec });
      }

      if (props.brightP) {
        mBrightPec = props.brightP;
        this.setState({ brightness: parseInt(mBrightPec) });
      }
    }
  }


  generateArrayFromRange(start, finish) {
    return Array.apply(null, Array(finish - start + 1)).map((_, i) => start + i);
  }

  componentWillMount() {

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
          backgroundColor: '#fff',
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          paddingTop: 24,
          paddingBottom: 17
        }}>
        {this.props.title ? this._titleView() : null}
        {this.props.value ? this._valueView() : null}

        <View style={{
          width: '100%',
          paddingVertical: 20,
          paddingHorizontal: 20,
          borderRadius: 12,
          marginTop: 12,
          backgroundColor: '#xmfff'
        }}>
          <View
            style={{}}>
            <View
              style={{
                width: '100%',
                height: 48,
                position: 'absolute',
                borderRadius: 48 / 2,
                overflow: 'hidden'
              }}>
              <View
                style={{
                  width: '100%',
                  height: 48,
                  position: 'absolute',
                  backgroundColor: '#F5F5F5',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 15,
                  paddingRight: 15
                }}>
                <Image
                  source={require('../../resources/bright_low_dis_ic.png')}/>
                <View
                  style={{
                    flex: 1
                  }}/>
                <Image
                  source={require('../../resources/bright_high_dis_ic.png')}/>
              </View>

              <View
                style={{
                  // width: ((this.mScreenWidth) - 40) * ((this.state.brightness != 1 ? this.state.brightness + 1 : 1) / 100),
                  width: ((this.mScreenWidth) - 40) * (this.state.brightness / 100),
                  height: 48,
                  position: 'absolute',
                  backgroundColor: '#FFBC39',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}/>

              <View
                style={{
                  width: '100%',
                  height: 48,
                  position: 'absolute',
                  borderRadius: 48 / 2,
                  paddingLeft: 15,
                  paddingRight: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                {
                  this.state.brightness > 8 ? <Image
                    source={require('../../resources/bright_low_white_ic.png')}/> : null
                }

                <View
                  style={{
                    flex: 1
                  }}/>

                {
                  this.state.brightness > 95 ? <Image
                    source={require('../../resources/bright_high_white_ic.png')}/> : null
                }
              </View>
            </View>


            <SlideGear
              blockStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
              showEndText={false}
              options={this.generateArrayFromRange(1, 101)}
              containerStyle={{ width: '100%', height: 48 }}
              value={parseInt(this.state.brightness)}
              onValueChange={(value) => {
                if (value == 0) {
                  value = 1;
                }
                this.setState({ init: false });
                mBrightPec = parseInt(value);
                if (this.props.sliderEvent) {
                  this.props.sliderEvent(mColorPec, mBrightPec);
                }
                this.setState({ brightness: value });
              }}
              onSlidingComplete={(value) => {

              }}
              minimumTrackTintColor={'rgba(0,0,0,0)'}
              maximumTrackTintColor={'rgba(0,0,0,0)'}
            />
          </View>

        </View>

        <View
          style={{
            marginTop: 26,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <LinearGradient
            start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}
            colors={['#F0F6FF', '#FCD981', '#F99B3E']}
            style={{
              width: '90%',
              height: 48,
              position: 'absolute',
              borderRadius: 48 / 2
            }}/>
          <SlideGear
            blockStyle={{ backgroundColor: '#xmfff' }}
            showEndText={false}
            options={this.generateArrayFromRange(colorMin, colorMax)}
            containerStyle={{ width: '90%', height: 48 }}
            value={this.state.color_temperature - colorMin}
            onValueChange={(value) => {
              this.setState({ init: false });
              mColorPec = parseInt(value + colorMin);
              if (this.props.sliderEvent) {
                this.props.sliderEvent(mColorPec, mBrightPec);
              }
              this.setState({ color_temperature: value });
            }}
            onSlidingComplete={(value) => {

            }}
            minimumTrackTintColor={'rgba(0,0,0,0)'}
            maximumTrackTintColor={'rgba(0,0,0,0)'}
          />
        </View>

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
          {`${ HomeLocalizableString.brightness2(mBrightPec) } ${ HomeLocalizableString.temp2(mColorPec) }`}
        </Text>
      </View>
    );
  }

  _btnView() {
    return (
      <View
        style={{
          paddingLeft: 20,
          alignSelf: 'center',
          paddingRight: 20,
          flexDirection: 'row',
          width: this.mScreenWidth - 20 - 6,
          marginTop: 37
        }}>
        {this._btnItemView(this.props.cancelText, this.props.cancelTextColor, this.props.cancelEvent)}
        <View
          style={{
            width: 12,
            height: 1
          }}/>
        {this._btnItemView(this.props.sureText, this.props.sureTextColor, this.props.sureEvent)}
      </View>
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
          this.setState({ init: true });
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