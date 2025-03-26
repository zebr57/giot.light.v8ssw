import BaseComponent from "./Base/BaseComponent";
import { TitleBarBlack } from "../../../miot-sdk/ui";
import LocalizableString from "./HomeLocalizableString";
import React from "react";
import {
  Alert,
  Image,
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  DeviceEventEmitter
} from "react-native";

let data = {
  'result': [
    {
      'title': LocalizableString.execute_once,
      'select': true,
      'func': () => {

      },
      'day': '*'
    },
    {
      'title': LocalizableString.every_day,
      'select': false,
      'func': () => {

      },
      'day': '0,1,2,3,4,5,6'
    },
    {
      'title': LocalizableString.working_day,
      'select': false,
      'func': () => {

      },
      'day': '1,2,3,4,5'
    },
    {
      'title': LocalizableString.weekend,
      'select': false,
      'func': () => {

      },
      'day': '0,6'
    },
    {
      'title': LocalizableString.custom,
      'select': false,
      'func': () => {

      }
    }
  ]
};

export default class Repeat extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: <TitleBarBlack title={LocalizableString.repeat} style={{ backgroundColor: '#fff' }}
          onPressLeft={() => {
            navigation.goBack();
          }}/>
      };
    };

    componentDidMount() {
      // 收到监听
      this.listener = DeviceEventEmitter.addListener('custom', (message) => {
        const temp = JSON.parse(JSON.stringify(data.result));
        // 收到监听后想做的事情
        if (message == '') {
          temp.map((info, index) => {
            if (index == 0) {
              temp[index].select = true;
              data.result[index].select = true;
            } else {
              temp[index].select = false;
              data.result[index].select = false;
            }
          });
          this.setState({ dataSource: this.state.dataSource.cloneWithRows(temp) });
          DeviceEventEmitter.emit('repeat', { title: data.result[0].title, day: data.result[0].day });
        } else {
          temp.map((info, index) => {
            if (index == 4) {
              temp[4].select = true;
              data.result[4].select = true;
            } else {
              temp[index].select = false;
              data.result[index].select = false;
            }
          });
          this.setState({ dataSource: this.state.dataSource.cloneWithRows(temp) });
          DeviceEventEmitter.emit('repeat', { title: data.result[4].title, day: message });
        }

      });

      let day = this.props.navigation.state.params.day;
      const temp = JSON.parse(JSON.stringify(data.result));
      let i = 0;
      if (day != '*' && day != '0,1,2,3,4,5,6' && day != '1,2,3,4,5' && day != '0,6') {
        i = 4;
      } else {
        if (day == '*') {
          i = 0;
        } else if (day == '0,1,2,3,4,5,6') {
          i = 1;
        } else if (day == '1,2,3,4,5') {
          i = 2;
        } else {
          i = 3;
        }
      }
      temp.map((info, index) => {
        if (index == i) {
          temp[i].select = true;
          data.result[i].select = true;
        } else {
          temp[index].select = false;
          data.result[index].select = false;
        }
      });
      this.setState({ dataSource: this.state.dataSource.cloneWithRows(temp) });
    }

    componentWillUnmount() {
      // 移除监听
      if (this.listener) {
        this.listener.remove();
      }
      // 移除所有监听
      // DeviceEventEmitter.removeAllListeners();
    }

    constructor(props) {
      super(props);
      // 创建datasource数据源
      const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.state = {
        dataSource: ds.cloneWithRows(data.result)// data.result为模拟的数据或服务端得到的数据
      };
    }


    render() {
      return (
        <View>
          <ListView style={{ backgroundColor: '#fff', marginTop: 40 }}
            dataSource={this.state.dataSource}
            renderRow={this._renderRow.bind(this)}
            renderSeparator={this._renderSeparator.bind(this)}
          />
        </View>
      );
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
            if (rowID == 4) {
              this.props.navigation.navigate('Custom', { day: this.props.navigation.state.params.day });
            } else {
              const temp = JSON.parse(JSON.stringify(data.result));
              temp.map((info, index) => {
                if (index == rowID) {
                  temp[index].select = true;
                  data.result[index].select = true;
                } else {
                  temp[index].select = false;
                  data.result[index].select = false;
                }
              });
              this.setState({ dataSource: this.state.dataSource.cloneWithRows(temp) });
              DeviceEventEmitter.emit('repeat', { title: data.result[rowID].title, day: data.result[rowID].day });

              this.props.navigation.goBack();// 返回上一层
            }
          }}>
          <View>
            {
              <View
                style={{
                  paddingLeft: 16,
                  paddingRight: 16,
                  height: 40,
                  flex: 1,
                  backgroundColor: 'white',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                <Text style={{
                  flex: 1, fontSize: 16, color: '#000', ...Platform.select({
                    ios: {},
                    android: { fontFamily: 'lucida grande' }
                  })
                }}>{rowData.title}</Text>

                {rowData.select ? <Image style={{ width: 18, height: 12 }}
                  source={require("../resources/gou.png")}/> : null}
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
}