import React from 'react';
import { Device, Host, Package, PackageEvent } from 'miot';
import main from "./Main/Main";
import commonSetting from './Main/CommonSetting';
import timing from "./Main/Timing";
import timingTask from "./Main/TimingTask";
import repeat from './Main/Repeat';
import custom from './Main/Custom';
import collect from './Main/Collect';
import defaultPage from './Main/Default';
import traverseSwitch from './Main/TraverseSwitch';
import awake from './Main/Awake';
import remotecontrol from './Main/RemoteControl';
import nightlight from './Main/NightLight';
import professionalSettings from './Main/ProfessionalSettings';
import wifiProfessionalSettings from './Main/WifiProfessionalSettings';
import { createStackNavigator } from "react-navigation";
import { TitleBarBlack } from "../../miot-sdk/ui";
import { FirmwareUpgrade, MoreSetting } from "miot/ui/CommonSetting";
import subHelpSleep from "./Main/SubHelpSleep";
import subAwake from "./Main/SubAwake";
import sceneModeSettings from "./Main/SceneModeSettings";
import shengwu from "./Main/shengwu";
import JyDetail from "./Main/JyDetail";

PackageEvent.packageAuthorizationCancel.addListener(() => { // 撤销隐私协议授权回调
  Host.storage.set(`LicenseAndPrivacy${ Device.deviceID }`, 0);
});

Package.BLEAutoCheckUpgradeOptions = {
  enable: true,
  redPoint: true,
  alertDialog: true,
  authType: 4
};


const RootStack = createStackNavigator({
  Home: main,
  CommonSetting: commonSetting,
  MoreSetting: MoreSetting,
  FirmwareUpgrade: FirmwareUpgrade,
  Timing: timing,
  TimingTask: timingTask,
  NightLight: nightlight,
  ProfessionalSettings: professionalSettings,
  WifiProfessionalSettings: wifiProfessionalSettings,
  RemoteControl: remotecontrol,
  Repeat: repeat,
  Custom: custom,
  Collect: collect,
  Default: defaultPage,
  TraverseSwitch: traverseSwitch,
  SubHelpSleep: subHelpSleep,
  SubAwake: subAwake,
  Awake: awake,
  SceneModeSettings: sceneModeSettings,
  Shengwu: shengwu,
  JyDetail: JyDetail
}, {
  initialRouteName: 'Home',
  navigationOptions: ({ navigation }) => {
    return {
      header: <TitleBarBlack title={navigation.state.params ? navigation.state.params.title : Device.name}
        style={{ backgroundColor: '#fff' }}
        onPressLeft={() => {
          Package.exit();
        }}
        onPressRight={() => { // 更多事件点击
          // navigation.navigate('Setting')
        }}/>
    };
  }
});

class App extends React.Component {
  render() {
    return <RootStack/>;
  }
}

// 关闭其中某些yellow警告
console.ignoredYellowBox = ['Warning: BackAndroid is deprecated. Please use BackHandler instead.', 'source.uri should not be an empty string', 'Invalid props.style key'];
// 关闭全部yellow警告
console.disableYellowBox = true;

Package.entry(App, () => {

});
    