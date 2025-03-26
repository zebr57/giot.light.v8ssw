import React from "react";
import { DeviceEventEmitter, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
import MHDatePicker from "miot/ui/MHDatePicker";
import MHDatePicker1 from "./View/MHDatePickerJy";
import Switch from "miot/ui/Switch";

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

    constructor(props) {
      super(props);
      const colorScheme = DarkMode.getColorScheme();
      this.state = {
        colorScheme,
        mode: props.navigation.state.params.mode,

        item: props.navigation.state.params.mode == 1 ? DataUtils.getJl1()
          : props.navigation.state.params.mode == 2 ? DataUtils.getJl2()
            : props.navigation.state.params.mode == 3 ? DataUtils.getJl3()
              : props.navigation.state.params.mode == 4 ? DataUtils.getJl4()
                : props.navigation.state.params.mode == 5 ? DataUtils.getJl5()
                  : DataUtils.getJl6(),

        bright: props.navigation.state.params.mode == 1 ? DataUtils.getJl1().bright
          : props.navigation.state.params.mode == 2 ? DataUtils.getJl2().bright
            : props.navigation.state.params.mode == 3 ? DataUtils.getJl3().bright
              : props.navigation.state.params.mode == 4 ? DataUtils.getJl4().bright
                : props.navigation.state.params.mode == 5 ? DataUtils.getJl5().bright : DataUtils.getJl6().bright,

        temp: props.navigation.state.params.mode == 1 ? DataUtils.getJl1().temp
          : props.navigation.state.params.mode == 2 ? DataUtils.getJl2().temp
            : props.navigation.state.params.mode == 3 ? DataUtils.getJl3().temp
              : props.navigation.state.params.mode == 4 ? DataUtils.getJl4().temp
                : props.navigation.state.params.mode == 5 ? DataUtils.getJl5().temp
                  : DataUtils.getJl6().temp,

        time: props.navigation.state.params.mode == 1 ? DataUtils.getJl1().time
          : props.navigation.state.params.mode == 2 ? DataUtils.getJl2().time
            : props.navigation.state.params.mode == 3 ? DataUtils.getJl3().time
              : props.navigation.state.params.mode == 4 ? DataUtils.getJl4().time
                : props.navigation.state.params.mode == 5 ? DataUtils.getJl5().time
                  : DataUtils.getJl6().time,

        lightMode: props.navigation.state.params.mode == 1 ? DataUtils.getJl1().mode
          : props.navigation.state.params.mode == 2 ? DataUtils.getJl2().mode
            : props.navigation.state.params.mode == 3 ? DataUtils.getJl3().mode
              : props.navigation.state.params.mode == 4 ? DataUtils.getJl4().mode
                : props.navigation.state.params.mode == 5 ? DataUtils.getJl5().mode
                  : DataUtils.getJl6().mode,

        customTime: this.getCustomTimeStr(props.navigation.state.params.mode == 1 ? DataUtils.getJl1().custom_time
          : props.navigation.state.params.mode == 2 ? DataUtils.getJl2().custom_time
            : props.navigation.state.params.mode == 3 ? DataUtils.getJl3().custom_time
              : props.navigation.state.params.mode == 4 ? DataUtils.getJl4().custom_time
                : props.navigation.state.params.mode == 5 ? DataUtils.getJl5().custom_time
                  : DataUtils.getJl6().custom_time, props.navigation.state.params.mode == 1 ? DataUtils.getJl1().mode
          : props.navigation.state.params.mode == 2 ? DataUtils.getJl2().mode
            : props.navigation.state.params.mode == 3 ? DataUtils.getJl3().mode
              : props.navigation.state.params.mode == 4 ? DataUtils.getJl4().mode
                : props.navigation.state.params.mode == 5 ? DataUtils.getJl5().mode
                  : DataUtils.getJl6().mode),
        dialogInit: true,

        loadingVis: false,
        btConnect: props.navigation.state.params.btConnect
      };
      console.log(`speed->${ parseInt(props.navigation.state.params.mode == 1 ? DataUtils.get3_8()[5] : DataUtils.get3_9()[5]) }`);
    }

    generateArrayFromRange(start, finish) {
      return Array.apply(null, Array(finish - start + 1)).map((_, i) => start + i);
    }

    convert(integer) {
      let str = Number(integer).toString(16);
      return str.length == 1 ? `0${ str }` : str;
    }


    componentWillMount() {
    }

    componentWillUnmount() {
      DeviceEventEmitter.emit('update', '');
      this.listener && this.listener.remove();

      this.listener1 && this.listener1.remove();

      if (this.listenerBle) {
        this.listenerBle.remove();
      }
    }

    _2addZero(str) {
      return str.toString().length == 2 ? str : `0${ str }`;
    }

    parseTime(time) {
      return `${ this._2addZero(parseInt(time / 60)) }:${ this._2addZero(time % 60) }`;
    }

    render() {
      return (
        <View style={styles.containAll}>

          <NavigationBar
            type={NavigationBar.TYPE.LIGHT}
            title={this.state.mode == 1 ? HomeLocalizableString.起床设置
              : this.state.mode == 2 ? HomeLocalizableString.中午设置
                : this.state.mode == 3 ? HomeLocalizableString.午休设置
                  : this.state.mode == 4 ? HomeLocalizableString.午起设置
                    : this.state.mode == 5 ? HomeLocalizableString.傍晚设置 : HomeLocalizableString.入睡设置}
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


              <TouchableOpacity style={{
                marginTop: 20,
                marginHorizontal: 20,
                alignItems: 'center',
                flexDirection: 'row'
              }} onPress={() => {
                this.setState({ timeDialog: true });
              }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000000',
                    ...Platform.select({
                      ios: {},
                      android: { fontFamily: 'lucida grande' }
                    })
                  }}>{HomeLocalizableString.到达目标亮度时间}</Text>

                <View style={{ flex: 1 }}/>

                <Text
                  style={{
                    fontSize: 13,
                    color: '#999',
                    ...Platform.select({
                      ios: {},
                      android: { fontFamily: 'lucida grande' }
                    })
                  }}>{this.parseTime(this.state.time)}</Text>
                <Image
                  style={{ tintColor: DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : null }}
                  source={require('../resources/arrow_ic.png')}/>
              </TouchableOpacity>

              <TouchableOpacity style={{
                marginHorizontal: 20,
                alignItems: 'center',
                marginTop: 20,
                flexDirection: 'row'
              }} onPress={() => {
                this.setState({ custom_dialog: true });
              }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000000',
                    ...Platform.select({
                      ios: {},
                      android: { fontFamily: 'lucida grande' }
                    })
                  }}>{HomeLocalizableString.变光时长2}</Text>

                <View style={{ flex: 1 }}/>

                <Text
                  style={{
                    fontSize: 13,
                    color: '#999',
                    ...Platform.select({
                      ios: {},
                      android: { fontFamily: 'lucida grande' }
                    })
                  }}>{this.state.customTime}</Text>

                <Image
                  style={{ tintColor: DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : null }}
                  source={require('../resources/arrow_ic.png')}/>

              </TouchableOpacity>

              <View style={{
                marginHorizontal: 20,
                alignItems: 'center',
                marginTop: 20,
                flexDirection: 'row'
              }}>

                <View>
                  <Text style={{
                    color: '#000000',
                    fontSize: 16,
                    ...Platform.select({
                      ios: {},
                      android: { fontFamily: 'lucida grande' }
                    })
                  }}>{HomeLocalizableString.灯光}</Text>

                </View>

                <View style={{ flex: 1 }}/>

                <Switch
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                  value={this.state.bright != 0}
                  onTintColor={'#4396EB'}
                  tintColor={DarkMode.getColorScheme() === 'dark' ? 'xm#565656' : '#E6E7F0'}
                  onValueChange={(value) => {
                    let bright = 0;
                    if (!value) {
                      bright = 0;
                      this.setState({ bright: 0 });
                    } else {
                      bright = 100;
                      this.setState({ bright: 100 });
                    }

                    if (this.state.mode == 1) {
                      let value = DataUtils.setJL(
                        DataUtils.getJl1().enable,
                        DataUtils.getJl1().time,
                        DataUtils.getJl1().temp,
                        bright,
                        DataUtils.getJl1().custom_time,
                        DataUtils.getJl1().mode);
                      this._sendCode(4, 7, value);
                      DataUtils.parse3_7(value);
                    } else if (this.state.mode == 2) {
                      let value = DataUtils.setJL(
                        DataUtils.getJl2().enable,
                        DataUtils.getJl2().time,
                        DataUtils.getJl2().temp,
                        bright,
                        DataUtils.getJl2().custom_time,
                        DataUtils.getJl2().mode);
                      this._sendCode(4, 10, value);
                      DataUtils.parse3_10(value);
                    } else if (this.state.mode == 3) {
                      let value = DataUtils.setJL(
                        DataUtils.getJl3().enable,
                        DataUtils.getJl3().time,
                        DataUtils.getJl3().temp,
                        bright,
                        DataUtils.getJl3().custom_time,
                        DataUtils.getJl3().mode);
                      this._sendCode(4, 11, value);
                      DataUtils.parse3_11(value);
                    } else if (this.state.mode == 4) {
                      let value = DataUtils.setJL(
                        DataUtils.getJl4().enable,
                        DataUtils.getJl4().time,
                        DataUtils.getJl4().temp,
                        bright,
                        DataUtils.getJl4().custom_time,
                        DataUtils.getJl4().mode);
                      this._sendCode(4, 12, value);
                      DataUtils.parse3_12(value);
                    } else if (this.state.mode == 5) {
                      let value = DataUtils.setJL(
                        DataUtils.getJl5().enable,
                        DataUtils.getJl5().time,
                        DataUtils.getJl5().temp,
                        bright,
                        DataUtils.getJl5().custom_time,
                        DataUtils.getJl5().mode);
                      this._sendCode(4, 13, value);
                      DataUtils.parse3_13(value);
                    } else if (this.state.mode == 6) {
                      let value = DataUtils.setJL(
                        DataUtils.getJl6().enable,
                        DataUtils.getJl6().time,
                        DataUtils.getJl6().temp,
                        bright,
                        DataUtils.getJl6().custom_time,
                        DataUtils.getJl6().mode);
                      this._sendCode(4, 14, value);
                      DataUtils.parse3_14(value);
                    }
                  }
                  }
                />
              </View>

              {this.state.bright == 0 ?
                null :
                <View style={styles.tab}>
                  <View style={styles.tabTitleWrapper}>
                    <Text style={styles.tabTitleLabel}>{HomeLocalizableString.text_brightness}</Text>
                    <Text style={styles.tabTitleSeparator}>|</Text>
                    <Text style={styles.tabTitleSubLabel}>{this.state.bright}%</Text>
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
                          width: 0 + (((this.mScreenWidth * 1) - 40 - 0) * (this.state.bright / 100)),
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
                          (this.state.bright > 8 ? <Image
                            source={require('../resources/bright_low_white_ic.png')}/> : null)
                        }

                        <View
                          style={{
                            flex: 1
                          }}/>

                        {
                          (this.state.bright > 95 ? <Image
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
                      value={this.state.bright - 1}
                      onValueChange={(value) => {
                        this.setState({ bright: parseInt(value + 1) });
                      }}
                      onSlidingComplete={(br) => {
                        if (this.state.mode == 1) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl1().enable,
                            DataUtils.getJl1().time,
                            DataUtils.getJl1().temp,
                            parseInt(br + 1),
                            DataUtils.getJl1().custom_time,
                            DataUtils.getJl1().mode);
                          this._sendCode(4, 7, value);
                          DataUtils.parse3_7(value);
                        } else if (this.state.mode == 2) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl2().enable,
                            DataUtils.getJl2().time,
                            DataUtils.getJl2().temp,
                            parseInt(br + 1),
                            DataUtils.getJl2().custom_time,
                            DataUtils.getJl2().mode);
                          this._sendCode(4, 10, value);
                          DataUtils.parse3_10(value);
                        } else if (this.state.mode == 3) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl3().enable,
                            DataUtils.getJl3().time,
                            DataUtils.getJl3().temp,
                            parseInt(br + 1),
                            DataUtils.getJl3().custom_time,
                            DataUtils.getJl3().mode);
                          this._sendCode(4, 11, value);
                          DataUtils.parse3_11(value);
                        } else if (this.state.mode == 4) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl4().enable,
                            DataUtils.getJl4().time,
                            DataUtils.getJl4().temp,
                            parseInt(br + 1),
                            DataUtils.getJl4().custom_time,
                            DataUtils.getJl4().mode);
                          this._sendCode(4, 12, value);
                          DataUtils.parse3_12(value);
                        } else if (this.state.mode == 5) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl5().enable,
                            DataUtils.getJl5().time,
                            DataUtils.getJl5().temp,
                            parseInt(br + 1),
                            DataUtils.getJl5().custom_time,
                            DataUtils.getJl5().mode);
                          this._sendCode(4, 13, value);
                          DataUtils.parse3_13(value);
                        } else if (this.state.mode == 6) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl6().enable,
                            DataUtils.getJl6().time,
                            DataUtils.getJl6().temp,
                            parseInt(br + 1),
                            DataUtils.getJl6().custom_time,
                            DataUtils.getJl6().mode);
                          this._sendCode(4, 14, value);
                          DataUtils.parse3_14(value);
                        }
                      }}
                      minimumTrackTintColor={'rgba(0,0,0,0)'}
                      maximumTrackTintColor={'rgba(0,0,0,0)'}
                    />
                  </View>

                </View>
              }

              {this.state.bright == 0 ?
                null :
                <View style={styles.tab}>
                  <View style={styles.tabTitleWrapper}>
                    <Text style={styles.tabTitleLabel}>{HomeLocalizableString.text_temp}</Text>
                    <Text style={styles.tabTitleSeparator}>|</Text>
                    <Text
                      style={styles.tabTitleSubLabel}>{this.state.temp}K</Text>
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
                      value={this.state.temp}
                      onValueChange={(value) => {
                        this.setState({ temp: parseInt(value) });
                      }}
                      onSlidingComplete={(temp) => {
                        console.log(`temp->${ temp }`);
                        if (this.state.mode == 1) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl1().enable,
                            DataUtils.getJl1().time,
                            parseInt(temp),
                            DataUtils.getJl1().bright,
                            DataUtils.getJl1().custom_time,
                            DataUtils.getJl1().mode);
                          this._sendCode(4, 7, value);
                          DataUtils.parse3_7(value);
                        } else if (this.state.mode == 2) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl2().enable,
                            DataUtils.getJl2().time,
                            parseInt(temp),
                            DataUtils.getJl2().bright,
                            DataUtils.getJl2().custom_time,
                            DataUtils.getJl2().mode);
                          this._sendCode(4, 10, value);
                          DataUtils.parse3_10(value);
                        } else if (this.state.mode == 3) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl3().enable,
                            DataUtils.getJl3().time,
                            parseInt(temp),
                            DataUtils.getJl3().bright,
                            DataUtils.getJl3().custom_time,
                            DataUtils.getJl3().mode);
                          this._sendCode(4, 11, value);
                          DataUtils.parse3_11(value);
                        } else if (this.state.mode == 4) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl4().enable,
                            DataUtils.getJl4().time,
                            parseInt(temp),
                            DataUtils.getJl4().bright,
                            DataUtils.getJl4().custom_time,
                            DataUtils.getJl4().mode);
                          this._sendCode(4, 12, value);
                          DataUtils.parse3_12(value);
                        } else if (this.state.mode == 5) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl5().enable,
                            DataUtils.getJl5().time,
                            parseInt(temp),
                            DataUtils.getJl5().bright,
                            DataUtils.getJl5().custom_time,
                            DataUtils.getJl5().mode);
                          this._sendCode(4, 13, value);
                          DataUtils.parse3_13(value);
                        } else if (this.state.mode == 6) {
                          let value = DataUtils.setJL(
                            DataUtils.getJl6().enable,
                            DataUtils.getJl6().time,
                            parseInt(temp),
                            DataUtils.getJl6().bright,
                            DataUtils.getJl6().custom_time,
                            DataUtils.getJl6().mode);
                          this._sendCode(4, 14, value);
                          DataUtils.parse3_14(value);
                        }
                      }}
                      minimumTrackTintColor={'rgba(0,0,0,0)'}
                      maximumTrackTintColor={'rgba(0,0,0,0)'}
                    />
                  </View>

                </View>
              }

            </View>
          </ScrollView>

          <MHDatePicker
            visible={this.state.timeDialog}
            title={HomeLocalizableString.到达目标亮度时间}
            type={MHDatePicker.TYPE.TIME24}
            datePickerStyle={{
              rightButtonStyle: {
                color: '#fff'
              },
              rightButtonBgStyle: {
                bgColorNormal: "#4396EB"
              },
              pickerInnerStyle: { selectTextColor: "#4396EB", unitTextColor: "#4396EB" }
            }}
            current={[parseInt(this.state.time / 60), parseInt(this.state.time % 60)]}
            onDismiss={(_) => {
              this.setState({
                timeDialog: false
              });
            }}
            onSelect={(res) => {
              this.setState({
                time: parseInt(res.rawArray[0]) * 60 + parseInt(res.rawArray[1])
              });
              if (this.state.mode == 1) {
                let value = DataUtils.setJL(
                  DataUtils.getJl1().enable,
                  parseInt(res.rawArray[0]) * 60 + parseInt(res.rawArray[1]),
                  DataUtils.getJl1().temp,
                  DataUtils.getJl1().bright,
                  DataUtils.getJl1().custom_time,
                  DataUtils.getJl1().mode);
                this._sendCode(4, 7, value);
                DataUtils.parse3_7(value);
              } else if (this.state.mode == 2) {
                let value = DataUtils.setJL(
                  DataUtils.getJl2().enable,
                  parseInt(res.rawArray[0]) * 60 + parseInt(res.rawArray[1]),
                  DataUtils.getJl2().temp,
                  DataUtils.getJl2().bright,
                  DataUtils.getJl2().custom_time,
                  DataUtils.getJl2().mode);
                this._sendCode(4, 10, value);
                DataUtils.parse3_10(value);
              } else if (this.state.mode == 3) {
                let value = DataUtils.setJL(
                  DataUtils.getJl3().enable,
                  parseInt(res.rawArray[0]) * 60 + parseInt(res.rawArray[1]),
                  DataUtils.getJl3().temp,
                  DataUtils.getJl3().bright,
                  DataUtils.getJl3().custom_time,
                  DataUtils.getJl3().mode);
                this._sendCode(4, 11, value);
                DataUtils.parse3_11(value);
              } else if (this.state.mode == 4) {
                let value = DataUtils.setJL(
                  DataUtils.getJl4().enable,
                  parseInt(res.rawArray[0]) * 60 + parseInt(res.rawArray[1]),
                  DataUtils.getJl4().temp,
                  DataUtils.getJl4().bright,
                  DataUtils.getJl4().custom_time,
                  DataUtils.getJl4().mode);
                this._sendCode(4, 12, value);
                DataUtils.parse3_12(value);
              } else if (this.state.mode == 5) {
                let value = DataUtils.setJL(
                  DataUtils.getJl5().enable,
                  parseInt(res.rawArray[0]) * 60 + parseInt(res.rawArray[1]),
                  DataUtils.getJl5().temp,
                  DataUtils.getJl5().bright,
                  DataUtils.getJl5().custom_time,
                  DataUtils.getJl5().mode);
                this._sendCode(4, 13, value);
                DataUtils.parse3_13(value);
              } else if (this.state.mode == 6) {
                let value = DataUtils.setJL(
                  DataUtils.getJl6().enable,
                  parseInt(res.rawArray[0]) * 60 + parseInt(res.rawArray[1]),
                  DataUtils.getJl6().temp,
                  DataUtils.getJl6().bright,
                  DataUtils.getJl6().custom_time,
                  DataUtils.getJl6().mode);
                this._sendCode(4, 14, value);
                DataUtils.parse3_14(value);
              }
            }
            }
          />

          <MHDatePicker1
            showSubtitle={false}
            unit={HomeLocalizableString.分钟}
            min={['1']}
            step={1}
            max={['30']}
            visible={this.state.custom_dialog}
            title={HomeLocalizableString.变光时长2}
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
            current={[this.state.customTime]}
            onDismiss={(_) => {
              this.setState({
                custom_dialog: false
              });
            }}
            onSelect={(res) => {
              console.log(res.rawArray[0]);
              let devValue = this.getCustomTimeValue(res.rawArray[0]);
              let modeValue = this.getModeValue(res.rawArray[0]);
              console.log(`devValue=${ devValue }`);
              this.setState({ customTime: res.rawArray[0] });
              if (this.state.mode == 1) {
                let value = DataUtils.setJL(
                  DataUtils.getJl1().enable,
                  DataUtils.getJl1().time,
                  DataUtils.getJl1().temp,
                  DataUtils.getJl1().bright,
                  parseInt(devValue),
                  parseInt(modeValue));
                this._sendCode(4, 7, value);
                DataUtils.parse3_7(value);
              } else if (this.state.mode == 2) {
                let value = DataUtils.setJL(
                  DataUtils.getJl2().enable,
                  DataUtils.getJl2().time,
                  DataUtils.getJl2().temp,
                  DataUtils.getJl2().bright,
                  parseInt(devValue),
                  parseInt(modeValue));
                this._sendCode(4, 10, value);
                DataUtils.parse3_10(value);
              } else if (this.state.mode == 3) {
                let value = DataUtils.setJL(
                  DataUtils.getJl3().enable,
                  DataUtils.getJl3().time,
                  DataUtils.getJl3().temp,
                  DataUtils.getJl3().bright,
                  parseInt(devValue),
                  parseInt(modeValue));
                this._sendCode(4, 11, value);
                DataUtils.parse3_11(value);
              } else if (this.state.mode == 4) {
                let value = DataUtils.setJL(
                  DataUtils.getJl4().enable,
                  DataUtils.getJl4().time,
                  DataUtils.getJl4().temp,
                  DataUtils.getJl4().bright,
                  parseInt(devValue),
                  parseInt(modeValue));
                this._sendCode(4, 12, value);
                DataUtils.parse3_12(value);
              } else if (this.state.mode == 5) {
                let value = DataUtils.setJL(
                  DataUtils.getJl5().enable,
                  DataUtils.getJl5().time,
                  DataUtils.getJl5().temp,
                  DataUtils.getJl5().bright,
                  parseInt(devValue),
                  parseInt(modeValue));
                this._sendCode(4, 13, value);
                DataUtils.parse3_13(value);
              } else if (this.state.mode == 6) {
                let value = DataUtils.setJL(
                  DataUtils.getJl6().enable,
                  DataUtils.getJl6().time,
                  DataUtils.getJl6().temp,
                  DataUtils.getJl6().bright,
                  parseInt(devValue),
                  parseInt(modeValue));
                this._sendCode(4, 14, value);
                DataUtils.parse3_14(value);
              }

            }}
          />
          <LoadingDialog title={HomeLocalizableString.loading}
            timeout={3000}
            visible={this.state.loadingVis}/>
        </View>
      );
    }

    getCustomTimeValue(s) {
      // 发送给设备
      if (s == HomeLocalizableString.立即变化) {
        return 1;
      } else {
        if (this.state.lightMode == 2) {
          return parseInt(s.split(HomeLocalizableString.s).join(""));
        } else {
          return parseInt(s.split(HomeLocalizableString.分钟).join(""));
        }
      }
    }

    getModeValue(s) {
      // 发送给设备
      if (s == HomeLocalizableString.立即变化) {
        return 1;
      } else {
        if (s.indexOf(HomeLocalizableString.s) != -1) {
          return 2;
        } else {
          return 3;
        }
      }
    }

    getCustomTimeStr(value, lightMode) {
      console.log(`getCustomTimeStr->${ value }`);
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
      return `xm${ ColorTemperatureGetter.getColorFromPercent(getColorTemperaturePercent(temp, [colorMin, colorMax])) + parseInt(this._getCheckBrightness(bgAlpha * (185 / 100) + 70)).toString(16) }`;
    }

    _getCheckBrightness(value) {
      return value;
    }
}


const styles = StyleSheet.create({
  containAll: {
    flex: 1,
    flexDirection: 'column',
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
    backgroundColor: DarkMode.getColorScheme() === 'dark' ? 'xm#000' : '#ffffff'
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