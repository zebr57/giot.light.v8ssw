import BaseComponent from "./Base/BaseComponent";
import React from "react";
import {
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Alert,
  DeviceEventEmitter,
  TouchableOpacity, Image
} from "react-native";
import { TitleBarBlack } from "../../../miot-sdk/ui";
import TitleBarBlacks from './TitleBarBlacks';
import LocalizableString from './HomeLocalizableString';
import { Service, Device, SceneType } from "../../../miot-sdk";
import Dialog, { DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
import CustomPickerNew from "./View/CustomPickerNew";
import CustomPickerNew2 from "./View/CustomPickerNew2";

let hour = '0';
let min = '0';
let day = "*";
let dateMonth = "*";
let dateDay = "*";
let timeArray = [];
let param = [{ did: Device.deviceID, siid: 3, piid: 1, value: true }];
let name = LocalizableString.fan_open;

export default class TimingTask extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <TitleBarBlacks
          title={navigation.state.params ? navigation.state.params.title : LocalizableString.addTiming}
          style={{ backgroundColor: '#fff' }}
          onPressLeft={() => {
            navigation.goBack();
          }}
          rightText={LocalizableString.confirm}
          onPressRight={() => { // 保存事件点击
            // console.log('====='+min + " " + hour + " " + dateDay + " " + dateMonth + " " + day)
            let index = navigation.state.params.index;
            if (index == -1) { // 新增
              let flag = false;

              if (timeArray.length > 0)
                for (let i = 0; i < timeArray.length; i++) { // 列表存在的时间不允许重复添加
                  if (timeArray[i] == (`${ min } ${ hour } ${ dateDay } ${ dateMonth } ${ day }`)) {
                    flag = true;
                  }
                }
              else
                flag = false;

              if (!flag) {
                Service.scene.createTimerScene(Device.deviceID, {
                  identify: Device.deviceID,
                  name: name,
                  setting: {
                    "enable_timer": "1",
                    "on_time": `${ min } ${ hour } ${ dateDay } ${ dateMonth } ${ day }`,
                    "enable_timer_on": "1",
                    "off_time": "",
                    "enable_timer_off": "0",
                    "on_method": "set_properties",
                    "off_method": "",
                    "on_param": param,
                    "off_param": ""
                  }
                }).save().then((scene) => {
                  flag = false;
                  DeviceEventEmitter.emit('refresh', '');// 发送通知刷新定时列表
                  navigation.goBack();
                }).catch((err) => {
                  // console.log('' + JSON.stringify(err))
                });
              } else {
                Alert.alert(LocalizableString.add_failed);
              }
              // console.log('----->' + JSON.stringify(param) + '---->' + min + " " + hour + " " + dateDay + " " + dateMonth + " " + day)

            } else { // 编辑
              Service.scene.loadScenes(Device.deviceID, SceneType.Timer)
                .then((sceneArr) => { // 获取定时场景
                  sceneArr[index].save(
                    {
                      identify: Device.deviceID,
                      name: name,
                      setting: {
                        "enable_timer": "1",
                        "on_time": `${ min } ${ hour } ${ dateDay } ${ dateMonth } ${ day }`,
                        "enable_timer_on": "1",
                        "off_time": "",
                        "enable_timer_off": "0",
                        "on_method": "set_properties",
                        "off_method": "",
                        "on_param": param,
                        "off_param": ""
                      }
                    }
                  ).then((scene) => {
                    DeviceEventEmitter.emit('refresh', '');// 发送通知刷新定时列表
                    navigation.goBack();
                  }).catch((err) => {
                  });
                })
                .catch((err) => {

                });
            }
          }}
          rightTextStyle={{
            fontSize: 14,
            alignItems: 'center',
            justifyContent: 'center',
            textAlignVertical: "center",
            textAlign: "center",
            color: '#ff8b0c',
            padding: 15,
            ...Platform.select({
              ios: {},
              android: { fontFamily: 'lucida grande' }
            })
          }}
        />
      };
    };

    componentDidMount() {
      if (this.state.index == -1)
        this._loadScenes();
        // 收到监听
      this.listener = DeviceEventEmitter.addListener('repeat', (message) => {
        // 收到监听后想做的事情
        this.setState({
          repeatValue: message.title
        });
        day = message.day;
        if (message.day != "*") {
          dateDay = "*";
          dateMonth = "*";
        } else {
          let date = new Date();
          dateMonth = (date.getMonth() + 1).toString();
          dateDay = date.getDate().toString();
        }
      });

      if (this.props.navigation.state.params.param)
        this._getParam(this.props.navigation.state.params.param);

      let time = this.props.navigation.state.params.time;
      if (time) {
        this.setTime(time);
      }
      this._geDate();
    }

    _getParam(params) {
      param = params;
      this.setState({
        param: params,
        deviceActionValue: this._getDeviceActionValue(params[0])
      });
      name = this._getDeviceActionValue(params[0]);
    }

    _getDeviceActionValue(params) {
      let action = '';
      if (params.siid == 3) {
        if (params.value == true)
          action = LocalizableString.light_open;
        else
          action = LocalizableString.light_colse;
      } else if (params.siid == 2) {
        if (params.value == true)
          action = LocalizableString.fan_open;
        else
          action = LocalizableString.fan_colse;
      }
      return action;
    }

    _geDate() {
      let date = new Date();
      dateMonth = (date.getMonth() + 1).toString();
      dateDay = date.getDate().toString();
    }

    _loadScenes() { // 获取定时场景列表
      Service.scene.loadScenes(Device.deviceID, SceneType.Timer)
        .then((sceneArr) => {
          if (sceneArr.length > 0) {
            for (let i = 0; i < sceneArr.length; i++) {
              timeArray[i] = sceneArr[i].setting.on_time;
            }
          } else {
            timeArray = [];
          }

        })
        .catch((err) => {
          // Alert.alert(JSON.stringify(err))
        });
    }

    setTime(time) {
      let strArray = time.split(' ');
      hour = strArray[1];
      min = strArray[0];
      day = strArray[4];

      this.setState({
        hourSelectValue: strArray[1].length == 1 ? `0${ strArray[1] }` : strArray[1],
        minSelectValue: strArray[0].length == 1 ? `0${ strArray[0] }` : strArray[0],
        repeatValue: this._getDayValue(strArray[4])
      });
    }

    _getDayValue(str) {
      return str == '*' ? LocalizableString.execute_once : (
        str == '0,1,2,3,4,5,6' ? LocalizableString.every_day : (
          str == '1,2,3,4,5' ? LocalizableString.working_day : (
            str == '0,6' ? LocalizableString.weekend : LocalizableString.custom
          )
        )
      );
    }

    componentWillUnmount() {
      // 移除监听
      if (this.listener) {
        this.listener.remove();
      }
    }

    constructor(props) {
      super(props);
      this.state = {
        hourSelectValue: '00',
        minSelectValue: '00',
        repeatValue: LocalizableString.execute_once,
        deviceActionValue: LocalizableString.fan_open,
        buttonVisible: props.navigation.state.params.buttonVisible, // 上个界面传递的值
        index: props.navigation.state.params.index,
        visMessage: false,

        fanPower: false,
        lightPower: false,
        param: [{ did: Device.deviceID, siid: 3, piid: 1, value: true }]
      };
    }

    _setParam(Siid, Piid, Value) {
      return [{ did: Device.deviceID, siid: Siid, piid: Piid, value: Value }];
    }

    render() {
      this.data = {
        'row': [
          {
            'title': LocalizableString.time,
            'subTitle': `${ this.state.hourSelectValue }:${ this.state.minSelectValue }`,
            'func': () => {
              this.TimePicker.show();
            }
          },
          {
            'title': LocalizableString.repeat,
            'subTitle': this.state.repeatValue,
            'func': () => {
              this.props.navigation.navigate('Repeat', { day: day });
            }
          },
          {
            'title': LocalizableString.device_action,
            'subTitle': this.state.deviceActionValue,
            'func': () => {
              this.ActionPicker.show();
            }
          }
          // {
          //     'title': LocalizableString.fanOnOff,
          //     'subTitle': this.state.fanPower ? LocalizableString.open : LocalizableString.close,
          //     'func': () => {
          //         this.FanPicker.show()
          //     }
          // },
          // {
          //     'title': LocalizableString.lightOnOff,
          //     'subTitle': this.state.lightPower ? LocalizableString.open : LocalizableString.close,
          //     'func': () => {
          //         this.LightPicker.show()
          //     }
          // }
        ]
      };

      let ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      });
      let dataSource = ds.cloneWithRowsAndSections(this.data);
      let hourData = this.generateArrayFromRangeTime(0, 23);
      let minData = this.generateArrayFromRangeTime(0, 59);
      let diretionData = [LocalizableString.open, LocalizableString.close];
      let actionData = [LocalizableString.fan_open, LocalizableString.fan_colse, LocalizableString.light_open, LocalizableString.light_colse];
      return (
        <View style={styles.containerAll}>
          <ListView
            dataSource={dataSource}
            renderRow={this._renderRow.bind(this)}
            renderSeparator={this._renderSeparator.bind(this)}
          />

          {this.state.buttonVisible ? <View style={{ paddingBottom: 40 }}>
            <TouchableOpacity
              activeOpacity={1}// 不透明度显示（通常在0到1之间）
              onPress={() => {
                this.setState({ visMessage: true });
              }}>
              <Text style={styles.deleteButtonNew}>{LocalizableString.delete_timing}</Text>
            </TouchableOpacity>
          </View> : null}


          <Dialog
            visible={this.state.visMessage}
            footer={
              <DialogFooter>
                <DialogButton
                  textStyle={{ color: '#ff8b0c' }}
                  text={LocalizableString.cancel}
                  onPress={() => {
                    console.log('onCancel');
                    this.setState({ visMessage: false });
                  }}
                />
                <DialogButton
                  textStyle={{ color: '#ff8b0c' }}
                  text={LocalizableString.confirm}
                  onPress={() => { // 删除定时任务
                    Service.scene.loadScenes(Device.deviceID, SceneType.Timer)
                      .then((sceneArr) => { // 获取定时场景
                        sceneArr[this.state.index].remove().then(() => { // 删除定时任务
                          DeviceEventEmitter.emit('refresh', '');// 发送通知刷新定时列表
                          this.props.navigation.goBack();// 返回上一层
                        }).catch((err) => {

                        });
                      })
                      .catch((err) => {

                      });
                    this.setState({ visMessage: false });
                  }}
                />
              </DialogFooter>
            }
          >
            <DialogContent>
              {<Text style={{
                fontSize: 18,
                paddingRight: 50,
                paddingLeft: 50,
                paddingTop: 30,
                paddingBottom: 10,
                color: '#000',
                ...Platform.select({
                  ios: {},
                  android: { fontFamily: 'lucida grande' }
                })
              }}>{LocalizableString.delete_timing_task}?</Text>}
            </DialogContent>
          </Dialog>

          <CustomPickerNew2
            confirmText={LocalizableString.confirm}
            cancelText={LocalizableString.cancel}
            title={''}
            ref={(ref) => this.TimePicker = ref}
            areaJson={hourData}
            areaJson2={minData}
            selectedValue={this.state.hourSelectValue}
            selectedValue2={this.state.minSelectValue}
            onPickerCancel={() => {
            }}
            onPickerConfirm={(value) => {
              this.setState({
                hourSelectValue: value[0],
                minSelectValue: value[1]
              });
              hour = parseInt(value[0]);
              min = parseInt(value[1]);
            }}
          />

          <CustomPickerNew
            title={''}
            confirmText={LocalizableString.confirm}
            cancelText={LocalizableString.cancel}
            ref={(ref) => this.FanPicker = ref}
            areaJson={diretionData}
            selectedValue={this.state.fanPower ? LocalizableString.open : LocalizableString.close}
            onPickerCancel={() => {
            }}
            onPickerConfirm={(value) => {
              this.setState({ fanPower: value == LocalizableString.open ? true : false });
            }}
          />

          <CustomPickerNew
            title={''}
            confirmText={LocalizableString.confirm}
            cancelText={LocalizableString.cancel}
            ref={(ref) => this.LightPicker = ref}
            areaJson={diretionData}
            selectedValue={this.state.lightPower ? LocalizableString.open : LocalizableString.close}
            onPickerCancel={() => {
            }}
            onPickerConfirm={(value) => {
              this.setState({ lightPower: value == LocalizableString.open ? true : false });
            }}
          />

          <CustomPickerNew
            title={''}
            confirmText={LocalizableString.confirm}
            cancelText={LocalizableString.cancel}
            ref={(ref) => this.ActionPicker = ref}
            areaJson={actionData}
            selectedValue={this.state.deviceActionValue}
            onPickerCancel={() => {
            }}
            onPickerConfirm={(value) => {
              name = value;
              this.setState({
                deviceActionValue: value,
                param: value == LocalizableString.fan_open ? this._setParam(2, 1, true) : (
                  value == LocalizableString.fan_colse ? this._setParam(2, 1, false) : (
                    value == LocalizableString.light_open ? this._setParam(3, 1, true) : this._setParam(3, 1, false)
                  )
                )
              });

              param = value == LocalizableString.fan_open ? this._setParam(2, 1, true) : (
                value == LocalizableString.fan_colse ? this._setParam(2, 1, false) : (
                  value == LocalizableString.light_open ? this._setParam(3, 1, true) : this._setParam(3, 1, false)
                )
              );

            }}
          />
        </View>
      );
    }

    generateArrayFromRangeTime(start, finish) {
      return Array.apply(null, Array(finish - start + 1)).map((_, i) => (start + i).toString().length == 1 ? (`0${ start + i }`).toString() : (start + i).toString());
    }

    _renderRow(rowData, sectionID, rowID, highlightRow) {
      let subTitle = null;
      if (rowData.subTitle) {
        subTitle = (<Text style={{
          flex: 1,
          fontSize: 14,
          color: '#959595',
          textAlign: 'right',
          marginRight: 8,
          ...Platform.select({
            ios: {},
            android: { fontFamily: 'lucida grande' }
          })
        }}>{rowData.subTitle}</Text>);
      }
      return (
        <TouchableHighlight
          underlayColor="#838383" onPress={() => {
            rowData['func']();
          }}>
          <View>
            {
              <View
                style={{
                  paddingLeft: 16,
                  paddingRight: 16,
                  height: 40,
                  flex: 1,
                  backgroundColor: '#fff',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                <Text style={{
                  flex: 1, fontSize: 16, color: '#000', ...Platform.select({
                    ios: {},
                    android: { fontFamily: 'lucida grande' }
                  })
                }}>{rowData.title}</Text>
                {subTitle}
                <Image style={{ width: 7, height: 14 }}
                  source={require("../resources/list_arrow_ic.png")}/>
              </View>
            }
          </View>
        </TouchableHighlight>
      )
      ;
    }

    _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
      let underLine = null;

      underLine = (
        <View style={{ height: 1, flexDirection: 'row' }}>
          <View style={{ width: 16, backgroundColor: 'white' }}/>
          <View style={{ flex: 1, backgroundColor: '#e9e9e9' }}/>
        </View>
      );

      return underLine;
    }

    getDataIndex(data, value) {
      let selectedIndex = 0;
      let length = data.length;
      for (let i = 0; i < length; i++) {
        if (data[i] == value) {
          selectedIndex = i;
          break;
        }
      }
      return selectedIndex;
    }
}

const styles = StyleSheet.create({
  containerAll: {
    flex: 1,
    marginTop: 10,
    flexDirection: 'column'
  },
  deleteButton: {
    backgroundColor: '#fff',
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#b22222',
    color: '#b22222',
    borderRadius: 20,
    marginLeft: 50,
    marginRight: 50,
    ...Platform.select({
      ios: {
        lineHeight: 36
      },
      android: { fontFamily: 'lucida grande' }
    })
  },
  deleteButtonNew: {
    backgroundColor: '#fff',
    height: 42,
    textAlign: 'center',
    textAlignVertical: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e9e9e9',
    color: '#F43F31',
    borderRadius: 5,
    marginLeft: 25,
    marginRight: 25,
    ...Platform.select({
      ios: {
        lineHeight: 36
      },
      android: { fontFamily: 'lucida grande' }
    })
  }
});