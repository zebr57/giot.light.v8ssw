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
import Switch from "miot/ui/Switch";
import { LoadingDialog } from "miot/ui";
import DataUtils from "./Utils/DataUtils";

let data = [];

const bt = Device.getBluetoothLE();
let colorMax = Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 5700 : 6500;
let colorMin = 2700;


let msgSubscription = null;
const getPropsPara =
    [{ did: Device.deviceID, siid: 4, piid: 1 },
      { did: Device.deviceID, siid: 4, piid: 2 },
      { did: Device.deviceID, siid: 4, piid: 3 },
      { did: Device.deviceID, siid: 4, piid: 4 },
      { did: Device.deviceID, siid: 4, piid: 5 },
      { did: Device.deviceID, siid: 4, piid: 6 }];

let b;
let t;
export default class Default extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <NavigationBar
          backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
          type={NavigationBar.TYPE.LIGHT}
          title={LocalizableString.助眠唤醒模式设置}
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
        sleep: DataUtils.getAwakeData()[1],
        sleep_time: DataUtils.getAwakeData()[0],
        temp_sleep_time: 0,
        awake: DataUtils.getAwakeData()[3],
        awake_time: DataUtils.getAwakeData()[2],
        temp_awake_time: 0,

        startBright: DataUtils.getAwakeData()[4],
        startColor: DataUtils.getAwakeData()[6],
        endBright: DataUtils.getAwakeData()[5],
        endColor: DataUtils.getAwakeData()[7],

        type: 1,
        dialogInit: true,
        birghtnessLightVis: false,
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
            sleep: DataUtils.getAwakeData()[1],
            sleep_time: DataUtils.getAwakeData()[0],
            awake: DataUtils.getAwakeData()[3],
            awake_time: DataUtils.getAwakeData()[2],
            startBright: DataUtils.getAwakeData()[4],
            startColor: DataUtils.getAwakeData()[6],
            endBright: DataUtils.getAwakeData()[5],
            endColor: DataUtils.getAwakeData()[7]
          });
        });
    }


    _getPropsSpecBle1() {
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
          this.setState({
            sleep: DataUtils.getAwakeData()[1],
            sleep_time: DataUtils.getAwakeData()[0],
            awake: DataUtils.getAwakeData()[3],
            awake_time: DataUtils.getAwakeData()[2],
            startBright: DataUtils.getAwakeData()[4],
            startColor: DataUtils.getAwakeData()[6],
            endBright: DataUtils.getAwakeData()[5],
            endColor: DataUtils.getAwakeData()[7]
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
        this.setState({ loadingVis: false });

        if (jsonData.objects[0].code == 0) {
          DataUtils.parse3_3(jsonData.objects[0].value);
          this.setState({
            sleep: DataUtils.getAwakeData()[1],
            sleep_time: DataUtils.getAwakeData()[0],
            awake: DataUtils.getAwakeData()[3],
            awake_time: DataUtils.getAwakeData()[2],
            startBright: DataUtils.getAwakeData()[4],
            startColor: DataUtils.getAwakeData()[6],
            endBright: DataUtils.getAwakeData()[5],
            endColor: DataUtils.getAwakeData()[7]
          });
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
            if (value == 'prop.4.1') {
              DataUtils.parse3_1(key);
            }

            if (value == 'prop.4.2') {
              DataUtils.parse3_2(key);
              this.setState({
                sleep: DataUtils.getAwakeData()[1],
                sleep_time: DataUtils.getAwakeData()[0],
                awake: DataUtils.getAwakeData()[3],
                awake_time: DataUtils.getAwakeData()[2],
                startBright: DataUtils.getAwakeData()[4],
                startColor: DataUtils.getAwakeData()[6],
                endBright: DataUtils.getAwakeData()[5],
                endColor: DataUtils.getAwakeData()[7]
              });
            }

            if (value == 'prop.4.3') {
              DataUtils.parse3_3(key);
              this.setState({
                sleep: DataUtils.getAwakeData()[1],
                sleep_time: DataUtils.getAwakeData()[0],
                awake: DataUtils.getAwakeData()[3],
                awake_time: DataUtils.getAwakeData()[2],
                startBright: DataUtils.getAwakeData()[4],
                startColor: DataUtils.getAwakeData()[6],
                endBright: DataUtils.getAwakeData()[5],
                endColor: DataUtils.getAwakeData()[7]
              });
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
          });
        });

        this._getPropsSpecBle1();
      } else {
        this.listener = DeviceEvent.deviceReceivedMessages.addListener((device, messages) => {
          if (messages.has('prop.4.1')) {
            DataUtils.parse3_1(messages.get('prop.4.1')[0]);
          }
          if (messages.has('prop.4.2')) {
            DataUtils.parse3_2(messages.get('prop.4.2')[0]);
            this.setState({
              sleep: DataUtils.getAwakeData()[1],
              sleep_time: DataUtils.getAwakeData()[0],
              awake: DataUtils.getAwakeData()[3],
              awake_time: DataUtils.getAwakeData()[2],
              startBright: DataUtils.getAwakeData()[4],
              startColor: DataUtils.getAwakeData()[6],
              endBright: DataUtils.getAwakeData()[5],
              endColor: DataUtils.getAwakeData()[7]
            });
          }
          if (messages.has('prop.4.3')) {
            DataUtils.parse3_3(messages.get('prop.4.3')[0]);
            this.setState({
              sleep: DataUtils.getAwakeData()[1],
              sleep_time: DataUtils.getAwakeData()[0],
              awake: DataUtils.getAwakeData()[3],
              awake_time: DataUtils.getAwakeData()[2],
              startBright: DataUtils.getAwakeData()[4],
              startColor: DataUtils.getAwakeData()[6],
              endBright: DataUtils.getAwakeData()[5],
              endColor: DataUtils.getAwakeData()[7]
            });
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
        }
        );

        Device.getDeviceWifi().subscribeMessages(
          'prop.4.1', 'prop.4.2', 'prop.4.3', 'prop.4.4'
          , 'prop.4.5', 'prop.4.6')
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
          }}>{HomeLocalizableString.助眠模式设置}</Text>

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
                  this._sendCode(4, 2, DataUtils.getSetSleepParams(false));
                } else {
                  this.setState({ sleep: true });
                  this.setState({ sleepFlag: true });

                  b = this.state.startBright;
                  t = this.state.startColor;
                  this.setState({ type: 1 });
                  this.setState({ dialogInit: true });
                  this.setState({ birghtnessLightVis: true });
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
              this.setState({ birghtnessLightVis: true });
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
            marginTop: 5,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.助眠提示}</Text>

          <Text style={{
            marginLeft: 25,
            marginRight: 25,
            marginTop: 40,
            color: '#999999',
            fontSize: 13,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.唤醒模式设置}</Text>

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
            this.setState({ dialog2: true });
            this.setState({ temp_awake_time: this.state.awake_time });
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
            }}>{this.state.awake_time}{HomeLocalizableString.分钟}</Text>

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
              }}>{HomeLocalizableString.自定义最终状态}</Text>

              <Text style={{
                color: '#999999',
                fontSize: 12,
                marginTop: 5,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.自定义最终状态提示}</Text>

            </View>

            <View style={{ flex: 1 }}/>

            <Switch
              style={{ alignItems: 'center', justifyContent: 'center' }}
              value={this.state.awake}
              onTintColor={'#4396EB'}
              tintColor={DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : '#E6E7F0'}
              onValueChange={(value) => {
                if (!value) {
                  this._sendCode(4, 3, DataUtils.getSetAwakeParams(false));
                } else {
                  this.setState({ awake: true });
                  this.setState({ awakeFlag: true });

                  b = this.state.endBright;
                  t = this.state.endColor;
                  this.setState({ dialogInit: true });
                  this.setState({ type: 2 });
                  this.setState({ birghtnessLightVis: true });
                }
              }
              }
            />

          </View>

          {this.state.awake ?

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
              b = this.state.endBright;
              t = this.state.endColor;
              this.setState({ awakeFlag: false });
              this.setState({ dialogInit: true });
              this.setState({ type: 2 });
              this.setState({ birghtnessLightVis: true });

            }}>

              <Text style={{
                color: '#000000',
                fontSize: 16,
                fontWeight: 'bold',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{HomeLocalizableString.最终状态设置}</Text>

              <View style={{ flex: 1 }}/>

              <Text style={{
                color: '#cccccc',
                fontSize: 12,
                marginRight: 5,
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{`${ HomeLocalizableString.brightness4(this.state.endBright) } | ${ HomeLocalizableString.temp4(this.state.endColor) }`}</Text>

              <Image
                style={{ alignSelf: 'center' }}
                source={require('../resources/arrow_ic.png')}/>

            </TouchableOpacity>
            : null}

          <Text style={{
            color: '#999999',
            fontSize: 12,
            paddingLeft: 25,
            marginTop: 5,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}>{HomeLocalizableString.唤醒提示}</Text>

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
                  this._sendCode(4, 2, DataUtils.getSetSleepTimeParams(this.state.temp_sleep_time));
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

          <AbstractDialog
            visible={this.state.dialog2}
            title={HomeLocalizableString.唤醒时长设定}
            showSubtitle={true}
            onDismiss={(_) => this.setState({ dialog2: false })}
            subtitle={this.state.temp_awake_time + HomeLocalizableString.分钟}
            buttons={[
              {
                text: HomeLocalizableString.cancel,
                callback: (_) => this.setState({ dialog2: false })
              },
              {
                backgroundColor: { bgColorNormal: "#32bad0" },
                style: { color: "#32bad0" },
                text: HomeLocalizableString.ensure,
                callback: (result) => {
                  this._sendCode(4, 3, DataUtils.getSetAwakeTimeParams(this.state.temp_awake_time));
                  this.setState({ dialog2: false });
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
                value={this.state.temp_awake_time}
                containerStyle={{
                  width: '80%',
                  height: 50
                }}
                onValueChange={(index) => {
                  this.setState({ temp_awake_time: index });
                }}
                onSlidingComplete={(index) => {
                }}
              />
            </View>
          </AbstractDialog>

          <BrightnessLightDialog
            brightP={100 - b}
            colorP={(t - colorMin) / (colorMax - colorMin) * 100}
            //  brightP={this.state.type == 1 ? (100 - this.state.startBright) : (100 - this.state.endBright)}
            // colorP={this.state.type == 1 ? parseInt((this.state.startColor - colorMin) / (colorMax - colorMin) * 100) : parseInt((this.state.endColor - colorMin) / (colorMax - colorMin) * 100)}
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
              if (isNaN(lightPec) || isNaN(colorPec)) {
                console.log('bbbbb');
                this.setState({ birghtnessLightVis: false });
                return;
              }
              if (this.state.type == 1) {
                this.setState({ sleep: false, sleepFlag: false });
                this._sendCode(4, 2, DataUtils.getSetSleepAllParams((100 - lightPec) < 1 ? 1 : 100 - lightPec,
                  colorMin + ((colorMax - colorMin) * (colorPec / 100)),
                  true));
              } else {
                this.setState({ awake: false, awakeFlag: false });
                this._sendCode(4, 3, DataUtils.getSetAwakeAllParams((100 - lightPec) < 1 ? 1 : 100 - lightPec,
                  colorMin + ((colorMax - colorMin) * (colorPec / 100)),
                  true));
              }

              this.setState({ birghtnessLightVis: false });
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
            if (Piid == 1 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              DataUtils.parse3_1(Value);
            }
            if (Piid == 2 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              DataUtils.parse3_2(Value);
              this.setState({
                sleep: DataUtils.getAwakeData()[1],
                sleep_time: DataUtils.getAwakeData()[0],
                awake: DataUtils.getAwakeData()[3],
                awake_time: DataUtils.getAwakeData()[2],
                startBright: DataUtils.getAwakeData()[4],
                startColor: DataUtils.getAwakeData()[6],
                endBright: DataUtils.getAwakeData()[5],
                endColor: DataUtils.getAwakeData()[7]
              });
            }
            if (Piid == 3 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              DataUtils.parse3_3(Value);
              this.setState({
                sleep: DataUtils.getAwakeData()[1],
                sleep_time: DataUtils.getAwakeData()[0],
                awake: DataUtils.getAwakeData()[3],
                awake_time: DataUtils.getAwakeData()[2],
                startBright: DataUtils.getAwakeData()[4],
                startColor: DataUtils.getAwakeData()[6],
                endBright: DataUtils.getAwakeData()[5],
                endColor: DataUtils.getAwakeData()[7]
              });
            }
            if (Piid == 4 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              DataUtils.parse3_4(Value);
            }
            if (Piid == 5 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              DataUtils.parse3_5(Value);
            }
            if (Piid == 6 && (result.objects[0].code == 0 || result.objects[0].code == 1)) { // 开关
              DataUtils.parse3_6(Value);
            }
          }
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
          this.setState({
            sleep: DataUtils.getAwakeData()[1],
            sleep_time: DataUtils.getAwakeData()[0],
            awake: DataUtils.getAwakeData()[3],
            awake_time: DataUtils.getAwakeData()[2],
            startBright: DataUtils.getAwakeData()[4],
            startColor: DataUtils.getAwakeData()[6],
            endBright: DataUtils.getAwakeData()[5],
            endColor: DataUtils.getAwakeData()[7]
          });
        }
        if (Piid == 3) {
          DataUtils.parse3_3(Value);
          this.setState({
            sleep: DataUtils.getAwakeData()[1],
            sleep_time: DataUtils.getAwakeData()[0],
            awake: DataUtils.getAwakeData()[3],
            awake_time: DataUtils.getAwakeData()[2],
            startBright: DataUtils.getAwakeData()[4],
            startColor: DataUtils.getAwakeData()[6],
            endBright: DataUtils.getAwakeData()[5],
            endColor: DataUtils.getAwakeData()[7]
          });
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
    }

    _sendCode(Siid, Piid, Value) { // 发送指令  一组参数
      this._updateUi(Siid, Piid, Value);
      console.log(`发送指令---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ Siid }--${ Piid }--${ Value }`);
      if (this.state.btConnect) {
        console.log('ble');
        if (Siid == 4) {
          if (Piid == 6) {
            this._sendCodeSpecForBle(Siid, Piid, Value, 3);
          } else {
            this._sendCodeSpecForBle(Siid, Piid, Value, 5);
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