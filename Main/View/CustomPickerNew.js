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

export default class CustomPickerNew extends BaseDialog {
    static defaultProps = {
      removeSubviews: false,
      selectedValue: [4],
      areaJson: [1, 2, 3, 4, 5, 6],
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
      title: '666'
    }

    constructor(props) {
      super(props);
      this.state = {
        areaData: this.props.areaJson,
        path: new Animated.Value(0),
        testSelect: this.props.selectedValue
      };
    }

    _getContentPosition() {
      return { justifyContent: 'flex-end', alignItems: 'center' };
    }

    componentDidMount() {
      // Alert.alert(this.props.selectedValue + '--' + this.state.testSelect)
    }

    renderContent() {
      let selectedIndex = 0;
      let length = this.state.areaData.length;
      for (let i = 0; i < length; i++) {
        if (this.props.areaJson[i] == this.props.selectedValue) {
          selectedIndex = i;
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
          bottom: 0
        }}>
          <PickerView
            itemTextColor={this.props.itemTextColor}
            itemSelectedColor={this.props.itemSelectedColor}
            list={this.props.areaJson}
            onPickerSelected={(toValue) => {
              this.props.selectedValue = toValue;
              this.setState({ testSelect: toValue });
            }}
            selectedIndex={selectedIndex}
            fontSize={this.getSize(18)}
            itemWidth={this.mScreenWidth}
            itemHeight={this.getSize(40)}/>
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
              width: this.getSize(70),
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
                this.props.onPickerConfirm && this.props.onPickerConfirm(this.state.testSelect);
              });
            }}
            style={{
              width: this.getSize(70),
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
