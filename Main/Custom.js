import BaseComponent from "./Base/BaseComponent";
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
import NavigationBar from "miot/ui/NavigationBar";

let data = {
  'result': [
    {
      'title': LocalizableString.Sunday,
      'select': false,
      'func': () => {

      }, 'day': '0'
    },
    {
      'title': LocalizableString.Monday,
      'select': false,
      'func': () => {

      }, 'day': '1'
    },
    {
      'title': LocalizableString.Tuesday,
      'select': false,
      'func': () => {

      }, 'day': '2'
    },
    {
      'title': LocalizableString.Wednesday,
      'select': false,
      'func': () => {

      }, 'day': '3'
    },
    {
      'title': LocalizableString.Thursday,
      'select': false,
      'func': () => {

      }, 'day': '4'
    },
    {
      'title': LocalizableString.Friday,
      'select': false,
      'func': () => {

      }, 'day': '5'
    },
    {
      'title': LocalizableString.Saturday,
      'select': false,
      'func': () => {

      }, 'day': '6'
    }
  ]
};

export default class Custom extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header:
                <NavigationBar
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
        dataSource: ds.cloneWithRows(data.result), // data.result为模拟的数据或服务端得到的数据
        day: this.props.navigation.state.params.day
      };
    }

    componentDidMount() {
      if (this.state.day != '*' && this.state.day != '0,1,2,3,4,5,6' && this.state.day != '1,2,3,4,5' && this.state.day != '0,6') {
        let strArray = this.state.day.split(',');
        const temp = JSON.parse(JSON.stringify(data.result));
        let test = [];

        temp.map((info, index) => {
          strArray.map((Info, Index) => {
            if (index == parseInt(strArray[Index])) {
              test.push(temp[index].day);

              temp[index].select = true;
              data.result[index].select = true;
            }
          });
        });
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(temp) });

        DeviceEventEmitter.emit('custom', test.join(','));
      }
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
            const temp = JSON.parse(JSON.stringify(data.result));
            temp[rowID].select = !rowData.select;
            data.result[rowID].select = !rowData.select;
            this.setState({ dataSource: this.state.dataSource.cloneWithRows(temp) });


            let test = [];
            temp.map((info, index) => {
              if (temp[index].select) {
                test.push(temp[index].day);
              }
            });
            DeviceEventEmitter.emit('custom', test.join(','));
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