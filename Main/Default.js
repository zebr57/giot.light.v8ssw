import React from "react";
import { Image, ListView, Platform, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import LocalizableString from './HomeLocalizableString';
import HomeLocalizableString from './HomeLocalizableString';
import { Bluetooth, Device, DeviceEvent, Service, DarkMode } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import NavigationBar from "miot/ui/NavigationBar";
import { MessageDialog } from "miot/ui/Dialog";
import { LoadingDialog } from "miot/ui";
import DataUtils from "./Utils/DataUtils";
import Switch from "miot/ui/Switch";

let data = [];

let msgSubscription = null;
const getPropsPara =
    [
      { did: Device.deviceID, siid: 4, piid: 1 },
      { did: Device.deviceID, siid: 4, piid: 2 },
      { did: Device.deviceID, siid: 4, piid: 3 },
      { did: Device.deviceID, siid: 4, piid: 4 },
      { did: Device.deviceID, siid: 4, piid: 5 },
      { did: Device.deviceID, siid: 4, piid: 6 }];

const bt = Device.getBluetoothLE();

export default class Default extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <NavigationBar
          backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
          type={NavigationBar.TYPE.LIGHT}
          title={LocalizableString.default}
          left={[
            {
              key: 'back',
              onPress: (_) => navigation.goBack()
            }
          ]}/>
      };
    };

    constructor(props) {
      super(props);
      // 创建datasource数据源
      const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.state = {
        lightPower: DataUtils.getDefaultData()[0], // 灯开关
        brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
        color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
        powerOnState: DataUtils.getDefaultData()[3],
        turnOnState: DataUtils.getDefaultData()[4],
        defaultBright: DataUtils.getDefaultData()[5],
        defaultTemp: DataUtils.getDefaultData()[6],
        fenduan: DataUtils.getFenDuanData()[0],
        quxian: DataUtils.getQuXianData()[0],

        loadingVis: false,
        btConnect: props.navigation.state.params.btConnect,
        lastControlTime: 0
      };
    }

    _getProps() {
      Service.spec.getPropertiesValue(getPropsPara)
        .then((res) => { // 请求成功
          console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          if (res[0].code == 0) {
            DataUtils.parse3_1(res[0].value);
          }

          if (res[1].code == 0) {
            DataUtils.parse3_2(res[1].value);
          }

          if (res[2].code == 0) {
            DataUtils.parse3_3(res[2].value);
          }

          if (res[3].code == 0) {
            DataUtils.parse3_4(res[3].value);
          }

          if (res[4].code == 0) {
            DataUtils.parse3_5(res[4].value);
          }

          if (res[5].code == 0) {
            DataUtils.parse3_6(res[5].value);
          }
          this.setState({
            lightPower: DataUtils.getDefaultData()[0], // 灯开关
            brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
            color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
            powerOnState: DataUtils.getDefaultData()[3],
            turnOnState: DataUtils.getDefaultData()[4],
            defaultBright: DataUtils.getDefaultData()[5],
            defaultTemp: DataUtils.getDefaultData()[6],
            fenduan: DataUtils.getFenDuanData()[0],
            quxian: DataUtils.getQuXianData()[0]
          });
        });
    }

    _getPropsSpecBle1() {
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
          this.setState({
            lightPower: DataUtils.getDefaultData()[0], // 灯开关
            brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
            color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
            powerOnState: DataUtils.getDefaultData()[3],
            turnOnState: DataUtils.getDefaultData()[4],
            defaultBright: DataUtils.getDefaultData()[5],
            defaultTemp: DataUtils.getDefaultData()[6],
            fenduan: DataUtils.getFenDuanData()[0],
            quxian: DataUtils.getQuXianData()[0]
          });
          this._getPropsSpecBle2();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle2() {
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
        this.addLog(`get property resp2 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_2(jsonData.objects[0].value);
          this.setState({
            lightPower: DataUtils.getDefaultData()[0], // 灯开关
            brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
            color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
            powerOnState: DataUtils.getDefaultData()[3],
            turnOnState: DataUtils.getDefaultData()[4],
            defaultBright: DataUtils.getDefaultData()[5],
            defaultTemp: DataUtils.getDefaultData()[6]
          });
          this._getPropsSpecBle3();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle3() {
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

        this.addLog(`get property resp3 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_3(jsonData.objects[0].value);
          this.setState({
            lightPower: DataUtils.getDefaultData()[0], // 灯开关
            brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
            color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
            powerOnState: DataUtils.getDefaultData()[3],
            turnOnState: DataUtils.getDefaultData()[4],
            defaultBright: DataUtils.getDefaultData()[5],
            defaultTemp: DataUtils.getDefaultData()[6]
          });
          this._getPropsSpecBle4();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle4() {
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

        this.addLog(`get property resp4 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_4(jsonData.objects[0].value);
          this.setState({
            lightPower: DataUtils.getDefaultData()[0], // 灯开关
            brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
            color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
            powerOnState: DataUtils.getDefaultData()[3],
            turnOnState: DataUtils.getDefaultData()[4],
            defaultBright: DataUtils.getDefaultData()[5],
            defaultTemp: DataUtils.getDefaultData()[6]
          });
          this._getPropsSpecBle5();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle5() {
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
        this.addLog(`get property resp4 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_5(jsonData.objects[0].value);
          this.setState({
            lightPower: DataUtils.getDefaultData()[0], // 灯开关
            brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
            color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
            powerOnState: DataUtils.getDefaultData()[3],
            turnOnState: DataUtils.getDefaultData()[4],
            defaultBright: DataUtils.getDefaultData()[5],
            defaultTemp: DataUtils.getDefaultData()[6]
          });
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
        "piid": 6
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.addLog(`get property resp4 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

        this.setState({ loadingVis: false });
        this.setState({ devFinalOffline: false });

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_6(jsonData.objects[0].value);
          this.setState({
            lightPower: DataUtils.getDefaultData()[0], // 灯开关
            brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
            color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
            powerOnState: DataUtils.getDefaultData()[3],
            turnOnState: DataUtils.getDefaultData()[4],
            defaultBright: DataUtils.getDefaultData()[5],
            defaultTemp: DataUtils.getDefaultData()[6]
          });
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _subscribeProps() {
      if (this.state.btConnect) {
        this.listenerBle = DeviceEvent.BLESpecNotifyActionEvent.addListener((device, result) => {
          if (new Date().getTime() - this.state.lastControlTime < 3000) {
            return;
          }
          result.forEach((key, value) => {
            console.log(`receive prop(event) changed notification,prop:${ key },${ JSON.stringify(value) }`);
            if (value == 'prop.4.1') {
              DataUtils.parse3_1(key);
            }

            if (value == 'prop.4.2') {
              DataUtils.parse3_2(key);
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

            if (value == 'prop.4.6') {
              DataUtils.parse3_6(key);
            }

            this.setState({
              lightPower: DataUtils.getDefaultData()[0], // 灯开关
              brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
              color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
              powerOnState: DataUtils.getDefaultData()[3],
              turnOnState: DataUtils.getDefaultData()[4],
              defaultBright: DataUtils.getDefaultData()[5],
              defaultTemp: DataUtils.getDefaultData()[6],
              fenduan: DataUtils.getFenDuanData()[0],
              quxian: DataUtils.getQuXianData()[0]
            });
          });
        });

        this._getPropsSpecBle1();
      } else {
        // 先订阅属性变更事件
        this.listener = DeviceEvent.deviceReceivedMessages.addListener((device, messages) => {
          if (new Date().getTime() - this.state.lastControlTime < 3000) {
            return;
          }
          if (messages.has('prop.4.1')) {
            DataUtils.parse3_1(messages.get('prop.4.1')[0]);
          }
          if (messages.has('prop.4.2')) {
            DataUtils.parse3_2(messages.get('prop.4.2')[0]);
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

          this.setState({
            lightPower: DataUtils.getDefaultData()[0], // 灯开关
            brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
            color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
            powerOnState: DataUtils.getDefaultData()[3],
            turnOnState: DataUtils.getDefaultData()[4],
            defaultBright: DataUtils.getDefaultData()[5],
            defaultTemp: DataUtils.getDefaultData()[6],
            fenduan: DataUtils.getFenDuanData()[0],
            quxian: DataUtils.getQuXianData()[0]
          });
        }
        );

        Device.getDeviceWifi().subscribeMessages(
          'prop.4.1', 'prop.4.2', 'prop.4.3', 'prop.4.4', 'prop.4.5', 'prop.4.6')
          .then((subcription) => {
            // call this when you need to unsubscribe the message
            // 订阅成功
            msgSubscription = subcription;
            // console.log('subscribe success');
          })
          .catch(() => {
            // 订阅失败
            // console.log('subscribe failed');
          });
      }
    }

    componentWillMount() {
      if (this.state.btConnect) {
        this.setState({ loadingVis: true });
        this._subscribeProps();
      } else {
        this._getProps();
        this._subscribeProps();
      }
    }

    componentWillUnmount() {
      if (this.interval) {
        clearTimeout(this.interval);
      }
      msgSubscription && msgSubscription.remove();

      this.listener && this.listener.remove();

      this.listener1 && this.listener1.remove();

      if (this.listenerBle) {
        this.listenerBle.remove();
      }
    }


    render() {
      return (
        <ScrollView style={styles.containAll}>

          <Text style={{
            color: '#999999',
            fontSize: 13,
            marginTop: 7,
            marginLeft: 24,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.通电状态}</Text>

          <View style={{
            backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff',
            paddingLeft: 25,
            paddingRight: 25,
            paddingTop: 15,
            paddingBottom: 15,
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center'
          }}>

            <View>
              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: 'bold',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.开灯}</Text>

              <Text style={{
                color: '#999999',
                fontSize: 13,
                marginTop: 7,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.开灯提示语}</Text>
            </View>

            <View style={{ flex: 1 }}/>

            <TouchableOpacity
              onPress={() => {
                this._sendCode(4, 1, DataUtils.getPowerOnParams(true));
              }}>
              {this._checkBoxView(this.state.powerOnState)}
            </TouchableOpacity>

          </View>

          <View style={{
            backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff',
            paddingLeft: 25,
            paddingRight: 25,
            paddingTop: 10,
            paddingBottom: 15,
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center'
          }}>

            <View>
              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: 'bold',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.关灯}</Text>

              <Text style={{
                color: '#999999',
                fontSize: 13,
                marginTop: 7,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.关灯提示语}</Text>
            </View>

            <View style={{ flex: 1 }}/>

            <TouchableOpacity
              onPress={() => {
                this._sendCode(4, 1, DataUtils.getPowerOnParams(false));
              }}>
              {this._checkBoxView(!this.state.powerOnState)}
            </TouchableOpacity>

          </View>

          <Text style={{
            color: '#999999',
            fontSize: 12,
            marginTop: 7,
            marginLeft: 24,
            marginRight: 24,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{Device.model == 'rjxn20.light.rjxndd' || Device.model == 'rjxn20.light.rjxncx' ? HomeLocalizableString.通电状态提示语2 : HomeLocalizableString.通电状态提示语}</Text>

          <Text style={{
            color: '#999999',
            fontSize: 13,
            marginTop: 40,
            marginLeft: 24,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.开灯状态}</Text>

          <View style={{
            backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff',
            paddingLeft: 25,
            paddingRight: 25,
            paddingTop: 15,
            marginTop: 10,
            paddingBottom: 15,
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center'
          }}>

            <View>
              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: 'bold',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.关灯前状态}</Text>

              <Text style={{
                color: '#999999',
                fontSize: 13,
                marginTop: 7,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{
                  Device.model == 'nvcsmt.light.bas202'
                            || Device.model == 'nvcsmt.light.bcs201'
                            || Device.model == 'ym001.light.v8w'
                            || Device.model == 'giot.light.dblgt1'
                            || Device.model == 'giot.light.hwzd1'
                            || Device.model == 'giot.light.xwzd1'
                            || Device.model == 'znsn.light.v5ssw'
                            || Device.model == 'leedar.light.600'
                            || Device.model == 'leedar.light.1050'
                            || Device.model == 'leedar.light.470'
                            || Device.model == 'leedar.light.p470'
                            || Device.model == 'leedar.light.345'
                            || Device.model == 'leedar.light.345a'
                            || Device.model == 'devcea.light.ls2302'
                            || Device.model == 'devcea.light.ls2303'
                            || Device.model == 'devcea.light.ls2304'
                            || Device.model == 'devcea.light.ls2305'
                            || Device.model == 'devcea.light.ls2306' ? HomeLocalizableString.leedarson关灯前状态提示 : HomeLocalizableString.关灯前状态提示}</Text>
            </View>

            <View style={{ flex: 1 }}/>

            <TouchableOpacity
              onPress={() => {
                this._sendCode(4, 1, DataUtils.getTurnOnParams(false));
              }}>
              {this._checkBoxView(!this.state.turnOnState)}
            </TouchableOpacity>

          </View>

          {this.state.turnOnState ? null :
            <View style={{
              borderRadius: 12,
              backgroundColor: '#F6F6F6',
              margin: 12,
              padding: 18,
              marginTop: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
              alignItems: 'center'
            }}>

              <View>
                <Text style={{
                  color: '#000000',
                  fontSize: 16,
                  fontWeight: 'bold',
                  ...Platform.select({
                    ios: {},
                    android: { fontFamily: 'lucida grande' }
                  })
                }}>{HomeLocalizableString.开关灯切换灯光颜色}</Text>

                <Text style={{
                  color: '#999999',
                  fontSize: 13,
                  marginTop: 7,
                  ...Platform.select({
                    ios: {},
                    android: { fontFamily: 'lucida grande' }
                  })
                }}>{HomeLocalizableString.开关灯切换灯光颜色提示}</Text>
              </View>

              <View style={{ flex: 1 }}/>

              <Switch
                style={{ alignItems: 'center', justifyContent: 'center' }}
                value={this.state.fenduan}
                onTintColor={'#4396EB'}
                tintColor={DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : '#E6E7F0'}
                onValueChange={(value) => {
                  this._sendCode(4, 1, DataUtils.getFenduanParams(value));
                }
                }
              />

            </View>
          }

          <View style={{
            backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff',
            paddingLeft: 25,
            paddingRight: 25,
            paddingTop: 10,
            marginTop: 10,
            paddingBottom: 15,
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center'
          }}>

            <View>
              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: 'bold',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.默认状态}</Text>

              <Text style={{
                color: '#999999',
                fontSize: 13,
                marginTop: 7,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{Device.model == 'leedar.light.600'
                        || Device.model == 'leedar.light.1050'
                        || Device.model == 'leedar.light.470'
                        || Device.model == 'leedar.light.p470'
                        || Device.model == 'leedar.light.345'
                        || Device.model == 'leedar.light.345a'
                        || Device.model == 'devcea.light.ls2302'
                        || Device.model == 'devcea.light.ls2303'
                        || Device.model == 'devcea.light.ls2304'
                        || Device.model == 'devcea.light.ls2305'
                        || Device.model == 'devcea.light.ls2306' ? HomeLocalizableString.默认状态提示语 : HomeLocalizableString.默认状态提示语2}</Text>
            </View>

            <View style={{ flex: 1 }}/>

            <TouchableOpacity
              onPress={() => {
                this._sendCode(4, 1, DataUtils.getTurnOnParams(true));
              }}>
              {this._checkBoxView(this.state.turnOnState)}
            </TouchableOpacity>

          </View>

          {this.state.turnOnState ?

            <View style={{
              borderRadius: 12,
              backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#181818' : '#F6F6F6',
              margin: 12,
              padding: 18,
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
              alignItems: 'center'
            }}>

              <View>
                <Text style={{
                  color: 'rgb(64,64,64)',
                  fontSize: 14,
                  ...Platform.select({
                    ios: {},
                    android: { fontFamily: 'lucida grande' }
                  })
                }}>{HomeLocalizableString.当前灯具默认状态}</Text>

                <Text style={{
                  color: '#999999',
                  fontSize: 12,
                  marginTop: 7,
                  ...Platform.select({
                    ios: {},
                    android: { fontFamily: 'lucida grande' }
                  })
                }}>{`${ HomeLocalizableString.text_brightness }: ${ this.state.defaultBright }% | ${ HomeLocalizableString.text_temp }: ${ this.state.defaultTemp }k`}</Text>
              </View>

              <View style={{ flex: 1 }}/>

              <TouchableOpacity
                style={{
                  borderRadius: 12.5,
                  paddingLeft: 14,
                  paddingRight: 14,
                  paddingTop: 3,
                  paddingBottom: 3,
                  backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#1d252d' : '#E2EFF0'
                }}
                onPress={() => {
                  if (!this.state.lightPower) {
                    this.onShowToast(HomeLocalizableString.更新失败);
                    return;
                  }
                  // this._sendCode(4, 6, 0);

                  Service.spec.doAction({ did: Device.deviceID, siid: 4, aiid: 8, in: [] })
                    .then((res) => { // 请求成功
                      this.addLog(`do Action 成功`);
                    }).catch((err) => { // 请求失败
                      this.addLog(`do Action 失败`);
                    });

                  this.onShowToast(HomeLocalizableString.更新成功);
                }}>

                <Text style={{
                  color: 'xm#4396EB',
                  fontSize: 12,
                  ...Platform.select({
                    ios: {},
                    android: { fontFamily: 'lucida grande' }
                  })
                }}>{HomeLocalizableString.更新}</Text>
              </TouchableOpacity>

            </View>
            : null}


          <LoadingDialog title={HomeLocalizableString.loading}
            timeout={3000}
            visible={this.state.loadingVis}/>
        </ScrollView>
      );
    }

    _editCollect(name) {
      Service.smarthome.editUserColl({
        coll_id: this.state.selectCollect,
        newname: name,
        content: `${ this.state.selectBright },${ this.state.selectTemp }`
      }).then((data) => {
        console.log(JSON.stringify(data));
        this._loadCollects();
      }).catch((err) => {
        console.log(JSON.stringify(err));
      });
    }

    addLog(string) {
      console.log(`log->${ string }`);
    }

    _sendCodeSpecForBle(Siid, Piid, Value, Type) { // 发送指令  一组参数

      let data = { objects: [{ siid: parseInt(Siid), piid: parseInt(Piid), value: Value, type: Type }] };
      let json = JSON.stringify(data);
      Bluetooth.spec.setPropertiesValue(Device.mac, json)
        .then((res) => { // 请求成功
          console.log(`ble---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          let result = Platform.OS === 'android' ? JSON.parse(res) : res;
        }).catch((err) => { // 请求失败
        });
    }

    _updateUi(Siid, Piid, Value) {
      if (Siid == 4) {
        if (Piid == 1) {
          DataUtils.parse3_1(Value);
        }
        if (Piid == 2) {
          DataUtils.parse3_2(Value);
        }
        if (Piid == 3) {
          DataUtils.parse3_3(Value);
        }
        if (Piid == 4) {
          DataUtils.parse3_4(Value);
        }
        if (Piid == 5) {
          DataUtils.parse3_5(Value);
        }
        if (Piid == 6) {
          DataUtils.parse3_6(Value);
        }
      }
      this.setState({
        lightPower: DataUtils.getDefaultData()[0], // 灯开关
        brightness: DataUtils.getDefaultData()[1], // 亮度  最小值:1  最大值:100
        color_temperature: DataUtils.getDefaultData()[2], // 色温  最小值:2700 最大值:6500
        powerOnState: DataUtils.getDefaultData()[3],
        turnOnState: DataUtils.getDefaultData()[4],
        defaultBright: DataUtils.getDefaultData()[5],
        defaultTemp: DataUtils.getDefaultData()[6],
        fenduan: DataUtils.getFenDuanData()[0],
        quxian: DataUtils.getQuXianData()[0]
      });
    }

    _sendCode(Siid, Piid, Value) { // 发送指令  一组参数
      this.setState({ lastControlTime: new Date().getTime() });
      this._updateUi(Siid, Piid, Value);
      console.log(`发送指令---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ Siid }--${ Piid }--${ Value }`);
      if (this.state.btConnect) {
        console.log('ble');
        if (Siid == 4) {
          this._sendCodeSpecForBle(Siid, Piid, Value, 5);
        }
      } else {
        console.log('wifi');
        Service.spec.setPropertiesValue([{ did: Device.deviceID, siid: Siid, piid: Piid, value: Value }])
          .then((res) => { // 请求成功
            console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          }
          ).catch((err) => { // 请求失败
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
        this._getProps();
      }, 3000);
    }

    _renderSeparator() {
      let underLine = null;
      underLine = (
        <View style={{ height: 1, flexDirection: 'row' }}>
          <View style={{ width: 16, backgroundColor: 'white' }}/>
          <View style={{ flex: 1, backgroundColor: '#e9e9e9' }}/>
        </View>
      );
      return underLine;
    }

    _checkBoxView(checkAble) {
      return (
        <View
          style={{
            width: 20,
            height: 20,
            // backgroundColor: checkAble ? '#32bad0' : '#dfdfdf',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20
          }}>
          <Image
            style={{ tintColor: !checkAble && DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : null }}
            source={checkAble ? require('../resources/icon_sel.png') : require('../resources/icon_not_sel.png')}/>
          {/* {
                    checkAble ?
                        <View
                            style={{
                                width: 10,
                                height: 10,
                                backgroundColor: '#fff',
                                borderRadius: 10
                            }}/> : null
                } */}
        </View>
      );
    }
}

const
  styles = StyleSheet.create({
    containAll: {
      flex: 1,
      backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff'
    },
    itemContainer: {
      backgroundColor: '#fff',
      flexDirection: 'row'
    },
    container1: {
      flexDirection: 'column',
      flex: 1,
      alignSelf: 'center',
      marginLeft: 20
    },
    container2: {
      flexDirection: 'column',
      flex: 4,
      alignSelf: 'center',
      marginLeft: 10
    },
    container3: {
      flex: 1,
      marginRight: 15
    },
    textTimeFont: {
      fontSize: 19,
      color: '#000',
      ...Platform.select({
        ios: {},
        android: { fontFamily: 'lucida grande' }
      })
    },
    textFont: {
      fontSize: 14,
      color: '#c2c2c2',
      ...Platform.select({
        ios: {},
        android: { fontFamily: 'lucida grande' }
      })
    },
    textFont1: {
      fontSize: 14,
      color: '#c2c2c2',
      marginTop: 5,
      ...Platform.select({
        ios: {},
        android: { fontFamily: 'lucida grande' }
      })
    }
  });