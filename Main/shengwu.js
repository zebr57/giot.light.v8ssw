import React from "react";
import {
  Image,
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  DeviceEventEmitter
} from "react-native";
import LocalizableString from './HomeLocalizableString';
import HomeLocalizableString from './HomeLocalizableString';
import { Bluetooth, Device, DeviceEvent, Host, Service, DarkMode } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import NavigationBar from "miot/ui/NavigationBar";
import { MessageDialog } from "miot/ui/Dialog";
import { LoadingDialog } from "miot/ui";
import Switch from "miot/ui/Switch";
import DataUtils from "./Utils/DataUtils";
import { colorGetterforRange } from "miot/utils/colors";

let data = [];

let msgSubscription = null;
const getPropsPara =
    [{ did: Device.deviceID, siid: 4, piid: 7 },
      { did: Device.deviceID, siid: 4, piid: 10 },
      { did: Device.deviceID, siid: 4, piid: 11 },
      { did: Device.deviceID, siid: 4, piid: 12 },
      { did: Device.deviceID, siid: 4, piid: 13 },
      { did: Device.deviceID, siid: 4, piid: 14 },
      { did: Device.deviceID, siid: 4, piid: 6 }];

const bt = Device.getBluetoothLE();

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


let colorMax = Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 5700 : 6500;
let colorMin = 2700;

