import React from "react";
import { Image, ListView, Platform, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import LocalizableString from './HomeLocalizableString';
import HomeLocalizableString from './HomeLocalizableString';
import { Bluetooth, DarkMode, Device, DeviceEvent, Service } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import NavigationBar from "miot/ui/NavigationBar";
import { MessageDialog } from "miot/ui/Dialog";
import { LoadingDialog } from "miot/ui";
import MHDatePicker1 from "./View/MHDatePicker";
import MHDatePicker2 from "./View/MHDatePicker2";

import DataUtils from "./Utils/DataUtils";
import Switch from "miot/ui/Switch";

let data = [];

let msgSubscription = null;
const getPropsPara =
    [{ did: Device.deviceID, siid: 4, piid: 5 },
      { did: Device.deviceID, siid: 4, piid: 6 },
      { did: Device.deviceID, siid: 4, piid: 1 }];

const bt = Device.getBluetoothLE();

export default class ProfessionalSettings extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <NavigationBar
          backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
          type={NavigationBar.TYPE.LIGHT}
          title={LocalizableString.专业设置}
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
        gradient_duration_on: DataUtils.getProfessData()[0],
        gradient_duration_off: DataUtils.getProfessData()[1],
        gradient_duration_aj: DataUtils.getProfessData()[2],
        minimum_bri_factory: DataUtils.getProfessData()[3],
        minimum_bri_set: DataUtils.getProfessData()[4],
        quxian: DataUtils.getQuXianData()[0],

        type: 1,
        dialog: false,
        dialog2: false,

        loadingVis: false,
        btConnect: props.navigation.state.params.btConnect
      };
    }

    _getProps() {
      Service.spec.getPropertiesValue(getPropsPara)
        .then((res) => { // 请求成功
          console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          if (res[0].code == 0) {
            DataUtils.parse3_5(res[0].value);
          }
          if (res[1].code == 0) {
            DataUtils.parse3_6(res[1].value);
          }
          if (res[2].code == 0) {
            DataUtils.parse3_1(res[2].value);
          }
          this.setState({
            gradient_duration_on: DataUtils.getProfessData()[0],
            gradient_duration_off: DataUtils.getProfessData()[1],
            gradient_duration_aj: DataUtils.getProfessData()[2],
            minimum_bri_factory: DataUtils.getProfessData()[3],
            minimum_bri_set: DataUtils.getProfessData()[4],
            fenduan: DataUtils.getQuXianData()[0]
          });
        });
    }

    _getPropsSpecBle1() {
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

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_5(jsonData.objects[0].value);

          this.setState({
            gradient_duration_on: DataUtils.getProfessData()[0],
            gradient_duration_off: DataUtils.getProfessData()[1],
            gradient_duration_aj: DataUtils.getProfessData()[2],
            minimum_bri_factory: DataUtils.getProfessData()[3],
            minimum_bri_set: DataUtils.getProfessData()[4]
          });
          this._getPropsSpecBle2();
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

    _getPropsSpecBle2() {
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

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_6(jsonData.objects[0].value);

          this.setState({
            gradient_duration_on: DataUtils.getProfessData()[0],
            gradient_duration_off: DataUtils.getProfessData()[1],
            gradient_duration_aj: DataUtils.getProfessData()[2],
            minimum_bri_factory: DataUtils.getProfessData()[3],
            minimum_bri_set: DataUtils.getProfessData()[4]
          });
          this._getPropsSpecBle3();
        } else {
          // 读取失败 1.5s后重试
          const timeoutID = setTimeout(() => {
            this._getPropsSpecBle2();
            // 清除
            clearTimeout(timeoutID);
          }, 1500);
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle3() {
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

        this.setState({ loadingVis: false });

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_1(jsonData.objects[0].value);

          this.setState({
            quxian: DataUtils.getQuXianData()[0]
          });
        } else {
          // 读取失败 1.5s后重试
          const timeoutID = setTimeout(() => {
            this._getPropsSpecBle2();
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
            if (value == 'prop.4.5') {
              DataUtils.parse3_5(key);
            }
            if (value == 'prop.4.6') {
              DataUtils.parse3_6(key);
            }
            if (value == 'prop.4.1') {
              DataUtils.parse3_1(key);
            }
            this.setState({
              gradient_duration_on: DataUtils.getProfessData()[0],
              gradient_duration_off: DataUtils.getProfessData()[1],
              gradient_duration_aj: DataUtils.getProfessData()[2],
              minimum_bri_factory: DataUtils.getProfessData()[3],
              minimum_bri_set: DataUtils.getProfessData()[4],
              quxian: DataUtils.getQuXianData()[0]
            });
          });
        });

        this._getPropsSpecBle1();
      } else {
        // 先订阅属性变更事件
        this.listener = DeviceEvent.deviceReceivedMessages.addListener((device, messages) => {
          if (messages.has('prop.4.5')) {
            DataUtils.parse3_5(messages.get('prop.4.5')[0]);
          }
          if (messages.has('prop.4.6')) {
            DataUtils.parse3_6(messages.get('prop.4.6')[0]);
          }
          if (messages.has('prop.4.1')) {
            DataUtils.parse3_1(messages.get('prop.4.1')[0]);
          }
          this.setState({
            gradient_duration_on: DataUtils.getProfessData()[0],
            gradient_duration_off: DataUtils.getProfessData()[1],
            gradient_duration_aj: DataUtils.getProfessData()[2],
            minimum_bri_factory: DataUtils.getProfessData()[3],
            minimum_bri_set: DataUtils.getProfessData()[4],
            quxian: DataUtils.getQuXianData()[0]
          });
        }
        );

        Device.getDeviceWifi().subscribeMessages(
          'prop.4.5', 'prop.4.6', 'event.4.1')
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
        <ScrollView style={[styles.containAll]}>

          <TouchableOpacity style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingLeft: 25,
            paddingRight: 25,
            alignSelf: 'center',
            paddingTop: 12,
            paddingBottom: 20,
            alignItems: 'center'
          }} onPress={() => {
            this.setState({ dialog: true, type: 1 });
          }}>
            <View>
              <Text style={{
                color: '#000000',
                fontSize: 15,
                fontWeight: 'bold'
              }}>{HomeLocalizableString.开灯渐变时长}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Text
              style={{
                fontSize: 13,
                marginLeft: 13,
                color: 'rgba(0, 0, 0, 0.4)',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{this.state.gradient_duration_on / 10 + HomeLocalizableString.s}</Text>

            <Image
              source={require('../resources/arrow_ic.png')}/>
          </TouchableOpacity>


          <TouchableOpacity style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingLeft: 25,
            paddingRight: 25,
            alignSelf: 'center',
            paddingTop: 20,
            paddingBottom: 20,
            alignItems: 'center'
          }} onPress={() => {
            this.setState({ dialog: true, type: 2 });
          }}>
            <View>
              <Text style={{
                color: '#000000',
                fontSize: 15,
                fontWeight: 'bold'
              }}>{HomeLocalizableString.关灯渐变时长}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Text
              style={{
                fontSize: 13,
                marginLeft: 13,
                color: 'rgba(0, 0, 0, 0.4)',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{this.state.gradient_duration_off / 10 + HomeLocalizableString.s}</Text>

            <Image
              source={require('../resources/arrow_ic.png')}/>
          </TouchableOpacity>

          <TouchableOpacity style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingLeft: 25,
            paddingRight: 25,
            alignSelf: 'center',
            paddingTop: 20,
            paddingBottom: 20,
            alignItems: 'center'
          }} onPress={() => {
            this.setState({ dialog: true, type: 3 });
          }}>
            <View>
              <Text style={{
                color: '#000000',
                fontSize: 15,
                fontWeight: 'bold'
              }}>{HomeLocalizableString.调光渐变时长}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Text
              style={{
                fontSize: 13,
                marginLeft: 13,
                color: 'rgba(0, 0, 0, 0.4)',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{this.state.gradient_duration_aj / 10 + HomeLocalizableString.s}</Text>

            <Image
              source={require('../resources/arrow_ic.png')}/>
          </TouchableOpacity>

          <Text style={{
            marginLeft: 25,
            marginRight: 25,
            marginTop: 10,
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
            marginTop: 10,
            marginBottom: 20,
            color: '#999999',
            fontSize: 13,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.专业设置功能说明}</Text>

          <TouchableOpacity style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingLeft: 25,
            paddingRight: 25,
            alignSelf: 'center',
            paddingTop: 20,
            paddingBottom: 20,
            alignItems: 'center'
          }} onPress={() => {
            this.setState({ dialog2: true });
          }}>
            <View>
              <Text style={{
                color: '#000000',
                fontSize: 15,
                fontWeight: 'bold'
              }}>{HomeLocalizableString.最低亮度}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Text
              style={{
                fontSize: 13,
                marginLeft: 13,
                color: 'rgba(0, 0, 0, 0.4)',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{`${ this.state.minimum_bri_set / 10 }%`}</Text>

            <Image
              source={require('../resources/arrow_ic.png')}/>
          </TouchableOpacity>

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
                fontSize: 15,
                fontWeight: 'bold',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.指数调光}</Text>
            </View>

            <View style={{ flex: 1 }}/>

            <Switch
              style={{ alignItems: 'center', justifyContent: 'center' }}
              value={this.state.quxian}
              onTintColor={'#4396EB'}
              tintColor={DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : '#E6E7F0'}
              onValueChange={(value) => {
                this._sendCode(4, 1, DataUtils.getQuxianParams(value));
              }
              }
            />

          </View>

          <TouchableOpacity style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingLeft: 25,
            paddingRight: 25,
            alignSelf: 'center',
            paddingTop: 20,
            paddingBottom: 20,
            alignItems: 'center'
          }} onPress={() => {
            this.setState({ rdialog: true });
          }}>
            <View>
              <Text style={{
                color: '#000000',
                fontSize: 15,
                fontWeight: 'bold'
              }}>{HomeLocalizableString.重置所有设置}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Image
              source={require('../resources/arrow_ic.png')}/>
          </TouchableOpacity>

          <MHDatePicker1
            showSubtitle={false}
            unit={'s'}
            min={['30']}
            step={1}
            max={['120']}
            visible={this.state.dialog}
            title={this.state.type == 1 ? HomeLocalizableString.开灯渐变时长 :
              this.state.type == 2 ? HomeLocalizableString.关灯渐变时长
                : HomeLocalizableString.调光渐变时长}
            type={MHDatePicker1.TYPE.SINGLE}
            datePickerStyle={{
              rightButtonStyle: {
                color: '#fff'
              },
              rightButtonBgStyle: {
                bgColorNormal: "#32BAC0"
              },
              pickerInnerStyle: { selectTextColor: "#32BAC0", unitTextColor: "#32BAC0" }
            }}
            current={[this.state.type == 1 ? `${ this.state.gradient_duration_on / 10 }` :
              this.state.type == 2 ? `${ this.state.gradient_duration_off / 10 }`
                : `${ this.state.gradient_duration_aj / 10 }`]}
            onDismiss={(_) => {
              this.setState({
                dialog: false
              });
            }}
            onSelect={(res) => {
              console.log(res.rawArray[0]);
              if (this.state.type == 1) {
                this.setState({ gradient_duration_on: res.rawArray[0] * 10 });
                this._sendCode(4, 5, DataUtils.getGradientDurationOnParams(parseInt(res.rawArray[0] * 10)));
              } else if (this.state.type == 2) {
                this.setState({ gradient_duration_off: res.rawArray[0] * 10 });
                this._sendCode(4, 5, DataUtils.getGradientDurationOffParams(parseInt(res.rawArray[0] * 10)));
              } else {
                this.setState({ gradient_duration_aj: res.rawArray[0] * 10 });
                this._sendCode(4, 5, DataUtils.getGradientDurationAjParams(parseInt(res.rawArray[0] * 10)));
              }

            }}
          />


          <MHDatePicker2
            showSubtitle={false}
            unit={'%'}
            min={[`${ this.state.minimum_bri_factory / 10 }`]}
            step={1}
            max={['25']}
            visible={this.state.dialog2}
            title={HomeLocalizableString.最低亮度}
            type={MHDatePicker1.TYPE.SINGLE}
            datePickerStyle={{
              rightButtonStyle: {
                color: '#fff'
              },
              rightButtonBgStyle: {
                bgColorNormal: "#32BAC0"
              },
              pickerInnerStyle: { selectTextColor: "#32BAC0", unitTextColor: "#32BAC0" }
            }}
            current={[`${ this.state.minimum_bri_set / 10 }`]}
            onDismiss={(_) => {
              this.setState({
                dialog2: false
              });
            }}
            onSelect={(res) => {
              console.log(res.rawArray[0]);
              this.setState({ minimum_bri_set: res.rawArray[0] * 10 });
              this._sendCode(4, 6, DataUtils.getMinimumBriSetParams(parseInt(res.rawArray[0] * 10)));
            }}
          />

          <MessageDialog
            visible={this.state.rdialog}
            title={HomeLocalizableString.重要提示}
            message={HomeLocalizableString.重置设置提示}
            buttons={[
              {
                backgroundColor: { bgColorNormal: DarkMode.getColorScheme() === 'dark' ? 'xm#484848' : '#F5F5F5' },
                text: HomeLocalizableString.cancel,
                callback: (_) => this.setState({ rdialog: false })
              },
              {
                titleColor: "#F44431",
                backgroundColor: { bgColorNormal: DarkMode.getColorScheme() === 'dark' ? 'xm#484848' : '#F5F5F5' },
                text: HomeLocalizableString.重置,
                callback: (_) => {
                  if (this.state.btConnect) {
                    let entity = {
                      "siid": 3,
                      "aiid": 7,
                      "objects": []
                    };
                    let json = JSON.stringify(entity);
                    this.addLog(`do Action params ${ json }`);
                    Bluetooth.spec.doAction(Device.mac, json).then((data) => {

                    }).catch((err) => {

                    });
                  } else {
                    Service.spec.doAction({ did: Device.deviceID, siid: 4, aiid: 7, in: [] })
                      .then((res) => { // 请求成功

                      }).catch((err) => { // 请求失败

                      });
                  }
                  this.setState({ rdialog: false });
                }
              }
            ]}
            onDismiss={(_) => {
              this.setState({ rdialog: false });
            }}
          />

          <LoadingDialog title={HomeLocalizableString.loading}
            timeout={3000}
            visible={this.state.loadingVis}/>
        </ScrollView>
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
        }).catch((err) => { // 请求失败
        });
    }

    _updateUi(Siid, Piid, Value) {
      if (Siid == 4) {
        if (Piid == 5) {
          DataUtils.parse3_5(Value);
        }
        if (Piid == 6) {
          DataUtils.parse3_6(Value);
        }
        if (Piid == 1) {
          DataUtils.parse3_1(Value);
        }
        this.setState({
          gradient_duration_on: DataUtils.getProfessData()[0],
          gradient_duration_off: DataUtils.getProfessData()[1],
          gradient_duration_aj: DataUtils.getProfessData()[2],
          minimum_bri_factory: DataUtils.getProfessData()[3],
          minimum_bri_set: DataUtils.getProfessData()[4],
          quxian: DataUtils.getQuXianData()[0]
        });
      }
    }

    _sendCode(Siid, Piid, Value) { // 发送指令  一组参数
      this._updateUi(Siid, Piid, Value);
      console.log(`发送指令---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ Siid }--${ Piid }--${ Value }`);
      if (this.state.btConnect) {
        console.log('ble');
        if (Piid == 5) {
          this._sendCodeSpecForBle(Siid, Piid, Value, 5);
        } else {
          this._sendCodeSpecForBle(Siid, Piid, Value, 3);
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