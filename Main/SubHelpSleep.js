import React from "react";
import { Image, ListView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LocalizableString from './HomeLocalizableString';
import HomeLocalizableString from './HomeLocalizableString';
import { Bluetooth, DarkMode, Device, DeviceEvent, Service } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import NavigationBar from "miot/ui/NavigationBar";
import SlideGear from "miot/ui/Gear/SlideGear";
import { AbstractDialog } from "miot/ui/Dialog";
import BrightnessLightDialog from "./View/BrightnessLightDialog";
import BrightnessLightDialog2 from "./View/BrightnessLightDialog2";
import Switch from "miot/ui/Switch";
import { LoadingDialog } from "miot/ui";

let data = [];

const bt = Device.getBluetoothLE();

let msgSubscription = null;
const getPropsPara =
    [{ did: Device.deviceID, siid: 4, piid: 7 },
      { did: Device.deviceID, siid: 4, piid: 8 },
      { did: Device.deviceID, siid: 4, piid: 9 },
      { did: Device.deviceID, siid: 4, piid: 10 }];

let b;
let t;
export default class SubHelpSleep extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <NavigationBar
          backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
          type={NavigationBar.TYPE.LIGHT}
          title={LocalizableString.助眠设置}
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
        sleep: false,
        sleep_time: 0,
        temp_sleep_time: 0,
        awake: false,
        awake_time: 0,
        temp_awake_time: 0,

        startBright: 80,
        startColor: 4600,
        endBright: 0,
        endColor: 0,

        type: 1,
        dialogInit: true,
        birghtnessLightVis: false,
        birghtnessLightVis2: false,
        sleepFlag: false,
        awakeFlag: false,
        btConnect: props.navigation.state.params.btConnect
      };
    }

    addLog(string) {
      console.log(`log->${ string }`);
    }

    _getProps() {
      Service.spec.getPropertiesValue(getPropsPara, 1)
        .then((res) => { // 请求成功
          console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          this.setState({
            sleep_time: res[0].value,
            sleep: res[1].value
          });
          if (res[2].code == 0) {
            this.setState({ startBright: res[2].value });
          }
          if (res[3].code == 0) {
            this.setState({ startColor: res[3].value });
          }
        });
    }


    _getPropsSpecBle4() {
      let prop = {
        "siid": 3,
        "piid": 10
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
          this.setState({
            startColor: jsonData.objects[0].value
          });
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
        "piid": 9
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
          this.setState({
            startBright: jsonData.objects[0].value
          });
          this._getPropsSpecBle4();
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

        if (jsonData.objects[0].code == 0) {
          this.setState({
            sleep: jsonData.objects[0].value
          });
          this._getPropsSpecBle3();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _getPropsSpecBle1() {
      let prop = {
        "siid": 3,
        "piid": 7
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
          this.setState({
            sleep_time: jsonData.objects[0].value
          });
          this._getPropsSpecBle2();
        } else {
          this.setState({ loadingVis: false });
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }

    _subscribeProps() {
      // 先订阅属性变更事件
      if (this.state.btConnect) {
        this.listenerBle = DeviceEvent.BLESpecNotifyActionEvent.addListener((device, result) => {
          result.forEach((key, value) => {
            console.log(`receive prop(event) changed notification,prop:${ key },${ JSON.stringify(value) }`);
            if (value == 'prop.4.8') {
              this.setState({ sleep: key });
            }
            if (value == 'prop.4.7') {
              this.setState({ sleep_time: key });
            }
            if (value == 'prop.4.9') {
              this.setState({ startBright: key });
            }
            if (value == 'prop.4.10') {
              this.setState({ startColor: key });
            }
          });
        });

        this._getPropsSpecBle1();
      } else {
        this.listener = DeviceEvent.deviceReceivedMessages.addListener((device, messages) => {
          if (messages.has('prop.4.8')) {
            this.setState({
              sleep: messages.get('prop.4.8')[0]
            });
          }
          if (messages.has('prop.4.7')) {
            this.setState({
              sleep_time: messages.get('prop.4.7')[0]
            });
          }
          if (messages.has('prop.4.9')) {
            this.setState({
              startBright: messages.get('prop.4.9')[0]
            });
          }
          if (messages.has('prop.4.10')) {
            this.setState({
              startColor: messages.get('prop.4.10')[0]
            });
          }
        }
        );

        Device.getDeviceWifi().subscribeMessages(
          'prop.4.7', 'prop.4.8', 'prop.4.9', 'prop.4.10')
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
        // this._subscribeProps();
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
        <View style={styles.containAll}>

          <TouchableOpacity style={{
            backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff',
            paddingLeft: 25,
            paddingRight: 25,
            paddingTop: 15,
            paddingBottom: 15,
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center'
          }} onPress={() => {
            this.setState({ dialog: true });
            this.setState({ temp_sleep_time: this.state.sleep_time });
          }}>

            <Text style={{
              color: '#000000',
              fontSize: 16,
              fontWeight: 'bold',
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}>{HomeLocalizableString.持续时长}</Text>

            <View style={{ flex: 1 }}/>

            <Text style={{
              color: '#cccccc',
              fontSize: 12,
              marginRight: 5,
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}>{this.state.sleep_time}{HomeLocalizableString.分钟}</Text>

            <Image
              style={{ alignSelf: 'center' }}
              source={require('../resources/arrow_ic.png')}/>

          </TouchableOpacity>


          <View style={{
            backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff',
            paddingLeft: 25,
            paddingRight: 25,
            paddingTop: 15,
            paddingBottom: 15,
            flexDirection: 'row',
            justifyContent: 'center'
          }}>

            <View style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignSelf: 'center'
            }}>

              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: 'bold',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.自定义起始状态}</Text>

              <Text style={{
                color: '#999999',
                fontSize: 12,
                marginTop: 5,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.自定义起始状态提示}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Switch
              style={{ alignItems: 'center', justifyContent: 'center' }}
              value={this.state.sleep}
              onTintColor={'#4396EB'}
              tintColor={DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : '#E6E7F0'}
              onValueChange={(value) => {
                if (!value) {
                  this._sendCode(4, 8, false);
                } else {
                  this.setState({ sleep: true });
                  this.setState({ sleepFlag: true });

                  b = this.state.startBright;
                  t = this.state.startColor;
                  this.setState({ type: 1 });
                  this.setState({ dialogInit: true });
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
                }
              }
              }
            />
          </View>

          {this.state.sleep ?

            <TouchableOpacity style={{
              backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff',
              paddingLeft: 25,
              paddingRight: 25,
              paddingTop: 15,
              paddingBottom: 15,
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
              alignItems: 'center'
            }} onPress={() => {
              b = this.state.startBright;
              t = this.state.startColor;
              this.setState({ sleepFlag: false });
              this.setState({ type: 1 });
              this.setState({ dialogInit: true });
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
            }}>

              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: 'bold',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.起始状态设置}</Text>

              <View style={{ flex: 1 }}/>

              <Text style={{
                color: '#cccccc',
                fontSize: 12,
                marginRight: 5,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{`${ HomeLocalizableString.brightness4(this.state.startBright) } | ${ HomeLocalizableString.temp4(this.state.startColor) }`}</Text>

              <Image
                style={{ alignSelf: 'center' }}
                source={require('../resources/arrow_ic.png')}/>

            </TouchableOpacity>
            : null}

          <Text style={{
            color: '#999999',
            fontSize: 12,
            paddingLeft: 25,
            marginTop: 35,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.助眠提示}</Text>

          <View style={{ flex: 1 }}/>

          <AbstractDialog
            visible={this.state.dialog}
            title={HomeLocalizableString.助眠时长设定}
            showSubtitle={true}
            onDismiss={(_) => this.setState({ dialog: false })}
            subtitle={this.state.temp_sleep_time + HomeLocalizableString.分钟}
            buttons={[
              {
                text: HomeLocalizableString.cancel,
                callback: (_) => this.setState({ dialog: false })
              },
              {
                backgroundColor: { bgColorNormal: "#32bad0" },
                style: { color: "#32bad0" },
                text: HomeLocalizableString.ensure,
                callback: (result) => {
                  this._sendCode(4, 7, this.state.temp_sleep_time);
                  this.setState({ dialog: false });
                }
              }
            ]}>

            <View style={{
              flex: 1, height: 100,
              alignItems: 'center',
              justifyContent: 'center', flexDirection: 'column'
            }}>

              <SlideGear
                minimumTrackTintColor={'#32bad0'}
                maximumTrackTintColor="#dee0e6"
                optionMin={1}
                optionMax={60}
                optionStep={1}
                value={this.state.temp_sleep_time}
                containerStyle={{
                  width: '80%',
                  height: 50
                }}
                onValueChange={(index) => {
                  this.setState({ temp_sleep_time: index });
                }}
                onSlidingComplete={(index) => {
                }}
              />
            </View>
          </AbstractDialog>

          <BrightnessLightDialog
            brightP={100 - b}
            colorP={(t - 2700) / (6500 - 2700) * 100}
            //  brightP={this.state.type == 1 ? (100 - this.state.startBright) : (100 - this.state.endBright)}
            // colorP={this.state.type == 1 ? parseInt((this.state.startColor - 2700) / (6500 - 2700) * 100) : parseInt((this.state.endColor - 2700) / (6500 - 2700) * 100)}
            dialogInit={this.state.dialogInit}
            modalClose={() => {
              this.setState({ birghtnessLightVis: false });
            }}
            onRequestClose={() => {
              this.setState({ birghtnessLightVis: false });
            }}
            modalVisible={this.state.birghtnessLightVis}
            title={this.state.type == 1 ? HomeLocalizableString.起始状态设置 : HomeLocalizableString.最终状态设置}
            value={'123'}
            cancelText={HomeLocalizableString.cancel}
            cancelTextColor={'#4C4C4C'}
            cancelEvent={() => {
              if (this.state.sleepFlag) {
                console.log('111111');
                this.setState({ sleep: false, sleepFlag: false });
              }
              if (this.state.awakeFlag) {
                console.log('222222');
                this.setState({ awake: false, awakeFlag: false });
              }
              this.setState({ birghtnessLightVis: false });
            }}
            sureText={HomeLocalizableString.confirm}
            sureTextColor={'#FD723F'}
            sureEvent={(lightPec, colorPec) => {
              if (this.state.type == 1) {
                this.setState({ sleep: false, sleepFlag: false });
                this._sendCode(4, 8, true);
                this.interval = setInterval(() => {
                  clearInterval(this.interval);
                  this._sendCode(4, 9, (100 - lightPec) < 1 ? 1 : 100 - lightPec);

                  this.interval = setInterval(() => {
                    clearInterval(this.interval);
                    this._sendCode(4, 10, 2700 + ((6500 - 2700) * (colorPec / 100)));
                  }, 250);

                }, 250);
              } else {
                this.setState({ awake: false, awakeFlag: false });
                this._sendCode(4, 12, true);
                this.interval = setInterval(() => {
                  clearInterval(this.interval);
                  this._sendCode(4, 13, (100 - lightPec) < 1 ? 1 : 100 - lightPec);

                  this.interval = setInterval(() => {
                    clearInterval(this.interval);
                    this._sendCode(4, 14, 2700 + ((6500 - 2700) * (colorPec / 100)));
                  }, 250);
                }, 250);
              }

              this.setState({ birghtnessLightVis: false });
            }}
            sliderEvent={(lightPec, colorPec) => {
              this.setState({ dialogInit: false });
              // 滑动时亮度和色温的回调  lightPec亮度百分比，colorPec色温百分比
            }}/>


          <BrightnessLightDialog2
            brightP={b}
            colorP={t}
            //  brightP={this.state.type == 1 ? (100 - this.state.startBright) : (100 - this.state.endBright)}
            // colorP={this.state.type == 1 ? parseInt((this.state.startColor - 2700) / (6500 - 2700) * 100) : parseInt((this.state.endColor - 2700) / (6500 - 2700) * 100)}
            dialogInit={this.state.dialogInit}
            modalClose={() => {
              this.setState({ birghtnessLightVis2: false });
            }}
            onRequestClose={() => {
              this.setState({ birghtnessLightVis2: false });
            }}
            modalVisible={this.state.birghtnessLightVis2}
            title={this.state.type == 1 ? HomeLocalizableString.起始状态设置 : HomeLocalizableString.最终状态设置}
            value={'123'}
            cancelText={HomeLocalizableString.cancel}
            cancelTextColor={'#4C4C4C'}
            cancelEvent={() => {
              if (this.state.sleepFlag) {
                console.log('111111');
                this.setState({ sleep: false, sleepFlag: false });
              }
              if (this.state.awakeFlag) {
                console.log('222222');
                this.setState({ awake: false, awakeFlag: false });
              }
              this.setState({ birghtnessLightVis2: false });
            }}
            sureText={HomeLocalizableString.confirm}
            sureTextColor={'#FD723F'}
            sureEvent={(lightPec, colorPec) => {
              if (this.state.type == 1) {
                this.setState({ sleep: false, sleepFlag: false });
                this._sendCode(4, 8, true);
                this.interval = setInterval(() => {
                  clearInterval(this.interval);
                  this._sendCode(4, 9, lightPec);

                  this.interval = setInterval(() => {
                    clearInterval(this.interval);
                    this._sendCode(4, 10, colorPec);
                  }, 250);

                }, 250);
              } else {
                this.setState({ awake: false, awakeFlag: false });
                this._sendCode(4, 12, true);
                this.interval = setInterval(() => {
                  clearInterval(this.interval);
                  this._sendCode(4, 13, lightPec);

                  this.interval = setInterval(() => {
                    clearInterval(this.interval);
                    this._sendCode(4, 14, colorPec);
                  }, 250);
                }, 250);
              }

              this.setState({ birghtnessLightVis2: false });
            }}
            sliderEvent={(lightPec, colorPec) => {
              this.setState({ dialogInit: false });
              // 滑动时亮度和色温的回调  lightPec亮度百分比，colorPec色温百分比
            }}/>

          <LoadingDialog title={HomeLocalizableString.loading}
            timeout={3000}
            visible={this.state.loadingVis}/>
        </View>
      );
    }

    _sendCodeSpecForBle(Siid, Piid, Value, Type) { // 发送指令  一组参数
      let data = { objects: [{ siid: parseInt(Siid), piid: parseInt(Piid), value: Value, type: Type }] };
      let json = JSON.stringify(data);
      Bluetooth.spec.setPropertiesValue(Device.mac, json)
        .then((res) => { // 请求成功
          console.log(`ble---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          let result = Platform.OS === 'android' ? JSON.parse(res) : res;
          if (Siid == 4) {
            if (Piid == 8 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              this.setState({ sleep: Value });
            }
            if (Piid == 7 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              this.setState({ sleep_time: Value });
            }
            if (Piid == 12 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              this.setState({ awake: Value });
            }
            if (Piid == 11 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              this.setState({ awake_time: Value });
            }
            if (Piid == 9 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              this.setState({ startBright: Value });
            }
            if (Piid == 10 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              this.setState({ startColor: Value });
            }
            if (Piid == 13 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              this.setState({ endBright: Value });
            }
            if (Piid == 14 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              this.setState({ endColor: Value });
            }
          }
        }).catch((err) => { // 请求失败
        });
    }

    _updateUi(Siid, Piid, Value) {
      if (Siid == 4) {
        if (Piid == 8) {
          this.setState({ sleep: Value });
        }
        if (Piid == 7) {
          this.setState({ sleep_time: Value });
        }
        if (Piid == 12) {
          this.setState({ awake: Value });
        }
        if (Piid == 11) {
          this.setState({ awake_time: Value });
        }
        if (Piid == 9) {
          this.setState({ startBright: Value });
        }
        if (Piid == 10) {
          this.setState({ startColor: Value });
        }
        if (Piid == 13) {
          this.setState({ endBright: Value });
        }
        if (Piid == 14) {
          this.setState({ endColor: Value });
        }
      }
    }

    _sendCode(Siid, Piid, Value) { // 发送指令  一组参数
      this._updateUi(Siid, Piid, Value);
      console.log(`发送指令---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ Siid }--${ Piid }--${ Value }`);
      if (this.state.btConnect) {
        console.log('ble');
        if (Siid == 4) {
          if (Piid == 8 || Piid == 12) {
            this._sendCodeSpecForBle(Siid, Piid, Value, 0);
          } else if (Piid == 10 || Piid == 14) {
            this._sendCodeSpecForBle(Siid, Piid, Value, 3);
          } else {
            this._sendCodeSpecForBle(Siid, Piid, Value, 1);
          }
        }
      } else {
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