import React from "react";
import { Image, ImageBackground, ListView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LocalizableString from './HomeLocalizableString';
import HomeLocalizableString from './HomeLocalizableString';
import { Bluetooth, Device, DeviceEvent, Service, DarkMode } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import NavigationBar from "miot/ui/NavigationBar";
import { LoadingDialog, MessageDialog } from "miot/ui";
import Switch from "miot/ui/Switch";
import MHDatePicker from "miot/ui/MHDatePicker";
import DataUtils from "./Utils/DataUtils";

let data = [];

let msgSubscription = null;
const getPropsPara =
    [{ did: Device.deviceID, siid: 3, piid: 4 }];

const bt = Device.getBluetoothLE();

export default class NightLight extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <NavigationBar
          backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
          type={NavigationBar.TYPE.LIGHT}
          title={LocalizableString.起夜灯模式设置}
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
        _switch: DataUtils.getNightLightData()[0],
        startHour: DataUtils.getNightLightData()[1],
        startMin: DataUtils.getNightLightData()[2],
        endHour: DataUtils.getNightLightData()[3],
        endMin: DataUtils.getNightLightData()[4],

        startDialog: false,
        endDialog: false,

        loadingVis: false,
        btConnect: props.navigation.state.params.btConnect
      };
    }

    _getProps() {
      Service.spec.getPropertiesValue(getPropsPara)
        .then((res) => { // 请求成功
          console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          if (res[0].code == 0) {
            DataUtils.parse3_4(res[0].value);
          }
          this.setState({
            _switch: DataUtils.getNightLightData()[0],
            startHour: DataUtils.getNightLightData()[1],
            startMin: DataUtils.getNightLightData()[2],
            endHour: DataUtils.getNightLightData()[3],
            endMin: DataUtils.getNightLightData()[4]
          });
        }
        )
      ;
    }

    _getPropsSpecBle1() {
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
        this.setState({ loadingVis: false });
        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_4(jsonData.objects[0].value);
          this.setState({
            _switch: DataUtils.getNightLightData()[0],
            startHour: DataUtils.getNightLightData()[1],
            startMin: DataUtils.getNightLightData()[2],
            endHour: DataUtils.getNightLightData()[3],
            endMin: DataUtils.getNightLightData()[4]
          });
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
            if (value == 'prop.4.4') {
              DataUtils.parse3_4(key);
            }
            this.setState({
              _switch: DataUtils.getNightLightData()[0],
              startHour: DataUtils.getNightLightData()[1],
              startMin: DataUtils.getNightLightData()[2],
              endHour: DataUtils.getNightLightData()[3],
              endMin: DataUtils.getNightLightData()[4]
            });
          });
        });

        this._getPropsSpecBle1();
      } else {
        // 先订阅属性变更事件
        this.listener = DeviceEvent.deviceReceivedMessages.addListener((device, messages) => {
          if (messages.has('prop.4.4')) {
            DataUtils.parse3_4(messages.get('prop.4.4')[0]);

            this.setState({
              _switch: DataUtils.getNightLightData()[0],
              startHour: DataUtils.getNightLightData()[1],
              startMin: DataUtils.getNightLightData()[2],
              endHour: DataUtils.getNightLightData()[3],
              endMin: DataUtils.getNightLightData()[4]
            });
          }
        }
        );

        Device.getDeviceWifi().subscribeMessages(
          'prop.4.4')
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
      let nightLightTime = DataUtils.getNightLightData()[1];
      if (nightLightTime != 0) {
        if (nightLightTime.toString().length < 8) {
          this.setState({ startHour: parseInt(nightLightTime.toString().substring(0, 1)) });
          this.setState({ startMin: parseInt(nightLightTime.toString().substring(1, 3)) });
          this.setState({ endHour: parseInt(nightLightTime.toString().substring(3, 5)) });
          this.setState({ endMin: parseInt(nightLightTime.toString().substring(5, 7)) });
        } else {
          this.setState({ startHour: parseInt(nightLightTime.toString().substring(0, 2)) });
          this.setState({ startMin: parseInt(nightLightTime.toString().substring(2, 4)) });
          this.setState({ endHour: parseInt(nightLightTime.toString().substring(4, 6)) });
          this.setState({ endMin: parseInt(nightLightTime.toString().substring(6, 8)) });
        }
      }

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
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
              width: this.mScreenWidth - 20
            }}
            source={require('../resources/night_light.png')}/>

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
              }}>{HomeLocalizableString.起夜灯模式}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Switch
              style={{ alignItems: 'center', justifyContent: 'center' }}
              value={this.state.btConnect ? false : this.state._switch}
              onTintColor={'#4396EB'}
              tintColor={DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : '#E6E7F0'}
              onValueChange={(value) => {
                if (this.state.btConnect) {
                  this.setState({ tipsVisible: true });
                  return;
                }
                console.log('111');
                this._sendCode(4, 4, DataUtils.getNightLightSwitchParams(!this.state._switch));
              }}
            />
          </View>

          <TouchableOpacity
            activeOpacity={this.state._switch && !this.state.btConnect ? 0 : 1}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingLeft: 25,
              paddingRight: 25,
              alignSelf: 'center',
              paddingTop: 12,
              paddingBottom: 20,
              alignItems: 'center'
            }} onPress={() => {
              if (this.state._switch && !this.state.btConnect)
                this.setState({ startDialog: true });
            }}>
            <View>
              <Text style={{
                color: '#000000',
                fontSize: 15,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'MI-LANTING--GBK1-Light' }
                })

              }}>{HomeLocalizableString.start_time}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Text
              style={{
                fontSize: 13,
                marginLeft: 13,
                color: this.state._switch && !this.state.btConnect ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{this.state.btConnect ? '' : `${ this._addZero(this.state.startHour) }:${ this._addZero(this.state.startMin) }`}</Text>

            <Image
              style={{
                tintColor: this.state._switch && !this.state.btConnect ? DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : 'rgba(0, 0, 0, 0.4)' : DarkMode.getColorScheme() === 'dark' ? 'xm#56565650' : 'rgba(0, 0, 0, 0.1)'
              }}
              source={require('../resources/arrow_ic.png')}/>
          </TouchableOpacity>


          <TouchableOpacity
            activeOpacity={this.state._switch && !this.state.btConnect ? 0 : 1}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingLeft: 25,
              paddingRight: 25,
              alignSelf: 'center',
              paddingTop: 20,
              paddingBottom: 20,
              alignItems: 'center'
            }} onPress={() => {
              if (this.state._switch && !this.state.btConnect)
                this.setState({ endDialog: true });
            }}>
            <View>
              <Text style={{
                color: '#000000',
                fontSize: 15,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'MI-LANTING--GBK1-Light' }
                })
              }}>{HomeLocalizableString.end_time}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Text
              style={{
                fontSize: 13,
                marginLeft: 13,
                color: this.state._switch && !this.state.btConnect ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{this.state.btConnect ? '' : this._getEndTime()}</Text>

            <Image
              style={{
                tintColor: this.state._switch && !this.state.btConnect ? DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : 'rgba(0, 0, 0, 0.4)' : DarkMode.getColorScheme() === 'dark' ? 'xm#56565650' : 'rgba(0, 0, 0, 0.1)'
              }}
              source={require('../resources/arrow_ic.png')}/>
          </TouchableOpacity>

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
            marginLeft: 25,
            marginRight: 25,
            marginTop: 20,
            color: '#999999',
            fontSize: 13,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.起夜灯模式1}</Text>

          <Text style={{
            marginLeft: 25,
            marginTop: 20,
            marginRight: 25,
            color: '#999999',
            fontSize: 13,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.起夜灯模式2}</Text>

          <MHDatePicker
            visible={this.state.startDialog}
            title={HomeLocalizableString.start_time}
            type={MHDatePicker.TYPE.TIME24}
            datePickerStyle={{
              rightButtonStyle: {
                color: '#fff'
              },
              rightButtonBgStyle: {
                bgColorNormal: "#4396EB"
              },
              pickerInnerStyle: { selectTextColor: "#4396EB", unitTextColor: "#4396EB" }
            }}
            current={[this.state.startHour, this.state.startMin]}
            onDismiss={(_) => {
              this.setState({
                startDialog: false
              });
            }}
            onSelect={(res) => {
              this.setState({
                startHour: parseInt(res.rawArray[0]),
                startMin: parseInt(res.rawArray[1])
              });
              this._sendCode(4, 4, DataUtils.getNightLightStartParams(parseInt(res.rawArray[0]), parseInt(res.rawArray[1])));
            }}
          />

          <MHDatePicker
            visible={this.state.endDialog}
            title={HomeLocalizableString.end_time}
            type={MHDatePicker.TYPE.TIME24}
            datePickerStyle={{
              rightButtonStyle: {
                color: '#fff'
              },
              rightButtonBgStyle: {
                bgColorNormal: "#4396EB"
              },
              pickerInnerStyle: { selectTextColor: "#4396EB", unitTextColor: "#4396EB" }
            }}
            current={[this.state.endHour, this.state.endMin]}
            onDismiss={(_) => {
              this.setState({
                endDialog: false
              });
            }}
            onSelect={(res) => {
              this.setState({
                endHour: parseInt(res.rawArray[0]),
                endMin: parseInt(res.rawArray[1])
              });
              this._sendCode(4, 4, DataUtils.getNightLightEndParams(parseInt(res.rawArray[0]), parseInt(res.rawArray[1])));
            }}
          />

          <MessageDialog
            visible={this.state.dialog}
            title={HomeLocalizableString.请阅读以下注意事项}
            message={HomeLocalizableString.灵动开关弹窗提示}
            buttons={[
              {
                text: HomeLocalizableString.cancel,
                callback: (_) => this.setState({ dialog: false })
              },
              {
                text: HomeLocalizableString.开启,
                callback: (_) => {
                  this._sendCode(4, 4, DataUtils.getNightLightSwitchParams(true));
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
        </View>
      );
    }

    _getEndTime() {
      if (this.state.endHour == this.state.startHour) {
        if (this.state.endMin <= this.state.startMin) {
          // 次日
          return `${ HomeLocalizableString.次日 + this._addZero(this.state.endHour) }:${ this._addZero(this.state.endMin) }`;
        } else {
          // 今日
          return `${ this._addZero(this.state.endHour) }:${ this._addZero(this.state.endMin) }`;
        }
      } else if (this.state.endHour < this.state.startHour) {
        // 次日
        return `${ HomeLocalizableString.次日 + this._addZero(this.state.endHour) }:${ this._addZero(this.state.endMin) }`;
      } else {
        // 今日
        return `${ this._addZero(this.state.endHour) }:${ this._addZero(this.state.endMin) }`;
      }
    }

    _addZero(value) {
      if (value < 10) {
        return `0${ value }`;
      } else {
        return value;
      }
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
        }).catch((err) => { // 请求失败
        });
    }

    _updateUi(Siid, Piid, Value) {
      if (Siid == 4) {
        if (Piid == 4) {
          DataUtils.parse3_4(Value);

          this.setState({
            _switch: DataUtils.getNightLightData()[0],
            startHour: DataUtils.getNightLightData()[1],
            startMin: DataUtils.getNightLightData()[2],
            endHour: DataUtils.getNightLightData()[3],
            endMin: DataUtils.getNightLightData()[4]
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