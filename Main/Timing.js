import React from "react";
import { TitleBarBlack } from "../../../miot-sdk/ui";
import { RkSwitch } from "react-native-ui-kitten";
import {
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Alert,
  DeviceEventEmitter,
  TouchableOpacity
} from "react-native";
import LocalizableString from './HomeLocalizableString';
import { Service, Device, SceneType } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import NavigationBar from "miot/ui/NavigationBar";

let data = [];

export default class Timing extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <NavigationBar
          backgroundColor={navigation.state.params ? navigation.state.params.backgroundColor : '#fff'}
          type={NavigationBar.TYPE.DARK}
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
        dataSource: ds// data.result为模拟的数据或服务端得到的数据
      };
    }

    componentDidMount() {
      this._loadScenes();

      this.listener = DeviceEventEmitter.addListener('refresh', (message) => {
        // 收到监听后重新获取定时列表
        this._loadScenes();
      });
    }

    componentWillUnmount() {
      // 移除监听
      if (this.listener) {
        this.listener.remove();
      }
    }

    _loadScenes() { // 获取定时场景列表
      // this.data = ['', '', '', '', '']
      // this.setState({dataSource: this.state.dataSource.cloneWithRows(this.data)})
      Service.scene.loadScenes(Device.deviceID, SceneType.Timer)
        .then((sceneArr) => {
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(sceneArr)
          });
          data = sceneArr;
          sceneArr.map((info, index) => {
            console.log(`${ index }--haoge--${ this._IsTimeBefore(sceneArr[index].setting.on_time) }`);
          });
        })
        .catch((err) => {
          Alert.alert(JSON.stringify(err));
        });
    }

    _IsTimeBefore(time) {
      let strArray = time.split(' ');
      let date = new Date();
      if (strArray[4] == '*') {
        if (strArray[3] < (date.getMonth() + 1))
          return true;
        else if (strArray[3] > (date.getMonth() + 1)) {
          return false;
        } else if (strArray[3] == (date.getMonth() + 1)) {
          if (strArray[2] < date.getDate()) {
            return true;
          } else if (strArray[2] > date.getDate()) {
            return false;
          } else if (strArray[2] == date.getDate()) {
            if (strArray[1] < date.getHours()) {
              return true;
            } else if (strArray[1] > date.getHours()) {
              return false;
            } else if (strArray[1] == date.getHours()) {
              if (strArray[0] < date.getMinutes()) {
                console.log(`${ strArray[0] }===haoge1===${ date.getMinutes() }`);
                return true;
              } else if (strArray[0] > date.getMinutes()) {
                console.log(`${ strArray[0] }===haoge2===${ date.getMinutes() }`);
                return false;
              } else if (strArray[0] == date.getMinutes()) {
                console.log(`${ strArray[0] }===haoge3===${ date.getMinutes() }`);
                return true;
              }
            }
          }
        }
      } else {
        return false;
      }

    }

    render() {
      let addView = this._addTimingView();
      return (
        <View style={styles.containAll}>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this._renderRow.bind(this)}
            renderSeparator={this._renderSeparator.bind(this)}
            enableEmptySections={true}
          />
          {addView}
        </View>
      );
    }

    _addTimingView() {
      return (
        <View style={{
          flexDirection: 'column',
          alignSelf: 'center',
          marginBottom: 20,
          position: 'absolute',
          bottom: 0
        }}>

          <TouchableOpacity
            activeOpacity={0.5}// 不透明度显示（通常在0到1之间）
            onPress={() => {
              this.props.navigation.navigate('TimingTask', {
                buttonVisible: false,
                title: LocalizableString.addTiming,
                index: -1
              });// 进入添加定时任务
            }}>
            <View style={{
              width: 50,
              height: 50,
              borderWidth: 1,
              borderColor: '#c9c9c9',
              borderRadius: 30,
              backgroundColor: '#fff',
              alignSelf: 'center'
            }}>
              <Text
                style={{
                  fontSize: 40,
                  color: '#666666',
                  alignSelf: 'center',
                  textAlign: 'center',
                  ...Platform.select({
                    ios: { lineHeight: 45 },
                    android: {
                      fontFamily: 'lucida grande',
                      lineHeight: 48
                    }
                  })
                }}>
                            +
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={{
            marginTop: 10,
            color: '#000',
            ...Platform.select({
              ios: {},
              android: {
                fontFamily: 'lucida grande'
              }
            })
          }}>
            {LocalizableString.addTiming}
          </Text>
        </View>
      );
    }

    _renderRow(item, sectionID, rowID) {
      return (
        <TouchableHighlight
          underlayColor="#838383" onPress={() => {
            this.props.navigation.navigate('TimingTask', {
              buttonVisible: true,
              title: LocalizableString.edit_timing,
              index: rowID,
              time: item.setting.on_time,
              param: item.setting.on_param
            });// 进入编辑定时任务
          }}>
          <View style={styles.itemContainer}>

            <View style={styles.container1}>
              <Text style={styles.textTimeFont}>{this._getTimeOrDay(item.setting.on_time, true)}</Text>
            </View>

            <View style={{ height: 40, width: 1, backgroundColor: '#e9e9e9', alignSelf: 'center' }}/>

            <View style={styles.container2}>
              <Text style={styles.textFont}>{this._getItemName(item.name)}</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.textFont1}>{this._getTimeOrDay(item.setting.on_time, false)}</Text>
              </View>
            </View>

            <View style={styles.container3}>
              <RkSwitch
                onTintColor={'#ff8b0c'}
                value={this._IsTimeBefore(item.setting.on_time) == true ? false : (item.setting.enable_timer == 1 ? true : false)}
                style={{ paddingVertical: 20 }}
                onValueChange={() => {
                  { // 开启关闭定时
                    const tempData = [];
                    const temp = JSON.parse(JSON.stringify(data[rowID].setting));
                    temp.enable_timer = item.setting.enable_timer == 1 ? 0 : 1;

                    data.map((info, index) => {
                      if (rowID == index) {
                        tempData.push({
                          identify: Device.deviceID,
                          name: data[rowID].name,
                          setting: temp
                        });
                      } else {
                        tempData.push(data[index]);
                      }
                    });

                    this.setState({ dataSource: this.state.dataSource.cloneWithRows(tempData) });

                    data[rowID].save(
                      {
                        setting: {
                          "enable_timer": item.setting.enable_timer == 1 ? 0 : 1,
                          "on_time": item.setting.on_time,
                          "enable_timer_on": "1",
                          "off_time": "",
                          "enable_timer_off": "0",
                          "on_method": "set_properties",
                          "off_method": "",
                          "on_param": item.on_param,
                          "off_param": ""
                        }
                      }
                    ).then((scene) => {
                      this._loadScenes();
                    }).catch((err) => {
                    });
                  }
                }
                }
              />
            </View>
          </View>
        </TouchableHighlight>
      );
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

    _getTimeOrDay(str, flag) { // flag true返回time，否则返回day
      let strArray = str.split(' ');

      return flag ? (`${ strArray[1].length == 1 ? (`0${ strArray[1] }`) : strArray[1] }:${ strArray[0].length == 1 ? (`0${ strArray[0] }`) : strArray[0] }`) : this._getDayValue(strArray[4]);
    }

    _getItemName(name) {
      let Name = name;

      name == '风扇开启' || name == 'Turn on the fan' ? Name = LocalizableString.fan_open : (
        name == '风扇关闭' || name == 'Turn off the fan' ? Name = LocalizableString.fan_colse : (
          name == '灯光开启' || name == 'Turn on the light' ? Name = LocalizableString.light_open : (
            name == '灯光关闭' || name == 'Turn off the light' ? Name = LocalizableString.light_colse : Name
          )
        )
      );

      return Name;
    }

    _getDayValue(str) {
      return str == '*' ? LocalizableString.execute_once : (
        str == '0,1,2,3,4,5,6' ? LocalizableString.every_day : (
          str == '1,2,3,4,5' ? LocalizableString.working_day : (
            str == '0,6' ? LocalizableString.weekend : this._getCustomDay(str)
          )
        )
      );
    }

    _getCustomDay(str) {
      let stringsArray = [];
      let strArray = str.split(',');

      strArray.map((info, index) => {
        if (strArray[index] == '1')
          stringsArray.push(LocalizableString.Monday);
        else if (strArray[index] == '2')
          stringsArray.push(LocalizableString.Tuesday);
        else if (strArray[index] == '3')
          stringsArray.push(LocalizableString.Wednesday);
        else if (strArray[index] == '4')
          stringsArray.push(LocalizableString.Thursday);
        else if (strArray[index] == '5')
          stringsArray.push(LocalizableString.Friday);
        else if (strArray[index] == '6')
          stringsArray.push(LocalizableString.Saturday);
        else
          stringsArray.push(LocalizableString.Sunday);
      });

      return stringsArray.join(',');
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