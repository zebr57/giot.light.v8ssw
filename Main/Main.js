import BaseComponent from '../Main/Base/BaseComponent';
import {
  Animated,
  DeviceEventEmitter,
  Easing,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import React from "react";
import {
  Bluetooth,
  BluetoothEvent,
  DarkMode,
  Device,
  DeviceEvent,
  Host,
  Package,
  PackageEvent,
  Service
} from "../../../miot-sdk";
import HomeLocalizableString from './HomeLocalizableString';
import NavigationBar from "miot/ui/NavigationBar";
import InputDialog from "./View/InputDialog";
import { LoadingDialog, MessageDialog } from "miot/ui";
import MHCard from "miot/ui/Card/MHCard";
import IconButton from "./View/IconButton";
import MyModeButton from "./View/MyModeButton";
import { Theme } from "./theme";
import SlideGear from "miot/ui/Gear/SlideGear";
import BrightnessLightDialog from "./View/BrightnessLightDialog";
import BrightnessLightDialog2 from "./View/BrightnessLightDialog2";
import LinearGradient from "react-native-linear-gradient";
import { colorGetterforRange } from 'miot/utils/colors';
import DataUtils from "./Utils/DataUtils";

const circle = require('../resources/connecting_ic.png');

export const RangeForColorTemperature = {
  '0.00': '#EDF4FF',
  '0.166': '#EDF4FF',
  '0.332': '#FEFDD9',
  '0.5': '#FBD26C',
  '0.666': '#FFB127',
  '0.832': '#FF9E42',
  '1.00': '#F67F00'
};

const ColorTemperatureGetter = colorGetterforRange(RangeForColorTemperature);

function getColorTemperaturePercent(v, [min, max]) {
  return 100 - (v < min ? 0 : v > max ? 100 : min === max ? 50 : ((v - min) / (max - min) * 100));
}

const getPropsPara =
    [{ did: Device.deviceID, siid: 2, piid: 1 },
      { did: Device.deviceID, siid: 2, piid: 2 },
      { did: Device.deviceID, siid: 2, piid: 3 },
      { did: Device.deviceID, siid: 2, piid: 7 },
      { did: Device.deviceID, siid: 4, piid: 1 },
      { did: Device.deviceID, siid: 4, piid: 2 },
      { did: Device.deviceID, siid: 4, piid: 3 },
      { did: Device.deviceID, siid: 4, piid: 4 },
      { did: Device.deviceID, siid: 4, piid: 5 },
      { did: Device.deviceID, siid: 4, piid: 6 },
      { did: Device.deviceID, siid: 4, piid: 8 },
      { did: Device.deviceID, siid: 4, piid: 9 },
      { did: Device.deviceID, siid: 4, piid: 7 },
      { did: Device.deviceID, siid: 4, piid: 10 },
      { did: Device.deviceID, siid: 4, piid: 11 },
      { did: Device.deviceID, siid: 4, piid: 12 },
      { did: Device.deviceID, siid: 4, piid: 13 },
      { did: Device.deviceID, siid: 4, piid: 14 }];


const leedarGetPropsPara =
    [{ did: Device.deviceID, siid: 2, piid: 1 },
      { did: Device.deviceID, siid: 2, piid: 2 },
      { did: Device.deviceID, siid: 2, piid: 3 },
      { did: Device.deviceID, siid: 2, piid: 7 },
      { did: Device.deviceID, siid: 4, piid: 9 },
      { did: Device.deviceID, siid: 4, piid: 10 },
      { did: Device.deviceID, siid: 4, piid: 8 },
      { did: Device.deviceID, siid: 4, piid: 1 }];


const encryptionPropsPara =
    [{ did: Device.deviceID, siid: 4, piid: 24 }];

const encryptionPropsPara2 =
    [{ did: Device.deviceID, siid: 4, piid: 25 }];


let msgSubscription = null;

let that;
let show = false;
let _showDot1;

let colorMax = Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 5700 : 6500;
let colorMin = 2700;

const bt = Device.getBluetoothLE();
let statusEnable = false;
let retryGetProp = 0;
let scanNum = 0;

let b;
let t;

// 准备发送的数据队列
let waitToSendDatas = [];
let isFree = true;

// 是否加密
// let isEncryption = true
let isEncryption = Device.model == 'rjxn20.light.rjdhts' || Device.model == 'rjxn20.light.rjxndd' || Device.model == 'rjxn20.light.rjxncx' || Device.model == 'znsn.light.v5ssw';
let md5Res;
// 是否加密
let deviceInfo1 = '';
let deviceInfo2 = '';

let tryTime = 0;

export default class Main extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
      return {
        header: null
      };
    };

    constructor(props) {
      super(props);
      that = this;
      const colorScheme = DarkMode.getColorScheme();
      this.state = {
        bottomHeight: 0,
        topHeight: 0,
        lightBarHeight: 184,
        lightBarProgress: this.mScreenHeight / 3,
        lightSwitchMarTop: 0,
        modalVisible: false,
        colorBarWidth: 0,
        colorBarHeight: 0,
        colorBarSwitchMarLeft: this.mScreenWidth / 2,

        bgColor: '233,144,54', // 背景颜色
        bgAlpha: 1, // 背景颜色透明度

        isUpDownScroll: false,
        isLRScroll: false,

        lightPower: false, // 灯开关
        brightness: 100, // 亮度  最小值:1  最大值:100
        temp_brightness: 0,
        color_temperature: 3400, // 色温  最小值:colorMin 最大值:colorMax
        mode: 0,
        scrollFinished: true,
        startBright: 0,
        startColor: 0,
        awake: false,
        lockMode: 0,
        isShowHelpLight: false,
        helpLight: false,

        dialogInit: true,

        lightBarFirst: true,
        colorBarFirst: true,

        animRuning: false,

        lastControlBrightOrTemp: 0,

        collectInputNameDialog: false,
        dialog: false,
        lastControlTime: 0,
        lastControlTimeSlide: 0,

        did: Device.deviceID,
        chars: {},
        services: [],
        isEnable: false,
        connectState: HomeLocalizableString.unconnected,
        btConnect: false,
        blueConnecting: false,
        testCharNotify: false,

        devFinalOffline: false,
        scType: Platform.OS === 'android' ? 5 : 4,
        saveBtnEnable: false,
        useDataName: '',
        loadingVis: false,
        birghtnessLightVis: false,
        birghtnessLightVis2: false,

        dialogBrightness: 0,
        dialogColorTemperature: 0,

        curMode: 0,
        mode1: '100,4600',
        mode2: Device.model == 'nvcsmt.light.bas202'
            || Device.model == 'nvcsmt.light.bcs201' ? '100,5700' :
          Device.model == 'leedar.light.600'
                || Device.model == 'giot.light.v8ssm'
                || Device.model == 'giot.light.dblgt2'
                || Device.model == 'giot.light.v8ssw'
                || Device.model == 'giot.light.dblgt1'
                || Device.model == 'giot.light.hwzd1'
                || Device.model == 'giot.light.xwzd1'
                || Device.model == 'leedar.light.1050'
                || Device.model == 'leedar.light.470'
                || Device.model == 'leedar.light.p470'
                || Device.model == 'leedar.light.345'
                || Device.model == 'leedar.light.345a'
                || Device.model == 'devcea.light.ls2302'
                || Device.model == 'devcea.light.ls2303'
                || Device.model == 'devcea.light.ls2304'
                || Device.model == 'devcea.light.ls2305'
                || Device.model == 'devcea.light.ls2306' ? '100,2700' : '100,6500',
        mode3: Device.model == 'leedar.light.600'
            || Device.model == 'giot.light.v8ssm'
            || Device.model == 'giot.light.dblgt2'
            || Device.model == 'giot.light.v8ssw'
            || Device.model == 'giot.light.dblgt1'
            || Device.model == 'giot.light.hwzd1'
            || Device.model == 'giot.light.xwzd1'
            || Device.model == 'leedar.light.1050'
            || Device.model == 'leedar.light.470'
            || Device.model == 'leedar.light.p470'
            || Device.model == 'leedar.light.345'
            || Device.model == 'leedar.light.345a'
            || Device.model == 'devcea.light.ls2302'
            || Device.model == 'devcea.light.ls2303'
            || Device.model == 'devcea.light.ls2304'
            || Device.model == 'devcea.light.ls2305'
            || Device.model == 'devcea.light.ls2306' ? '100,6500' : '100,2700',
        mode4: '1,4600',
        // theme
        colorScheme,
        isScroll: false,

        pairFail: false,
        finalPairFail: false,
        isCheckEncryption: false,

        curRoutesLength: 1,
        curRoutesName: 'Home'
      };

      this.lastDx = 0;
      this.lastDy = 0;

      this.spinValue = new Animated.Value(0);
    }

    getEncryptionByBLE() {
      let mac = Device.mac.toString().slice(0, 2)
            + Device.mac.toString().slice(3, 5)
            + Device.mac.toString().slice(6, 8)
            + Device.mac.toString().slice(9, 11)
            + Device.mac.toString().slice(12, 14)
            + Device.mac.toString().slice(15, 17);

      // let mac = '121233456789'
      let array = this.hexString2Bytes(mac);
      let a = array[0] ^ array[5];
      let b = array[1] ^ array[5];
      let c = array[2] ^ array[5];
      let d = array[3] ^ array[5];
      let e = array[4] ^ array[5];
      let f = array[5];
      let arrBytes = [];
      arrBytes.push(a);
      arrBytes.push(b);
      arrBytes.push(c);
      arrBytes.push(d);
      arrBytes.push(e);
      arrBytes.push(f);
      let hexString = this.bytesToHexString(arrBytes).toUpperCase();
      Host.crypto.encodeMD5(hexString).then((res) => {
        console.log(`md5 res: ${ res }`);
        md5Res = res;

        let prop = {
          "siid": 3,
          "piid": 24
        };
        let props = [];
        props.push(prop);
        let entity = { "objects": props };
        let json = JSON.stringify(entity);
        this.addLog(`get Property params ${ json }`);
        Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
          this.addLog(`device info 1 :${ JSON.stringify(data) }`);
          let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

          if (jsonData.objects[0].code == 0) {
            deviceInfo1 = jsonData.objects[0].value.toString(16);
            if (deviceInfo1.length < 8) {
              deviceInfo1 = `0${ deviceInfo1 }`;
            }

            let prop = {
              "siid": 3,
              "piid": 25
            };
            let props = [];
            props.push(prop);
            let entity = { "objects": props };
            let json = JSON.stringify(entity);
            this.addLog(`get Property params ${ json }`);

            Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
              this.addLog(`device info 2 :${ JSON.stringify(data) }`);
              let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

              if (jsonData.objects[0].code == 0) {
                deviceInfo2 = jsonData.objects[0].value.toString(16);
                if (deviceInfo2.length < 8) {
                  deviceInfo2 = `0${ deviceInfo2 }`;
                }

                if (deviceInfo1 == '' || deviceInfo2 == '') {
                  return;
                }
                let result = (deviceInfo1 + deviceInfo2).toUpperCase();

                console.log(`rusult=${ result }`);
                if (md5Res.toString().toUpperCase().indexOf(result) != -1) {
                  // 匹配成功
                  console.log('加密匹配成功');
                  this.setState({ pairFail: false });
                  this.setState({ finalPairFail: false });
                  this._getPropsSpecBle1();
                } else {
                  if (tryTime >= 3) {
                    // 匹配失败
                    console.log('加密匹配失败');
                    this.setState({ pairFail: true });
                    this.setState({ finalPairFail: true });
                  } else {
                    console.log('加密重试中');
                    tryTime++;
                    this.reTryEncryptionTimer = setTimeout(() => {
                      this.getEncryptionByBLE();
                    }, 250);
                  }
                }
              } else {
                // 属性二获取异常
                if (tryTime >= 3) {
                  // 匹配失败
                  console.log('加密匹配失败');
                  this.setState({ pairFail: true });
                  this.setState({ finalPairFail: true });
                } else {
                  console.log('加密重试中');
                  tryTime++;
                  this.reTryEncryptionTimer = setTimeout(() => {
                    this.getEncryptionByBLE();
                  }, 250);
                }
              }
            });
          } else {
            // 属性一获取异常
            if (tryTime >= 3) {
              // 匹配失败
              console.log('加密匹配失败');
              this.setState({ pairFail: true });
              this.setState({ finalPairFail: true });
            } else {
              console.log('加密重试中');
              tryTime++;
              this.reTryEncryptionTimer = setTimeout(() => {
                this.getEncryptionByBLE();
              }, 250);
            }
          }
        });
      }).catch((err) => {
        console.log(`md5 failed: ${ err }`);
      });
    }


    getEncryption() {
      let mac = Device.mac.toString().slice(0, 2)
            + Device.mac.toString().slice(3, 5)
            + Device.mac.toString().slice(6, 8)
            + Device.mac.toString().slice(9, 11)
            + Device.mac.toString().slice(12, 14)
            + Device.mac.toString().slice(15, 17);
      let array = this.hexString2Bytes(mac);
      let a = array[0] ^ array[5];
      let b = array[1] ^ array[5];
      let c = array[2] ^ array[5];
      let d = array[3] ^ array[5];
      let e = array[4] ^ array[5];
      let f = array[5];
      let arrBytes = [];
      arrBytes.push(a);
      arrBytes.push(b);
      arrBytes.push(c);
      arrBytes.push(d);
      arrBytes.push(e);
      arrBytes.push(f);
      let hexString = this.bytesToHexString(arrBytes).toUpperCase();
      Host.crypto.encodeMD5(hexString).then((res) => {
        console.log(`md5 res: ${ res }`);
        md5Res = res;
        Service.spec.getPropertiesValue(encryptionPropsPara)
          .then((res) => { // 请求成功
            console.log(`encryptionPropsPara ${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
            if (res[0].code == 0) {
              deviceInfo1 = res[0].value.toString(16);
              if (deviceInfo1.length < 8) {
                deviceInfo1 = `0${ deviceInfo1 }`;
              }


              Service.spec.getPropertiesValue(encryptionPropsPara2)
                .then((res) => { // 请求成功
                  console.log(`encryptionPropsPara ${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
                  if (res[0].code == 0) {
                    deviceInfo2 = res[0].value.toString(16);
                    if (deviceInfo2.length < 8) {
                      deviceInfo2 = `0${ deviceInfo2 }`;
                    }

                    if (deviceInfo1 == '' || deviceInfo2 == '') {
                      if (tryTime >= 5) {
                        // 匹配失败
                        console.log('加密匹配失败');
                        this.setState({ pairFail: true });
                        this.setState({ finalPairFail: true });
                      } else {
                        console.log('加密重试中');
                        tryTime++;
                        this.reTryEncryptionTimer = setTimeout(() => {
                          this.getEncryption();
                        }, 500);
                      }
                    } else {
                      let result = (deviceInfo1 + deviceInfo2).toUpperCase();
                      console.log(`rusult=${ result }`);
                      if (md5Res.toString().toUpperCase().indexOf(result) != -1) {
                        // 匹配成功
                        console.log('加密匹配成功');
                        this.setState({ pairFail: false });
                        this.setState({ finalPairFail: false });
                      } else {
                        if (tryTime >= 5) {
                          // 匹配失败
                          console.log('加密匹配失败');
                          this.setState({ pairFail: true });
                          this.setState({ finalPairFail: true });
                        } else {
                          console.log('加密重试中');
                          tryTime++;
                          this.reTryEncryptionTimer = setTimeout(() => {
                            this.getEncryption();
                          }, 500);
                        }
                      }
                    }
                  } else {
                    // 获取属性2失败
                    if (tryTime >= 5) {
                      // 匹配失败
                      console.log('加密匹配失败');
                      this.setState({ pairFail: true });
                      this.setState({ finalPairFail: true });
                    } else {
                      console.log('加密重试中');
                      tryTime++;
                      this.reTryEncryptionTimer = setTimeout(() => {
                        this.getEncryption();
                      }, 500);
                    }
                  }
                }).catch((error) => {
                  console.log('getPropertiesValue error ', error);
                });
            } else {
              // 获取属性1失败
              if (tryTime >= 5) {
                // 匹配失败
                console.log('加密匹配失败');
                this.setState({ pairFail: true });
                this.setState({ finalPairFail: true });
              } else {
                console.log('加密重试中');
                tryTime++;
                this.reTryEncryptionTimer = setTimeout(() => {
                  this.getEncryption();
                }, 500);
              }
            }
          }).catch((error) => {
            console.log('getPropertiesValue error ', error);
          });
      }).catch((err) => {
        console.log(`md5 failed: ${ err }`);
      });
    }

    bytesToHexString(arrBytes) {
      let str = "";
      for (let i = 0; i < arrBytes.length; i++) {
        var tmp;
        let num = arrBytes[i];
        if (num < 0) {
          // 此处填坑，当byte因为符合位导致数值为负时候，需要对数据进行处理
          tmp = (255 + num + 1).toString(16);
        } else {
          tmp = num.toString(16);
        }
        if (tmp.length == 1) {
          tmp = `0${ tmp }`;
        }
        str += tmp;
      }
      return str;
    }

    // 十六进制字符串转换为字节数组
    hexString2Bytes(str) {
      let pos = 0;
      let len = str.length;
      if (len % 2 != 0) {
        return null;
      }
      len /= 2;
      let arrBytes = new Array();
      for (let i = 0; i < len; i++) {
        let s = str.substr(pos, 2);
        let v = parseInt(s, 16);
        arrBytes.push(v);
        pos += 2;
      }
      return arrBytes;
    }

    get colorScheme() {
      return this.state.colorScheme;
    }

    _startScrollTime() {
      this.intervalScroll = setInterval(() => {
        this.setState((previousState) => {
          return {
            scrollFinished: true
          };
        });
        this._stopScrollTime();
      }, 2000);
    }

    _stopScrollTime() { // 停止计时
      if (this.intervalScroll) {
        clearInterval(this.intervalScroll);
      }
    }

    _getPropsSpec() {
      retryGetProp = 0;
      if (this.state.btConnect) {
        this._subscribeProps();
      } else {
        if (Device.model == 'leedar.light.600'
                || Device.model == 'leedar.light.1050'
                || Device.model == 'leedar.light.470'
                || Device.model == 'leedar.light.p470'
                || Device.model == 'leedar.light.345'
                || Device.model == 'leedar.light.345a'
                || Device.model == 'devcea.light.ls2302'
                || Device.model == 'devcea.light.ls2303'
                || Device.model == 'devcea.light.ls2304'
                || Device.model == 'devcea.light.ls2305'
                || Device.model == 'devcea.light.ls2306') {
          Service.spec.getPropertiesValue(leedarGetPropsPara)
            .then((res) => { // 请求成功
              console.log(`aaaa ${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
              this.setState({
                lightPower: res[0].value,
                mode: res[3].value,
                startBright: res[4].value,
                acStatus: res[7].value
              });

              if (res[1].code == 0) {
                this.setState({ brightness: res[1].value });

                // 起码有一个属性成功了
                this._startGetEncryption();
              }

              if (res[2].code == 0) {
                this.setState({ color_temperature: res[2].value });
              }

              if (res[5].code == 0) {
                this.setState({ startColor: res[5].value });
              }

              if (res[6].code == 0) {
                this.setState({ awake: res[6].value });
              }

              this.setState({
                temp_brightness: res[1].value
              });

              if (res[0].value) {
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.LIGHT,
                  backgroundColor: ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(this.state.color_temperature, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(this.state.brightness * (185 / 100) + 70)).toString(16),
                  title: Device.name
                });
              } else {
                this.setState({ birghtnessLightVis: false });
                this.setState({ birghtnessLightVis2: false });
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.DARK,
                  backgroundColor: 'rgb(14,10,28)',
                  title: Device.name
                });
              }

              // 设置lightBar/colorBar
              this._setBrightNess(res[1].value ? res[1].value : 1);
              this._setColorTemp(res[2].value ? (res[2].value - colorMin) : 0);
            }).catch((error) => {
              console.log('getPropertiesValue error ', error);
            });
        } else {
          Service.spec.getPropertiesValue(getPropsPara)
            .then((res) => { // 请求成功
              console.log(`aaaa ${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
              this.setState({
                lightPower: res[0].value,
                mode: res[3].value
              });
              DataUtils.setLightPower(res[0].value);

              if (res[1].code == 0) {
                this.setState({ brightness: res[1].value });
                DataUtils.setBrightness(res[1].value);
                // 起码有一个属性成功了
                this._startGetEncryption();
              }

              if (res[2].code == 0) {
                this.setState({ color_temperature: res[2].value });
                DataUtils.setColorTemperature(res[2].value);
              }

              this.setState({
                temp_brightness: res[1].value
              });

              if (res[4].code == 0) {
                DataUtils.parse3_1(res[4].value);
                this.setState({ isShowHelpLight: DataUtils.getHelpLight()[0] });
                this.setState({ helpLight: DataUtils.getHelpLight()[1] });
                this.setState({ acStatus: DataUtils.getAcStatus() });
              }

              if (res[5].code == 0) {
                DataUtils.parse3_2(res[5].value);
                this.setState({ startColor: DataUtils.getAwakeData()[6] });
                this.setState({ startBright: DataUtils.getAwakeData()[4] });
                this.setState({ awake: DataUtils.getAwakeData()[3] });
              }

              if (res[6].code == 0) {
                DataUtils.parse3_3(res[6].value);
              }

              if (res[7].code == 0) {
                DataUtils.parse3_4(res[7].value);
              }

              if (res[8].code == 0) {
                DataUtils.parse3_5(res[8].value);
              }

              if (res[9].code == 0) {
                DataUtils.parse3_6(res[9].value);
              }

              if (res[10].code == 0) {
                // 呼吸
                DataUtils.parse3_8(res[10].value);
              }

              if (res[11].code == 0) {
                // 律动
                DataUtils.parse3_9(res[11].value);
              }

              // 节律
              if (res[12].code == 0) {
                DataUtils.parse3_7(res[12].value);
              }
              if (res[13].code == 0) {
                DataUtils.parse3_10(res[13].value);
              }
              if (res[14].code == 0) {
                DataUtils.parse3_11(res[14].value);
              }
              if (res[15].code == 0) {
                DataUtils.parse3_12(res[15].value);
              }
              if (res[16].code == 0) {
                DataUtils.parse3_13(res[16].value);
              }
              if (res[17].code == 0) {
                DataUtils.parse3_14(res[17].value);
              }


              if (res[0].value) {
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.LIGHT,
                  backgroundColor: ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(this.state.color_temperature, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(this.state.brightness * (185 / 100) + 70)).toString(16),
                  title: Device.name
                });
              } else {
                this.setState({ birghtnessLightVis: false });
                this.setState({ birghtnessLightVis2: false });
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.DARK,
                  backgroundColor: 'rgb(14,10,28)',
                  title: Device.name
                });
              }

              // 设置lightBar/colorBar
              this._setBrightNess(res[1].value ? res[1].value : 1);
              this._setColorTemp(res[2].value ? (res[2].value - colorMin) : 0);
            }).catch((error) => {
              console.log('getPropertiesValue error ', error);
            });
        }
      }
    }

    _getPropsSpec2() {
      retryGetProp = 0;
      if (this.state.btConnect) {
        this._getPropsSpecBle1();
      } else {
        if (Device.model == 'leedar.light.600'
                || Device.model == 'leedar.light.1050'
                || Device.model == 'leedar.light.470'
                || Device.model == 'leedar.light.p470'
                || Device.model == 'leedar.light.345'
                || Device.model == 'leedar.light.345a'
                || Device.model == 'devcea.light.ls2302'
                || Device.model == 'devcea.light.ls2303'
                || Device.model == 'devcea.light.ls2304'
                || Device.model == 'devcea.light.ls2305'
                || Device.model == 'devcea.light.ls2306') {
          Service.spec.getPropertiesValue(leedarGetPropsPara)
            .then((res) => { // 请求成功
              console.log(`aaaa ${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
              this.setState({
                lightPower: res[0].value,
                mode: res[3].value,
                startBright: res[4].value,
                acStatus: res[7].value
              });

              if (res[1].code == 0) {
                this.setState({ brightness: res[1].value });

                // 起码有一个属性成功了
                this._startGetEncryption();
              }

              if (res[2].code == 0) {
                this.setState({ color_temperature: res[2].value });
              }

              if (res[5].code == 0) {
                this.setState({ startColor: res[5].value });
              }

              if (res[6].code == 0) {
                this.setState({ awake: res[6].value });
              }

              this.setState({
                temp_brightness: res[1].value
              });

              if (res[0].value) {
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.LIGHT,
                  backgroundColor: ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(this.state.color_temperature, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(this.state.brightness * (185 / 100) + 70)).toString(16),
                  title: Device.name
                });
              } else {
                this.setState({ birghtnessLightVis: false });
                this.setState({ birghtnessLightVis2: false });
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.DARK,
                  backgroundColor: 'rgb(14,10,28)',
                  title: Device.name
                });
              }

              // 设置lightBar/colorBar
              this._setBrightNess(res[1].value ? res[1].value : 1);
              this._setColorTemp(res[2].value ? (res[2].value - colorMin) : 0);
            }).catch((error) => {
              console.log('getPropertiesValue error ', error);
            });
        } else {
          Service.spec.getPropertiesValue(getPropsPara)
            .then((res) => { // 请求成功
              console.log(`aaaa ${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
              this.setState({
                lightPower: res[0].value,
                mode: res[3].value
              });
              DataUtils.setLightPower(res[0].value);

              if (res[1].code == 0) {
                this.setState({ brightness: res[1].value });

                DataUtils.setBrightness(res[1].value);
                // 起码有一个属性成功了
                this._startGetEncryption();
              }

              if (res[2].code == 0) {
                this.setState({ color_temperature: res[2].value });
                DataUtils.setColorTemperature(res[2].value);
              }

              this.setState({
                temp_brightness: res[1].value
              });

              if (res[4].code == 0) {
                DataUtils.parse3_1(res[4].value);
                this.setState({ isShowHelpLight: DataUtils.getHelpLight()[0] });
                this.setState({ helpLight: DataUtils.getHelpLight()[1] });
                this.setState({ acStatus: DataUtils.getAcStatus() });
              }

              if (res[5].code == 0) {
                DataUtils.parse3_2(res[5].value);
                this.setState({ startColor: DataUtils.getAwakeData()[6] });
                this.setState({ startBright: DataUtils.getAwakeData()[4] });
                this.setState({ awake: DataUtils.getAwakeData()[3] });
              }

              if (res[6].code == 0) {
                DataUtils.parse3_3(res[6].value);
              }

              if (res[7].code == 0) {
                DataUtils.parse3_4(res[7].value);
              }

              if (res[8].code == 0) {
                DataUtils.parse3_5(res[8].value);
              }

              if (res[9].code == 0) {
                DataUtils.parse3_6(res[9].value);
              }

              if (res[0].value) {
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.LIGHT,
                  backgroundColor: ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(this.state.color_temperature, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(this.state.brightness * (185 / 100) + 70)).toString(16),
                  title: Device.name
                });
              } else {
                this.setState({ birghtnessLightVis: false });
                this.setState({ birghtnessLightVis2: false });
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.DARK,
                  backgroundColor: 'rgb(14,10,28)',
                  title: Device.name
                });
              }

              // 设置lightBar/colorBar
              this._setBrightNess(res[1].value ? res[1].value : 1);
              this._setColorTemp(res[2].value ? (res[2].value - colorMin) : 0);
            }).catch((error) => {
              console.log('getPropertiesValue error ', error);
            });
        }
      }
    }

    _subscribeProps() {
      if (this.state.btConnect) {
        bt.unsubscribeMessages();
        bt.subscribeMessages('prop.2.1', 'prop.2.2', 'prop.2.3', 'prop.2.7',
          'prop.4.1', 'prop.4.2', 'prop.4.3', 'prop.4.4', 'prop.4.5', 'prop.4.6', 'prop.4.8', 'prop.4.9').then((subcription) => {
          // 订阅成功
          console.log('订阅成功');

          if (parseInt(this.state.curRoutesLength) > 1) {
            return;
          }

          if (isEncryption) {
            if (this.state.isCheckEncryption) {
              return;
            }
            this.setState({ isCheckEncryption: true });

            this.setState({ loadingVis: true });
            let params = {
              'did': Device.deviceID, 'props': [
                "prop.first"
              ]
            };
            Service.smarthome.batchGetDeviceDatas([params]).then((res) => {
              Object.keys(res).map((key, index) => {
                if (index == 0) {
                  if (res[key]["prop.first"] == null || res[key]["prop.first"] == '') { // 显示隐私窗口
                    console.log('首次配网');
                    Service.smarthome.batchSetDeviceDatas([{
                      'did': Device.deviceID, 'props': {
                        "prop.first": "1"
                      }
                    }]).then(((value) => {
                    }));
                    this._getPropsSpecBle1();
                  } else {
                    tryTime = 0;
                    this.getEncryptionByBLE();
                  }
                }
              });
            });
          } else {
            this._getPropsSpecBle1();
          }
        }).catch((err) => console.log('subscribe exception fail'));
      } else {
        // 先订阅属性变更事件
        this.listener = DeviceEvent.deviceReceivedMessages.addListener((device, messages) => {
          if (this.state.finalPairFail) {
            this.setState({ pairFail: true });
            // 匹配失败 不响应
            return;
          }
          if (new Date().getTime() - this.state.lastControlTime > 5000) {
            if (messages.has('prop.2.1')) { // 灯开关
              this.setState({
                lightPower: messages.get('prop.2.1')[0]
              });

              if (this.state.lightPower) {
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.LIGHT,
                  backgroundColor: ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(this.state.color_temperature, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(this.state.brightness * (185 / 100) + 70)).toString(16),
                  title: Device.name
                });
              } else {
                this.setState({ birghtnessLightVis: false });
                this.setState({ birghtnessLightVis2: false });
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.DARK,
                  backgroundColor: 'rgb(14,10,28)',
                  title: Device.name
                });
              }
            }
          }


          if (new Date().getTime() - this.state.lastControlBrightOrTemp > 5000) {

            if (messages.has('prop.2.2')) { // 亮度
              let bight = messages.get('prop.2.2')[0];
              this.setState({
                brightness: bight
              });

              this._setBrightNess(bight);
            }

            if (messages.has('prop.2.3')) { // 色温
              this.setState({
                color_temperature: messages.get('prop.2.3')[0]
              });

              this._setColorTemp(messages.get('prop.2.3')[0]);
            }
          }

          if (messages.has('prop.2.7')) { // 模式
            if (!this.state.lockMode) {
              this.setState({
                mode: messages.get('prop.2.7')[0]
              });
            }
            this.setState({ lockMode: false });
          }

          if (messages.has('prop.4.1')) {
            DataUtils.parse3_1(messages.get('prop.4.1')[0]);
            this.setState({ isShowHelpLight: DataUtils.getHelpLight()[0] });
            this.setState({ helpLight: DataUtils.getHelpLight()[1] });
            this.setState({ acStatus: DataUtils.getAcStatus() });
          }
          if (messages.has('prop.4.2')) {
            DataUtils.parse3_2(messages.get('prop.4.2')[0]);
            this.setState({ startColor: DataUtils.getAwakeData()[6] });
            this.setState({ startBright: DataUtils.getAwakeData()[4] });
            this.setState({ awake: DataUtils.getAwakeData()[3] });
          }
          if (messages.has('prop.4.3')) {
            DataUtils.parse3_3(messages.get('prop.4.3')[0]);
          }
          if (messages.has('prop.4.4')) {
            DataUtils.parse3_4(messages.get('prop.4.4')[0]);
          }
          if (messages.has('prop.4.5')) {
            DataUtils.parse3_5(messages.get('prop.4.5')[0]);
          }
          if (messages.has('prop.4.6')) {
            DataUtils.parse3_6(messages.get('prop.4.6')[0]);
          }
          if (messages.has('prop.4.8')) {
            DataUtils.parse3_8(messages.get('prop.4.8')[0]);
          }
          if (messages.has('prop.4.9')) {
            DataUtils.parse3_9(messages.get('prop.4.9')[0]);
          }
        });

        Device.getDeviceWifi().subscribeMessages(
          'prop.2.1',
          'prop.2.2',
          'prop.2.3', 'prop.2.7', 'prop.4.1', 'prop.4.2', 'prop.4.3', 'prop.4.4', 'prop.4.5', 'prop.4.6', 'prop.4.8', 'prop.4.9')
          .then((subcription) => {
            // call this when you need to unsubscribe the message
            // 订阅成功
            msgSubscription = subcription;
            console.log('subscribe success');
          })
          .catch(() => {
            // 订阅失败
            console.log('subscribe failed');
          });
      }
    }

    _startGetEncryption() {
      if (this.state.isCheckEncryption) {
        return;
      }
      this.setState({ isCheckEncryption: true });
      if (isEncryption) {
        let params = {
          'did': Device.deviceID, 'props': [
            "prop.first"
          ]
        };
        Service.smarthome.batchGetDeviceDatas([params]).then((res) => {
          Object.keys(res).map((key, index) => {
            if (index == 0) {
              if (res[key]["prop.first"] == null || res[key]["prop.first"] == '') { // 显示隐私窗口
                console.log('首次配网');
                Service.smarthome.batchSetDeviceDatas([{
                  'did': Device.deviceID, 'props': {
                    "prop.first": "1"
                  }
                }]).then(((value) => {
                }));
              } else {
                tryTime = 0;
                this.getEncryption();
              }
            }
          });
        });
      }
    }


    componentWillMount() {
      DataUtils.resetJv();
      // giot.light.v8ssw || giot.light.xhyd1 || giot.light.hhyd1
      if (!Device.isOnline
            && Device.model != 'giot.light.v5ssw'
            && Device.model != 'giot.light.v8ssw'
            && Device.model != 'giot.light.dblgt1'
            && Device.model != 'giot.light.hwzd1'
            && Device.model != 'giot.light.xwzd1'
            && Device.model != 'giot.light.xhyd1'
            && Device.model != 'giot.light.hhyd1'
            && Device.model != 'leedar.light.600'
            && Device.model != 'leedar.light.1050'
            && Device.model != 'leedar.light.470'
            && Device.model != 'leedar.light.p470'
            && Device.model != 'leedar.light.345'
            && Device.model != 'leedar.light.345a'
            && Device.model != 'devcea.light.ls2302'
            && Device.model != 'devcea.light.ls2303'
            && Device.model != 'devcea.light.ls2304'
            && Device.model != 'devcea.light.ls2305'
            && Device.model != 'devcea.light.ls2306') {
        this._ble();
      } else {
        this.setState({ devFinalOffline: false });
        this._getPropsSpec();
        this._subscribeProps();
      }

      this._getMyModeData();
      // this._getCurModeData();

      // 设备名称变更事件
      this.subscription = DeviceEvent.deviceNameChanged.addListener((device) => {
        this.props.navigation.setParams({ title: device.name });
      });

      this.setState({ bgColor: `233,${ this.state.centerColor },54` });

      this.listenerResetBarTime = DeviceEventEmitter.addListener('setLastControlBrightOrTempZero', (message) => {
        if (this.state.mode != 0) {
          this.setState({ lastControlTime: 0 });
          this._sendCode(2, 7, 0);
        }
      });

      this.spin();

      this.routesListener = DeviceEventEmitter.addListener('routesInfo', (message) => {
        let length = message.length;
        let curRouteName = message.curRouteName;
        // 监听路由长度
        console.log(`routesListener->${ JSON.stringify(message) }`);
        this.setState({
          curRoutesLength: length,
          curRoutesName: curRouteName
        });
      });

      PackageEvent.packageViewWillAppear.addListener(() => {
        console.log("packageViewWillAppear");
        this._getPropsSpec();
        // 确保拉到属性
        this._delayGet();
      });

      this.listenerRequery = DeviceEventEmitter.addListener('requerySpec', (message) => {
        if (this.state.btConnect) {

        } else {
          this._getPropsSpec();
        }
      });

    }

    // ----------------------- 蓝牙相关 --------------------------
    _ble() {
      console.log('_ble');
      this.setState({ devFinalOffline: false });
      Bluetooth.checkBluetoothIsEnabled().then((result) => {
        this.state.isEnable = result;
        if (!result) {
          if (Host.isAndroid) {
            Bluetooth.enableBluetoothForAndroid(true);
          } else {
            Host.ui.showBLESwitchGuide();
          }
        } else {
          this.connect();
        }
      });
      this._s5 = BluetoothEvent.bluetoothStatusChanged.addListener((isOn) => {
        console.log('bluetoothStatusChanged', isOn);
        this.addLog(`蓝牙状态发生变化 ： ${ JSON.stringify(isOn) }`);
        if (!isOn) {
          this.addLog('蓝牙连接已断开');
          this.setState({
            connectState: HomeLocalizableString.notConnected,
            testCharNotify: false,
            btConnect: false,
            chars: {},
            services: []
          });
          this.props.navigation.setParams({
            title: Device.name,
            subtitle: HomeLocalizableString.unconnected
          });
        } else {
          this.connect();
        }
      });
      this._s7 = BluetoothEvent.bluetoothDeviceDiscovered.addListener((result) => {
        if (scanNum + 1 > 1) {
          this._stopNullTimeOut();
        } else {
          scanNum += 1;
        }
        if (result.mac === bt.mac) {
          this.addLog(`发现设备${ JSON.stringify(result) }`);
          this._stopScanTimeOut();
          this.connect(result.mac);
        }
        // else {
        //     this.addLog("初次发现设备" + JSON.stringify(result))
        //     //普通蓝牙设备的连接必须在扫描到设备之后手动创建 ble 对象
        //     bt = Bluetooth.createBluetoothLE(result.uuid || result.mac);//android 用 mac 创建设备，ios 用 uuid 创建设备
        //     Bluetooth.stopScan();
        //     this.connect();
        // }
      });
      this._s1 = BluetoothEvent.bluetoothSeviceDiscovered.addListener((blut, services) => {
        if (services.length <= 0) {
          return;
        }
        console.log('bluetoothSeviceDiscovered', blut.mac, services.map((s) => s.UUID), bt.isConnected);
        this.addLog(`发现蓝牙服务更新：${ JSON.stringify(services.map((s) => s.UUID)) }`);

        const s = services.map((s) => ({ uuid: s.UUID, char: [] }));
        this.setState({ services: s });
        if (bt.isConnected) {
          this.addLog('开始扫描特征值');
          services.forEach((s) => {
            this.state.services[s.UUID] = s;
            s.startDiscoverCharacteristics();
          });
        }
      });
      this._s2 = BluetoothEvent.bluetoothCharacteristicDiscovered.addListener((bluetooth, service, characters) => {
        console.log('bluetoothCharacteristicDiscovered', characters.map((s) => s.UUID), bt.isConnected);
        this.addLog(`${ service.UUID } 蓝牙特征值已扫描成功${ JSON.stringify(characters.map((s) => s.UUID)) }`);
        const { services } = this.state;
        services.forEach((s) => {
          if (s.uuid === service.UUID) {
            s.char = characters.map((s) => s.UUID);
          }
        });
        this.setState({ services });
        if (bt.isConnected) {
          characters.forEach((c) => {
            this.state.chars[c.UUID] = c;
          });
        }

        this._startDelayReadParms();
      });
      this._s3 = BluetoothEvent.bluetoothCharacteristicValueChanged.addListener((bluetooth, service, character, value) => {
        console.log(`bluetoothCharacteristicValueChanged`);
      });
      this._s4 = BluetoothEvent.bluetoothSeviceDiscoverFailed.addListener((blut, data) => {
        console.log('bluetoothSeviceDiscoverFailed', data);
        //   this.setState({ buttonText: 'bluetoothSeviceDiscoverFailed :' + data });
      });
      this._s5 = BluetoothEvent.bluetoothCharacteristicDiscoverFailed.addListener((blut, data) => {
        console.log('bluetoothCharacteristicDiscoverFailed', data);
        //   this.setState({ buttonText: 'bluetoothCharacteristicDiscoverFailed:' + data });
      });
      this._s6 = BluetoothEvent.bluetoothConnectionStatusChanged.addListener((blut, isConnect) => {
        console.log('bluetoothConnectionStatusChanged', blut, isConnect);
        if (bt.mac === blut.mac) {
          // this.setState({connectState: isConnect ? HomeLocalizableString.isConnected : HomeLocalizableString.notConnected});
          this.props.navigation.setParams({
            title: Device.name,
            subtitle: isConnect ? HomeLocalizableString.had_connected : HomeLocalizableString.unconnected
          });
          this.addLog(`蓝牙${ JSON.stringify(blut) }状态变化${ isConnect }`);
          this.addLog('蓝牙连接已断开');
          if (!isConnect) {
            this.setState({
              connectState: HomeLocalizableString.notConnected,
              testCharNotify: false,
              btConnect: false,
              chars: {},
              services: []
            });

            // this.setState({devFinalOffline: true});
            this.connect();
          }
        }
      });
      this._s8 = DeviceEvent.BLESpecNotifyActionEvent.addListener((device, result) => {
        this.addLog(`Spec notify:${ JSON.stringify(result) }`);
        result.forEach((key, value) => {
          console.log(`receive prop(event) changed notification,prop:${ key },${ JSON.stringify(value) }`);

          if (this.state.finalPairFail) {
            this.setState({ pairFail: true });
            // 匹配失败 不响应
            return;
          }

          if (new Date().getTime() - this.state.lastControlTime > 5000) {
            if (value == 'prop.2.1') { // 灯开关
              this.setState({
                lightPower: key
              });
              DataUtils.setLightPower(key);

              if (this.state.lightPower) {
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.LIGHT,
                  backgroundColor: ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(this.state.color_temperature, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(this.state.brightness * (185 / 100) + 70)).toString(16),
                  title: Device.name
                });
              } else {
                this.props.navigation.setParams({
                  type: NavigationBar.TYPE.DARK,
                  backgroundColor: 'rgb(14,10,28)',
                  title: Device.name
                });
              }
            }
          }

          if (new Date().getTime() - this.state.lastControlBrightOrTemp > 5000) {
            if (value == 'prop.2.2') { // 亮度
              this.setState({
                brightness: parseInt(key)
              });
              DataUtils.setBrightness(parseInt(key));
              this._setBrightNess(parseInt(key));
            }

            if (value == 'prop.2.3') { // 色温
              this.setState({
                color_temperature: parseInt(key)
              });
              DataUtils.setColorTemperature(parseInt(key));
              this._setColorTemp(parseInt(key));
            }
          }

          if (new Date().getTime() - this.state.lastControlTime > 5000) {
            if (value == 'prop.2.7') {
              this.setState({
                mode: key
              });
            }
          }

          if (value == 'prop.4.1') {
            DataUtils.parse3_1(key);
            this.setState({ isShowHelpLight: DataUtils.getHelpLight()[0] });
            this.setState({ helpLight: DataUtils.getHelpLight()[1] });
            this.setState({ acStatus: DataUtils.getAcStatus() });
          }

          if (value == 'prop.4.2') {
            DataUtils.parse3_2(key);
            this.setState({ startColor: DataUtils.getAwakeData()[6] });
            this.setState({ startBright: DataUtils.getAwakeData()[4] });
            this.setState({ awake: DataUtils.getAwakeData()[3] });
          }

          if (value == 'prop.4.3') {
            DataUtils.parse3_3(key);
          }

          if (value == 'prop.4.4') {
            DataUtils.parse3_4(key);
          }

          if (value == 'prop.4.5') {
            DataUtils.parse3_5(key);
          }

          if (value == 'prop.4.8') {
            DataUtils.parse3_8(key);
          }

          if (value == 'prop.4.9') {
            DataUtils.parse3_9(key);
          }
        });
      });
    }

    _startGetParmsNotResponse() {
      this._stopGetParmsNotResponse();
      this.intervalGetParmsNotResponse = setInterval(() => {
        console.log('没有响应 发起重试');
        this._stopGetParmsNotResponse();

        if (Host.isAndroid) {
          bt.disconnect(0, true);
        } else {
          bt.disconnect();
        }
        this.connect();
      }, 5000);
    }

    _stopGetParmsNotResponse() {
      if (this.intervalGetParmsNotResponse) {
        clearInterval(this.intervalGetParmsNotResponse);
      }
    }

    _startDelayReadParms() {
      this._stopDelayReadParms();
      this.intervalReadParamsDelay = setInterval(() => {
        this._stopDelayReadParms();
        this._getPropsSpec();
      }, 1000);
    }

    _stopDelayReadParms() {
      if (this.intervalReadParamsDelay) {
        clearInterval(this.intervalReadParamsDelay);
      }
    }

    _startReadParmsTimeOut() {
      this._stopReadParamsTimeOut();
      this.intervalReadParams = setInterval(() => {
        this._stopReadParamsTimeOut();
        // 3秒内没有读不到属性 说明读取的时机不对 需要重新获取属性
        console.log('3秒内没有读不到属性 说明读取的时机不对 需要重新获取属性');

        this._getPropsSpec1();
      }, 3000);
    }

    _stopReadParamsTimeOut() {
      if (this.intervalReadParams) {
        clearInterval(this.intervalReadParams);
      }
    }

    _startNullTimeOut() {
      scanNum = 0;
      this._stopNullTimeOut();
      this.intervalScanNull = setInterval(() => {
        this._stopNullTimeOut();
        // 5秒内没有扫到任何设备 重新发起扫描连接
        console.log('5秒内没有扫到任何设备 重新发起扫描连接');
        this.connect();
      }, 5000);
    }

    _stopNullTimeOut() {
      if (this.intervalScanNull) {
        clearInterval(this.intervalScanNull);
      }
    }

    _startScanTimeOut() {
      this._stopScanTimeOut();
      this.intervalScan = setInterval(() => {
        this._stopScanTimeOut();
        this.setState({ blueConnecting: false, connectState: HomeLocalizableString.connect_fail, btConnect: false });
        this.props.navigation.setParams({
          title: Device.name,
          subtitle: HomeLocalizableString.connect_fail
        });

        this.setState({ devFinalOffline: true });
      }, 20000);
    }

    _stopScanTimeOut() {
      if (this.intervalScan) {
        clearInterval(this.intervalScan);
      }
    }

    disconnect() {
      this.setState({ connectState: HomeLocalizableString.disconnecting });
      if (Host.isAndroid) {
        bt.disconnect(0, true);
      } else {
        bt.disconnect();
      }
    }

    checkBluetoothIsEnabled() {
      Bluetooth.checkBluetoothIsEnabled().then((yes) => {
        statusEnable = yes;
      });
    }

    enableBluetoothForAndroid() {
      Bluetooth.enableBluetoothForAndroid(!statusEnable);
    }

    addLog(string) {
      console.log(`log->${ string }`);
    }

    connect(mac = undefined, disconnectOntimeOut = true) {
      this.setState({ devFinalOffline: false });
      if (Host.isAndroid) {
        Bluetooth.stopScan();
      }
      this.setState({ blueConnecting: true, connectState: HomeLocalizableString.connecting });
      this.props.navigation.setParams({
        title: Device.name,
        subtitle: HomeLocalizableString.connecting
      });
      this.addLog('准备开始蓝牙连接');
      // ios特殊处理
      if (Host.isAndroid && mac === undefined) {

      } else {
        // this._startNullTimeOut();
        this._startScanTimeOut();
      }
      if (bt.isConnected) {
        console.log();
        this.addLog('蓝牙设备已经连接');
        this.addLog('开始发先服务');
        this.setState({ blueConnecting: false, connectState: HomeLocalizableString.had_connected, btConnect: true });
        this.props.navigation.setParams({
          title: Device.name,
          subtitle: HomeLocalizableString.had_connected
        });
        bt.startDiscoverServices();
      } else if (bt.isConnecting) {
        this.addLog('蓝牙正处于连接中，请等待连接结果后再试');
      } else {
        const that = this;
        this.addLog(`${ Host.isAndroid }`);
        if (Host.isAndroid && mac === undefined) {
          this.setState({ blueConnecting: true, connectState: HomeLocalizableString.scaning });
          this.props.navigation.setParams({
            title: Device.name,
            subtitle: HomeLocalizableString.scaning
          });

          console.log('发起蓝牙扫描');
          Bluetooth.startScan(20000);
          // this._startNullTimeOut();
          this._startScanTimeOut();
          return;
        } else {
          this._startScanTimeOut();
        }
        bt.connect(this.state.scType, { did: Device.deviceID, timeout: 20000 }).then((data) => {
          this._stopScanTimeOut();
          this.setState({
            blueConnecting: false,
            connectState: HomeLocalizableString.had_connected,
            btConnect: true
          });
          this.props.navigation.setParams({
            title: Device.name,
            subtitle: HomeLocalizableString.had_connected
          });
          bt.startDiscoverServices();
        }).catch((data) => {
          this.setState({
            blueConnecting: false,
            connectState: HomeLocalizableString.connect_fail,
            btConnect: false
          });
          this.props.navigation.setParams({
            title: Device.name,
            subtitle: HomeLocalizableString.connect_fail
          });
          this.addLog(`ble connect failed: ${ JSON.stringify(data) }`);
          // that.connect(mac, false);
        });
      }
    }

    _getPropsSpecBle1() {
      this._startGetParmsNotResponse();
      let prop = {
        "siid": 2,
        "piid": 1
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this._stopGetParmsNotResponse();
        this.setState({ devFinalOffline: false });

        this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

        if (jsonData.objects[0].code == 0) {
          this.setState({
            lightPower: jsonData.objects[0].value
          });
          DataUtils.setLightPower(jsonData.objects[0].value);

          if (jsonData.objects[0].value) {
            this.props.navigation.setParams({
              type: NavigationBar.TYPE.LIGHT,
              backgroundColor: ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(this.state.color_temperature, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(this.state.brightness * (185 / 100) + 70)).toString(16),
              title: Device.name
            });
          } else {
            this.setState({ birghtnessLightVis: false });
            this.setState({ birghtnessLightVis2: false });
            this.props.navigation.setParams({
              type: NavigationBar.TYPE.DARK,
              backgroundColor: 'rgb(14,10,28)',
              title: Device.name
            });
          }

          this._getPropsSpecBle2();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
        console.log(JSON.stringify(err));
        this._stopGetParmsNotResponse();
      });
    }

    _getPropsSpecBle2() {
      let prop = {
        "siid": 2,
        "piid": 2
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.setState({ devFinalOffline: false });

        this.addLog(`get property resp2 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

        if (jsonData.objects[0].code == 0) {
          // 设置lightBar/colorBar

          this.setState({ brightness: jsonData.objects[0].value });
          DataUtils.setBrightness(jsonData.objects[0].value);
          this._setBrightNess(jsonData.objects[0].value);

          this._getPropsSpecBle3();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
        this.addLog(`get property Fail2:${ JSON.stringify(err) }`);
      });
    }

    _getPropsSpecBle3() {
      let prop = {
        "siid": 2,
        "piid": 3
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.setState({ devFinalOffline: false });

        this.addLog(`get property resp3 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;
        if (jsonData.objects[0].code == 0) {

          this.setState({ color_temperature: jsonData.objects[0].value });
          DataUtils.setColorTemperature(jsonData.objects[0].value);
          this._setColorTemp(jsonData.objects[0].value);

          this._getPropsSpecBle4();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
        this.addLog(`get property Fail3:${ JSON.stringify(err) }`);
      });
    }

    _getPropsSpecBle4() {
      let prop = {
        "siid": 2,
        "piid": 4
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {

        this.addLog(`get property resp4 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;
        if (jsonData.objects[0].code == 0) {
          this.setState({
            mode: jsonData.objects[0].value
          });

          this._getPropsSpecBle5();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
        this.addLog(`get property Fail4:${ JSON.stringify(err) }`);
      });
    }

    _getPropsSpecBle5() {
      let prop = {
        "siid": 3,
        "piid": 1
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_1(jsonData.objects[0].value);
          this.setState({ isShowHelpLight: DataUtils.getHelpLight()[0] });
          this.setState({ helpLight: DataUtils.getHelpLight()[1] });
          this.setState({ acStatus: DataUtils.getAcStatus() });

          this._getPropsSpecBle6();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle6() {
      let prop = {
        "siid": 3,
        "piid": 2
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;
        this.setState({ devFinalOffline: false });

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_2(jsonData.objects[0].value);
          this.setState({ startColor: DataUtils.getAwakeData()[6] });
          this.setState({ startBright: DataUtils.getAwakeData()[4] });
          this.setState({ awake: DataUtils.getAwakeData()[3] });

          this._getPropsSpecBle7();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle7() {
      let prop = {
        "siid": 3,
        "piid": 3
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;
        this.setState({ devFinalOffline: false });

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_3(jsonData.objects[0].value);
          this._getPropsSpecBle8();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle8() {
      let prop = {
        "siid": 3,
        "piid": 4
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;
        this.setState({ devFinalOffline: false });

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_4(jsonData.objects[0].value);

          this._getPropsSpecBle9();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle9() {
      let prop = {
        "siid": 3,
        "piid": 5
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;
        this.setState({ devFinalOffline: false });

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_5(jsonData.objects[0].value);
          this._getPropsSpecBle10();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle10() {
      let prop = {
        "siid": 3,
        "piid": 6
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;
        this.setState({ devFinalOffline: false });

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_6(jsonData.objects[0].value);
          this._getPropsSpecBle11();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle11() {
      let prop = {
        "siid": 3,
        "piid": 8
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;
        this.setState({ devFinalOffline: false });

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_8(jsonData.objects[0].value);
          this._getPropsSpecBle12();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle12() {
      let prop = {
        "siid": 3,
        "piid": 9
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.setState({ loadingVis: false });
        this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;
        this.setState({ devFinalOffline: false });

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_9(jsonData.objects[0].value);
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    componentWillUnmount() {
      if (this.encryptionInterval) {
        clearInterval(this.encryptionInterval);
      }
      if (this.reTryEncryptionTimer) {
        clearTimeout(this.reTryEncryptionTimer);
      }
      this.subscription && this.subscription.remove();
      if (this.interval) {
        clearTimeout(this.interval);
      }

      this.listener && this.listener.remove();
      this.listenerBle && this.listenerBle.remove();
      this.listenerResetBarTime && this.listenerResetBarTime.remove();
      this.listenerRequery && this.listenerRequery.remove();
      this.routesListener && this.routesListener.remove();

      this._stopScanTimeOut();
      this._stopNullTimeOut();
      this._stopReadParamsTimeOut();
      this._stopDelayReadParms();
      this._stopGetParmsNotResponse();

      this._s1 && this._s1.remove();
      this._s2 && this._s2.remove();
      this._s3 && this._s3.remove();
      this._s4 && this._s4.remove();
      this._s5 && this._s5.remove();
      this._s6 && this._s6.remove();
      this._s7 && this._s7.remove();
      this._s8 && this._s8.remove();

      Bluetooth.stopScan();
      this.disconnect();
      bt.unsubscribeMessages();
    }


    onLayout = (event) => { // 获取View的高度
      const viewHeight = event.nativeEvent.layout.height;
      this.setState({ bottomHeight: viewHeight });
    }

    _getCheckBrightness(value) {
      return value;
    }

    render() {
      let bottomView = this._bottomView();
      return (
        <ImageBackground style={{ flex: 1 }}
          source={this.state.lightPower ? require('../resources/on_bg.png') : require('../resources/off_bg.png')}>

          <NavigationBar
            backgroundColor={'#ffffff00'}
            /*                 backgroundColor={this.state.lightPower ?
                                         `xm${ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(this.state.color_temperature, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(this.state.brightness * (185 / 100) + 70)).toString(16)}` : null}
                                     type={this.state.lightPower ? NavigationBar.TYPE.LIGHT : NavigationBar.TYPE.DARK} */
            type={NavigationBar.TYPE.DARK}
            left={[
              {
                key: 'back',
                onPress: (_) => Package.exit()
              }
            ]}
            right={[
              {
                key: 'more',
                showDot: false,
                onPress: (_) => {
                  this.props.navigation.navigate('CommonSetting', {
                    acStatus: that.state.acStatus,
                    btConnect: that.state.btConnect,
                    lightPower: that.state.lightPower
                  });
                }
              }
            ]}
            title={Device.name}
            subtitleStyle={{ fontSize: 14 }}
            subtitle={(!Device.isOnline && !this.state.btConnect) ? '' : this.state.lightPower ?
              (this.state.mode == 9 || this.state.mode == 10 ? (this.state.mode == 9 ? HomeLocalizableString.呼吸模式 : HomeLocalizableString.律动模式) : `${ HomeLocalizableString.brightness3(this.state.brightness) } | ${ HomeLocalizableString.temp3(this.state.color_temperature) }`) : HomeLocalizableString.已关闭}
            onPressTitle={(_) => console.log('onPressTitle')}
          />
          <ImageBackground
            style={{
              flex: 1
            }}>

            <ScrollView
              scrollEnabled={!this.state.isScroll}
              showsVerticalScrollIndicator={false}>
              {bottomView}
            </ScrollView>
          </ImageBackground>

          <InputDialog
            visible={this.state.collectInputNameDialog}
            title={HomeLocalizableString.collect_name}
            onDismiss={(_) => {
              this.setState({
                collectInputNameDialog: false,
                saveBtnEnable: false
              });
            }}
            buttons={[
              {
                backgroundColor: 'rgba(0,0,0,0)',
                style: {
                  backgroundColor: '#e2e2e2',
                  flex: 1,
                  borderRadius: 25,
                  height: 45,
                  alignItems: 'center',
                  justifyContent: 'center'
                },
                text: HomeLocalizableString.cancel,
                callback: (_) => this.setState({
                  collectInputNameDialog: false,
                  saveBtnEnable: false
                })
              },
              {
                backgroundColor: 'rgba(0,0,0,0)',
                style: {
                  backgroundColor: this.state.saveBtnEnable ? '#5fb6bd' : '#e2e2e2',
                  flex: 1,
                  borderRadius: 25,
                  height: 45,
                  alignItems: 'center',
                  justifyContent: 'center'
                },
                text: HomeLocalizableString.save,
                callback: (result) => {
                  if (!this.state.saveBtnEnable)
                    return;

                  Keyboard.dismiss();
                  console.log(`结果`, result.textInputArray[0]);
                  if (result.textInputArray[0] == '') {
                    this.onShowToast(HomeLocalizableString.collect_name_is_null);
                    this.setState({ collectInputNameDialog: false });
                    return;
                  }
                  if (result.textInputArray[0].length > 10) {
                    this.onShowToast(HomeLocalizableString.collect_name_too_long);
                    this.setState({ collectInputNameDialog: false });
                    return;
                  }

                  let flag = 0;
                  Service.smarthome.getUserColl({
                    did: Device.deviceID
                  }).then((data) => {
                    console.log(`data->${ JSON.stringify(data) }`);
                    data.map((info, index) => {
                      if (info.name.split('_')[0] == result.textInputArray[0]) {
                        flag = 1;
                      }
                    });
                    if (flag != 0) {
                      Keyboard.dismiss();
                      this.onShowToast(HomeLocalizableString.duplicate_custom_theme_name);
                    } else {
                      this._addCollect(result.textInputArray[0]);
                    }
                  }).catch((err) => {
                    this._addCollect(result.textInputArray[0]);
                  });
                  this.setState({
                    collectInputNameDialog: false,
                    saveBtnEnable: false
                  });


                }
              }
            ]}
            inputs={[
              {
                placeholder: HomeLocalizableString.collect_input_tips,
                textInputProps: {
                  maxLength: 20,
                  autoFocus: true,
                  returnKeyType: 'done',
                  inputStyle: {
                    color: DarkMode.getColorScheme() === 'dark' ? '#ffffff' : '#000'
                  }
                },
                defaultValue: '',
                type: 'DELETE',
                onChangeText: (text) => {
                  this.setState({ saveBtnEnable: text.length > 0 ? true : false });
                }
              }
            ]}
          />

          <LoadingDialog title={HomeLocalizableString.loading}
            timeout={6000}
            visible={this.state.loadingVis}/>

          <MessageDialog
            visible={this.state.tipsVisible}
            title={''}
            message={HomeLocalizableString.cant_use}
            messageStyle={{ textAlign: 'center', fontSize: 14 }}
            confirm={HomeLocalizableString.confirm}
            onConfirm={() => {
              this.setState({ tipsVisible: false });
            }}
            onDismiss={(_) => this.setState({ tipsVisible: false })}
          />

          <MessageDialog
            visible={this.state.pairFail}
            title={''}
            cancelable={false}
            message={HomeLocalizableString.产品功能信息获取失败}
            confirm={HomeLocalizableString.ok}
            onConfirm={() => {
              Package.exit();
            }}
            onDismiss={(_) => this.setState({ pairFail: false })}
          />

          <BrightnessLightDialog
            brightP={100 - b}
            colorP={(t - colorMin) / (colorMax - colorMin) * 100}
            dialogInit={this.state.dialogInit}
            modalClose={() => {
              this.setState({ birghtnessLightVis: false });
            }}
            onRequestClose={() => {
              this.setState({ birghtnessLightVis: false });
            }}
            modalVisible={this.state.birghtnessLightVis}
            title={HomeLocalizableString.编辑我的模式}
            value={'123'}
            cancelText={HomeLocalizableString.cancel}
            cancelTextColor={'#4C4C4C'}
            cancelEvent={() => {
              if (this.interval != null) {
                clearInterval(this.interval);
              }
              if (this.state.curMode == 1) {
                this._sendCodeNotLimit(2, 2, parseInt(this.state.mode1.split(',')[0]));
                this._sendCodeNotLimit(2, 3, parseInt(this.state.mode1.split(',')[1]));
              } else if (this.state.curMode == 2) {
                this._sendCodeNotLimit(2, 2, parseInt(this.state.mode2.split(',')[0]));
                this._sendCodeNotLimit(2, 3, parseInt(this.state.mode2.split(',')[1]));
              } else if (this.state.curMode == 3) {
                this._sendCodeNotLimit(2, 2, parseInt(this.state.mode3.split(',')[0]));
                this._sendCodeNotLimit(2, 3, parseInt(this.state.mode3.split(',')[1]));
              } else if (this.state.curMode == 4) {
                this._sendCodeNotLimit(2, 2, parseInt(this.state.mode4.split(',')[0]));
                this._sendCodeNotLimit(2, 3, parseInt(this.state.mode4.split(',')[1]));
              }
              this.setState({ birghtnessLightVis: false });
            }}
            sureText={HomeLocalizableString.confirm}
            sureTextColor={'#4396EB'}
            sureEvent={(lightPec, colorPec) => {
              if (this.interval != null) {
                clearTimeout(this.interval);
              }
              this._setMyModeData(this.state.curMode, (100 - lightPec) < 1 ? 1 : 100 - lightPec, colorMin + ((colorMax - colorMin) * (colorPec / 100)));
              // 确认点击事件回调  lightPec亮度百分比，colorPec色温百分比

              this._sendCode(2, 2, (100 - lightPec) < 1 ? 1 : 100 - lightPec);
              this._sendCode(2, 3, colorMin + ((colorMax - colorMin) * (colorPec / 100)));

              this.setState({ birghtnessLightVis: false });
            }}
            sliderEvent={(colorPec, lightPec) => {
              this.setState({ dialogInit: false });
              // 滑动时亮度和色温的回调  lightPec亮度百分比，colorPec色温百分比
              console.log(`lightPec->${ lightPec }`);
              this._updataUi({ siid: 2, piid: 2 }, (100 - lightPec) < 1 ? 1 : 100 - lightPec);
              this._updataUi({ siid: 2, piid: 3 }, colorMin + ((colorMax - colorMin) * (colorPec / 100)));

              if (new Date().getTime() - this.state.lastControlTimeSlide < 500) {
                // 直接过滤
                return;
              }

              // 发送亮度
              if (this.state.btConnect) {
                this._sendCodeSpecForBle(2, 2, parseInt((100 - lightPec) < 1 ? 1 : 100 - lightPec).toString(), 1);
                this.setState({ lastControlBrightOrTemp: new Date().getTime() });
              } else {
                Service.spec.setPropertiesValue([{
                  did: Device.deviceID,
                  siid: 2,
                  piid: 2,
                  value: parseInt((100 - lightPec) < 1 ? 1 : 100 - lightPec)
                }])
                  .then((res) => { // 请求成功
                  }).catch((err) => { // 请求失败
                  });
                this.setState({ lastControlBrightOrTemp: new Date().getTime() });
              }

              setTimeout(() => {
                // 发送色温
                if (this.state.btConnect) {
                  this._sendCodeSpecForBle(2, 3, parseInt(colorMin + ((colorMax - colorMin) * (colorPec / 100))).toString(), 5);
                  this.setState({ lastControlBrightOrTemp: new Date().getTime() });
                } else {
                  Service.spec.setPropertiesValue([{
                    did: Device.deviceID,
                    siid: 2,
                    piid: 3,
                    value: parseInt(colorMin + ((colorMax - colorMin) * (colorPec / 100)))
                  }])
                    .then((res) => { // 请求成功
                    }).catch((err) => { // 请求失败
                    });
                  this.setState({ lastControlBrightOrTemp: new Date().getTime() });
                }
              }, 250);

              this.setState({ lastControlTimeSlide: new Date().getTime() });
            }}/>

          <BrightnessLightDialog2
            brightP={b}
            colorP={t}
            dialogInit={this.state.dialogInit}
            modalClose={() => {
              this.setState({ birghtnessLightVis2: false });
            }}
            onRequestClose={() => {
              this.setState({ birghtnessLightVis2: false });
            }}
            modalVisible={this.state.birghtnessLightVis2}
            title={HomeLocalizableString.编辑我的模式}
            value={'123'}
            cancelText={HomeLocalizableString.cancel}
            cancelTextColor={'#4C4C4C'}
            cancelEvent={() => {
              if (this.interval != null) {
                clearInterval(this.interval);
              }
              if (this.state.curMode == 1) {
                this._sendCodeNotLimit(2, 2, parseInt(this.state.mode1.split(',')[0]));
                this._sendCodeNotLimit(2, 3, parseInt(this.state.mode1.split(',')[1]));
              } else if (this.state.curMode == 2) {
                this._sendCodeNotLimit(2, 2, parseInt(this.state.mode2.split(',')[0]));
                this._sendCodeNotLimit(2, 3, parseInt(this.state.mode2.split(',')[1]));
              } else if (this.state.curMode == 3) {
                this._sendCodeNotLimit(2, 2, parseInt(this.state.mode3.split(',')[0]));
                this._sendCodeNotLimit(2, 3, parseInt(this.state.mode3.split(',')[1]));
              } else if (this.state.curMode == 4) {
                this._sendCodeNotLimit(2, 2, parseInt(this.state.mode4.split(',')[0]));
                this._sendCodeNotLimit(2, 3, parseInt(this.state.mode4.split(',')[1]));
              }
              this.setState({ birghtnessLightVis2: false });
            }}
            sureText={HomeLocalizableString.confirm}
            sureTextColor={'#4396EB'}
            sureEvent={(lightPec, colorPec) => {
              if (this.interval != null) {
                clearTimeout(this.interval);
              }
              this._setMyModeData(this.state.curMode, lightPec, colorPec);
              // 确认点击事件回调  lightPec亮度百分比，colorPec色温百分比

              this._sendCode(2, 2, parseInt(lightPec));
              this._sendCode(2, 3, parseInt(colorPec));

              this.setState({ birghtnessLightVis2: false });
            }}
            sliderEvent={(colorPec, lightPec) => {
              this.setState({ dialogInit: false });
              // 滑动时亮度和色温的回调  lightPec亮度百分比，colorPec色温百分比
              console.log(`lightPec->${ lightPec }`);
              this._updataUi({ siid: 2, piid: 2 }, lightPec);
              this._updataUi({ siid: 2, piid: 3 }, colorPec);

              if (new Date().getTime() - this.state.lastControlTimeSlide < 500) {
                // 直接过滤
                return;
              }

              // 发送亮度
              if (this.state.btConnect) {
                this._sendCodeSpecForBle(2, 2, parseInt(lightPec).toString(), 1);
                this.setState({ lastControlBrightOrTemp: new Date().getTime() });
              } else {
                Service.spec.setPropertiesValue([{
                  did: Device.deviceID,
                  siid: 2,
                  piid: 2,
                  value: parseInt(lightPec)
                }])
                  .then((res) => { // 请求成功
                  }).catch((err) => { // 请求失败
                  });
                this.setState({ lastControlBrightOrTemp: new Date().getTime() });
              }

              setTimeout(() => {
                // 发送色温
                if (this.state.btConnect) {
                  this._sendCodeSpecForBle(2, 3, parseInt(colorPec).toString(), 5);
                  this.setState({ lastControlBrightOrTemp: new Date().getTime() });
                } else {
                  Service.spec.setPropertiesValue([{
                    did: Device.deviceID,
                    siid: 2,
                    piid: 3,
                    value: parseInt(colorPec)
                  }])
                    .then((res) => { // 请求成功
                    }).catch((err) => { // 请求失败
                    });
                  this.setState({ lastControlBrightOrTemp: new Date().getTime() });
                }
              }, 250);

              this.setState({ lastControlTimeSlide: new Date().getTime() });
            }}/>
        </ImageBackground>
      );
    }

    _setBrightNess() {
      this._setTitleBarNew(this._getColor(this.state.color_temperature, this.state.brightness));
    }

    _setColorTemp() {
      this._setTitleBarNew(this._getColor(this.state.color_temperature, this.state.brightness));
    }


    _getColor(temp, bgAlpha) {
      return '#4396EBFF';
      //  return `xm${ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(temp, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(bgAlpha * (185 / 100) + 70)).toString(16)}`;
    }

    _getUnColor(temp, bgAlpha) {
      return DarkMode.getColorScheme() === 'dark' ? 'xm#2f2f2f' : '#F7F7F7';
      //  return `xm${ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(temp, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(bgAlpha * (185 / 100) + 70)).toString(16)}`;
    }

    _setTitleBarNew(rgba) {
      if (this.state.lightPower)
        this.props.navigation.setParams({
          backgroundColor: rgba,
          title: Device.name
        });
    }

    _addCollect(name) {
      Service.smarthome.setUserColl({
        did: Device.deviceID,
        name: name,
        content: `${ this.state.brightness },${ this.state.color_temperature }`
      }).then((data) => {
        console.log(JSON.stringify(data));
      }).catch((err) => {
        console.log(JSON.stringify(err));
      });
    }

    _bleDirectConnect() {
      return (
        <View style={{
          flexDirection: 'column',
          alignSelf: 'center',
          marginBottom: 40,
          width: this.mScreenWidth
        }} onLayout={(event) => this.onLayout(event)}>
          <TouchableOpacity
            style={{
              flexDirection: 'column',
              alignSelf: 'center'
            }}
            onPress={() => {
              this._ble();
            }}>
            <Image
              style={{ alignSelf: 'center' }}
              source={require('../resources/ble_connect.png')}/>

            <Text style={{
              color: 'rgb(255,255,255)',
              fontSize: 11,
              marginTop: 10,
              textAlign: 'center',
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}>{HomeLocalizableString.ble_direct_connect}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 旋转方法
    spin = () => {
      this.spinValue.setValue(0);
      Animated.timing(this.spinValue, {
        toValue: 1, // 最终值 为1，这里表示最大旋转 360度
        duration: 1000,
        easing: Easing.linear
      }).start(() => this.spin());
    }

    _bottomView() {
      const { user, pwd, fadeAnim } = this.state;
      // 映射 0-1的值 映射 成 0 - 360 度
      const spin = this.spinValue.interpolate({
        inputRange: [0, 1], // 输入值
        outputRange: ['0deg', '360deg'] // 输出值
      });


      return (
        <View style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          marginTop: 280
        }} onLayout={(event) => this.onLayout(event)}>

          {(Device.model != 'giot.light.v5ssw'
                    && Device.model != 'giot.light.v8ssw'
                    && Device.model != 'giot.light.dblgt1'
                    && Device.model != 'giot.light.hwzd1'
                    && Device.model != 'giot.light.xwzd1'
                    && Device.model != 'giot.light.xhyd1'
                    && Device.model != 'giot.light.hhyd1'
                    && Device.model != 'leedar.light.600'
                    && Device.model != 'leedar.light.1050'
                    && Device.model != 'leedar.light.470'
                    && Device.model != 'leedar.light.p470'
                    && Device.model != 'leedar.light.345'
                    && Device.model != 'leedar.light.345a'
                    && Device.model != 'devcea.light.ls2302'
                    && Device.model != 'devcea.light.ls2303'
                    && Device.model != 'devcea.light.ls2304'
                    && Device.model != 'devcea.light.ls2305'
                    && Device.model != 'devcea.light.ls2306'
                    && !Device.isOnline && !this.state.btConnect) ?

            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 12,
                marginLeft: 12,
                marginRight: 12,
                marginTop: 12,
                padding: 20,
                flexDirection: 'column'
              }}>

              <View
                style={{
                  backgroundColor: '#fff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>

                {/* <Image
                                style={{
                                    width: 30,
                                    height: 30,
                                }}
                                source={require('../resources/connecting_ic.png')}/> */}
                {this.state.connectState == HomeLocalizableString.connect_fail ?
                  <Image
                    style={{
                      width: 30,
                      height: 30
                    }}
                    source={require('../resources/unconnect_ic.png')}/> :
                  <Animated.Image style={[styles.circle, { transform: [{ rotate: spin }] }]} source={circle}/>
                }
                <View
                  style={{
                    marginLeft: 13,
                    backgroundColor: '#fff',
                    flexDirection: 'column'
                  }}>

                  <Text style={{
                    color: '#000',
                    fontSize: 16,
                    ...Platform.select({
                      ios: {},
                      android: { fontFamily: 'lucida grande' }
                    })
                  }}>{this.state.connectState}</Text>
                </View>

                <View style={{ flex: 1 }}/>

                {this.state.connectState == HomeLocalizableString.connect_fail ?
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onPress={() => this._ble()}>

                    <View
                      style={{
                        marginLeft: 13,
                        borderRadius: 13,
                        paddingLeft: 13,
                        paddingRight: 13,
                        paddingTop: 5,
                        paddingBottom: 5,
                        backgroundColor: '#FFE9C8',
                        flexDirection: 'column'
                      }}>

                      <Text style={{
                        color: '#FAA72B',
                        fontSize: 12,
                        ...Platform.select({
                          ios: {},
                          android: { fontFamily: 'lucida grande' }
                        })
                      }}>{HomeLocalizableString.reconnect}</Text>
                    </View>
                  </TouchableOpacity>
                  : null}
              </View>

            </View>
            : null
          }

          <MHCard
            style={{ backgroundColor: '#fff' }}
            titleStyle={{
              color: (Device.isOnline || this.state.btConnect) ? '#000' : '#00000050',
              fontSize: 16
            }}
            title={this.state.lightPower ? HomeLocalizableString.light_colse : HomeLocalizableString.light_open}
            iconContainerStyle={{
              borderRadius: 999,
              width: 40,
              height: 40
              // backgroundColor: Device.isOnline ? '#4396EB' : '#00000050'
            }}
            // disabled={(!Device.isOnline && !this.state.btConnect)}
            title={this.state.lightPower ? HomeLocalizableString.light_colse : HomeLocalizableString.light_open}
            icon={this.state.lightPower ? require('../resources/power_on_btn.png') : require('../resources/power_off_btn.png')}
            cardType={MHCard.CARD_TYPE.NORMAL}
            cardRadiusType={MHCard.CARD_RADIUS_TYPE.ALL}
            onPress={() => {
              if (!Device.isOnline && !this.state.btConnect) {
                return;
              }
              this._lightClick(this.state.lightPower);
            }}
            marginTop={12}
            showShadow={false}
            hideArrow={true}
          />

          {Device.model != 'leedar.light.600'
                && Device.model != 'leedar.light.1050'
                && Device.model != 'leedar.light.470'
                && Device.model != 'leedar.light.p470'
                && Device.model != 'leedar.light.345'
                && Device.model != 'leedar.light.345a'
                && Device.model != 'devcea.light.ls2302'
                && Device.model != 'devcea.light.ls2303'
                && Device.model != 'devcea.light.ls2304'
                && Device.model != 'devcea.light.ls2305'
                && Device.model != 'devcea.light.ls2306'
                && this.state.isShowHelpLight ?
            <MHCard
              style={{ backgroundColor: '#fff' }}
              titleStyle={{
                color: (Device.isOnline || this.state.btConnect) ? '#000' : '#00000050',
                fontSize: 16
              }}
              title={this.state.helpLight ? HomeLocalizableString.light_colse : HomeLocalizableString.light_open}
              iconContainerStyle={{
                borderRadius: 999,
                width: 40,
                height: 40,
                backgroundColor: Device.isOnline ? '#4396EB' : '#00000050'
              }}
              disabled={(!Device.isOnline && !this.state.btConnect)}
              title={this.state.helpLight ? HomeLocalizableString.关闭辅光 : HomeLocalizableString.开启辅光}
              icon={this.state.helpLight ? require('../resources/power_on_btn.png') : require('../resources/power_off_btn.png')}
              cardType={MHCard.CARD_TYPE.NORMAL}
              cardRadiusType={MHCard.CARD_RADIUS_TYPE.ALL}
              onPress={() => {
                this._helpLightClick(this.state.helpLight);
              }}
              marginTop={12}
              showShadow={false}
              hideArrow={true}
            />
            : null}

          <View style={styles.tab}>
            <View style={styles.tabTitleWrapper}>
              <Text style={{
                fontSize: 16,
                color: DarkMode.getColorScheme() == 'dark' ? !this.state.lightPower ? 'xm#565656' : '#000' : !this.state.lightPower ? '#b6b6b6' : '#000'
              }}>{HomeLocalizableString.text_brightness}</Text>
              <Text style={styles.tabTitleSeparator}>|</Text>
              <Text style={{
                color: DarkMode.getColorScheme() == 'dark' ? !this.state.lightPower ? 'xm#565656' : '#000' : !this.state.lightPower ? '#b6b6b6' : '#000'
              }}>{this.state.brightness}%</Text>
            </View>

            <View
              style={{
                marginTop: 26
              }}>
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
                    style={{ tintColor: DarkMode.getColorScheme() == 'dark' && !this.state.lightPower ? 'xm#565656' : null }}
                    source={require('../resources/bright_low_dis_ic.png')}/>
                  <View
                    style={{
                      flex: 1
                    }}/>
                  <Image
                    style={{ tintColor: DarkMode.getColorScheme() == 'dark' && !this.state.lightPower ? 'xm#565656' : null }}
                    source={require('../resources/bright_high_dis_ic.png')}/>
                </View>

                <View
                  style={{
                    width: 0 + (((this.mScreenWidth * 0.94) - 40 - 0) * (this.state.brightness / 100)),
                    height: 48,
                    position: 'absolute',
                    backgroundColor: (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF' : this.state.lightPower ? '#4396EBFF' : DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF',
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
                      style={{ tintColor: DarkMode.getColorScheme() == 'dark' && !this.state.lightPower ? 'xm#565656' : null }}
                      source={require('../resources/bright_low_white_ic.png')}/> : null
                  }

                  <View
                    style={{
                      flex: 1
                    }}/>

                  {
                    this.state.brightness > 95 ? <Image
                      style={{ tintColor: DarkMode.getColorScheme() == 'dark' && !this.state.lightPower ? 'xm#565656' : null }}
                      source={require('../resources/bright_high_white_ic.png')}/> : null
                  }
                </View>
              </View>


              {((!Device.isOnline && !this.state.btConnect) || !this.state.lightPower)
                ? <View style={{ height: 48 }}/> :
                <SlideGear
                  blockStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
                  showEndText={false}
                  disabled={(!Device.isOnline && !this.state.btConnect) || !this.state.lightPower}
                  options={this.generateArrayFromRange(1, 100)}
                  containerStyle={{ width: '100%', height: 48 }}
                  value={this.state.brightness - 1}
                  onValueChange={(value) => {
                    this.setState({ isScroll: true });
                    this.setState({ brightness: parseInt(value + 1) });
                    this._setBrightNess();
                    this.setState({ mode: -1 });
                    this._setCurModeData(-1);

                    if (new Date().getTime() - this.state.lastControlTime <= 500) {
                      return;
                    }
                    this.setState({ lastControlBrightOrTemp: new Date().getTime() });
                    this.setState({ lastControlTime: new Date().getTime() });

                    if (this.state.btConnect) {
                      this._sendCodeSpecForBle(2, 2, parseInt(value + 1).toString(), 1);
                    } else {
                      Service.spec.setPropertiesValue([{
                        did: Device.deviceID,
                        siid: 2,
                        piid: 2,
                        value: parseInt(value + 1)
                      }])
                        .then((res) => { // 请求成功
                        }).catch((err) => { // 请求失败
                        });
                    }
                  }}
                  onSlidingComplete={(value) => {
                    this.setState({ isScroll: false });
                    this._sendCodeNotLimit(2, 2, value + 1);
                  }}
                  minimumTrackTintColor={'rgba(0,0,0,0)'}
                  maximumTrackTintColor={'rgba(0,0,0,0)'}
                />
              }
            </View>
          </View>

          <View style={styles.tab}>
            <View style={styles.tabTitleWrapper}>
              <Text style={{
                fontSize: 16,
                color: DarkMode.getColorScheme() == 'dark' ? !this.state.lightPower ? 'xm#565656' : '#000' : !this.state.lightPower ? '#b6b6b6' : '#000'
              }}>{HomeLocalizableString.text_temp}</Text>
              <Text style={styles.tabTitleSeparator}>|</Text>
              <Text style={{
                color: DarkMode.getColorScheme() == 'dark' ? !this.state.lightPower ? 'xm#565656' : '#000' : !this.state.lightPower ? '#b6b6b6' : '#000'
              }}>{this.state.color_temperature}K</Text>
            </View>

            <View
              style={{
                marginTop: 26
              }}>
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
                    style={{ tintColor: DarkMode.getColorScheme() == 'dark' && !this.state.lightPower ? 'xm#565656' : null }}
                    source={require('../resources/temp_high_dis_ic.png')}/>
                  <View
                    style={{
                      flex: 1
                    }}/>
                  <Image
                    style={{ tintColor: DarkMode.getColorScheme() == 'dark' && !this.state.lightPower ? 'xm#565656' : null }}
                    source={require('../resources/temp_low_dis_ic.png')}/>
                </View>

                <View
                  style={{
                    width: 0 + (((this.mScreenWidth * 0.94) - 40 - 0) * ((this.state.color_temperature - colorMin) / (colorMax - colorMin))),
                    height: 48,
                    position: 'absolute',
                    backgroundColor: (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF' : this.state.lightPower ? '#4396EBFF' : DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF',
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
                    ((this.state.color_temperature - colorMin) / (colorMax - colorMin)) * 100 > 8 ?
                      <Image
                        style={{ tintColor: DarkMode.getColorScheme() == 'dark' && !this.state.lightPower ? 'xm#565656' : null }}
                        source={require('../resources/temp_high_white_ic.png')}/> : null
                  }

                  <View
                    style={{
                      flex: 1
                    }}/>

                  {
                    ((this.state.color_temperature - colorMin) / (colorMax - colorMin)) * 100 > 95 ?
                      <Image
                        style={{ tintColor: DarkMode.getColorScheme() == 'dark' && !this.state.lightPower ? 'xm#565656' : null }}
                        source={require('../resources/temp_low_white_ic.png')}/> : null
                  }
                </View>
              </View>
              {((!Device.isOnline && !this.state.btConnect) || !this.state.lightPower)
                ? <View style={{ height: 48 }}/> :
                <SlideGear
                  blockStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
                  showEndText={false}
                  disabled={(!Device.isOnline && !this.state.btConnect) || !this.state.lightPower}
                  options={this.generateArrayFromRange(colorMin, colorMax)}
                  containerStyle={{ width: '100%', height: 48 }}
                  value={this.state.color_temperature - colorMin}
                  onValueChange={(value) => {
                    this.setState({ isScroll: true });
                    this.setState({ color_temperature: parseInt(value + colorMin) });
                    this._setColorTemp();
                    this.setState({ mode: -1 });
                    this._setCurModeData(-1);

                    if (new Date().getTime() - this.state.lastControlTime <= 500) {
                      return;
                    }
                    this.setState({ lastControlBrightOrTemp: new Date().getTime() });
                    this.setState({ lastControlTime: new Date().getTime() });
                    if (this.state.btConnect) {
                      this._sendCodeSpecForBle(2, 3, parseInt(value + colorMin).toString(), 5);
                    } else {
                      Service.spec.setPropertiesValue([{
                        did: Device.deviceID,
                        siid: 2,
                        piid: 3,
                        value: parseInt(value + colorMin)
                      }])
                        .then((res) => { // 请求成功
                        }).catch((err) => { // 请求失败
                        });
                    }
                  }}
                  onSlidingComplete={(value) => {
                    this.setState({ isScroll: false });
                    this._sendCodeNotLimit(2, 3, parseInt(value + colorMin));
                  }}
                  minimumTrackTintColor={'rgba(0,0,0,0)'}
                  maximumTrackTintColor={'rgba(0,0,0,0)'}
                />}
            </View>

          </View>

          {Device.model == 'giot.light.v8ssm'
                || Device.model == 'giot.light.v8ssw'
                || Device.model == 'giot.light.dblgt1'
                || Device.model == 'giot.light.hwzd1'
                || Device.model == 'giot.light.xwzd1'
                || Device.model == 'giot.light.xhyd1'
                || Device.model == 'giot.light.hhyd1' ?
            <TouchableOpacity
              disabled={(!Device.isOnline && !this.state.btConnect)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                backgroundColor: '#fff',
                borderRadius: 8,
                marginLeft: 12,
                marginTop: 12,
                marginRight: 12,
                padding: 20
              }}
              onPress={() => {
                if (this.state.btConnect) {
                  this.setState({ tipsVisible: true });
                  return;
                }
                if (!Device.isOnline) {
                  return;
                }
                this.props.navigation.navigate('Shengwu', {
                  btConnect: that.state.btConnect
                });
              }
              }>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Image
                  style={{
                    resizeMode: 'contain'
                  }}
                  source={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/shengwu_dis_dark.png') : require('../resources/shengwu_dis.png') : require('../resources/shengwu_sel.png')}/>

                <View style={{
                  marginLeft: 13
                }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: !this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? (DarkMode.getColorScheme() === 'dark' ? '#00000040' : 'xm#B5B2B3') : '#000',
                      ...Platform.select({
                        ios: {},
                        android: { fontFamily: 'lucida grande' }
                      })
                    }}>{HomeLocalizableString.生物节律功能}</Text>

                  <Text
                    style={{
                      fontSize: 13,
                      color: !this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? (DarkMode.getColorScheme() === 'dark' ? '#00000020' : '#999') : '#999',
                      ...Platform.select({
                        ios: {},
                        android: { fontFamily: 'lucida grande' }
                      })
                    }}>{HomeLocalizableString.灯光跟随生物节律自动变化}</Text>
                </View>

                <View style={{ flex: 1 }}/>

                <Image
                  style={{ tintColor: DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : null }}
                  source={require('../resources/arrow_ic.png')}/>
              </View>
            </TouchableOpacity>
            : null}

          <View style={{ flexDirection: 'row' }}>
            <View style={[styles.tab, {
              flexDirection: 'column',
              flex: 1,
              marginLeft: 12
            }]}>
              <TouchableOpacity
                style={{ flex: 1 }}
                disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                onPress={() => {
                  if (!Device.isOnline && !this.state.btConnect) {
                    return;
                  }
                  if (this.state.lightPower)
                    if (this.state.mode == 9) {
                      this._sendCode(2, 7, 9);
                    } else {
                      this._sendCode(2, 7, 9);
                    }
                }}>
                <View style={{
                  alignItems: 'center',
                  flexDirection: 'row'
                }}>

                  <Image
                    style={{ resizeMode: 'contain', width: 42, height: 42 }}
                    source={
                      !this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/huxi_dark.png') : require('../resources/huxi.png')
                        : this.state.mode == 9 ? require('../resources/huxi_sel.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/huxi_dark.png') : require('../resources/huxi.png')}/>
                  <Text
                    style={{
                      fontSize: Host.locale.language == 'zh' ? 16 : 13,
                      marginLeft: 13,
                      fontWeight: 'bold',
                      color: !this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? '#00000020' : '#000',
                      ...Platform.select({
                        ios: {},
                        android: { fontFamily: 'lucida grande' }
                      })
                    }}>{HomeLocalizableString.呼吸}</Text>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row'
                    }}
                    onPress={() => {
                      this.props.navigation.navigate('SceneModeSettings', {
                        btConnect: that.state.btConnect,
                        mode: 1
                      });
                    }}>

                    <View style={{ flex: 1 }}/>

                    <Image
                      style={{ tintColor: DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : null }}
                      source={require('../resources/arrow_ic.png')}/>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.tab, {
              flexDirection: 'column',
              flex: 1,
              marginLeft: 12,
              marginRight: 12
            }]}>
              <TouchableOpacity
                disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                style={{ flex: 1 }}
                onPress={() => {
                  if (!Device.isOnline && !this.state.btConnect) {
                    return;
                  }
                  if (this.state.lightPower)
                    if (this.state.mode == 10) {
                      this._sendCode(2, 7, 10);
                    } else {
                      this._sendCode(2, 7, 10);
                    }
                }}>
                <View style={{
                  alignItems: 'center',
                  flexDirection: 'row'
                }}>

                  <Image
                    style={{ resizeMode: 'contain', width: 42, height: 42 }}
                    source={
                      !this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ?
                        DarkMode.getColorScheme() === 'dark' ? require('../resources/lvdong_dark.png') : require('../resources/lvdong.png')
                        : !this.state.lightPower ? DarkMode.getColorScheme() === 'dark' ? require('../resources/lvdong_dark.png') : require('../resources/lvdong.png') :
                          this.state.mode == 10 ? require('../resources/lvdong_sel.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/lvdong_dark.png') : require('../resources/lvdong.png')}/>
                  <Text
                    style={{
                      fontSize: Host.locale.language == 'zh' ? 16 : 13,
                      marginLeft: 13,
                      fontWeight: 'bold',
                      color: !this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? '#00000020' : '#000',
                      ...Platform.select({
                        ios: {},
                        android: { fontFamily: 'lucida grande' }
                      })
                    }}>{HomeLocalizableString.律动}</Text>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row'
                    }}
                    onPress={() => {
                      this.props.navigation.navigate('SceneModeSettings', {
                        btConnect: that.state.btConnect,
                        mode: 2
                      });
                    }}>

                    <View style={{ flex: 1 }}/>

                    <Image
                      style={{ tintColor: DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : null }}
                      source={require('../resources/arrow_ic.png')}/>
                  </TouchableOpacity>

                </View>
              </TouchableOpacity>
            </View>
          </View>

          {
            (Device.model != 'leedar.light.600'
                        && Device.model != 'leedar.light.1050'
                        && Device.model != 'leedar.light.470'
                        && Device.model != 'leedar.light.p470'
                        && Device.model != 'leedar.light.345'
                        && Device.model != 'leedar.light.345a'
                        && Device.model != 'devcea.light.ls2302'
                        && Device.model != 'devcea.light.ls2303'
                        && Device.model != 'devcea.light.ls2304'
                        && Device.model != 'devcea.light.ls2305'
                        && Device.model != 'devcea.light.ls2306')
              ?
              <View style={styles.tab}>
                <View style={styles.tabTitleWrapper}>
                  <Text style={{
                    fontSize: 16,
                    color: DarkMode.getColorScheme() == 'dark' ? !this.state.lightPower ? 'xm#565656' : '#000' : !this.state.lightPower ? '#b6b6b6' : '#000'
                  }}>{HomeLocalizableString.scene_mode}</Text>
                </View>

                <View style={styles.buttonGroups}>
                  <IconButton
                    active={this.state.mode == 1}
                    width={52}
                    title={HomeLocalizableString.day_light}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.lightPower)
                        if (this.state.mode == 1) {
                          this._sendCode(2, 7, 1);
                        } else {
                          this._sendCode(2, 7, 1);
                        }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ?
                      DarkMode.getColorScheme() === 'dark' ? require('../resources/sun_dis_btn_dark.png') : require('../resources/sun_dis_btn.png') :
                      DarkMode.getColorScheme() === 'dark' ? require('../resources/sun_btn_dark.png') : require('../resources/sun_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ?
                      DarkMode.getColorScheme() === 'dark' ? require('../resources/sun_dis_btn_dark.png') : require('../resources/sun_dis_btn.png') :
                      require('../resources/sun_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                  <IconButton
                    active={this.state.mode == 2}
                    width={52}
                    title={HomeLocalizableString.moon_light}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.mode == 2) {
                        this._sendCode(2, 7, 2);
                      } else {
                        this._sendCode(2, 7, 2);
                      }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ?
                      DarkMode.getColorScheme() === 'dark' ? require('../resources/moon_dis_btn_dark.png') : require('../resources/moon_dis_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/moon_btn_dark.png') : require('../resources/moon_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/moon_dis_btn_dark.png') : require('../resources/moon_dis_btn.png') : require('../resources/moon_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                  <IconButton
                    active={this.state.mode == 3}
                    width={52}
                    title={HomeLocalizableString.warming}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.lightPower)
                        if (this.state.mode == 3) {
                          this._sendCode(2, 7, 3);
                        } else {
                          this._sendCode(2, 7, 3);
                        }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/warm_dis_btn_dark.png') : require('../resources/warm_dis_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/warm_btn_dark.png') : require('../resources/warm_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/warm_dis_btn_dark.png') : require('../resources/warm_dis_btn.png') : require('../resources/warm_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                  <IconButton
                    active={this.state.mode == 4}
                    width={52}
                    title={HomeLocalizableString.video}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.lightPower)
                        if (this.state.mode == 4) {
                          this._sendCode(2, 7, 4);
                        } else {
                          this._sendCode(2, 7, 4);
                        }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/movie_dis_btn_dark.png') : require('../resources/movie_dis_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/movie_btn_dark.png') : require('../resources/movie_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/movie_dis_btn_dark.png') : require('../resources/movie_dis_btn.png') : require('../resources/movie_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                </View>

                <View style={styles.buttonGroups}>
                  <IconButton
                    active={this.state.mode == 5}
                    width={52}
                    title={HomeLocalizableString.read}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.lightPower)
                        if (this.state.mode == 5) {
                          this._sendCode(2, 7, 5);
                        } else {
                          this._sendCode(2, 7, 5);
                        }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/read_dis_btn_dark.png') : require('../resources/read_dis_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/read_btn_dark.png') : require('../resources/read_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/read_dis_btn_dark.png') : require('../resources/read_dis_btn.png') : require('../resources/read_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                  <IconButton
                    active={this.state.mode == 6}
                    width={52}
                    title={HomeLocalizableString.computer}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.lightPower)
                        if (this.state.mode == 6) {
                          this._sendCode(2, 7, 6);
                        } else {
                          this._sendCode(2, 7, 6);
                        }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/computer_dis_btn_dark.png') : require('../resources/computer_dis_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/computer_btn_dark.png') : require('../resources/computer_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/computer_dis_btn_dark.png') : require('../resources/computer_dis_btn.png') : require('../resources/computer_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                  <IconButton
                    active={this.state.mode == 7}
                    width={52}
                    title={HomeLocalizableString.sleep_aid}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.lightPower)
                        if (this.state.mode == 7) {
                          this._sendCode(2, 7, 7);
                        } else {
                          this._sendCode(2, 7, 7);
                        }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/sleep_dis_btn_dark.png') : require('../resources/sleep_dis_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/sleep_btn_dark.png') : require('../resources/sleep_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/sleep_dis_btn_dark.png') : require('../resources/sleep_dis_btn.png') : require('../resources/sleep_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                  <IconButton
                    active={this.state.mode == 8}
                    width={52}
                    title={HomeLocalizableString.awake}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.mode == 8) {
                        this._sendCode(2, 7, 8);
                      } else {
                        this._sendCode(2, 7, 8);
                      }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={(!Device.isOnline && !this.state.btConnect) ? require('../resources/wake_dis_btn.png') : !this.state.lightPower ? DarkMode.getColorScheme() === 'dark' ? require('../resources/wake_btn_dark.png') : require('../resources/wake_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/wake_btn_dark.png') : require('../resources/wake_btn.png')}
                    activeIcon={(!Device.isOnline && !this.state.btConnect) ? require('../resources/wake_dis_btn.png') : !this.state.lightPower ? DarkMode.getColorScheme() === 'dark' ? require('../resources/wake_btn_dark.png') : require('../resources/wake_btn.png') : require('../resources/wake_sel_btn.png')}
                    disabled={(!Device.isOnline && !this.state.btConnect)}
                  />
                </View>
              </View>
              :
              <View style={styles.tab}>
                <View style={styles.tabTitleWrapper}>
                  <Text style={{
                    fontSize: 16,
                    color: DarkMode.getColorScheme() == 'dark' ? !this.state.lightPower ? 'xm#565656' : '#000' : !this.state.lightPower ? '#b6b6b6' : '#000'
                  }}>{HomeLocalizableString.scene_mode}</Text>
                </View>

                <View style={styles.buttonGroups}>

                  <IconButton
                    active={this.state.mode == 2}
                    width={52}
                    title={HomeLocalizableString.moon_light}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.mode == 2) {
                        this._sendCode(2, 7, 2);
                      } else {
                        this._sendCode(2, 7, 2);
                      }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/moon_dis_btn_dark.png') : require('../resources/moon_dis_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/moon_btn_dark.png') : require('../resources/moon_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/moon_dis_btn_dark.png') : require('../resources/moon_dis_btn.png') : require('../resources/moon_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                  <IconButton
                    active={this.state.mode == 3}
                    width={52}
                    title={HomeLocalizableString.warming}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.lightPower)
                        if (this.state.mode == 3) {
                          this._sendCode(2, 7, 3);
                        } else {
                          this._sendCode(2, 7, 3);
                        }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/warm_dis_btn_dark.png') : require('../resources/warm_dis_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/warm_btn_dark.png') : require('../resources/warm_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/warm_dis_btn_dark.png') : require('../resources/warm_dis_btn.png') : require('../resources/warm_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                  <IconButton
                    active={this.state.mode == 5}
                    width={52}
                    title={HomeLocalizableString.read}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.lightPower)
                        if (this.state.mode == 5) {
                          this._sendCode(2, 7, 5);
                        } else {
                          this._sendCode(2, 7, 5);
                        }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/read_dis_btn_dark.png') : require('../resources/read_dis_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/read_btn_dark.png') : require('../resources/read_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/read_dis_btn_dark.png') : require('../resources/read_dis_btn.png') : require('../resources/read_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                  <IconButton
                    active={this.state.mode == 4}
                    width={52}
                    title={HomeLocalizableString.video}
                    onPress={() => {
                      if (!Device.isOnline && !this.state.btConnect) {
                        return;
                      }
                      if (this.state.lightPower)
                        if (this.state.mode == 4) {
                          this._sendCode(2, 7, 4);
                        } else {
                          this._sendCode(2, 7, 4);
                        }
                    }}
                    theme={Theme[this.colorScheme].hood.levelButtons}
                    inactiveIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/movie_dis_btn_dark.png') : require('../resources/movie_dis_btn.png') : DarkMode.getColorScheme() === 'dark' ? require('../resources/movie_btn_dark.png') : require('../resources/movie_btn.png')}
                    activeIcon={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/movie_dis_btn_dark.png') : require('../resources/movie_dis_btn.png') : require('../resources/movie_sel_btn.png')}
                    disabled={!this.state.lightPower || (!Device.isOnline && !this.state.btConnect)}
                  />
                </View>
              </View>
          }

          <View style={styles.tab}>
            <View style={styles.tabTitleWrapper}>
              <Text style={{
                fontSize: 16,
                color: DarkMode.getColorScheme() == 'dark' ? !this.state.lightPower ? 'xm#565656' : '#000' : !this.state.lightPower ? '#b6b6b6' : '#000'
              }}>{HomeLocalizableString.my_mode}</Text>
            </View>

            <View style={styles.buttonGroups}>
              <MyModeButton
                width={52}
                bri={parseInt(this.state.mode1.split(',')[0])}
                temp={parseInt(this.state.mode1.split(',')[1])}
                onPress={() => {
                  if (this.state.curMode == 1) {
                    b = this.state.mode1.split(',')[0];
                    t = this.state.mode1.split(',')[1];
                    if (Device.model == 'leedar.light.600'
                                        || Device.model == 'leedar.light.1050'
                                        || Device.model == 'leedar.light.470'
                                        || Device.model == 'leedar.light.p470'
                                        || Device.model == 'leedar.light.345'
                                        || Device.model == 'leedar.light.345a'
                                        || Device.model == 'devcea.light.ls2302'
                                        || Device.model == 'devcea.light.ls2303'
                                        || Device.model == 'devcea.light.ls2304'
                                        || Device.model == 'devcea.light.ls2305'
                                        || Device.model == 'devcea.light.ls2306') {
                      this.setState({ birghtnessLightVis2: true });
                    } else {
                      this.setState({ birghtnessLightVis: true });
                    }
                    this.setState({ dialogInit: true });
                    return;
                  }
                  this._sendCodeNotLimit(2, 2, parseInt(this.state.mode1.split(',')[0]));
                  setTimeout(() => {
                    this._sendCodeNotLimit(2, 3, parseInt(this.state.mode1.split(',')[1]));

                  }, 250);

                  this.setState({ mode: 0 });
                  this._setCurModeData(1);
                }}
                theme={Theme[this.colorScheme].hood.levelButtons}
                inactiveColor={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF' : this._getUnColor(this.state.mode1.split(',')[1], this.state.mode1.split(',')[0])}
                activeColor={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF' : this._getColor(this.state.mode1.split(',')[1], this.state.mode1.split(',')[0])}
                disabled={(!Device.isOnline && !this.state.btConnect) || !this.state.lightPower}
                selected={this.state.curMode == 1 && this.state.lightPower}
              />
              <MyModeButton
                width={52}
                bri={parseInt(this.state.mode2.split(',')[0])}
                temp={parseInt(this.state.mode2.split(',')[1])}
                onPress={() => {
                  if (this.state.curMode == 2) {
                    b = this.state.mode2.split(',')[0];
                    t = this.state.mode2.split(',')[1];
                    if (Device.model == 'leedar.light.600'
                                        || Device.model == 'leedar.light.1050'
                                        || Device.model == 'leedar.light.470'
                                        || Device.model == 'leedar.light.p470'
                                        || Device.model == 'leedar.light.345'
                                        || Device.model == 'leedar.light.345a'
                                        || Device.model == 'devcea.light.ls2302'
                                        || Device.model == 'devcea.light.ls2303'
                                        || Device.model == 'devcea.light.ls2304'
                                        || Device.model == 'devcea.light.ls2305'
                                        || Device.model == 'devcea.light.ls2306') {
                      this.setState({ birghtnessLightVis2: true });
                    } else {
                      this.setState({ birghtnessLightVis: true });
                    }
                    this.setState({ dialogInit: true });
                    return;
                  }
                  this._sendCodeNotLimit(2, 2, parseInt(this.state.mode2.split(',')[0]));
                  setTimeout(() => {
                    this._sendCodeNotLimit(2, 3, parseInt(this.state.mode2.split(',')[1]));

                  }, 250);

                  this.setState({ mode: 0 });
                  this._setCurModeData(2);
                }}
                theme={Theme[this.colorScheme].hood.levelButtons}
                inactiveColor={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF' : this._getUnColor(this.state.mode2.split(',')[1], this.state.mode2.split(',')[0])}
                activeColor={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF' : this._getColor(this.state.mode2.split(',')[1], this.state.mode2.split(',')[0])}
                disabled={(!Device.isOnline && !this.state.btConnect) || !this.state.lightPower}
                selected={this.state.curMode == 2 && this.state.lightPower}
              />
              <MyModeButton
                width={52}
                bri={parseInt(this.state.mode3.split(',')[0])}
                temp={parseInt(this.state.mode3.split(',')[1])}
                onPress={() => {
                  if (this.state.curMode == 3) {
                    b = this.state.mode3.split(',')[0];
                    t = this.state.mode3.split(',')[1];
                    if (Device.model == 'leedar.light.600'
                                        || Device.model == 'leedar.light.1050'
                                        || Device.model == 'leedar.light.470'
                                        || Device.model == 'leedar.light.p470'
                                        || Device.model == 'leedar.light.345'
                                        || Device.model == 'leedar.light.345a'
                                        || Device.model == 'devcea.light.ls2302'
                                        || Device.model == 'devcea.light.ls2303'
                                        || Device.model == 'devcea.light.ls2304'
                                        || Device.model == 'devcea.light.ls2305'
                                        || Device.model == 'devcea.light.ls2306') {
                      this.setState({ birghtnessLightVis2: true });
                    } else {
                      this.setState({ birghtnessLightVis: true });
                    }
                    this.setState({ dialogInit: true });
                    return;
                  }
                  this._sendCodeNotLimit(2, 2, parseInt(this.state.mode3.split(',')[0]));
                  setTimeout(() => {
                    this._sendCodeNotLimit(2, 3, parseInt(this.state.mode3.split(',')[1]));
                  }, 250);

                  this.setState({ mode: 0 });
                  this._setCurModeData(3);
                }}
                theme={Theme[this.colorScheme].hood.levelButtons}
                inactiveColor={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF' : this._getUnColor(this.state.mode3.split(',')[1], this.state.mode3.split(',')[0])}
                activeColor={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF' : this._getColor(this.state.mode3.split(',')[1], this.state.mode3.split(',')[0])}
                disabled={(!Device.isOnline && !this.state.btConnect) || !this.state.lightPower}
                selected={this.state.curMode == 3 && this.state.lightPower}
              />
              <MyModeButton
                width={52}
                bri={parseInt(this.state.mode4.split(',')[0])}
                temp={parseInt(this.state.mode4.split(',')[1])}
                onPress={() => {
                  if (this.state.curMode == 4) {
                    b = this.state.mode4.split(',')[0];
                    t = this.state.mode4.split(',')[1];
                    if (Device.model == 'leedar.light.600'
                                        || Device.model == 'leedar.light.1050'
                                        || Device.model == 'leedar.light.470'
                                        || Device.model == 'leedar.light.p470'
                                        || Device.model == 'leedar.light.345'
                                        || Device.model == 'leedar.light.345a'
                                        || Device.model == 'devcea.light.ls2302'
                                        || Device.model == 'devcea.light.ls2303'
                                        || Device.model == 'devcea.light.ls2304'
                                        || Device.model == 'devcea.light.ls2305'
                                        || Device.model == 'devcea.light.ls2306') {
                      this.setState({ birghtnessLightVis2: true });
                    } else {
                      this.setState({ birghtnessLightVis: true });
                    }
                    this.setState({ dialogInit: true });
                    return;
                  }
                  this._sendCodeNotLimit(2, 2, parseInt(this.state.mode4.split(',')[0]));
                  setTimeout(() => {
                    this._sendCodeNotLimit(2, 3, parseInt(this.state.mode4.split(',')[1]));

                  }, 250);

                  this.setState({ mode: 0 });
                  this._setCurModeData(4);
                }}
                theme={Theme[this.colorScheme].hood.levelButtons}
                inactiveColor={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF' : this._getUnColor(this.state.mode4.split(',')[1], this.state.mode4.split(',')[0])}
                activeColor={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? 'xm#C2C2C210' : '#ECEEEF' : this._getColor(this.state.mode4.split(',')[1], this.state.mode4.split(',')[0])}
                disabled={(!Device.isOnline && !this.state.btConnect) || !this.state.lightPower}
                selected={this.state.curMode == 4 && this.state.lightPower}
              />
            </View>

          </View>

          {Device.isOwner ?
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'column'
              }}>

              <TouchableOpacity
                disabled={(!Device.isOnline && !this.state.btConnect)}
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  marginLeft: 12,
                  marginTop: 12,
                  marginRight: 12,
                  padding: 20
                }}
                onPress={() => {
                  if (this.state.btConnect) {
                    this.setState({ tipsVisible: true });
                    return;
                  }
                  if (!Device.isOnline) {
                    return;
                  }
                  this.openTimerSettingPageWithOptions();
                }}>
                <View style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  flex: 1
                }}>
                  <Image
                    style={{
                      resizeMode: 'contain'
                    }}
                    source={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/timer_dis_ic_dark.png') : require('../resources/timer_dis_ic.png') : require('../resources/timer_ic.png')}/>
                  <Text
                    style={{
                      fontSize: 16,
                      color: (!Device.isOnline && !this.state.btConnect) ? 'xm#B5B2B3' : '#000',
                      marginLeft: 13,
                      ...Platform.select({
                        ios: {},
                        android: { fontFamily: 'lucida grande' }
                      })
                    }}>{HomeLocalizableString.timing_on_off}</Text>

                  <View style={{ flex: 1 }}/>

                  <Image
                    style={{
                      resizeMode: 'contain'
                    }}
                    source={require('../resources/arrow_ic.png')}/>
                </View>
              </TouchableOpacity>


              <TouchableOpacity
                disabled={(!Device.isOnline && !this.state.btConnect)}
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  marginLeft: 12,
                  marginTop: 12,
                  marginRight: 12,
                  padding: 20
                }}
                onPress={() => {
                  if (this.state.btConnect) {
                    this.setState({ tipsVisible: true });
                    return;
                  }
                  if (!Device.isOnline) {
                    return;
                  }
                  this.openCountDownPage();
                }
                }>
                <View style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  flex: 1
                }}>
                  <Image
                    style={{
                      resizeMode: 'contain'
                    }}
                    source={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/countdown_dis_ic_dark.png') : require('../resources/countdown_dis_ic.png') : require('../resources/countdown_ic.png')}/>
                  <Text
                    style={{
                      fontSize: 16,
                      color: (!Device.isOnline && !this.state.btConnect) ? 'xm#B5B2B3' : '#000',
                      marginLeft: 13,
                      ...Platform.select({
                        ios: {},
                        android: { fontFamily: 'lucida grande' }
                      })
                    }}>{HomeLocalizableString.count_time}</Text>

                  <View style={{ flex: 1 }}/>

                  <Image
                    style={{
                      resizeMode: 'contain'
                    }}
                    source={require('../resources/arrow_ic.png')}/>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={(!Device.isOnline && !this.state.btConnect)}
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  marginLeft: 12,
                  marginTop: 12,
                  marginRight: 12,
                  padding: 20
                }}
                onPress={() => {
                  if (!Device.isOnline && !this.state.btConnect) {
                    return;
                  }
                  Service.scene.openIftttAutoPage();
                }
                }>
                <View style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  flex: 1
                }}>
                  <Image
                    style={{
                      resizeMode: 'contain'
                    }}
                    source={(!Device.isOnline && !this.state.btConnect) ? DarkMode.getColorScheme() === 'dark' ? require('../resources/sence_dis_ic_dark.png') : require('../resources/sence_dis_ic.png') : require('../resources/sence_ic.png')}/>
                  <Text
                    style={{
                      fontSize: 16,
                      color: (!Device.isOnline && !this.state.btConnect) ? 'xm#B5B2B3' : '#000',
                      marginLeft: 13,
                      ...Platform.select({
                        ios: {},
                        android: { fontFamily: 'lucida grande' }
                      })
                    }}>{HomeLocalizableString.intelligence}</Text>

                  <View style={{ flex: 1 }}/>

                  <Image
                    style={{
                      resizeMode: 'contain'
                    }}
                    source={require('../resources/arrow_ic.png')}/>
                </View>
              </TouchableOpacity>
            </View>
            : null
          }

          <Text
            style={{
              fontSize: 10,
              color: '#FFFFFF',
              margin: 20,
              alignItems: 'center',
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}></Text>
        </View>
      );
    }

    _getCurModeData() {
      let params = {
        'did': Device.deviceID, 'props': [
          "prop.curMode"
        ]
      };
      Service.smarthome.batchGetDeviceDatas([params]).then((res) => {
        Object.keys(res).map((key, index) => {
          if (index == 0) {
            if (res[key]["prop.curMode"] != null || res[key]["prop.curMode"] != '') {
              // console.log(`cur->${res[key]["prop.curMode"]}`);
              this.setState({ curMode: res[key]["prop.curMode"] });
            }
          }
        });
      }).catch((err) => {

      });
    }

    _getMyModeData() {
      let params = {
        'did': Device.deviceID, 'props': [
          "prop.mode1", "prop.mode2", "prop.mode3", "prop.mode4"
        ]
      };
      Service.smarthome.batchGetDeviceDatas([params]).then((res) => {
        console.log(`res->${ JSON.stringify(res) }`);
        Object.keys(res).map((key, index) => {
          if (index == 0) {
            if (res[key]["prop.mode1"] != null && res[key]["prop.mode1"] != '') {
              console.log(`1->${ res[key]["prop.mode1"] }`);
              this.setState({ mode1: res[key]["prop.mode1"] });
            }
            if (res[key]["prop.mode2"] != null && res[key]["prop.mode2"] != '') {
              console.log(`2->${ res[key]["prop.mode2"] }`);
              this.setState({ mode2: res[key]["prop.mode2"] });
            }
            if (res[key]["prop.mode3"] != null && res[key]["prop.mode3"] != '') {
              console.log(`3->${ res[key]["prop.mode3"] }`);
              this.setState({ mode3: res[key]["prop.mode3"] });
            }
            if (res[key]["prop.mode4"] != null && res[key]["prop.mode4"] != '') {
              console.log(`4->${ res[key]["prop.mode4"] }`);
              this.setState({ mode4: res[key]["prop.mode4"] });
            }
          }
        });
      }).catch((err) => {

      });
    }

    _setMyModeData(id, bright, color) {
      if (id == 1) {
        Service.smarthome.batchSetDeviceDatas([{
          'did': Device.deviceID, 'props': {
            'prop.mode1': `${ bright },${ color }`
          }
        }]).then(((value) => {
          this._getMyModeData();
        })).catch((err) => {
          console.log(JSON.stringify(err));
        });
      } else if (id == 2) {
        Service.smarthome.batchSetDeviceDatas([{
          'did': Device.deviceID, 'props': {
            'prop.mode2': `${ bright },${ color }`
          }
        }]).then(((value) => {
          this._getMyModeData();
        })).catch((err) => {
          console.log(JSON.stringify(err));
        });
      } else if (id == 3) {
        Service.smarthome.batchSetDeviceDatas([{
          'did': Device.deviceID, 'props': {
            'prop.mode3': `${ bright },${ color }`
          }
        }]).then(((value) => {
          this._getMyModeData();
        })).catch((err) => {
          console.log(JSON.stringify(err));
        });
      } else if (id == 4) {
        Service.smarthome.batchSetDeviceDatas([{
          'did': Device.deviceID, 'props': {
            'prop.mode4': `${ bright },${ color }`
          }
        }]).then(((value) => {
          this._getMyModeData();
        })).catch((err) => {
          console.log(JSON.stringify(err));
        });
      }
    }

    _setCurModeData(id) {
      Service.smarthome.batchSetDeviceDatas([{
        'did': Device.deviceID, 'props': {
          'prop.curMode': `${ id }`
        }
      }]).then(((value) => {
        this._getCurModeData();
      })).catch((err) => {
        console.log(JSON.stringify(err));
      });
    }

    openTimerSettingPageWithOptions() {
      let params = {
        onMethod: "set_properties",
        offMethod: "set_properties",
        onParam: [{
          did: Device.deviceID,
          siid: 2,
          piid: 1,
          value: true
        }],
        offParam: [{
          did: Device.deviceID,
          siid: 2,
          piid: 1,
          value: false
        }],
        timerTitle: HomeLocalizableString.timing,
        displayName: HomeLocalizableString.timer,
        identify: "identify_1",
        onTimerTips: '',
        offTimerTips: '',
        listTimerTips: '',
        bothTimerMustBeSet: false,
        showOnTimerType: true,
        showOffTimerType: true,
        showPeriodTimerType: true
      };
      Service.scene.openTimerSettingPageWithOptions(params);
    }

    openCountDownPage() {
      let params = {
        onMethod: "set_properties",
        offMethod: "set_properties",
        onParam: [{
          did: Device.deviceID,
          siid: 2,
          piid: 1,
          value: true
        }],
        offParam: [{
          did: Device.deviceID,
          siid: 2,
          piid: 1,
          value: false
        }],
        identify: "custom",
        displayName: HomeLocalizableString.count_time
      };
      Service.scene.openCountDownPage(this.state.lightPower, params);
    }


    generateArrayFromRange(start, finish) {
      return Array.apply(null, Array(finish - start + 1)).map((_, i) => start + i);
    }

    _lightClick(flag) {
      if (flag) {
        this._sendCode(2, 1, false);
      } else {
        this._sendCode(2, 1, true);
      }
    }

    _helpLightClick(flag) {
      if (flag) {
        this._sendCode(4, 21, false);
      } else {
        this._sendCode(4, 21, true);
      }
    }

    _sendCode(Siid, Piid, Value) { // 发送指令  一组参数
      if (this.state.finalPairFail) {
        // 匹配失败 不响应
        this.setState({ pairFail: true });
        return;
      }

      // 一旦控制立马停止延迟查询
      if (this.interval) {
        clearTimeout(this.interval);
      }

      if ((Siid == 2 && Piid == 1) || (Siid == 3 && Piid == 21)) {
        // 开关灯不拦截亮度和色温
      } else {
        this.setState({ lastControlBrightOrTemp: new Date().getTime() });
      }
      this.setState({ lastControlTime: new Date().getTime() });

      this._updataUi({ siid: Siid, piid: Piid }, Value);

      if (this.state.btConnect) {
        if (Piid == 1 || Piid == 21) {
          // 开关
          this._sendCodeSpecForBle(Siid, Piid, Value, 0);
        } else if (Piid == 3) {
          // 色温
          this._sendCodeSpecForBle(Siid, Piid, Value, 5);
        } else {
          this._sendCodeSpecForBle(Siid, Piid, Value, 1);
        }
      } else {
        console.log(`发送指令---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ Siid }--${ Piid }--${ Value }`);
        Service.spec.setPropertiesValue([{ did: Device.deviceID, siid: Siid, piid: Piid, value: Value }])
          .then((res) => { // 请求成功
            if ((Siid == 2 && Piid == 1) || (Siid == 3 && Piid == 21)) {
              this._delayGet();
            }
            console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
            // this._updataUi(res[0], Value);
          }).catch((err) => { // 请求失败
            // console.log(new Date().getHours() + ':' + new Date().getMinutes() + '====>' + JSON.stringify(err));
          });
      }
    }

    _delayGet() {
      if (this.interval) {
        clearTimeout(this.interval);
      }
      this.interval = setTimeout(() => {
        console.log('结束查询');
        this._getPropsSpec2();
      }, 3000);
    }

    _encryptionTimeout() {
      if (this.encryptionInterval) {
        clearInterval(this.encryptionInterval);
      }
      this.encryptionInterval = setInterval(() => {
        clearInterval(this.encryptionInterval);
        this.setState({ pairFail: true });
        this.setState({ finalPairFail: true });
      }, 10000);
    }

    _sendCodeNotLimit(Siid, Piid, Value) { // 发送指令  一组参数
      this.setState({ lastControlBrightOrTemp: new Date().getTime() });
      this.setState({ lastControlTime: new Date().getTime() });

      this._updataUi({ siid: Siid, piid: Piid }, Value);

      if (this.state.btConnect) {
        if (Piid == 1) {
          // 开关
          this._sendCodeSpecForBle(Siid, Piid, Value, 0);
        } else if (Piid == 3) {
          // 色温
          this._sendCodeSpecForBle(Siid, Piid, Value, 5);
        } else {
          this._sendCodeSpecForBle(Siid, Piid, Value, 1);
        }
      } else {
        console.log(`发送指令---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ Siid }--${ Piid }--${ Value }`);
        Service.spec.setPropertiesValue([{ did: Device.deviceID, siid: Siid, piid: Piid, value: Value }])
          .then((res) => { // 请求成功
            console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
            if ((Siid == 2 && Piid == 1) || (Siid == 3 && Piid == 21)) {
              this._delayGet();
            }
          }).catch((err) => { // 请求失败
          });
      }
    }

    // 通知下发数据，发送完成检查是否还有需要发送的数据
    syncToSendSpecData() {
      if (isFree)
        if (waitToSendDatas.length > 0) {
          this.addLog(`syncToSendSpecData 执行->${ JSON.stringify(waitToSendDatas[0]) }`);
          isFree = false;

          let data = waitToSendDatas[0].entity;
          let json = JSON.stringify(data);
          Bluetooth.spec.setPropertiesValue(bt.mac, json)
            .then((res) => {
              console.log(`spec setPropertiesValue,方法返回 = ${ JSON.stringify(res) }`);

              let Siid = waitToSendDatas[0].entity.objects[0].siid;
              let Piid = waitToSendDatas[0].entity.objects[0].piid;
              let Value = waitToSendDatas[0].entity.objects[0].value;

              console.log(`ble---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
              let result = Platform.OS === 'android' ? JSON.parse(res) : res;
              if (Siid == 2) {
                if (Piid == 1 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
                  this.setState({ lightPower: Value });

                  if (Value) {
                    this.props.navigation.setParams({
                      type: NavigationBar.TYPE.LIGHT,
                      backgroundColor: ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(this.state.color_temperature, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(this.state.brightness * (185 / 100) + 70)).toString(16),
                      title: Device.name
                    });
                  } else {
                    this.props.navigation.setParams({
                      type: NavigationBar.TYPE.DARK,
                      backgroundColor: 'rgb(14,10,28)',
                      title: Device.name
                    });
                  }
                  // this._delayGet();
                } else if (Piid == 7 && (result.objects[0].code == 0 || result.objects[0].code == 1)) {
                  /* this.setState({
                                    mode: Value
                                }); */
                  this.setState({ lockMode: true });
                  // this._setModeBrightAndColortemp(Value);
                }
              } else if (Siid == 3 && Piid == 21) {
                this.setState({
                  helpLight: Value
                });
              }

              waitToSendDatas.splice(0, 1);
              isFree = true;
              this.syncToSendSpecData();
            })
            .catch((err) => {
              console.log(`spec setPropertiesValue fail=${ JSON.stringify(err) }`);

              waitToSendDatas.splice(0, 1);
              isFree = true;
              this.syncToSendSpecData();
            });
        }
    }

    _sendCodeSpecForBle(Siid, Piid, Value, Type) { // 发送指令  一组参数
      console.log('_sendCodeSpecForBle');
      let data = { objects: [{ siid: parseInt(Siid), piid: parseInt(Piid), value: Value, type: Type }] };
      waitToSendDatas.push({ 'specWay': 'setProperties', 'entity': data });
      this.syncToSendSpecData();
    }

    _updataUi(res, Value) {
      if (res.siid == 2) { // 灯组
        if (res.piid == 1) { // 灯开关
          this.setState({ lightPower: Value });
          this.setState({ helpLight: Value });
          DataUtils.setLightPower(Value);

          if (Value) {
            this.props.navigation.setParams({
              type: NavigationBar.TYPE.LIGHT,
              backgroundColor: ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(this.state.color_temperature, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(this.state.brightness * (185 / 100) + 70)).toString(16),
              title: Device.name
            });

            this.setState({ mode: -1 });
          } else {
            this.props.navigation.setParams({
              type: NavigationBar.TYPE.DARK,
              backgroundColor: 'rgb(14,10,28)',
              title: Device.name
            });
          }

          this._setCurModeData(-1);
        } else if (res.piid == 2) { // 亮度
          this.setState({ brightness: Value });
          DataUtils.setBrightness(Value);
          this._setTitleBarNew(this._getColor(this.state.color_temperature, Value));
        } else if (res.piid == 3) { // 色温
          this.setState({ color_temperature: Value });
          DataUtils.setColorTemperature(Value);
          this._setTitleBarNew(this._getColor(Value, this.state.brightness));
        } else if (res.piid == 7) { // 模式
          this.setState({ curMode: 0 });
          this.setState({ mode: Value });
          this.setState({ lockMode: true });
          this._setModeBrightAndColortemp(Value);
        }
      } else if (res.siid == 3) { // 灯组
        if (res.piid == 21) {
          this.setState({ helpLight: Value });
        }
      }
    }


    _setModeBrightAndColortemp(Value) {
      if (Value == 0) {
        return;
      }
      console.log(`_setModeBrightAndColortemp->${ Value }`);
      let brightness = 0;
      let color_temperature = 0;
      let helpLight = false;
      if (Value == 1) {
        brightness = 100;
        color_temperature = Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 5400 : 5550;
        helpLight = true;
      } else if (Value == 2) {
        brightness = 1;
        color_temperature =
                Device.model == 'leedar.light.600'
                || Device.model == 'leedar.light.1050'
                || Device.model == 'leedar.light.470'
                || Device.model == 'leedar.light.p470'
                || Device.model == 'leedar.light.345'
                || Device.model == 'leedar.light.345a'
                || Device.model == 'devcea.light.ls2302'
                || Device.model == 'devcea.light.ls2303'
                || Device.model == 'devcea.light.ls2304'
                || Device.model == 'devcea.light.ls2305'
                || Device.model == 'devcea.light.ls2306' ? 4000 : Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 2700 : 4600;
        helpLight = false;
      } else if (Value == 3) {
        brightness = 75;
        color_temperature = Device.model == 'leedar.light.600'
            || Device.model == 'leedar.light.1050'
            || Device.model == 'leedar.light.470'
            || Device.model == 'leedar.light.p470'
            || Device.model == 'leedar.light.345'
            || Device.model == 'leedar.light.345a'
            || Device.model == 'devcea.light.ls2302'
            || Device.model == 'devcea.light.ls2303'
            || Device.model == 'devcea.light.ls2304'
            || Device.model == 'devcea.light.ls2305'
            || Device.model == 'devcea.light.ls2306' ? 2700 : Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 3600 : colorMin;
        helpLight = true;
      } else if (Value == 4) {
        brightness = Device.model == 'leedar.light.600'
            || Device.model == 'leedar.light.1050'
            || Device.model == 'leedar.light.470'
            || Device.model == 'leedar.light.p470'
            || Device.model == 'leedar.light.345'
            || Device.model == 'leedar.light.345a'
            || Device.model == 'devcea.light.ls2302'
            || Device.model == 'devcea.light.ls2303'
            || Device.model == 'devcea.light.ls2304'
            || Device.model == 'devcea.light.ls2305'
            || Device.model == 'devcea.light.ls2306' ? 15 : 25;
        color_temperature = Device.model == 'leedar.light.600'
            || Device.model == 'leedar.light.1050'
            || Device.model == 'leedar.light.470'
            || Device.model == 'leedar.light.p470'
            || Device.model == 'leedar.light.345'
            || Device.model == 'leedar.light.345a'
            || Device.model == 'devcea.light.ls2302'
            || Device.model == 'devcea.light.ls2303'
            || Device.model == 'devcea.light.ls2304'
            || Device.model == 'devcea.light.ls2305'
            || Device.model == 'devcea.light.ls2306' ? 3000 : Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 3900 : 3460;
        helpLight = false;
      } else if (Value == 5) {
        brightness = 100;
        color_temperature = Device.model == 'leedar.light.600'
            || Device.model == 'leedar.light.1050'
            || Device.model == 'leedar.light.470'
            || Device.model == 'leedar.light.p470'
            || Device.model == 'leedar.light.345'
            || Device.model == 'leedar.light.345a'
            || Device.model == 'devcea.light.ls2302'
            || Device.model == 'devcea.light.ls2303'
            || Device.model == 'devcea.light.ls2304'
            || Device.model == 'devcea.light.ls2305'
            || Device.model == 'devcea.light.ls2306' ? 3800 : Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 3900 : 3460;
        helpLight = true;
      } else if (Value == 6) {
        brightness = 25;
        color_temperature = Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 5400 : 5550;
        helpLight = false;
      } else if (Value == 8) {
        brightness = 1;
        color_temperature = colorMin;
        helpLight = this.state.helpLight;
        this.setState({ lightPower: true });
      } else if (Value == 7) {
        helpLight = this.state.helpLight;
        if (this.state.awake) {
          // brightness = this.state.startBright;
          // color_temperature = this.state.startColor;
          this.setState({ lightPower: true });
          return;
        } else {
          // brightness = 80;
          // color_temperature = 4600;
          this.setState({ lightPower: true });
          return;
        }
      } else {
        // 其他模式不修改
        return;
      }
      this.setState({ helpLight: helpLight });
      this.setState({ brightness: brightness });
      this.setState({ color_temperature: color_temperature });
      this.props.navigation.setParams({
        type: NavigationBar.TYPE.LIGHT,
        backgroundColor: this._getColor(color_temperature, brightness),
        title: Device.name
      });
    }

}


