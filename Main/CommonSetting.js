import BaseComponent from "./Base/BaseComponent";
import React from "react";
import { DeviceEventEmitter, Image, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import LocalizableString from "./HomeLocalizableString";
import HomeLocalizableString from "./HomeLocalizableString";
import Separator from "../../../miot-sdk/ui/Separator";
import Styles from "../../../miot-sdk/resources/Styles";
import { CommonSetting, SETTING_KEYS } from "miot/ui/CommonSetting";
import ListItem from "miot/ui/ListItem/ListItem";
import { Bluetooth, DarkMode, Device, DeviceEvent, Service } from "miot";
import NavigationBar from "miot/ui/NavigationBar";
import { LoadingDialog } from "miot/ui";
import DataUtils from "./Utils/DataUtils";

const { first_options, second_options } = SETTING_KEYS;

const getPropsPara = [
  { did: Device.deviceID, siid: 2, piid: 5 },
  { did: Device.deviceID, siid: 2, piid: 1 },
  { did: Device.deviceID, siid: 4, piid: 1 },
  { did: Device.deviceID, siid: 4, piid: 2 },
  { did: Device.deviceID, siid: 4, piid: 3 },
  { did: Device.deviceID, siid: 4, piid: 4 },
  { did: Device.deviceID, siid: 4, piid: 5 },
  { did: Device.deviceID, siid: 4, piid: 6 }
];

const bt = Device.getBluetoothLE();

let isMount;
let msgSubscription = null;
let that;

export default class CommonSetting1 extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header:
                <NavigationBar
                  backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
                  type={NavigationBar.TYPE.LIGHT}
                  title={LocalizableString.setting}
                  left={[
                    {
                      key: 'back',
                      onPress: (_) => navigation.goBack()
                    }
                  ]}/>
      };
    };

    constructor(props, context) {
      super(props, context);
      that = this;
      this.state = {
        sliderValue: 25,
        switchValue: false,
        showDot: [],
        traverse_switch: 0,
        lastControlTime: 0,
        showUpgrade: props.navigation.state.params.showDot,
        btConnect: props.navigation.state.params.btConnect,
        lightPower: false,
        loadingVis: false,
        acStatus: props.navigation.state.params.acStatus,
        singal: ''
      };
    }

    render() {
      // 显示部分一级菜单项
      const firstOptions = [
        first_options.FIRMWARE_UPGRADE,
        first_options.SHARE,
        first_options.PRODUCT_BAIKE,
        first_options.IFTTT,
        first_options.CREATE_GROUP
      ];
        // 显示部分二级菜单项
      const secondOptions = [
        second_options.AUTO_UPGRADE,
        second_options.PRODUCT_BAIKE
        // second_options.TIMEZONE,j
      ];
        // 显示固件升级二级菜单
      const extraOptions = {
        showUpgrade: true,
        upgradePageKey: 'FirmwareUpgrade',
        option: {
          hideUserExperiencePlan: true
        },
        syncDevice: true
        // networkInfoConfig: -1,
      };
      return (
        <View style={styles.container}>
          <Separator/>
          <ScrollView
            showsVerticalScrollIndicator={false}>

            <View style={styles.featureSetting}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{HomeLocalizableString.featureSetting}</Text>
              </View>

              {(!Device.isOnline && !this.state.btConnect)
                ? null :
                <ListItem
                  title={HomeLocalizableString.default}
                  showSeparator={false}
                  onPress={() => {
                    this.props.navigation.navigate('Default', {
                      btConnect: this.state.btConnect
                    });
                  }}
                />
              }

              {(!Device.isOnline && !this.state.btConnect)
                ? null :
                Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ?
                  null :
                  <ListItem
                    title={HomeLocalizableString.遥控器}
                    showSeparator={false}
                    onPress={() => {
                      this.props.navigation.navigate('RemoteControl', {
                        btConnect: this.state.btConnect
                      });
                    }}
                  />
              }

              {(!Device.isOnline && !this.state.btConnect)
                ? null :
                this.state.acStatus ?
                  <ListItem
                    title={HomeLocalizableString.traverse_switch}
                    showSeparator={false}
                    onPress={() => {
                      this.props.navigation.navigate('TraverseSwitch', {
                        btConnect: this.state.btConnect
                      });
                    }}
                  />
                  : null}

              {Device.model == 'leedar.light.600'
                        || Device.model == 'leedar.light.1050'
                        || Device.model == 'leedar.light.470'
                        || Device.model == 'leedar.light.p470'
                        || Device.model == 'leedar.light.345'
                        || Device.model == 'leedar.light.345a'
                        || Device.model == 'devcea.light.ls2302'
                        || Device.model == 'devcea.light.ls2303'
                        || Device.model == 'devcea.light.ls2304'
                        || Device.model == 'devcea.light.ls2305'
                        || Device.model == 'devcea.light.ls2306'
                        || Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? null : !Device.isOnline && !this.state.btConnect
                  ? null :
                  <ListItem
                    title={HomeLocalizableString.起夜灯模式设置}
                    showSeparator={false}
                    onPress={() => {
                      this.props.navigation.navigate('NightLight', {
                        btConnect: this.state.btConnect
                      });
                    }}
                  />}

              {Device.model == 'leedar.light.600'
                        || Device.model == 'leedar.light.1050'
                        || Device.model == 'leedar.light.470'
                        || Device.model == 'leedar.light.p470'
                        || Device.model == 'leedar.light.345'
                        || Device.model == 'leedar.light.345a'
                        || Device.model == 'devcea.light.ls2302'
                        || Device.model == 'devcea.light.ls2303'
                        || Device.model == 'devcea.light.ls2304'
                        || Device.model == 'devcea.light.ls2305'
                        || Device.model == 'devcea.light.ls2306' ? null : (!Device.isOnline && !this.state.btConnect)
                  ? null :
                  <ListItem
                    title={HomeLocalizableString.助眠唤醒模式设置}
                    showSeparator={false}
                    onPress={() => {
                      this.props.navigation.navigate('Awake', {
                        btConnect: this.state.btConnect
                      });
                    }}
                  />
              }

              {(!Device.isOnline && !this.state.btConnect)
                ? null :
                Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ?
                  null :
                  <ListItem
                    title={HomeLocalizableString.专业设置}
                    showSeparator={false}
                    onPress={() => {
                      if (Device.model == 'giot.light.v5ssw'
                                            || Device.model == 'imigy.light.ym001'
                                            || Device.model == 'giot.light.dblgt1'
                                            || Device.model == 'giot.light.hwzd1'
                                            || Device.model == 'giot.light.xwzd1'
                                            || Device.model == 'giot.light.xhyd1'
                                            || Device.model == 'giot.light.hhyd1'
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
                                            || Device.model == 'devcea.light.ls2306'
                      ) {
                        this.props.navigation.navigate('WifiProfessionalSettings', {
                          btConnect: this.state.btConnect
                        });
                      } else {
                        this.props.navigation.navigate('ProfessionalSettings', {
                          btConnect: this.state.btConnect
                        });
                      }
                    }}
                  />
              }

              {Device.model == 'leedar.light.600'
                        || Device.model == 'leedar.light.1050'
                        || Device.model == 'leedar.light.470'
                        || Device.model == 'leedar.light.p470'
                        || Device.model == 'leedar.light.345'
                        || Device.model == 'leedar.light.345a'
                        || Device.model == 'devcea.light.ls2302'
                        || Device.model == 'devcea.light.ls2303'
                        || Device.model == 'devcea.light.ls2304'
                        || Device.model == 'devcea.light.ls2305'
                        || Device.model == 'devcea.light.ls2306'
                        || Device.model == 'nvcsmt.light.bas202'
                        || Device.model == 'nvcsmt.light.bcs201'
                ? null :
                Device.isOnline && Device.model != 'giot.light.v5ssw'
                            && Device.model != 'imigy.light.ym001'
                            && Device.model != 'giot.light.dblgt1'
                            && Device.model != 'giot.light.hwzd1'
                            && Device.model != 'giot.light.xwzd1'
                            && Device.model != 'giot.light.xhyd1'
                            && Device.model != 'giot.light.hhyd1' ?
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <ListItem
                      title={HomeLocalizableString.蓝牙网关信号}
                      showSeparator={false}
                      hideArrow={true}
                      // value={this.state.btConnect ? HomeLocalizableString.无网关 : this.state.singal}
                    />
                    <View style={{
                      right: 30,
                      flexDirection: 'row',
                      alignItems: "center",
                      position: "absolute"
                    }}>
                      {this.state.btConnect ?
                        <Text
                          style={{
                            color: 'rgb(0,0,0)',
                            ...Platform.select({
                              ios: {},
                              android: { fontFamily: 'lucida grande' }
                            })
                          }}>{HomeLocalizableString.无网关}</Text>
                        : Device.isOnline ?
                          <Image
                            style={{
                              resizeMode: 'contain'
                            }}
                            source={this.state.singal >= -80 ? require('../resources/3.png')
                              : this.state.singal >= -90 ? require('../resources/2.png')
                                : require('../resources/1.png')}/>
                          :
                          <Text
                            style={{
                              color: 'rgb(0,0,0)',
                              ...Platform.select({
                                ios: {},
                                android: { fontFamily: 'lucida grande' }
                              })
                            }}>{HomeLocalizableString.已离线}</Text>
                      }
                    </View>

                  </View>
                  : null}

            </View>

            <CommonSetting
              navigation={this.props.navigation}
              firstOptions={firstOptions}
              showDot={this.state.showDot}
              secondOptions={secondOptions}
              extraOptions={extraOptions}
            />
            <View style={{ height: 20 }}/>
          </ScrollView>

          <LoadingDialog title={HomeLocalizableString.loading}
            timeout={3000}
            visible={this.state.loadingVis}/>
        </View>
      );
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
      Service.scene.openCountDownPage(true, params);
    }

    componentDidMount() {
      // TODO: 拉取功能设置项里面的初始值，比如开关状态，slider的value
      this.isMount = true;

      this.setState({ lightPower: this.props.navigation.state.params.lightPower ? this.props.navigation.state.params.lightPower : false });

      if (this.state.btConnect) {
        this.setState({ loadingVis: true });
        this._subscribeProps();
      } else {
        this._getPropsSpec();
        this._subscribeProps();
      }
    }


    componentWillUnmount() {
      this.isMount = false;
      msgSubscription && msgSubscription.remove();

      this.listener && this.listener.remove();

      if (this.listenerBle) {
        this.listenerBle.remove();
      }

      DeviceEventEmitter.emit('requerySpec', '');
    }

    _getPropsSpec() {
      Service.spec.getPropertiesValue(getPropsPara).then((res) => {
        console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
        if (res[0].code == 0 && res[1].code == 0)
          this.setState({
            traverse_switch: res[0].value ? 1 : 0,
            lightPower: res[1].value
          });

        if (res[2].code == 0) {
          DataUtils.parse3_1(res[2].value);
        }

        if (res[3].code == 0) {
          DataUtils.parse3_2(res[3].value);
        }

        if (res[4].code == 0) {
          DataUtils.parse3_3(res[4].value);
        }

        if (res[5].code == 0) {
          DataUtils.parse3_4(res[5].value);
        }

        if (res[6].code == 0) {
          DataUtils.parse3_5(res[6].value);
        }

        if (res[7].code == 0) {
          DataUtils.parse3_6(res[7].value);
        }
      }).catch((err) => {
        console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(err) }`);
      });
    }

    _getPropsSpecBle1() {
      let prop = {
        "siid": 2,
        "piid": 5
      };
      let props = [];
      props.push(prop);
      let entity = { "objects": props };
      let json = JSON.stringify(entity);
      this.addLog(`get Property params ${ json }`);
      Bluetooth.spec.getPropertiesValue(Device.mac, json).then((data) => {
        this.setState({ loadingVis: false });
        if (this.isMount) {
          if (this.updater.isMounted(this)) {
            this.setState({ devFinalOffline: false });

            this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
            let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

            if (jsonData.objects[0].code == 0) {
              this.setState({
                traverse_switch: jsonData.objects[0].value
              });

              this._getPropsSpecBle2();
            } else {
              this._getPropsSpecBle1();
            }
          }
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }


    _getPropsSpecBle2() {
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
        if (this.isMount) {
          if (this.updater.isMounted(this)) {
            this.setState({ devFinalOffline: false });

            this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
            let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

            if (jsonData.objects[0].code == 0) {
              this.setState({
                lightPower: jsonData.objects[0].value
              });
              this._getPropsSpecBle3();
            } else {
              this._getPropsSpecBle2();
            }
          }
        }
      }).catch((err) => {

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
        if (this.isMount) {
          if (this.updater.isMounted(this)) {
            this.setState({ devFinalOffline: false });

            this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
            let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

            if (jsonData.objects[0].code == 0) {
              this.setState({
                acStatus: jsonData.objects[0].value
              });
            } else {
              this._getPropsSpecBle3();
            }
          }
        }
      }).catch((err) => {

      });
    }

    _subscribeProps() {
      if (this.state.btConnect) {
        this.listenerBle = DeviceEvent.BLESpecNotifyActionEvent.addListener((device, result) => {
          result.forEach((key, value) => {
            console.log(`commonsetting: receive prop(event) changed notification,prop:${ key },${ JSON.stringify(value) }`);
            if (this.isMount) {
              if (this.updater.isMounted(this)) {
                if (value == 'prop.2.1') {
                  this.setState({ lightPower: key });
                }
                if (value == 'prop.2.5') {
                  if (new Date().getTime() - this.state.lastControlTime < 1000) {
                    return;
                  }
                  this.setState({ traverse_switch: key ? 1 : 0 });
                }
              }
            }
          });
        });

        this._getPropsSpecBle1();
      } else {
        // 先订阅属性变更事件
        this.listener = DeviceEvent.deviceReceivedMessages.addListener((device, messages) => {
          console.log(`haoge---subscribe ---->${ JSON.stringify(messages) }`);
          if (messages.has('prop.2.5')) {
            if (new Date().getTime() - this.state.lastControlTime < 1000) {
              return;
            }
            this.setState({ traverse_switch: messages.get('prop.2.5')[0] });
          }
        });
        // 订阅属性
        Device.getDeviceWifi().subscribeMessages('prop.2.5')
          .then((subcription) => {
            // call this when you need to unsubscribe the message
            // 订阅成功
            console.log('subscribe success');
            msgSubscription = subcription;
          })
          .catch(() => {
            // 订阅失败
            console.log('subscribe failed');
          });
      }
    }

    addLog(string) {
      console.log(`log->${ string }`);
    }

    _sendCodeSpecForBle(Siid, Piid, Value, Type) { // 发送指令  一组参数

      let data = { objects: [{ siid: parseInt(Siid), piid: parseInt(Piid), value: Value, type: Type }] };
      let json = JSON.stringify(data);
      console.log(`_sendCodeSpecForBle->${ json }`);
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

    _sendCodeSpec(Siid, Piid, Value) { // 发送指令  一组参数
      this.setState({ lastControlTime: new Date().getTime() });
      console.log(`haoge---->${ new Date().getHours() }:${ new Date().getMinutes() }发送指令====>` + `Siid:${ Siid }--Piid:${ Piid }--Value:${ Value }`);
      if (this.state.btConnect) {
        console.log('ble');
        this._sendCodeSpecForBle(Siid, Piid, Value, 1);
      } else {
        console.log('wifi');
        Service.spec.setPropertiesValue([{ did: Device.deviceID, siid: Siid, piid: Piid, value: Value }])
          .then((res) => { // 请求成功
            console.log(`haoge---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
            if (Siid == 2) {
              if (Piid == 5 && res[0].code == 0) {
                this.setState({
                  traverse_switch: Value
                });
              }
            }
          }
          ).catch(
            (err) => { // 请求失败

            }
          );
      }
    }
}

var styles = StyleSheet.create({
  container: {
    backgroundColor: Styles.common.backgroundColor,
    flex: 1
  },
  featureSetting: {
    backgroundColor: DarkMode.getColorScheme() === 'dark' ? '#000' : '#fff'
  },
  blank: {
    height: 8,
    backgroundColor: Styles.common.backgroundColor,
    borderTopColor: Styles.common.hairlineColor,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Styles.common.hairlineColor,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  titleContainer: {
    height: 32,
    backgroundColor: DarkMode.getColorScheme() === 'dark' ? '#000' : '#fff',
    justifyContent: 'center',
    paddingLeft: Styles.common.padding
  },
  title: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.5)',
    lineHeight: 14
  }
});
