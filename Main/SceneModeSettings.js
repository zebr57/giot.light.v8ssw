import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HomeLocalizableString from './HomeLocalizableString';
import { Bluetooth, DarkMode, Device, Service } from "../../../miot-sdk";
import BaseComponent from "./Base/BaseComponent";
import NavigationBar from "miot/ui/NavigationBar";
import { LoadingDialog } from "miot/ui";
import MyModeButton from "./View/MyModeButton";
import { Theme } from "./theme";
import SlideGear from "miot/ui/Gear/SlideGear";
import DataUtils from "./Utils/DataUtils";
import LinearGradient from "react-native-linear-gradient";
import { colorGetterforRange } from "miot/utils/colors";

let data = [];

const bt = Device.getBluetoothLE();
let colorMax = Device.model == 'nvcsmt.light.bas202' || Device.model == 'nvcsmt.light.bcs201' ? 5700 : 6500;
let colorMin = 2700;

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

export default class SceneModeSettings extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
      return {
        header: null
      };
    };

    get colorScheme() {
      return this.state.colorScheme;
    }

    fixSpeed(speed) {
      if (speed == 1) {
        return 15;
      } else if (speed == 2) {
        return 14;
      } else if (speed == 3) {
        return 13;
      } else if (speed == 4) {
        return 12;
      } else if (speed == 5) {
        return 11;
      } else if (speed == 6) {
        return 10;
      } else if (speed == 7) {
        return 9;
      } else if (speed == 8) {
        return 8;
      } else if (speed == 9) {
        return 7;
      } else if (speed == 10) {
        return 6;
      } else if (speed == 11) {
        return 5;
      } else if (speed == 12) {
        return 4;
      } else if (speed == 13) {
        return 3;
      } else if (speed == 14) {
        return 2;
      } else if (speed == 15) {
        return 1;
      }
    }

    fixSpeed2(speed) {
      if (speed == 15) {
        return 1;
      } else if (speed == 14) {
        return 2;
      } else if (speed == 13) {
        return 3;
      } else if (speed == 12) {
        return 4;
      } else if (speed == 11) {
        return 5;
      } else if (speed == 10) {
        return 6;
      } else if (speed == 9) {
        return 7;
      } else if (speed == 8) {
        return 8;
      } else if (speed == 7) {
        return 9;
      } else if (speed == 6) {
        return 10;
      } else if (speed == 5) {
        return 11;
      } else if (speed == 4) {
        return 12;
      } else if (speed == 3) {
        return 13;
      } else if (speed == 2) {
        return 14;
      } else if (speed == 1) {
        return 15;
      }
    }


    constructor(props) {
      super(props);
      const colorScheme = DarkMode.getColorScheme();
      this.state = {
        colorScheme,
        mode: props.navigation.state.params.mode,

        brightness: (props.navigation.state.params.mode == 1 ? DataUtils.get3_8()[4] : DataUtils.get3_9()[4]) < 1 ? 1 : (props.navigation.state.params.mode == 1 ? DataUtils.get3_8()[4] : DataUtils.get3_9()[4]),
        brightness2: (props.navigation.state.params.mode == 1 ? DataUtils.get3_8()[2] : DataUtils.get3_9()[2]) < 1 ? 1 : (props.navigation.state.params.mode == 1 ? DataUtils.get3_8()[2] : DataUtils.get3_9()[2]),
        temp: (props.navigation.state.params.mode == 1 ? DataUtils.get3_8()[3] : DataUtils.get3_9()[3]) * 100 + 2700,
        temp2: (props.navigation.state.params.mode == 1 ? DataUtils.get3_8()[1] : DataUtils.get3_9()[1]) * 100 + 2700,
        change: props.navigation.state.params.mode == 1 ? DataUtils.get3_8()[0] : DataUtils.get3_9()[0],
        speed: this.fixSpeed(parseInt(props.navigation.state.params.mode == 1 ? DataUtils.get3_8()[5] : DataUtils.get3_9()[5])),
        curMode: 1,

        dialogInit: true,

        loadingVis: false,
        btConnect: props.navigation.state.params.btConnect
      };
      console.log(`speed->${ parseInt(props.navigation.state.params.mode == 1 ? DataUtils.get3_8()[5] : DataUtils.get3_9()[5]) }`);
    }

    generateArrayFromRange(start, finish) {
      return Array.apply(null, Array(finish - start + 1)).map((_, i) => start + i);
    }

    _getProps() {
      Service.spec.getPropertiesValue(
        this.state.mode == 1 ?
          [{ did: Device.deviceID, siid: 4, piid: 8 }]
          :
          [{ did: Device.deviceID, siid: 4, piid: 9 }])
        .then((res) => { // 请求成功
          console.log(`${ new Date().getHours() }:${ new Date().getMinutes() }====>${ JSON.stringify(res) }`);
          if (res[0].code === 0) {
            if (this.state.mode == 1) {
              DataUtils.parse3_8(
                res[0].value
              );
            } else {
              DataUtils.parse3_9(
                res[0].value
              );
            }
          }

          this.setState({
            brightness: this.state.mode == 1 ? DataUtils.get3_8()[4] : DataUtils.get3_9()[4],
            brightness2: this.state.mode == 1 ? DataUtils.get3_8()[2] : DataUtils.get3_9()[2],
            temp: (this.state.mode == 1 ? DataUtils.get3_8()[3] : DataUtils.get3_9()[3]) * 100 + 2700,
            temp2: (this.state.mode == 1 ? DataUtils.get3_8()[1] : DataUtils.get3_9()[1]) * 100 + 2700,
            change: this.state.mode == 1 ? DataUtils.get3_8()[0] : DataUtils.get3_9()[0],
            speed: this.fixSpeed((this.state.mode == 1 ? DataUtils.get3_8()[5] : DataUtils.get3_9()[5]))
          });
        });
    }


    convert(integer) {
      let str = Number(integer).toString(16);
      return str.length == 1 ? `0${ str }` : str;
    }

    _getPropsSpecBle1() {
      let prop = {
        "siid": 3,
        "piid": this.state.mode == 1 ? 8 : 9
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
          if (this.state.mode == 1) {
            DataUtils.parse3_8(jsonData.objects[0].value);
          } else {
            DataUtils.parse3_9(jsonData.objects[0].value);
          }
          this.setState({
            brightness: this.state.mode == 1 ? DataUtils.get3_8()[4] : DataUtils.get3_9()[4],
            brightness2: this.state.mode == 1 ? DataUtils.get3_8()[2] : DataUtils.get3_9()[2],
            temp: (this.state.mode == 1 ? DataUtils.get3_8()[3] : DataUtils.get3_9()[3]) * 100 + 2700,
            temp2: (this.state.mode == 1 ? DataUtils.get3_8()[1] : DataUtils.get3_9()[1]) * 100 + 2700,
            change: this.state.mode == 1 ? DataUtils.get3_8()[0] : DataUtils.get3_9()[0],
            speed: this.fixSpeed((this.state.mode == 1 ? DataUtils.get3_8()[5] : DataUtils.get3_9()[5]))
          });
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

    componentWillMount() {
      this._getProps();
    }

    componentWillUnmount() {
      this.listener && this.listener.remove();

      this.listener1 && this.listener1.remove();

      if (this.listenerBle) {
        this.listenerBle.remove();
      }
    }


    render() {
      return (
        <View style={styles.containAll}>

          <NavigationBar
            backgroundColor={DarkMode.getColorScheme() === 'dark' ? '#000' : '#ffffff'}
            type={NavigationBar.TYPE.LIGHT}
            title={this.state.mode == 1 ? HomeLocalizableString.呼吸
              : HomeLocalizableString.律动}
            left={[
              {
                key: 'back',
                onPress: (_) => this.props.navigation.goBack()
              }
            ]}/>

          <ScrollView style={{
            flex: 1
          }}>

            <View style={{
              flexDirection: 'column'

            }}>

              <View style={[styles.tabTitleWrapper, { marginTop: 20, marginLeft: 20 }]}>
                <Text style={styles.tabTitleLabel}>{HomeLocalizableString.灯光设置}</Text>
              </View>

              <View style={styles.buttonGroups}>
                <MyModeButton
                  bri={parseInt(this.state.brightness)}
                  temp={parseInt(this.state.temp)}
                  width={52}
                  onPress={() => {
                    this.setState({ curMode: 1 });
                  }}
                  theme={Theme[this.colorScheme].hood.levelButtons}
                  inactiveColor={(!Device.isOnline && !this.state.btConnect) ? '#ECEEEF' : this._getUnColor(this.state.temp, this.state.brightness)}
                  activeColor={(!Device.isOnline && !this.state.btConnect) ? '#ECEEEF' : this._getColor(this.state.temp, this.state.brightness)}
                  selected={this.state.curMode == 1}
                />
                <View style={{ width: 20 }}/>
                <MyModeButton
                  bri={parseInt(this.state.brightness2)}
                  temp={parseInt(this.state.temp2)}
                  width={52}
                  onPress={() => {
                    this.setState({ curMode: 2 });
                  }}
                  theme={Theme[this.colorScheme].hood.levelButtons}
                  inactiveColor={(!Device.isOnline && !this.state.btConnect) ? '#ECEEEF' : this._getUnColor(this.state.temp2, this.state.brightness2)}
                  activeColor={(!Device.isOnline && !this.state.btConnect) ? '#ECEEEF' : this._getColor(this.state.temp2, this.state.brightness2)}
                  selected={this.state.curMode == 2}
                />
              </View>


              {this.state.curMode == 1 ?
                <View style={styles.tab}>
                  <View style={styles.tabTitleWrapper}>
                    <Text style={styles.tabTitleLabel}>{HomeLocalizableString.text_brightness}</Text>
                    <Text style={styles.tabTitleSeparator}>|</Text>
                    <Text style={styles.tabTitleSubLabel}>{this.state.brightness}%</Text>
                  </View>

                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 26
                    }}>
                    <View
                      style={{
                        width: '100%',
                        height: 48,
                        position: 'absolute',
                        borderRadius: 48 / 2,
                        overflow: 'hidden'
                      }}>
                      <View
                        style={{
                          width: '100%',
                          height: 48,
                          position: 'absolute',
                          backgroundColor: '#F5F5F5',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingLeft: 15,
                          paddingRight: 15
                        }}>
                        <Image
                          source={require('../resources/bright_low_dis_ic.png')}/>
                        <View
                          style={{
                            flex: 1
                          }}/>
                        <Image
                          source={require('../resources/bright_high_dis_ic.png')}/>
                      </View>

                      <View
                        style={{
                          width: 0 + (((this.mScreenWidth * 1) - 40 - 0) * (this.state.brightness / 100)),
                          height: 48,
                          position: 'absolute',
                          backgroundColor: '#FFBC39',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}/>

                      <View
                        style={{
                          width: '100%',
                          height: 48,
                          position: 'absolute',
                          borderRadius: 48 / 2,
                          paddingLeft: 15,
                          paddingRight: 15,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        {
                          (this.state.brightness > 8 ? <Image
                            source={require('../resources/bright_low_white_ic.png')}/> : null)
                        }

                        <View
                          style={{
                            flex: 1
                          }}/>

                        {
                          (this.state.brightness > 95 ? <Image
                            source={require('../resources/bright_high_white_ic.png')}/> : null)
                        }
                      </View>
                    </View>

                    <SlideGear
                      blockStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
                      showEndText={false}
                      disabled={false}
                      options={this.generateArrayFromRange(1, 100)}
                      containerStyle={{ width: '100%', height: 48 }}
                      value={this.state.brightness - 1}
                      onValueChange={(value) => {
                        this.setState({ brightness: parseInt(value + 1) });
                      }}
                      onSlidingComplete={(value) => {

                      }}
                      minimumTrackTintColor={'rgba(0,0,0,0)'}
                      maximumTrackTintColor={'rgba(0,0,0,0)'}
                    />
                  </View>
                </View>
                :
                <View style={styles.tab}>
                  <View style={styles.tabTitleWrapper}>
                    <Text style={styles.tabTitleLabel}>{HomeLocalizableString.text_brightness}</Text>
                    <Text style={styles.tabTitleSeparator}>|</Text>
                    <Text style={styles.tabTitleSubLabel}>{this.state.brightness2}%</Text>
                  </View>

                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 26
                    }}>
                    <View
                      style={{
                        width: '100%',
                        height: 48,
                        position: 'absolute',
                        borderRadius: 48 / 2,
                        overflow: 'hidden'
                      }}>
                      <View
                        style={{
                          width: '100%',
                          height: 48,
                          position: 'absolute',
                          backgroundColor: '#F5F5F5',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingLeft: 15,
                          paddingRight: 15
                        }}>
                        <Image
                          source={require('../resources/bright_low_dis_ic.png')}/>
                        <View
                          style={{
                            flex: 1
                          }}/>
                        <Image
                          source={require('../resources/bright_high_dis_ic.png')}/>
                      </View>

                      <View
                        style={{
                          width: 0 + (((this.mScreenWidth * 1) - 40 - 0) * (this.state.brightness2 / 100)),
                          height: 48,
                          position: 'absolute',
                          backgroundColor: '#FFBC39',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}/>

                      <View
                        style={{
                          width: '100%',
                          height: 48,
                          position: 'absolute',
                          borderRadius: 48 / 2,
                          paddingLeft: 15,
                          paddingRight: 15,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        {
                          (this.state.brightness2 > 8 ? <Image
                            source={require('../resources/bright_low_white_ic.png')}/> : null)
                        }

                        <View
                          style={{
                            flex: 1
                          }}/>

                        {
                          (this.state.brightness2 > 95 ? <Image
                            source={require('../resources/bright_high_white_ic.png')}/> : null)
                        }
                      </View>
                    </View>

                    <SlideGear
                      blockStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
                      showEndText={false}
                      disabled={false}
                      options={this.generateArrayFromRange(1, 100)}
                      containerStyle={{ width: '100%', height: 48 }}
                      value={this.state.brightness2 - 1}
                      onValueChange={(value) => {
                        this.setState({ brightness2: parseInt(value + 1) });
                      }}
                      onSlidingComplete={(value) => {

                      }}
                      minimumTrackTintColor={'rgba(0,0,0,0)'}
                      maximumTrackTintColor={'rgba(0,0,0,0)'}
                    />
                  </View>

                </View>
              }

              <View style={styles.tab}>
                <View style={styles.tabTitleWrapper}>
                  <Text style={styles.tabTitleLabel}>{HomeLocalizableString.text_temp}</Text>
                  <Text style={styles.tabTitleSeparator}>|</Text>
                  <Text
                    style={styles.tabTitleSubLabel}>{this.state.curMode == 1 ? this.state.temp : this.state.temp2}K</Text>
                </View>

                <View
                  style={{
                    marginTop: 26
                  }}>
                  <LinearGradient
                    start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}
                    colors={['#F0F6FF', '#FCD981', '#F99B3E']}
                    style={{
                      width: '100%',
                      height: 48,
                      position: 'absolute',
                      borderRadius: 48 / 2
                    }}/>
                  <SlideGear
                    blockStyle={{ backgroundColor: '#xmfff' }}
                    showEndText={false}
                    optionMin={2700}
                    optionMax={6500}
                    optionStep={100}
                    // options={this.generateArrayFromRange(colorMin, colorMax)}
                    containerStyle={{ width: '100%', height: 48 }}
                    value={this.state.curMode == 1 ? this.state.temp : this.state.temp2}
                    onValueChange={(value) => {
                      if (this.state.curMode == 1) {
                        this.setState({ temp: parseInt(value) });
                      } else {
                        this.setState({ temp2: parseInt(value) });
                      }
                    }}
                    onSlidingComplete={(value) => {
                    }}
                    minimumTrackTintColor={'rgba(0,0,0,0)'}
                    maximumTrackTintColor={'rgba(0,0,0,0)'}
                  />
                </View>

              </View>


              <View
                style={{ height: 1, marginHorizontal: 30, backgroundColor: '#E5E5E5', marginVertical: 30 }}/>

              <View style={{
                flexDirection: 'column',
                marginHorizontal: 20
              }}>

                <View style={{
                  alignItems: 'center',
                  flexDirection: 'row'
                }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#000000',
                      ...Platform.select({
                        ios: {},
                        android: { fontFamily: 'lucida grande' }
                      })
                    }}>{HomeLocalizableString.颜色变换方式}</Text>

                  <View style={{ flex: 1 }}/>

                  <TouchableOpacity
                    style={{
                      marginLeft: 11,
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      backgroundColor: this.state.change == 1 ? '#4396EB' : '#E5E5E5'
                    }}
                    onPress={() => {
                      this.setState({ change: 1 });
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: 'bold',
                        color: this.state.change == 1 ? '#ffffff' : '#B4B4B4',
                        ...Platform.select({
                          ios: {},
                          android: { fontFamily: 'lucida grande' }
                        })
                      }}>{HomeLocalizableString.渐变}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      marginLeft: 11,
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      backgroundColor: this.state.change == 0 ? '#4396EB' : '#E5E5E5'
                    }}
                    onPress={() => {
                      this.setState({ change: 0 });
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: 'bold',
                        color: this.state.change == 0 ? '#ffffff' : '#B4B4B4',
                        ...Platform.select({
                          ios: {},
                          android: { fontFamily: 'lucida grande' }
                        })
                      }}>{HomeLocalizableString.跳变}</Text>
                  </TouchableOpacity>


                </View>


                {true ?
                  <Text
                    style={{
                      fontSize: 16,
                      marginTop: 30,
                      color: '#000000',
                      ...Platform.select({
                        ios: {},
                        android: { fontFamily: 'lucida grande' }
                      })
                    }}>{HomeLocalizableString.颜色变换速度}</Text>
                  : null}

                {true ?
                  <View style={{
                    marginTop: 26,
                    alignItems: 'center',
                    justifyContent: 'center', flexDirection: 'row'
                  }}>

                    <Text style={{
                      fontSize: 14,
                      marginLeft: 10,
                      marginRight: 10,
                      color: '#B0B6B8'
                    }}>
                      {HomeLocalizableString.慢}
                    </Text>

                    <SlideGear
                      minimumTrackTintColor={'#FFBC39'}
                      maximumTrackTintColor={DarkMode.getColorScheme() === 'dark' ? '#484848' : '#f0f0f0'}
                      optionMin={1}
                      optionMax={15}
                      optionStep={1}
                      showEndText={false}
                      leftTextColor={'#fff'}
                      leftTextOffColor={'#A3A3A3'}
                      rightTextColor={'#A3A3A3'}
                      rightTextOffColor={'#fff'}
                      value={this.state.speed}
                      containerStyle={{
                        width: '85%',
                        height: 50
                      }}
                      onValueChange={(index) => {
                        this.setState({ speed: index });
                      }}
                      onSlidingComplete={(index) => {
                      }}
                    />

                    <Text style={{
                      fontSize: 14,
                      marginRight: 10,
                      marginLeft: 10,
                      color: '#B0B6B8'
                    }}>
                      {HomeLocalizableString.快}
                    </Text>

                  </View>
                  : null}
                {/*  <View
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: 26
                                }}>
                                <View
                                    style={{
                                        width: '100%',
                                        height: 48,
                                        position: 'absolute',
                                        borderRadius: 48 / 2,
                                        overflow: 'hidden'
                                    }}>
                                    <View
                                        style={{
                                            width: '100%',
                                            height: 48,
                                            position: 'absolute',
                                            backgroundColor: '#F5F5F5',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingLeft: 15,
                                            paddingRight: 15
                                        }}>
                                    </View>

                                    <View
                                        style={{
                                            width: 0 + (((this.mScreenWidth * 1) - 40 - 0) * (this.state.speed / 100)),
                                            height: 48,
                                            position: 'absolute',
                                            backgroundColor: '#FFBC39',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}/>

                                    <View
                                        style={{
                                            width: '100%',
                                            height: 48,
                                            position: 'absolute',
                                            borderRadius: 48 / 2,
                                            paddingLeft: 15,
                                            paddingRight: 15,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                        {
                                            <Text style={{
                                                fontSize: 14,
                                                color: this.state.speed > 30 ? '#ffffff' : '#B0B6B8'
                                            }}>
                                                {HomeLocalizableString.慢}
                                            </Text>
                                        }

                                        <View
                                            style={{
                                                flex: 1
                                            }}/>

                                        {
                                            <Text style={{
                                                fontSize: 14,
                                                color: this.state.speed > 130 ? '#ffffff' : '#B0B6B8'
                                            }}>
                                                {HomeLocalizableString.快}
                                            </Text>
                                        }
                                    </View>
                                </View>


                                <SlideGear
                                    //blockStyle={{backgroundColor: 'rgba(0,0,0,0)'}}
                                    showEndText={false}
                                    optionMin={0}
                                    optionMax={150}
                                    optionStep={10}
                                    containerStyle={{width: '100%', height: 48}}
                                    value={this.state.speed}
                                    onValueChange={(value) => {
                                        console.log('value->' + parseInt((value)))
                                        this.setState({speed: parseInt((value))});
                                    }}
                                    onSlidingComplete={(value) => {

                                    }}
                                    minimumTrackTintColor={'rgba(0,0,0,0)'}
                                    maximumTrackTintColor={'rgba(0,0,0,0)'}
                                />
                            </View> */}

                <View style={{ flex: 1 }}/>

                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    marginTop: 40,
                    justifyContent: 'center'
                  }}
                  onPress={() => {
                    let speed = this.fixSpeed2(parseInt(this.state.speed));
                    console.log(`speed->${ speed }`);
                    if (this.state.mode == 1) {
                      let value = DataUtils.set3_8(this.state.change, (this.state.temp2 - 2700) / 100, this.state.brightness2, (this.state.temp - 2700) / 100, this.state.brightness, speed);
                      this._sendCode(4, 8, parseInt(value));
                      DataUtils.parse3_8(
                        value
                      );
                    } else {
                      let value = DataUtils.set3_9(this.state.change, (this.state.temp2 - 2700) / 100, this.state.brightness2, (this.state.temp - 2700) / 100, this.state.brightness, speed);
                      this._sendCode(4, 9, parseInt(value));
                      DataUtils.parse3_9(
                        value
                      );
                    }
                    this.props.navigation.goBack();// 返回上
                  }}>

                  <View
                    style={{
                      borderRadius: 24,
                      paddingLeft: 20,
                      paddingRight: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingTop: 15,
                      marginBottom: 20,
                      width: this.mScreenWidth - 40,
                      paddingBottom: 15,
                      backgroundColor: '#4396EB',
                      flexDirection: 'column'
                    }}>

                    <Text style={{
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 'bold',
                      ...Platform.select({
                        ios: {},
                        android: { fontFamily: 'lucida grande' }
                      })
                    }}>{HomeLocalizableString.confirm}</Text>
                  </View>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
          <LoadingDialog title={HomeLocalizableString.loading}
            timeout={3000}
            visible={this.state.loadingVis}/>
        </View>
      )
      ;
    }

    getNormalS(num) {
      // （（输入值-原最小值）/（float）（原最大值-原最小值））*（现最大值-现最小值）+现最小值
      // console.log(`num->${num},getNormalS->${((num - 10) / 90) * 100}`);
      return ((num - 10) / 90) * 100;
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

        }).catch((err) => { // 请求失败
        });
    }

    _updateUi(Siid, Piid, Value) {
      if (Siid == 4) {
        if (Piid == 8) {
        }
        if (Piid == 9) {
        }
      }
    }

    _sendCode(Siid, Piid, Value) { // 发送指令  一组参数
      console.log(`发送指令---->${ new Date().getHours() }:${ new Date().getMinutes() }====>${ Siid }--${ Piid }--${ Value }`);
      if (this.state.btConnect) {
        console.log('ble');
        this._sendCodeSpecForBle(Siid, Piid, Value, 5);
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

      this.setState({ lastControlTimeSlide: new Date().getTime() });
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

    _getColor(temp, bgAlpha) {
      // return '#4396EBFF'
      return `xm${ ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(temp, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(bgAlpha * (185 / 100) + 70)).toString(16) }`;
    }

    _getUnColor(temp, bgAlpha) {
      return DarkMode.getColorScheme() === 'dark' ? 'xm#2f2f2f' : '#F7F7F7';
      //  return `xm${ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(temp, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(bgAlpha * (185 / 100) + 70)).toString(16)}`;
    }

    _getCheckBrightness(value) {
      return value;
    }
}


const styles = StyleSheet.create({
  containAll: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: DarkMode.getColorScheme() === 'dark' ? '#000' : '#ffffff'
  },
  itemContainer: {
    backgroundColor: DarkMode.getColorScheme() === 'dark' ? '#000' : '#ffffff',
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
  },
  topButtonContainer: {
    flexDirection: 'row',
    marginTop: 20
  },
  topButtonItemContainer: {
    flexDirection: 'column',
    flex: 1
  },
  buttonTextFont: {
    color: '#e8e8e8',
    ...Platform.select({
      ios: {},
      android: { fontFamily: 'lucida grande' }
    }),
    marginTop: 10,
    alignSelf: 'center'
  },
  modalNorTextFont: {
    color: '#929292',
    ...Platform.select({
      ios: {},
      android: { fontFamily: 'lucida grande' }
    }),
    marginTop: 10,
    alignSelf: 'center'
  },
  fanSpeedContainer: {
    flexDirection: 'row',
    marginTop: 20
  },
  fanSpeedText: {
    textAlign: 'center',
    alignSelf: 'center',
    color: '#000',
    marginLeft: 20,
    fontSize: 16,
    ...Platform.select({
      ios: {},
      android: { fontFamily: 'lucida grande' }
    })
  },
  fanSpeedTextValue: {
    textAlign: 'center',
    alignSelf: 'center',
    color: '#e99036',
    marginLeft: 10,
    fontSize: 17,
    ...Platform.select({
      ios: {},
      android: { fontFamily: 'lucida grande' }
    })
  },
  sliderStyle: {
    marginTop: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        marginLeft: 20,
        marginRight: 20
      },
      android: {
        marginLeft: 20,
        marginRight: 20
      }
    })
  },
  trunButton: {
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',

    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#e99036',
    color: '#e99036',
    borderRadius: 20,
    marginLeft: 50,
    marginRight: 50,
    marginTop: 30,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        lineHeight: 36
      },
      android: { fontFamily: 'lucida grande' }
    })
  },
  lineView: {
    backgroundColor: 'rgb(230,230,230)',
    height: 1
  },
  trunButtonGray: {
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',

    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#d2d2d2',
    color: 'rgb(0,0,0)',
    borderRadius: 20,
    marginLeft: 50,
    marginRight: 50,
    marginTop: 30,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        lineHeight: 36
      },
      android: { fontFamily: 'lucida grande' }
    })
  },

  // control
  tab: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: DarkMode.getColorScheme() === 'dark' ? '#000' : '#ffffff'
  },
  tabTitleWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    color: '#000'
  },
  tabTitleLabel: {
    fontSize: 16,
    color: '#000'
  },
  tabTitleSeparator: {
    marginHorizontal: 5,
    color: '#999'
  },
  tabTitleSubLabel: {
    fontSize: 16,
    color: '#999'
  },
  buttonGroups: {
    flexDirection: 'row',
    marginTop: 20,
    marginLeft: 20
  },
  circle: {
    width: 30,
    height: 30
  }
});