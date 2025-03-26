import React from "react";
import ActionSheet from "miot/ui/Dialog/ActionSheet";
import {
  DeviceEventEmitter,
  Image,
  Keyboard,
  ListView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import LocalizableString from './HomeLocalizableString';
import HomeLocalizableString from './HomeLocalizableString';
import { Bluetooth, DarkMode, Device, Host, Service } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import InputDialog from "./View/InputDialog";
import NavigationBar from "miot/ui/NavigationBar";
import Styles from "../../../miot-sdk/resources/Styles";
import MessageDialog from "../../../miot-sdk/ui/Dialog/MessageDialog";

let data = [];

export default class Collect extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <NavigationBar
          backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
          type={NavigationBar.TYPE.LIGHT}
          title={LocalizableString.custom}
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
        visible: false,
        collectInputNameDialog: false,
        dataSource: [], // data.result为模拟的数据或服务端得到的数据
        selectCollect: 0,
        selectBright: 0,
        selectTemp: 0,
        saveBtnEnable: false,
        messageDialog: false,
        brightness: props.navigation.state.params.brightness,
        color_temperature: props.navigation.state.params.color_temperature,
        useDataName: props.navigation.state.params.useDataName ? props.navigation.state.params.useDataName : '',
        selectIndex: -1,
        btConnect: props.navigation.state.params.btConnect,
        selectName: '',
        clickIndex: -1
      };
    }

    componentDidMount() {
      this._getDeviceUseData();
    }

    _getDeviceUseData() {
      let params = {
        'did': Device.deviceID, 'props': [
          "prop.s_collect_use_data"
        ]
      };
      Service.smarthome.batchGetDeviceDatas([params]).then((res) => {
        console.log(`收藏使用的数据====》${ JSON.stringify(res) }`);
        Object.keys(res).map((key, index) => {
          if (index == 0) {
            if (res[key]["prop.s_collect_use_data"] != null || res[key]["prop.s_collect_use_data"] != '') {
              this.setState({ useDataName: res[key]["prop.s_collect_use_data"] });
              this._loadCollects(res[key]["prop.s_collect_use_data"]);
            } else
              this._loadCollects('');
          } else
            this._loadCollects('');
        });
      }).catch((err) => {
        this._loadCollects('');
      });
    }

    componentWillUnmount() {

    }

    _loadCollects(name) { // 获取收藏夹
      Service.smarthome.getUserColl({
        did: Device.deviceID
      }).then((data) => {
        this.setState({
          dataSource: data
        });
        console.log(`data->${ JSON.stringify(data) }`);

        data.map((item, index) => {
          this._setSelectStatus(item.content.split(',')[0], this.state.brightness, item.content.split(',')[1], this.state.color_temperature, item.name, name, index);
        });

      }).catch((err) => {
        console.log(JSON.stringify(err));
      });
    }

    _setSelectStatus(contentBrightness, brightness, contentTemperature, color_temperature, itemName, useDataName, index) {
      if (parseInt(contentBrightness) == brightness && parseInt(contentTemperature) == color_temperature && itemName == useDataName) {
        this.setState({ selectIndex: index });
      }
    }

    render() {
      return (
        <View style={styles.containAll}>
          {/* <ListView */}
          {/* dataSource={this.state.dataSource} */}
          {/* renderRow={this._renderRow.bind(this)} */}
          {/* renderSeparator={this._renderSeparator.bind(this)} */}
          {/* enableEmptySections={true} */}
          {/* /> */}

          <ScrollView>
            {
              this.state.dataSource.map((item, index) => {
                return (this._renderRow(item, index));
              })
            }
          </ScrollView>

          <ActionSheet
            visible={this.state.visible}
            options={[
              {
                title: LocalizableString.rename,
                onPress: (_) => {
                  this.setState({ collectInputNameDialog: true });
                  this.setState({ visible: false });
                }
              },
              {
                title: LocalizableString.delete,
                onPress: (_) => {
                  this.setState({
                    visible: false,
                    messageDialog: true
                  });
                }
              }
            ]}
            buttons={[
              {
                text: LocalizableString.cancel,
                callback: (_) => this.setState({ visible: false })
              }
            ]}
          />

          <InputDialog
            visible={this.state.collectInputNameDialog}
            title={HomeLocalizableString.collect_name}
            onDismiss={(_) => {
              this.setState({
                collectInputNameDialog: false,
                saveBtnEnable: false
              });
            }}
            buttons={[
              {
                backgroundColor: 'rgba(0,0,0,0)',
                style: {
                  backgroundColor: '#e2e2e2',
                  flex: 1,
                  borderRadius: 25,
                  height: 45,
                  alignItems: 'center',
                  justifyContent: 'center'
                },
                text: HomeLocalizableString.cancel,
                callback: (_) => this.setState({
                  collectInputNameDialog: false,
                  saveBtnEnable: false
                })
              },
              {
                backgroundColor: 'rgba(0,0,0,0)',
                style: {
                  backgroundColor: this.state.saveBtnEnable ? '#5fb6bd' : '#e2e2e2',
                  flex: 1,
                  borderRadius: 25,
                  height: 45,
                  alignItems: 'center',
                  justifyContent: 'center'
                },
                text: HomeLocalizableString.save,
                callback: (result) => {
                  if (!this.state.saveBtnEnable)
                    return;


                  Keyboard.dismiss();
                  console.log(`结果`, result.textInputArray[0]);
                  if (result.textInputArray[0] == '') {
                    this.onShowToast(HomeLocalizableString.collect_name_is_null);
                    this.setState({ collectInputNameDialog: false });
                    return;
                  }
                  if (result.textInputArray[0].length > 10) {
                    this.onShowToast(HomeLocalizableString.collect_name_too_long);
                    return;
                  }


                  let flag = 0;
                  Service.smarthome.getUserColl({
                    did: Device.deviceID
                  }).then((data) => {
                    data.map((info, index) => {
                      if (info.name.split('_')[0].toString() == result.textInputArray[0]) {
                        flag = 1;
                      }
                    });

                    if (flag != 0) {
                      Keyboard.dismiss();
                      this.onShowToast(HomeLocalizableString.duplicate_custom_theme_name);
                    } else {
                      this._editCollect(result.textInputArray[0]);
                      this.setState({
                        collectInputNameDialog: false,
                        saveBtnEnable: false
                      });
                    }
                  }).catch((err) => {
                    this._editCollect(result.textInputArray[0]);
                    this.setState({
                      collectInputNameDialog: false,
                      saveBtnEnable: false
                    });
                  });

                }
              }
            ]}
            inputs={[
              {
                placeholder: HomeLocalizableString.collect_input_tips,
                textInputProps: {
                  maxLength: 20,
                  autoFocus: true,
                  returnKeyType: 'done',
                  inputStyle: {
                    color: DarkMode.getColorScheme() === 'dark' ? '#ffffff' : '#000'
                  }
                },
                defaultValue: '',
                type: 'DELETE',
                onChangeText: (text) => {
                  this.setState({ saveBtnEnable: text.length > 0 ? true : false });
                }
              }
            ]}
          />

          <MessageDialog
            title={HomeLocalizableString.delete_collect}
            visible={this.state.messageDialog}
            message={HomeLocalizableString.delete_collect_tips}
            messageStyle={{ textAlign: 'center' }}
            buttons={[
              {
                text: HomeLocalizableString.cancel,
                callback: (_) => this.setState({ messageDialog: false })
              },
              {
                text: HomeLocalizableString.confirm,
                backgroundColor: { bgColorNormal: '#f5f5f5' },
                titleColor: Styles.common.MHGreen,
                callback: (_) => {
                  Service.smarthome.delUserColl({
                    did: Device.deviceID,
                    coll_id: this.state.selectCollect
                  }).then((data) => {
                    console.log(JSON.stringify(data));
                    this._delectUserName();
                    this._getDeviceUseData();
                    this.setState({ selectIndex: -1 });
                  }).catch((err) => {
                    console.log(JSON.stringify(err));
                  });
                  this.setState({ visible: false });
                  this.setState({ messageDialog: false });
                }
              }
            ]}
            onDismiss={(_) => this.setState({ messageDialog: false })}
          />
        </View>
      );
    }

    _delectUserName() {
      if (this.state.useDataName == this.state.selectName) {
        Service.smarthome.batchSetDeviceDatas([{
          'did': Device.deviceID, 'props': {
            "prop.s_collect_use_data": ''
          }
        }]).then(((value) => {
          this.setState({ useDataName: '' });
        })).catch((err) => {
        });
      }
    }

    // 重命名时，如果该收藏已经是使用中，顺便修改存在设备端的使用中名称
    _editNameWithUpdateUserName(name) {
      if (this.state.clickIndex == this.state.selectIndex) {
        this._setDeviceUseData(name);
      } else {
        this._getDeviceUseData();
      }
    }

    _editCollect(name) {
      Service.smarthome.editUserColl({
        coll_id: this.state.selectCollect,
        newname: name,
        content: `${ this.state.selectBright },${ this.state.selectTemp }`
      }).then((data) => {
        console.log(JSON.stringify(data));
        this._editNameWithUpdateUserName(name);
      }).catch((err) => {
        console.log(JSON.stringify(err));
      });
    }

    _renderRow(item, rowID) {
      return (
        <View
          key={rowID}
          style={{
            backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff',
            padding: 25,
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center'
          }}>
          <Image
            style={{ alignSelf: 'center' }}
            source={require('../resources/default_light_ic.png')}/>

          <View style={{
            flexDirection: 'column',
            marginLeft: 20
          }}>

            <Text style={{
              color: 'rgb(64,64,64)',
              fontSize: 15,
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}>{item.name}</Text>

            {/* <Text style={{ */}
            {/* color: 'rgb(156,156,156)', */}
            {/* fontSize: 11, */}
            {/* marginTop: 5, */}
            {/* ...Platform.select({ */}
            {/* ios: {}, */}
            {/* android: { fontFamily: 'lucida grande' } */}
            {/* }) */}
            {/* }}>{HomeLocalizableString.brightness(item.content.split(',')[0]) + HomeLocalizableString.temp(parseInt(item.content.split(',')[1]) + 3000)}</Text> */}

          </View>

          <View style={{ flex: 1 }}/>

          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: Host.locale.language == 'zh' ? this.mScreenWidth / 6 : this.mScreenWidth / 5,
              height: 30,
              borderWidth: 1,
              borderColor: rowID == this.state.selectIndex ? '#4396EB' : '#4396EB',
              borderRadius: 25,
              backgroundColor: rowID == this.state.selectIndex ? '#4396EB' : '#fff'
            }}
            onPress={() => {
              if (rowID == this.state.selectIndex)
                return;

              this._sendCode(2, 2, parseInt(item.content.split(',')[0]), item.name, rowID);// 发送指令设置色温

              this.interval = setInterval(() => {
                clearInterval(this.interval);
                this._sendCode(2, 3, parseInt(item.content.split(',')[1]) + 3000, item.name, rowID);// 发送指令设置色温
              }, 250);

              this.setState({ visible: false });
            }}>

            <Text style={{
              fontSize: 13,
              color: rowID == this.state.selectIndex ? '#fff' : '#4396EB',
              textAlign: 'center',
              ...Platform.select({
                ios: {},
                android: { fontFamily: 'lucida grande' }
              })
            }}>{rowID == this.state.selectIndex ? LocalizableString.used : LocalizableString.use_now}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              this.setState({
                selectCollect: item.coll_id,
                selectBright: item.content.split(',')[0],
                selectTemp: item.content.split(',')[1],
                visible: true,
                selectName: item.name,
                clickIndex: rowID
              });
            }}>
            <Image
              style={{ alignSelf: 'center', marginLeft: 15 }}
              source={require('../resources/list_setting_ic.png')}/>
          </TouchableOpacity>

        </View>
      );
    }

    _sendCode(Siid, Piid, Value, itemName, rowID) { // 发送指令  一组参数
      if (this.state.btConnect) {
        if (Piid == 1) {
          this._sendCodeSpecForBle(Siid, Piid, Value, 0);
        } else if (Piid == 3) {
          this._sendCodeSpecForBle(Siid, Piid, Value, 3);
        } else {
          this._sendCodeSpecForBle(Siid, Piid, Value, 1);
        }
      } else {
        console.log(`发送指令---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ Siid }--${ Piid }--${ Value }`);
        Service.spec.setPropertiesValue([{ did: Device.deviceID, siid: Siid, piid: Piid, value: Value }])
          .then((res) => { // 请求成功
            console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
            if (Siid == 2 && Piid == 2) {
              this.setState({ brightness: Value });
            } else if (Siid == 2 && Piid == 3) {
              this.setState({ color_temperature: parseInt(Value - 3000) });
              this.setState({ selectIndex: rowID });
              this._setDeviceUseData(itemName);
              DeviceEventEmitter.emit('setLastControlBrightOrTempZero', '');
            }
          }).catch((err) => { // 请求失败
            // console.log(new Date().getHours() + ':' + new Date().getMinutes() + '====>' + JSON.stringify(err));
          });
      }
    }

    _sendCodeSpecForBle(Siid, Piid, Value, Type) { // 发送指令  一组参数
      let data = { objects: [{ siid: parseInt(Siid), piid: parseInt(Piid), value: Value, type: Type }] };
      let json = JSON.stringify(data);
      console.log(`collect send->${ json }`);
      Bluetooth.spec.setPropertiesValue(Device.mac, json)
        .then((res) => { // 请求成功
          console.log(`ble---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          let result = Platform.OS === 'android' ? JSON.parse(res) : res;
          if (Siid == 2) {
            if (Piid == 2 && (result.objects[0].code == 0 || result.objects[0].code == 1)) {
              this.setState({ brightness: Value });
            } else if (Piid == 3 && (result.objects[0].code == 0 || result.objects[0].code == 1)) {
              this.setState({ color_temperature: parseInt(Value - 3000) });
              this.setState({ selectIndex: rowID });
              this._setDeviceUseData(itemName);
              DeviceEventEmitter.emit('setLastControlBrightOrTempZero', '');
            }
          }
        }).catch((err) => { // 请求失败
        });
    }

    _setDeviceUseData(useName) {
      if (useName) {
        Service.smarthome.batchSetDeviceDatas([{
          'did': Device.deviceID, 'props': {
            "prop.s_collect_use_data": useName
          }
        }]).then(((value) => {
          console.log(`收藏数据--->${ useName }******${ JSON.stringify(value) }`);
          this.setState({ useDataName: useName });
          this._getDeviceUseData();
        })).catch((err) => {
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

const styles = StyleSheet.create({
  containAll: {
    flex: 1,
    marginTop: 10
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