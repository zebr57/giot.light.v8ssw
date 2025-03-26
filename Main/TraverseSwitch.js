import React from "react";
import { Image, ListView, Platform, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import LocalizableString from './HomeLocalizableString';
import HomeLocalizableString from './HomeLocalizableString';
import { Bluetooth, Device, DarkMode, DeviceEvent, Host, Service } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import NavigationBar from "miot/ui/NavigationBar";
import { MessageDialog } from "miot/ui/Dialog";
import { LoadingDialog } from "miot/ui";
import Switch from "miot/ui/Switch";
import DataUtils from "./Utils/DataUtils";

let data = [];

let msgSubscription = null;
const getPropsPara =
    [{ did: Device.deviceID, siid: 4, piid: 1 }];

const bt = Device.getBluetoothLE();

export default class Default extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <NavigationBar
          backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
          type={NavigationBar.TYPE.LIGHT}
          title={LocalizableString.traverse_switch}
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
      console.log(`aaaa->${ DataUtils.getTraverseSwitchData()[0] }`);
      this.state = {
        traverse_switch: DataUtils.getTraverseSwitchData()[0],

        loadingVis: false,
        btConnect: props.navigation.state.params.btConnect
      };
    }

    _getProps() {
      Service.spec.getPropertiesValue(getPropsPara)
        .then((res) => { // 请求成功
          console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          if (res[0].code == 0) {
            DataUtils.parse3_1(res[0].value);
            this.setState({ traverse_switch: DataUtils.getTraverseSwitchData()[0] });
          }

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
          DataUtils.parse3_1(res[0].value);
          this.setState({ traverse_switch: DataUtils.getTraverseSwitchData()[0] });

          this.setState({ loadingVis: false });
          this.setState({ devFinalOffline: false });
        } else {
          // 读取失败 1.5s后重试
          const timeoutID = setTimeout(() => {
            this._getPropsSpecBle1();
            // 清除
            clearTimeout(timeoutID);
          }, 1500);
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }


    _subscribeProps() {
      if (this.state.btConnect) {
        this.listenerBle = DeviceEvent.BLESpecNotifyActionEvent.addListener((device, result) => {
          result.forEach((key, value) => {
            console.log(`receive prop(event) changed notification,prop:${ key },${ JSON.stringify(value) }`);
            if (value == 'prop.4.1') {
              DataUtils.parse3_1(key);
              this.setState({ traverse_switch: DataUtils.getTraverseSwitchData()[0] });
            }
          });
        });

        this._getPropsSpecBle1();
      } else {
        // 先订阅属性变更事件
        this.listener = DeviceEvent.deviceReceivedMessages.addListener((device, messages) => {
          if (messages.has('prop.4.1')) {
            DataUtils.parse3_1(messages.get('prop.4.1')[0]);
            this.setState({ traverse_switch: DataUtils.getTraverseSwitchData()[0] });
          }
        }
        );

        Device.getDeviceWifi().subscribeMessages(
          'prop.4.1')
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
      msgSubscription && msgSubscription.remove();

      this.listener && this.listener.remove();

      this.listener1 && this.listener1.remove();

      if (this.listenerBle) {
        this.listenerBle.remove();
      }
    }


    render() {
      return (
        <View style={[styles.containAll]}>

          <Image
            style={{
              resizeMode: 'cover',
              borderRadius: 20,
              width: this.mScreenWidth - 20
            }}
            source={require('../resources/traverse_switch_bg.png')}/>

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
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.开启灵动开关}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Switch
              style={{ alignItems: 'center', justifyContent: 'center' }}
              value={this.state.traverse_switch}
              onTintColor={'#4396EB'}
              tintColor={DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : '#E6E7F0'}
              onValueChange={(value) => {
                if (!value) {
                  this._sendCode(4, 1, DataUtils.getTraverseSwitchParams(false));
                } else {
                  this.setState({ dialog: true });
                }
              }
              }
            />
          </View>

          <ScrollView style={{
            flex: 1, marginLeft: 25,
            marginRight: 25
          }}>

            <Text style={{
              color: '#999999',
              fontSize: Host.locale.language == 'en' ? 12 : 13,
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}>{HomeLocalizableString.开启灵动开关说明}</Text>
          </ScrollView>


          <MessageDialog
            visible={this.state.dialog}
            title={HomeLocalizableString.请阅读以下注意事项}
            message={HomeLocalizableString.灵动开关弹窗提示}
            messageStyle={{ color: DarkMode.getColorScheme() === 'dark' ? '#999' : '#000' }}
            buttons={[
              {
                backgroundColor: { bgColorNormal: DarkMode.getColorScheme() === 'dark' ? 'xm#484848' : '#F5F5F5' },
                text: HomeLocalizableString.cancel,
                callback: (_) => this.setState({ dialog: false })
              },
              {
                titleColor: "#4396EB",
                backgroundColor: { bgColorNormal: DarkMode.getColorScheme() === 'dark' ? 'xm#484848' : '#F5F5F5' },
                text: HomeLocalizableString.开启,
                callback: (_) => {
                  this._sendCode(4, 1, DataUtils.getTraverseSwitchParams(true));
                  this.setState({ dialog: false });
                }
              }
            ]}
            onDismiss={(_) => {
              this.setState({ dialog: false });
            }}
          />

          <LoadingDialog title={HomeLocalizableString.loading}
            timeout={3000}
            visible={this.state.loadingVis}/>
        </View>
      );
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
          if (Siid == 4) {
            if (Piid == 1 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关

              DataUtils.parse3_1(Value);
              this.setState({ traverse_switch: DataUtils.getTraverseSwitchData[0] });
            }
          }
        }).catch((err) => { // 请求失败
        });
    }

    _updateUi(Siid, Piid, Value) {
      if (Siid == 4) {
        if (Piid == 1) {
          DataUtils.parse3_1(Value);
          this.setState({ traverse_switch: DataUtils.getTraverseSwitchData()[0] });
        }
      }
    }

    _sendCode(Siid, Piid, Value) { // 发送指令  一组参数
      this._updateUi(Siid, Piid, Value);
      console.log(`发送指令---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ Siid }--${ Piid }--${ Value }`);
      if (this.state.btConnect) {
        console.log('ble');
        this._sendCodeSpecForBle(Siid, Piid, Value, 0);
      } else {
        console.log('wifi');
        Service.spec.setPropertiesValue([{ did: Device.deviceID, siid: Siid, piid: Piid, value: Value }])
          .then((res) => { // 请求成功
            console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
            if (Siid == 4) {
              if (Piid == 1 && (res[0].code == 0 || res[0].code == 1)) {
                // DataUtils.parse3_1(Value)
                // this.setState({traverse_switch: DataUtils.getTraverseSwitchData[0]});
              }
            }
          }
          ).catch((err) => { // 请求失败
            // console.log(new Date().getHours() + ':' + new Date().getMinutes() + '====>' + JSON.stringify(err));
          });
      }
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

}

const
  styles = StyleSheet.create({
    containAll: {
      flex: 1,
      alignItems: 'center',
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