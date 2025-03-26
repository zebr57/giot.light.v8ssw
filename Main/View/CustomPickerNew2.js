import React, { Component, UIManager } from 'react';

import {
  Text,
  View,
  Animated,
  TouchableOpacity,
  Alert, Platform
} from 'react-native';

import PickerView from './PickerView';

import BaseDialog from './BaseDialog';

export default class CustomPickerNew2 extends BaseDialog {
    static defaultProps = {
      removeSubviews: false,
      selectedValue: [1],
      selectedValue2: [1],
      areaJson: [1, 2, 3, 4, 5, 6],
      areaJson2: [1, 2, 3, 4, 5, 6],
      confirmText: '确定',
      confirmTextSize: 16,
      confirmTextColor: '#333333',
      cancelText: '取消',
      cancelTextSize: 16,
      cancelTextColor: '#333333',
      itemTextColor: 0x333333ff,
      itemSelectedColor: 0x1097D5ff,
      itemHeight: 40,
      onPickerCancel: null,
      onPickerConfirm: null,
      title: '',
      unitVisible: false,
      unitHour: '时',
      unitMin: '分'
    }

    constructor(props) {
      super(props);
      this.state = {
        areaData: this.props.areaJson,
        areaData2: this.props.areaJson2,
        path: new Animated.Value(0),
        testSelect: this.props.selectedValue,
        testSelect2: this.props.selectedValue2
      };
    }

    _getContentPosition() {
      return { justifyContent: 'flex-end', alignItems: 'center' };
    }

    renderContent() {
      let selectedIndex = 0;
      let selectedIndex2 = 0;
      let length = this.state.areaData.length;
      let length2 = this.state.areaData2.length;
      for (let i = 0; i < length; i++) {
        if (this.props.areaJson[i] == this.props.selectedValue) {
          selectedIndex = i;
          break;
        }
      }
      for (let i = 0; i < length2; i++) {
        if (this.props.areaJson2[i] == this.props.selectedValue2) {
          selectedIndex2 = i;
          break;
        }
      }
      return <View
        style={{
          height: this.props.itemHeight * 5 + this.getSize(15) + this.getSize(44), width: this.mScreenWidth,
          backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff'
        }}>
        <View style={{
          width: this.mScreenWidth,
          height: this.props.itemHeight * 5 + this.getSize(15),
          flexDirection: 'row',
          position: 'absolute',
          bottom: 0,
          justifyContent: 'center'
        }}>
          <PickerView
            itemTextColor={this.props.itemTextColor}
            itemSelectedColor={this.props.itemSelectedColor}
            list={this.props.areaJson}
            onPickerSelected={(toValue) => {
              this.props.selectedValue = toValue;
              this.state.testSelect = toValue;
              this.setState();
            }}
            selectedIndex={selectedIndex}
            fontSize={this.getSize(20)}
            itemWidth={this.props.unitVisible ? this.mScreenWidth / 3 : this.mScreenWidth / 2}
            itemHeight={this.getSize(40)}/>
          <View style={{
            height: this.props.itemHeight * 5 + this.getSize(15) - 10,
            justifyContent: 'center'
          }}>
            <Text style={{
              textAlign: 'center',
              justifyContent: 'center',
              color: '#000',
              fontSize: 18,
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}> {this.props.unitVisible ? this.props.unitHour : ''}
            </Text>
          </View>
          <PickerView
            itemTextColor={this.props.itemTextColor}
            itemSelectedColor={this.props.itemSelectedColor}
            list={this.props.areaJson2}
            onPickerSelected={(toValue) => {
              this.props.selectedValue2 = toValue;
              this.state.testSelect2 = toValue;
              this.setState();
            }}
            selectedIndex={selectedIndex2}
            fontSize={this.getSize(20)}
            itemWidth={this.props.unitVisible ? this.mScreenWidth / 3 : this.mScreenWidth / 2}
            itemHeight={this.getSize(40)}/>
          <View style={{
            height: this.props.itemHeight * 5 + this.getSize(15) - 10,
            justifyContent: 'center'
          }}>
            <Text style={{
              textAlign: 'center',
              justifyContent: 'center',
              color: '#000',
              fontSize: 18,
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}> {this.props.unitVisible ? this.props.unitMin : ''}
            </Text>
          </View>
        </View>
        <View style={{
          width: this.mScreenWidth, height: this.getSize(44),
          backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff', flexDirection: 'row',
          justifyContent: 'space-between', position: 'absolute', top: 0
        }}>
          <TouchableOpacity
            onPress={() => {
              this.dismiss(() => {
                this.props.onPickerCancel && this.props.onPickerCancel();
              });
            }}
            style={{
              width: this.getSize(90),
              height: this.getSize(44),
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Text style={{
              fontSize: this.props.cancelTextSize,
              fontWeight: '600',
              color: this.props.cancelTextColor,
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}>{this.props.cancelText}</Text>
          </TouchableOpacity>
          <View
            style={{
              height: this.getSize(44),
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Text
              style={{
                fontSize: this.props.confirmTextSize,
                fontWeight: '800',
                color: this.props.confirmTextColor,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{this.props.title}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.dismiss(() => {
                this.props.onPickerConfirm && this.props.onPickerConfirm([this.state.testSelect, this.state.testSelect2]);
              });
            }}
            style={{
              width: this.getSize(72),
              height: this.getSize(44),
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Text style={{
              fontSize: this.props.confirmTextSize,
              fontWeight: '600',
              color: this.props.confirmTextColor,
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}>{this.props.confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>;
    }
}
