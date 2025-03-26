import React from "react";
import { Image, ListView, Platform, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import LocalizableString from './HomeLocalizableString';
import HomeLocalizableString from './HomeLocalizableString';
import { Bluetooth, DarkMode, Device, DeviceEvent, Host, Service } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import NavigationBar from "miot/ui/NavigationBar";
import { MessageDialog } from "miot/ui/Dialog";
import { LoadingDialog } from "miot/ui";
import DataUtils from "./Utils/DataUtils";

let data = [];

let msgSubscription = null;
const getPropsPara =
    [{ did: Device.deviceID, siid: 4, piid: 1 }];

const bt = Device.getBluetoothLE();

export default class RemoteControl extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <NavigationBar
          backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
          type={NavigationBar.TYPE.LIGHT}
          title={LocalizableString.遥控器}
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
        traverse_switch: DataUtils.getTraverseSwitch(),

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
          }
          this.setState({
            traverse_switch: DataUtils.getTraverseSwitch
          });
        });
    }

    _getPropsSpecBle1() {
      let prop = {
        "siid": 4,
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
            traverse_switch: DataUtils.getTraverseSwitch
          });

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
            if (value == 'event.4.1') {
              this.onShowToast(HomeLocalizableString.应用成功);
            }
          });
        });

        this._getPropsSpecBle1();
      } else {
        // 先订阅属性变更事件
        this.listener = DeviceEvent.deviceReceivedMessages.addListener((device, messages) => {
          if (messages.has('event.4.1')) {
            this.onShowToast(HomeLocalizableString.应用成功);
          }
        }
        );

        Device.getDeviceWifi().subscribeMessages(
          'event.4.1')
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
      this._subscribeProps();
      /* if (this.state.btConnect) {
                      this.setState({loadingVis: true});
                      this._subscribeProps();
                  } else {
                      this._getProps();
                      this._subscribeProps();
                  } */
    }

    componentWillUnmount() {
      /* msgSubscription && msgSubscription.remove();

                  this.listener && this.listener.remove();

                  this.listener1 && this.listener1.remove();

                  if (this.listenerBle) {
                      this.listenerBle.remove();
                  } */
    }


    render() {
      return (
        <View style={[styles.containAll]}>

          <Image
            style={{
              resizeMode: 'cover',
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: 20,
              justifyContent: 'center'
            }}
            source={require('../resources/remote_control.png')}/>

          <Text style={{
            marginLeft: 25,
            marginRight: 25,
            marginTop: 20,
            color: '#999999',
            fontSize: 13,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.功能说明}</Text>

          <Text style={{
            marginLeft: 23,
            marginRight: 23,
            marginTop: 20,
            color: '#999999',
            fontSize: Host.locale.language == 'en' ? 12 : 13,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.功能说明1}</Text>


          <Text style={{
            marginLeft: 23,
            marginRight: 23,
            marginTop: 20,
            color: '#999999',
            fontSize: Host.locale.language == 'en' ? 12 : 13,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.功能说明2}</Text>

          <View style={{ flex: 1 }}/>

          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => {
              if (this.state.btConnect) {
                let entity = {
                  "siid": 4,
                  "aiid": 5,
                  "objects": []
                };
                let json = JSON.stringify(entity);
                this.addLog(`do Action params ${ json }`);
                Bluetooth.spec.doAction(Device.mac, json).then((data) => {
                  this._delayGet();
                }).catch((err) => {

                });
              } else {
                Service.spec.doAction({ did: Device.deviceID, siid: 4, aiid: 5, in: [] })
                  .then((res) => { // 请求成功
                    this._delayGet();
                  }).catch((err) => { // 请求失败

                  });
              }
            }}>

            <View
              style={{
                borderRadius: 24,
                paddingLeft: 20,
                paddingRight: 20,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 15,
                width: this.mScreenWidth - 40,
                paddingBottom: 15,
                backgroundColor: '#4396EB',
                flexDirection: 'column'
              }}>

              <Text style={{
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.遥控器对码}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              marginBottom: 20
            }}
            onPress={() => {
              this.setState({ dialog: true });
            }}>

            <View
              style={{
                borderRadius: 24,
                paddingLeft: 20,
                paddingRight: 20,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 15,
                width: this.mScreenWidth - 40,
                paddingBottom: 15,
                backgroundColor: '#F5F5F5',
                flexDirection: 'column'
              }}>

              <Text style={{
                color: '#F44431',
                fontSize: 14,
                fontWeight: 'bold',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.清除所有遥控器}</Text>
            </View>
          </TouchableOpacity>

          <MessageDialog
            visible={this.state.dialog}
            title={HomeLocalizableString.请阅读以下注意事项}
            message={HomeLocalizableString.清除所有遥控器提示}
            messageStyle={{ color: DarkMode.getColorScheme() === 'dark' ? '#999' : '#000' }}
            buttons={[
              {
                backgroundColor: { bgColorNormal: DarkMode.getColorScheme() === 'dark' ? 'xm#484848' : '#F5F5F5' },
                text: HomeLocalizableString.cancel,
                callback: (_) => this.setState({ dialog: false })
              },
              {
                titleColor: "#F44431",
                backgroundColor: { bgColorNormal: DarkMode.getColorScheme() === 'dark' ? 'xm#484848' : '#F5F5F5' },
                text: HomeLocalizableString.清除,
                callback: (_) => {
                  if (this.state.btConnect) {
                    let entity = {
                      "siid": 4,
                      "aiid": 6,
                      "objects": []
                    };
                    let json = JSON.stringify(entity);
                    this.addLog(`do Action params ${ json }`);
                    Bluetooth.spec.doAction(Device.mac, json).then((data) => {

                    }).catch((err) => {

                    });
                  } else {
                    Service.spec.doAction({ did: Device.deviceID, siid: 4, aiid: 6, in: [] })
                      .then((res) => { // 请求成功

                      }).catch((err) => { // 请求失败

                      });
                  }
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
          if (Siid == 2) {
            if (Piid == 5 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              this.setState({ traverse_switch: Value });
            }
          }
        }).catch((err) => { // 请求失败
        });
    }

    _updateUi(Siid, Piid, Value) {
      if (Siid == 4) {
        if (Piid == 1) {
          DataUtils.parse3_1(Value);
          this.setState({
            traverse_switch: DataUtils.getTraverseSwitch
          });
        }
      }
    }

    _sendCode(Siid, Piid, Value) { // 发送指令  一组参数
      this._updateUi(Siid, Piid, Value);
      console.log(`发送指令---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ Siid }--${ Piid }--${ Value }`);
      if (this.state.btConnect) {
        console.log('ble');
        this._sendCodeSpecForBle(Siid, Piid, Value, 5);
      } else {
        console.log('wifi');
        Service.spec.setPropertiesValue([{ did: Device.deviceID, siid: Siid, piid: Piid, value: Value }])
          .then((res) => { // 请求成功
            console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
            if (Siid == 4) {
              if (Piid == 1 && (res[0].code == 0 || res[0].code == 1)) {
                DataUtils.parse3_1(Value);
                this.setState({
                  traverse_switch: DataUtils.getTraverseSwitch
                });
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