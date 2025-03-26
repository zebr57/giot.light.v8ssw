import React from "react";
import {
  Image,
  ListView,
  Modal,
  Platform, ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";
import LocalizableString from './HomeLocalizableString';
import HomeLocalizableString from './HomeLocalizableString';
import { Bluetooth, DarkMode, Device, DeviceEvent, Service } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import NavigationBar from "miot/ui/NavigationBar";
import { MessageDialog } from "miot/ui/Dialog";
import { LoadingDialog, StringSpinner } from "miot/ui";
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
        modalVisible: false,
        gradient_duration_on: DataUtils.getProfessData()[0],
        gradient_duration_off: DataUtils.getProfessData()[1],
        gradient_duration_aj: DataUtils.getProfessData()[2],
        quxian: DataUtils.getQuXianData()[0],

        type: 1,
        dialog: false,
        dialog2: false,

        loadingVis: false,
        btConnect: props.navigation.state.params.btConnect,
        mData: [HomeLocalizableString.渐变效果, HomeLocalizableString.立即变化],
        temp: 0
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
            quxian: DataUtils.getQuXianData()[0]
          });
        });
    }

    _getPropsSpecBle1() {
      let prop = {
        "siid": 3,
        "piid": 17
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
            gradient_duration_on: jsonData.objects[0].value
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
        "piid": 18
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
            gradient_duration_off: jsonData.objects[0].value
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
        "piid": 19
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
            gradient_duration_aj: jsonData.objects[0].value
          });

          this.setState({ loadingVis: false });
          this.setState({ devFinalOffline: false });
        } else {
          // 读取失败 1.5s后重试
          const timeoutID = setTimeout(() => {
            this._getPropsSpecBle3();
            // 清除
            clearTimeout(timeoutID);
          }, 1500);
        }
      }).catch((err) => {
        this.setState({ loadingVis: false });
      });
    }


    _subscribeProps() {
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
        if (messages.has('event.4.1')) {
          this.onShowToast(HomeLocalizableString.应用成功);
        }
        this.setState({
          gradient_duration_on: DataUtils.getProfessData()[0],
          gradient_duration_off: DataUtils.getProfessData()[1],
          gradient_duration_aj: DataUtils.getProfessData()[2],
          quxian: DataUtils.getQuXianData()[0]
        });
      }
      );

      Device.getDeviceWifi().subscribeMessages(
        'prop.4.5', 'prop.4.6', 'prop.4.1', 'event.4.1')
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
            if (this.state.gradient_duration_on == 10 &&
                        this.state.gradient_duration_off == 10 && this.state.gradient_duration_aj == 10) {
              this.setState({ temp: 0 });
            } else {
              this.setState({ temp: 1 });
            }
            this.setState({ modalVisible: true });
          }}>
            <View>
              <Text style={{
                color: '#000000',
                fontSize: 15,
                fontWeight: 'bold'
              }}>{HomeLocalizableString.灯光变化设置}</Text>

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
              }}>{(this.state.gradient_duration_on == 10 &&
                        this.state.gradient_duration_off == 10 && this.state.gradient_duration_aj == 10)
                ? HomeLocalizableString.渐变效果 : HomeLocalizableString.立即变化}</Text>

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
                bgColorNormal: "#4396EB"
              },
              pickerInnerStyle: { selectTextColor: "#4396EB", unitTextColor: "#4396EB" }
            }}
            current={[this.state.type == 1 ? `${ this.state.gradient_duration_on / 100 }` :
              this.state.type == 2 ? `${ this.state.gradient_duration_off / 100 }`
                : `${ this.state.gradient_duration_aj / 100 }`]}
            onDismiss={(_) => {
              this.setState({
                dialog: false
              });
            }}
            onSelect={(res) => {
              console.log(res.rawArray[0]);
              if (this.state.type == 1) {
                this.setState({ gradient_duration_on: res.rawArray[0] * 100 });
                this._sendCode(4, 17, parseInt(res.rawArray[0] * 100));
              } else if (this.state.type == 2) {
                this.setState({ gradient_duration_off: res.rawArray[0] * 100 });
                this._sendCode(4, 18, parseInt(res.rawArray[0] * 100));
              } else {
                this.setState({ gradient_duration_aj: res.rawArray[0] * 100 });
                this._sendCode(4, 19, parseInt(res.rawArray[0] * 100));
              }

            }}
          />


          <MHDatePicker2
            showSubtitle={false}
            unit={'%'}
            min={[`${ this.state.minimum_bri_factory / 10 }`]}
            step={1}
            max={['50']}
            visible={this.state.dialog2}
            title={HomeLocalizableString.最低亮度}
            type={MHDatePicker1.TYPE.SINGLE}
            datePickerStyle={{
              rightButtonStyle: {
                color: '#fff'
              },
              rightButtonBgStyle: {
                bgColorNormal: "#4396EB"
              },
              pickerInnerStyle: { selectTextColor: "#4396EB", unitTextColor: "#4396EB" }
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
              this._sendCode(4, 23, parseInt(res.rawArray[0] * 10));
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
                      "siid": 4,
                      "aiid": 7,
                      "objects": []
                    };
                    let json = JSON.stringify(entity);
                    this.addLog(`do Action params ${ json }`);
                    Bluetooth.spec.doAction(Device.mac, json).then((data) => {

                    }).catch((err) => {

                    });
                  } else {
                    this.addLog(`do Action`);
                    Service.spec.doAction({ did: Device.deviceID, siid: 4, aiid: 7, in: [] })
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
            }}
          />

          {this._modalView()}

          <LoadingDialog title={HomeLocalizableString.loading}
            timeout={3000}
            visible={this.state.loadingVis}/>
        </View>
      );
    }

    setModalVisible(visible) {
      this.setState({ modalVisible: visible });
    }

    onModalClose() {
      this.setState({ modalVisible: false });
    }

    _modalView() {
      return (

        <Modal
          animationType={"fade"}
          transparent={true}
          visible=
            {
              this.state.modalVisible
            }
          onRequestClose=
            {
              () => {
                this.setModalVisible(false);
              }
            }>

          <TouchableHighlight
            underlayColor="#00000000"
            style={{ flex: 1 }}
            onPress={this.onModalClose.bind(this)}>
            <View style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.4)'
            }}>

              <View style={{
                position: 'absolute',
                bottom: 0
              }}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                  }}>
                  <View style={{
                    width: this.mScreenWidth,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    backgroundColor: DarkMode.getColorScheme() === 'dark' ? '#fff' : '#ffffff',
                    paddingTop: 6,
                    paddingBottom: 27
                  }}>
                    <View style={{
                      flexDirection: 'column'
                    }}>

                      {this._modalTopView()}

                      {this._modalSpinner()}

                      <View style={{
                        width: this.mScreenWidth - 40,
                        alignItems: 'center',
                        marginLeft: 20,
                        marginRight: 20,
                        flexDirection: 'row'
                      }}>
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            height: 45,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: "#F5F5F5", borderRadius: 999
                          }}
                          onPress={() => {
                            this.setModalVisible(false);
                          }}>
                          <Text style={{
                            fontFamily: "PingFangSC-Regular",
                            fontSize: 16,
                            color: "#353535",
                            padding: 10,
                            fontWeight: 'bold'
                          }}>
                            {HomeLocalizableString.cancel}
                          </Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                          style={{
                            flex: 1,
                            marginLeft: 20,
                            height: 45,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: "#4396EB", borderRadius: 999
                          }}
                          onPress={() => {
                            this.setModalVisible(false);

                            if (this.state.temp == 0) {
                              console.log('aaaaaa');
                              this._sendCode(4, 5, DataUtils.getGradientDurationParams(10, 10, 10));

                            } else if (this.state.temp == 1) {
                              this._sendCode(4, 5, DataUtils.getGradientDurationParams(1, 1, 1));
                            }
                          }}>
                          <Text style={{
                            fontFamily: "PingFangSC-Regular",
                            fontSize: 16,
                            color: "#fff",
                            padding: 10,
                            fontWeight: 'bold'
                          }}>
                            {HomeLocalizableString.confirm}
                          </Text>
                        </TouchableOpacity>

                      </View>

                    </View>
                  </View>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableHighlight>

        </Modal>
      );
    }

    _modalTopView() {
      return (
        <View style={{
          width: this.mScreenWidth,
          alignItems: 'center',
          flexDirection: 'row'
        }}>

          <View style={{ flex: 1 }}/>

          <Text style={{
            fontSize: 16,
            marginTop: 10,
            color: "#353535",
            fontWeight: 'bold'
          }}>
            {HomeLocalizableString.灯光变化设置}
          </Text>

          <View style={{ flex: 1 }}/>

        </View>
      );
    }

    _modalSpinner() {
      return (
        <StringSpinner
          style={{
            width: this.mScreenWidth,
            height: 200,
            backgroundColor: '#ffffff'
          }}
          dataSource={this.state.mData}
          defaultValue={(this.state.temp == 0)
            ? HomeLocalizableString.渐变效果 : HomeLocalizableString.立即变化}
          pickerInnerStyle={{
            selectTextColor: "#4396EB"
          }}
          onValueChanged={(data) => {
            if (data.newValue == HomeLocalizableString.渐变效果) {
              this.setState({ temp: 0 });
            } else if (data.newValue == HomeLocalizableString.立即变化) {
              this.setState({ temp: 1 });
            }
            /* if (data.newValue == HomeLocalizableString.渐变效果) {
                                                 this._sendCode(4, 17, 100)
                                                 this._sendCode(4, 18, 100)
                                                 this._sendCode(4, 19, 100)
                                             } else if (data.newValue == HomeLocalizableString.立即变化) {
                                                 this._sendCode(4, 17, 10)
                                                 this._sendCode(4, 18, 10)
                                                 this._sendCode(4, 19, 10)
                                             } */
          }}
        />
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
            if (Piid == 17) {
              this.setState({ gradient_duration_on: Value });
            }
            if (Piid == 18) {
              this.setState({ gradient_duration_off: Value });
            }
            if (Piid == 19) {
              this.setState({ gradient_duration_aj: Value });
            }
          }
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
        this._sendCodeSpecForBle(Siid, Piid, Value, 3);
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