export default class Default extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <NavigationBar
          backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
          type={NavigationBar.TYPE.LIGHT}
          title={LocalizableString.生物节律功能设置}
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
        lastControlTime: 0,

        switch: DataUtils.getJvSwitch(),
        repeat: DataUtils.getJvRepeat(),
        jv1: DataUtils.getJl1(),
        jv2: DataUtils.getJl2(),
        jv3: DataUtils.getJl3(),
        jv4: DataUtils.getJl4(),
        jv5: DataUtils.getJl5(),
        jv6: DataUtils.getJl6(),

        loadingVis: false,
        btConnect: props.navigation.state.params.btConnect

      };
    }

    _getProps() {
      Service.spec.getPropertiesValue(getPropsPara)
        .then((res) => { // 请求成功
          console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          // 节律
          if (res[0].code == 0) {
            DataUtils.parse3_7(res[0].value);
          }
          if (res[1].code == 0) {
            DataUtils.parse3_10(res[1].value);
          }
          if (res[2].code == 0) {
            DataUtils.parse3_11(res[2].value);
          }
          if (res[3].code == 0) {
            DataUtils.parse3_12(res[3].value);
          }
          if (res[4].code == 0) {
            DataUtils.parse3_13(res[4].value);
          }
          if (res[5].code == 0) {
            DataUtils.parse3_14(res[5].value);
          }
          if (res[6].code == 0) {
            DataUtils.parse3_6(res[6].value);
          }

          this.setState({
            switch: DataUtils.getJvSwitch(),
            jv1: DataUtils.getJl1(),
            jv2: DataUtils.getJl2(),
            jv3: DataUtils.getJl3(),
            jv4: DataUtils.getJl4(),
            jv5: DataUtils.getJl5(),
            jv6: DataUtils.getJl6(),
            repeat: DataUtils.getJvRepeat()
          });
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
        this.addLog(`get property resp1 :${ JSON.stringify(data) }`);
        let jsonData = Platform.OS === 'android' ? JSON.parse(data) : data;

        if (jsonData.objects[0].code == 0) {
          this.setState({
            traverse_switch: jsonData.objects[0].value
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
            if (new Date().getTime() - this.state.lastControlTime > 4000) {
              if (value == 'prop.4.6') {
                DataUtils.parse3_6(key);
              }
              if (value == 'prop.4.7') {
                DataUtils.parse3_7(key);
              }
              if (value == 'prop.4.10') {
                DataUtils.parse3_10(key);
              }
              if (value == 'prop.4.11') {
                DataUtils.parse3_11(key);
              }
              if (value == 'prop.4.12') {
                DataUtils.parse3_12(key);
              }
              if (value == 'prop.4.13') {
                DataUtils.parse3_13(key);
              }
              if (value == 'prop.4.14') {
                DataUtils.parse3_14(key);
              }
              this.setState({
                switch: DataUtils.getJvSwitch(),
                jv1: DataUtils.getJl1(),
                jv2: DataUtils.getJl2(),
                jv3: DataUtils.getJl3(),
                jv4: DataUtils.getJl4(),
                jv5: DataUtils.getJl5(),
                jv6: DataUtils.getJl6(),
                repeat: DataUtils.getJvRepeat()
              });
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
          if (new Date().getTime() - this.state.lastControlTime > 4000) {
            if (messages.has('prop.4.6')) {
              DataUtils.parse3_6(messages.get('prop.4.6')[0]);
            }
            if (messages.has('prop.4.7')) {
              DataUtils.parse3_7(messages.get('prop.4.7')[0]);
            }
            if (messages.has('prop.4.10')) {
              DataUtils.parse3_10(messages.get('prop.4.10')[0]);
            }
            if (messages.has('prop.4.11')) {
              DataUtils.parse3_11(messages.get('prop.4.11')[0]);
            }
            if (messages.has('prop.4.12')) {
              DataUtils.parse3_12(messages.get('prop.4.12')[0]);
            }
            if (messages.has('prop.4.13')) {
              DataUtils.parse3_13(messages.get('prop.4.13')[0]);
            }
            if (messages.has('prop.4.14')) {
              DataUtils.parse3_14(messages.get('prop.4.14')[0]);
            }

            this.setState({
              switch: DataUtils.getJvSwitch(),
              jv1: DataUtils.getJl1(),
              jv2: DataUtils.getJl2(),
              jv3: DataUtils.getJl3(),
              jv4: DataUtils.getJl4(),
              jv5: DataUtils.getJl5(),
              jv6: DataUtils.getJl6(),
              repeat: DataUtils.getJvRepeat()
            });
          }
        }
        );

        Device.getDeviceWifi().subscribeMessages(
          'prop.4.1', 'prop.4.6', 'prop.4.7', 'prop.4.10', 'prop.4.11', 'prop.4.12', 'prop.4.13', 'prop.4.14')
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

      this.listenerRequery = DeviceEventEmitter.addListener('update', (message) => {
        this.setState({
          switch: DataUtils.getJvSwitch(),
          jv1: DataUtils.getJl1(),
          jv2: DataUtils.getJl2(),
          jv3: DataUtils.getJl3(),
          jv4: DataUtils.getJl4(),
          jv5: DataUtils.getJl5(),
          jv6: DataUtils.getJl6(),
          repeat: DataUtils.getJvRepeat()
        });
      });
    }

    componentWillUnmount() {
      msgSubscription && msgSubscription.remove();

      this.listenerRequery && this.listenerRequery.remove();
      this.listener && this.listener.remove();

      this.listener1 && this.listener1.remove();

      if (this.listenerBle) {
        this.listenerBle.remove();
      }
    }


    render() {
      return (
        <View style={[styles.containAll]}>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
              flex: 1
            }}>

            <Image
              style={{
                resizeMode: 'cover',
                alignSelf: 'center',
                borderRadius: 20,
                width: this.mScreenWidth - 40
              }}
              source={require('../resources/shengwu_big.png')}/>

            <View style={{
              backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff',
              paddingTop: 15,
              marginTop: 10,
              marginHorizontal: 20,
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
                }}>{HomeLocalizableString.开启生物节律功能}</Text>

              </View>

              <View style={{ flex: 1 }}/>

              <Switch
                style={{ alignItems: 'center', justifyContent: 'center' }}
                value={this.state.switch}
                onTintColor={'#4396EB'}
                tintColor={DarkMode.getColorScheme() === 'dark' ? 'xm#191919' : '#E6E7F0'}
                onValueChange={(value) => {
                  if (value) {
                    this.setState({ switch: true });
                    this._sendCode(4, 6, DataUtils.setJvSwitch2(true, this.state.repeat));
                    DataUtils.parse3_6(DataUtils.setJvSwitch(true));
                  } else {
                    this.setState({ switch: false });
                    this._sendCode(4, 6, DataUtils.setJvSwitch2(false, this.state.repeat));
                    DataUtils.parse3_6(DataUtils.setJvSwitch(false));
                  }
                }
                }
              />
            </View>

            <Text style={{
              color: '#999999',
              marginHorizontal: 20,
              fontSize: Host.locale.language == 'en' ? 12 : 13,
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}>{HomeLocalizableString.开启生物节律功能tips}</Text>

            <View style={{ height: 0.5, marginHorizontal: 20, backgroundColor: '#E5E5E5', marginTop: 27 }}/>

            <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 20 }}>

              <TouchableOpacity
                style={{
                  backgroundColor: this.state.repeat.indexOf(1) != -1 ? '#4396EB' : DarkMode.getColorScheme() === 'dark' ? 'xm#191919' : '#F7F7F7',
                  justifyContent: 'center',
                  borderRadius: 999,
                  marginBottom: 10,
                  width: (this.mScreenWidth - 55 - 40) / 7,
                  height: (this.mScreenWidth - 55 - 40) / 7,
                  alignItems: 'center',
                  flexDirection: 'column'
                }}
                onPress={() => {
                  if (this.state.repeat.indexOf(1) != -1) {
                    let data = [];
                    this.state.repeat.map((item, index) => {
                      if (item != 1) {
                        data.push(item);
                      }
                    });
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  } else {
                    let data = this.state.repeat;
                    data.push(1);
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  }
                }}>
                <Text style={{
                  color: this.state.repeat.indexOf(1) != -1 ? '#fff' : '#999999'
                }}>{HomeLocalizableString.一}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: this.state.repeat.indexOf(2) != -1 ? '#4396EB' : DarkMode.getColorScheme() === 'dark' ? 'xm#191919' : '#F7F7F7',
                  justifyContent: 'center',
                  borderRadius: 999,
                  width: (this.mScreenWidth - 55 - 40) / 7,
                  marginLeft: 11,
                  height: (this.mScreenWidth - 55 - 40) / 7,
                  alignItems: 'center',
                  flexDirection: 'column'
                }}
                onPress={() => {
                  if (this.state.repeat.indexOf(2) != -1) {
                    let data = [];
                    this.state.repeat.map((item, index) => {
                      if (item != 2) {
                        data.push(item);
                      }
                    });
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  } else {
                    let data = this.state.repeat;
                    data.push(2);
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  }
                }}>
                <Text style={{
                  color: this.state.repeat.indexOf(2) != -1 ? '#fff' : '#999999'
                }}>{HomeLocalizableString.二}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: this.state.repeat.indexOf(3) != -1 ? '#4396EB' : DarkMode.getColorScheme() === 'dark' ? 'xm#191919' : '#F7F7F7',
                  justifyContent: 'center',
                  borderRadius: 999,
                  width: (this.mScreenWidth - 55 - 50) / 7,
                  marginLeft: 11,
                  height: (this.mScreenWidth - 55 - 50) / 7,
                  alignItems: 'center',
                  flexDirection: 'column'
                }}
                onPress={() => {
                  if (this.state.repeat.indexOf(3) != -1) {
                    let data = [];
                    this.state.repeat.map((item, index) => {
                      if (item != 3) {
                        data.push(item);
                      }
                    });
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  } else {
                    let data = this.state.repeat;
                    data.push(3);
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  }
                }}>
                <Text style={{
                  color: this.state.repeat.indexOf(3) != -1 ? '#fff' : '#999999'
                }}>{HomeLocalizableString.三}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: this.state.repeat.indexOf(4) != -1 ? '#4396EB' : DarkMode.getColorScheme() === 'dark' ? 'xm#191919' : '#F7F7F7',
                  justifyContent: 'center',
                  borderRadius: 999,
                  width: (this.mScreenWidth - 55 - 50) / 7,
                  marginLeft: 11,
                  height: (this.mScreenWidth - 55 - 50) / 7,
                  alignItems: 'center',
                  flexDirection: 'column'
                }}
                onPress={() => {
                  if (this.state.repeat.indexOf(4) != -1) {
                    let data = [];
                    this.state.repeat.map((item, index) => {
                      if (item != 4) {
                        data.push(item);
                      }
                    });
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  } else {
                    let data = this.state.repeat;
                    data.push(4);
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  }
                }}>
                <Text style={{
                  color: this.state.repeat.indexOf(4) != -1 ? '#fff' : '#999999'
                }}>{HomeLocalizableString.四}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: this.state.repeat.indexOf(5) != -1 ? '#4396EB' : DarkMode.getColorScheme() === 'dark' ? 'xm#191919' : '#F7F7F7',
                  justifyContent: 'center',
                  borderRadius: 999,
                  width: (this.mScreenWidth - 55 - 50) / 7,
                  marginLeft: 11,
                  height: (this.mScreenWidth - 55 - 50) / 7,
                  alignItems: 'center',
                  flexDirection: 'column'
                }}
                onPress={() => {
                  if (this.state.repeat.indexOf(5) != -1) {
                    let data = [];
                    this.state.repeat.map((item, index) => {
                      if (item != 5) {
                        data.push(item);
                      }
                    });
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  } else {
                    let data = this.state.repeat;
                    data.push(5);
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  }
                }}>
                <Text style={{
                  color: this.state.repeat.indexOf(5) != -1 ? '#fff' : '#999999'
                }}>{HomeLocalizableString.五}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: this.state.repeat.indexOf(6) != -1 ? '#4396EB' : DarkMode.getColorScheme() === 'dark' ? 'xm#191919' : '#F7F7F7',
                  justifyContent: 'center',
                  borderRadius: 999,
                  width: (this.mScreenWidth - 55 - 50) / 7,
                  marginLeft: 11,
                  height: (this.mScreenWidth - 55 - 50) / 7,
                  alignItems: 'center',
                  flexDirection: 'column'
                }}
                onPress={() => {
                  if (this.state.repeat.indexOf(6) != -1) {
                    let data = [];
                    this.state.repeat.map((item, index) => {
                      if (item != 6) {
                        data.push(item);
                      }
                    });
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  } else {
                    let data = this.state.repeat;
                    data.push(6);
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  }
                }}>
                <Text style={{
                  color: this.state.repeat.indexOf(6) != -1 ? '#fff' : '#999999'
                }}>{HomeLocalizableString.六}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: this.state.repeat.indexOf(7) != -1 ? '#4396EB' : DarkMode.getColorScheme() === 'dark' ? 'xm#191919' : '#F7F7F7',
                  justifyContent: 'center',
                  borderRadius: 999,
                  width: (this.mScreenWidth - 55 - 50) / 7,
                  marginLeft: 11,
                  height: (this.mScreenWidth - 55 - 50) / 7,
                  alignItems: 'center',
                  flexDirection: 'column'
                }}
                onPress={() => {
                  if (this.state.repeat.indexOf(7) != -1) {
                    let data = [];
                    this.state.repeat.map((item, index) => {
                      if (item != 7) {
                        data.push(item);
                      }
                    });
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  } else {
                    let data = this.state.repeat;
                    data.push(7);
                    this._sendCode(4, 6, DataUtils.setJvRepeat(data));
                    DataUtils.parse3_6(DataUtils.setJvRepeat(data));
                    this.setState({ repeat: data });
                  }
                }}>
                <Text style={{
                  color: this.state.repeat.indexOf(7) != -1 ? '#fff' : '#999999'
                }}>{HomeLocalizableString.日}</Text>
              </TouchableOpacity>

            </View>

            {this.itemView(1, HomeLocalizableString.起床, this.state.jv1)}
            {this.itemView(2, HomeLocalizableString.中午, this.state.jv2)}
            {this.itemView(3, HomeLocalizableString.午休, this.state.jv3)}
            {this.itemView(4, HomeLocalizableString.午起, this.state.jv4)}
            {this.itemView(5, HomeLocalizableString.傍晚, this.state.jv5)}
            {this.itemView(6, HomeLocalizableString.入睡, this.state.jv6)}

            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
                marginBottom: 20
              }}
              onPress={() => {
                this.setState({ rdialog: true });
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
                }}>{HomeLocalizableString.重置}</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>


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
                  this._sendCode(2, 5, true);
                  this.setState({ dialog: false });
                }
              }
            ]}
            onDismiss={(_) => {
              this.setState({ dialog: false });
            }}
          />

          <MessageDialog
            visible={this.state.rdialog}
            title={HomeLocalizableString.重要提示}
            message={HomeLocalizableString.重置设置提示}
            buttons={[
              {
                text: HomeLocalizableString.cancel,
                callback: (_) => this.setState({ rdialog: false })
              },
              {
                titleColor: "#F44431",
                backgroundColor: { bgColorNormal: DarkMode.getColorScheme() === 'dark' ? 'xm#ffffff20' : 'xm#F5F5F5' },
                text: HomeLocalizableString.重置,
                callback: (_) => {
                  if (this.state.btConnect) {
                    let entity = {
                      "siid": 4,
                      "aiid": 9,
                      "objects": []
                    };
                    let json = JSON.stringify(entity);
                    this.addLog(`do Action params ${ json }`);


                    DataUtils.resetJv();

                    this.state = {
                      switch: DataUtils.getJvSwitch(),
                      repeat: DataUtils.getJvRepeat(),
                      jv1: DataUtils.getJl1(),
                      jv2: DataUtils.getJl2(),
                      jv3: DataUtils.getJl3(),
                      jv4: DataUtils.getJl4(),
                      jv5: DataUtils.getJl5(),
                      jv6: DataUtils.getJl6()
                    };

                    Bluetooth.spec.doAction(Device.mac, json).then((data) => {

                    }).catch((err) => {

                    });
                  } else {
                    this.addLog(`do Action  resetJv`);
                    DataUtils.resetJv();

                    this.setState({
                      switch: DataUtils.getJvSwitch(),
                      repeat: DataUtils.getJvRepeat(),
                      jv1: DataUtils.getJl1(),
                      jv2: DataUtils.getJl2(),
                      jv3: DataUtils.getJl3(),
                      jv4: DataUtils.getJl4(),
                      jv5: DataUtils.getJl5(),
                      jv6: DataUtils.getJl6()
                    });

                    Service.spec.doAction({ did: Device.deviceID, siid: 4, aiid: 9, in: [] })
                      .then((res) => { // 请求成功
                        this.addLog(`do Action 成功`);
                      }).catch((err) => { // 请求失败
                        this.addLog(`do Action 失败`);
                      });
                  }
                  this.setState({ rdialog: false });
                }
              }
            ]}
            onDismiss={(_) => {
              this.setState({ rdialog: false });
            }}/>

          <LoadingDialog title={HomeLocalizableString.loading}
            timeout={3000}
            visible={this.state.loadingVis}/>
        </View>
      );
    }

    _2addZero(str) {
      return str.toString().length == 2 ? str : `0${ str }`;
    }

    parseTime(time) {
      return `${ this._2addZero(parseInt(time / 60)) }:${ this._2addZero(time % 60) }`;
    }

    itemView(id, name, item) {
      return (
        <TouchableOpacity
          style={{
            marginHorizontal: 10,
            width: this.mScreenWidth - 20,
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F6F6F6',
            borderRadius: 12
          }} onPress={() => {
            this.props.navigation.navigate('JyDetail', {
              mode: id,
              btConnect: this.state.btConnect
            });
          }}>
          <TouchableOpacity
            style={{
              paddingHorizontal: 15,
              paddingVertical: 30
            }}
            onPress={() => {
              let m = 0;
              if (item.enable == 0) {
                m = 1;
              } else {
                m = 0;
              }
              if (id == 1) {
                let value = DataUtils.setJL(
                  m,
                  DataUtils.getJl1().time,
                  DataUtils.getJl1().temp,
                  DataUtils.getJl1().bright,
                  DataUtils.getJl1().custom_time,
                  DataUtils.getJl1().mode);
                this._sendCode(4, 7, value);
                DataUtils.parse3_7(value);
              } else if (id == 2) {
                let value = DataUtils.setJL(
                  m,
                  DataUtils.getJl2().time,
                  DataUtils.getJl2().temp,
                  DataUtils.getJl2().bright,
                  DataUtils.getJl2().custom_time,
                  DataUtils.getJl2().mode);
                this._sendCode(4, 10, value);
                DataUtils.parse3_10(value);
              } else if (id == 3) {
                let value = DataUtils.setJL(
                  m,
                  DataUtils.getJl3().time,
                  DataUtils.getJl3().temp,
                  DataUtils.getJl3().bright,
                  DataUtils.getJl3().custom_time,
                  DataUtils.getJl3().mode);
                this._sendCode(4, 11, value);
                DataUtils.parse3_11(value);
              } else if (id == 4) {
                let value = DataUtils.setJL(
                  m,
                  DataUtils.getJl4().time,
                  DataUtils.getJl4().temp,
                  DataUtils.getJl4().bright,
                  DataUtils.getJl4().custom_time,
                  DataUtils.getJl4().mode);
                this._sendCode(4, 12, value);
                DataUtils.parse3_12(value);
              } else if (id == 5) {
                let value = DataUtils.setJL(
                  m,
                  DataUtils.getJl5().time,
                  DataUtils.getJl5().temp,
                  DataUtils.getJl5().bright,
                  DataUtils.getJl5().custom_time,
                  DataUtils.getJl5().mode);
                this._sendCode(4, 13, value);
                DataUtils.parse3_13(value);
              } else if (id == 6) {
                let value = DataUtils.setJL(
                  m,
                  DataUtils.getJl6().time,
                  DataUtils.getJl6().temp,
                  DataUtils.getJl6().bright,
                  DataUtils.getJl6().custom_time,
                  DataUtils.getJl6().mode);
                this._sendCode(4, 14, value);
                DataUtils.parse3_14(value);
              }
              this.setState({
                jv1: DataUtils.getJl1(),
                jv2: DataUtils.getJl2(),
                jv3: DataUtils.getJl3(),
                jv4: DataUtils.getJl4(),
                jv5: DataUtils.getJl5(),
                jv6: DataUtils.getJl6(),
                repeat: DataUtils.getJvRepeat()
              });
            }}>
            <Image
              style={{ tintColor: item.enable != 1 && DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : null }}
              source={item.enable == 1 ? require('../resources/icon_sel.png') : require('../resources/icon_not_sel.png')}/>
          </TouchableOpacity>

          <Text style={{
            width: 60,
            color: '#000000',
            fontSize: 14,
            fontWeight: 'bold'
          }}>{name}</Text>

          <View style={{
            borderRadius: 999, width: 30, height: 30,
            marginHorizontal: 10,
            backgroundColor: this._getColor(item.temp, item.bright)
          }}></View>

          <View style={{ flexDirection: 'column', flex: 3 }}>

            <Text style={{
              color: '#999',
              fontSize: 13
            }}>{`${ this.parseTime(item.time) } ${ item.bright == 0 ? HomeLocalizableString.关灯 : (`${ item.bright }% ${ item.temp }k`) }`}</Text>

            <View style={{ flexDirection: 'row' }}>
              <Text style={{
                color: '#999',
                fontSize: 13
              }}>{HomeLocalizableString.变光时长 + this.getCustomTimeStr(item.custom_time, item.mode)}</Text>
            </View>
          </View>

          <Image style={{ tintColor: DarkMode.getColorScheme() === 'dark' ? 'xm#a2a2a2' : null, marginRight: 20 }}
            source={require('../resources/arrow.png')}/>
        </TouchableOpacity>
      );
    }


    getCustomTimeStr(value, lightMode) {
      console.log(`getCustomTimeStr->${ value },mode=${ lightMode }`);
      // 发送给设备
      if (lightMode == 1) {
        return HomeLocalizableString.立即变化;
      } else {
        if (lightMode == 2) {
          return value + HomeLocalizableString.s;
        } else {
          return value + HomeLocalizableString.分钟;
        }
      }
    }

    _getColor(temp, bgAlpha) {
      return `xm${ ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(temp, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(bgAlpha * (185 / 100) + 70)).toString(16) }`;
    }

    _getCheckBrightness(value) {
      return value;
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
      if (Siid == 2) {
        if (Piid == 5) {
          this.setState({ traverse_switch: Value });
        }
      }
    }

    _sendCode(Siid, Piid, Value) { // 发送指令  一组参数
      this.setState({ lastControlTime: new Date().getTime() });
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
            if (Siid == 2) {
              if (Piid == 5 && (res[0].code == 0 || res[0].code == 1)) {
                this.setState({ traverse_switch: Value });
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