const styles = StyleSheet.create({
  topButtonContainer: {
    flexDirection: 'row',
    marginTop: 20
  },
  topButtonItemContainer: {
    flexDirection: 'column',
    flex: 1
  },
  buttonTextFont: {
    color: '#e8e8e8',
    ...Platform.select({
      ios: {},
      android: { fontFamily: 'lucida grande' }
    }),
    marginTop: 10,
    alignSelf: 'center'
  },
  modalNorTextFont: {
    color: '#929292',
    ...Platform.select({
      ios: {},
      android: { fontFamily: 'lucida grande' }
    }),
    marginTop: 10,
    alignSelf: 'center'
  },
  fanSpeedContainer: {
    flexDirection: 'row',
    marginTop: 20
  },
  fanSpeedText: {
    textAlign: 'center',
    alignSelf: 'center',
    color: '#000',
    marginLeft: 20,
    fontSize: 16,
    ...Platform.select({
      ios: {},
      android: { fontFamily: 'lucida grande' }
    })
  },
  fanSpeedTextValue: {
    textAlign: 'center',
    alignSelf: 'center',
    color: '#e99036',
    marginLeft: 10,
    fontSize: 17,
    ...Platform.select({
      ios: {},
      android: { fontFamily: 'lucida grande' }
    })
  },
  sliderStyle: {
    marginTop: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        marginLeft: 20,
        marginRight: 20
      },
      android: {
        marginLeft: 20,
        marginRight: 20
      }
    })
  },
  trunButton: {
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',

    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#e99036',
    color: '#e99036',
    borderRadius: 20,
    marginLeft: 50,
    marginRight: 50,
    marginTop: 30,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        lineHeight: 36
      },
      android: { fontFamily: 'lucida grande' }
    })
  },
  lineView: {
    backgroundColor: 'rgb(230,230,230)',
    height: 1
  },
  trunButtonGray: {
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',

    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#d2d2d2',
    color: 'rgb(0,0,0)',
    borderRadius: 20,
    marginLeft: 50,
    marginRight: 50,
    marginTop: 30,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        lineHeight: 36
      },
      android: { fontFamily: 'lucida grande' }
    })
  },

  // control
  tab: {
    width: '94%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: '#fff'
  },
  tabTitleWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    color: '#000'
  },
  tabTitleLabel: {
    fontSize: 16,
    color: '#000'
  },
  tabTitleSeparator: {
    marginHorizontal: 5,
    color: '#999'
  },
  tabTitleSubLabel: {
    fontSize: 16,
    color: '#999'
  },
  buttonGroups: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 20
  },
  circle: {
    width: 30,
    height: 30
  }
});
