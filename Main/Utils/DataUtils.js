import number from "../../Main/Utils/number";

let lightPower = false;// 灯开关
let brightness = 100; // 亮度  最小值:1  最大值:100
let color_temperature = 2700; // 色温  最小值:2700 最大值:6500
let powerOnState = false;
let turnOnState = false;
let defaultBright = 0;
let defaultTemp = 0;
let helpLight = false;
let isShowHelpLight = false;
let fenDuanSwitch = false;
let quXianSwitch = false;

let acStatus = false;
let traverse_switch = false;

let sleep_time = 0;
let sleep = false;
let awake_time = 0;
let awake = false;
let startBright = 0;
let endBright = 0;
let startColor = 0;
let endColor = 0;

let nightLightSwitch = false;
let startHour = 0;
let startMin = 0;
let endHour = 0;
let endMin = 0;

let gradient_duration_on = 0;
let gradient_duration_off = 0;
let gradient_duration_aj = 0;
let minimum_bri_factory = 0;
let minimum_bri_set = 0;

let wifi_gradient_duration_on = 0;
let wifi_gradient_duration_off = 0;
let wifi_gradient_duration_aj = 0;


let breakMode = 0;
let breakTemp2 = 0;
let breakBright2 = 0;
let breakTemp1 = 0;
let breakBright1 = 0;
let breakTime = 0;

let ldMode = 0;
let ldTemp2 = 0;
let ldBright2 = 0;
let ldTemp1 = 0;
let ldBright1 = 0;
let ldTime = 0;

let jvLight1 = {};
let jvLight2 = {};
let jvLight3 = {};
let jvLight4 = {};
let jvLight5 = {};
let jvLight6 = {};

let jvSwitch = false;
let jvRepeat = [];

export default class DataUtils {

  static getBits(b, start, length) {
    // 字节b有8位bit，右移start位，截取长度为5的bit
    // 10011001 右移 0位,还是10011001
    // 0xFF的二进制为  11111111（8个1），右移8-5的长度，变为：00011111
    //      10011001
    //  &   00011111
    //      00011001   --------> bit
    let bit = ((b >> start) & (0xFF >> (8 - length)));
    return bit;
  }

  static getBitsForInt(b, start, length) {
    // 字节b有8位bit，右移start位，截取长度为5的bit
    // 10011001 右移 0位,还是10011001
    // 0xFF的二进制为  11111111（8个1），右移8-5的长度，变为：00011111
    //      10011001
    //  &   00011111
    //      00011001   --------> bit
    let bit = ((b >> start) & (0xFF >> (32 - length)));
    return bit;
  }

  static intToBytesBigEndian(number, length) {
    let bytes = [];
    let i = 0;
    do {
      bytes[i++] = number & (255);
      number = number >> 8;
    } while (i < length);
    return bytes;
  }

  static intToBytesSmallEndian(number, length) {
    let bytes = [];
    let i = 0;
    do {
      bytes[i++] = number & (255);
      number = number << 8;
    } while (i < length);
    return bytes;
  }

  static bytesToHexString(arrBytes) {
    let str = "";
    for (let i = 0; i < arrBytes.length; i++) {
      var tmp;
      let num = arrBytes[i];
      if (num < 0) {
        // 此处填坑，当byte因为符合位导致数值为负时候，需要对数据进行处理
        tmp = (255 + num + 1).toString(16);
      } else {
        tmp = num.toString(16);
      }
      if (tmp.length == 1) {
        tmp = `0${ tmp }`;
      }
      str += tmp;
    }
    return str;
  }

  static convert(integer) {
    let str = Number(integer).toString(16);
    return str.length == 1 ? `0${ str }` : str;
  }

  static getAcStatus() {
    return acStatus;
  }

  static getTraverseSwitch() {
    return traverse_switch;
  }

  static parse3_1(data) {
    let bytes = this.intToBytesBigEndian(data, 4);
    let rmTemp = (((bytes[1] & 0xff) << 8) | bytes[0] & 0xff);
    let rmBright = bytes[2];
    defaultTemp = rmTemp;
    defaultBright = rmBright;

    quXianSwitch = this.getBits(bytes[3], 0, 1) == 1;
    fenDuanSwitch = this.getBits(bytes[3], 1, 1) == 1;
    helpLight = this.getBits(bytes[3], 2, 1) == 1;
    isShowHelpLight = this.getBits(bytes[3], 3, 1) == 1;
    traverse_switch = this.getBits(bytes[3], 4, 1) == 1;
    acStatus = this.getBits(bytes[3], 5, 1) == 1;
    turnOnState = this.getBits(bytes[3], 6, 1) == 1;
    powerOnState = this.getBits(bytes[3], 7, 1) == 1;

    console.log(`helpLight->${ helpLight }`);
    console.log(`isShowHelpLight->${ isShowHelpLight }`);
    console.log(`traverse_switch->${ traverse_switch }`);
    console.log(`acStatus->${ acStatus }`);
    console.log(`turnOnState->${ turnOnState }`);
    console.log(`powerOnState->${ powerOnState }`);
    console.log(`defaultTemp->${ defaultTemp }`);
    console.log(`fenDuanSwitch->${ fenDuanSwitch }`);
    console.log(`quXianSwitch->${ quXianSwitch }`);
  }

  static getTraverseSwitchParams(traverse_switch) {
    console.log(`getTraverseSwitchParams defaultBright->${ defaultBright }`);
    console.log(`getTraverseSwitchParams defaultTemp->${ defaultTemp }`);

    let t = `${ powerOnState ? 1 : 0 }${
      turnOnState ? 1 : 0 }${
      acStatus ? 1 : 0 }${
      traverse_switch ? 1 : 0 }${
      isShowHelpLight ? 1 : 0 }${
      helpLight ? 1 : 0 }${
      fenDuanSwitch ? 1 : 0 }${
      quXianSwitch ? 1 : 0 }`;

    let s = parseInt(t, 2);
    let params = this.convert(s) + this.convert(defaultBright)
            + this._addZero(defaultTemp.toString(16), 4);
    return parseInt(params, 16);
  }

  static getPowerOnParams(powerOnState) {
    let t = `${ powerOnState ? 1 : 0 }${
      turnOnState ? 1 : 0 }${
      acStatus ? 1 : 0 }${
      traverse_switch ? 1 : 0 }${
      isShowHelpLight ? 1 : 0 }${
      helpLight ? 1 : 0 }${
      fenDuanSwitch ? 1 : 0 }${
      quXianSwitch ? 1 : 0 }`;

    let s = parseInt(t, 2);
    let params = this.convert(s) + this.convert(defaultBright)
            + this._addZero(defaultTemp.toString(16), 4);
    return parseInt(params, 16);
  }

  static getTurnOnParams(turnOnState) {
    console.log(`turnOnState->${ turnOnState }`);
    let t = `${ powerOnState ? 1 : 0 }${
      turnOnState ? 1 : 0 }${
      acStatus ? 1 : 0 }${
      traverse_switch ? 1 : 0 }${
      isShowHelpLight ? 1 : 0 }${
      helpLight ? 1 : 0 }${
      fenDuanSwitch ? 1 : 0 }${
      quXianSwitch ? 1 : 0 }`;

    let s = parseInt(t, 2);
    console.log(`s->${ s }`);
    let params = this.convert(s) + this.convert(defaultBright)
            + this._addZero(defaultTemp.toString(16), 4);
    return parseInt(params, 16);
  }

  static getFenduanParams(fenduan) {
    console.log(`fenduan->${ fenduan }`);
    let t = `${ powerOnState ? 1 : 0 }${
      turnOnState ? 1 : 0 }${
      acStatus ? 1 : 0 }${
      traverse_switch ? 1 : 0 }${
      isShowHelpLight ? 1 : 0 }${
      helpLight ? 1 : 0 }${
      fenduan ? 1 : 0 }${
      quXianSwitch ? 1 : 0 }`;

    let s = parseInt(t, 2);
    console.log(`s->${ s }`);
    let params = this.convert(s) + this.convert(defaultBright)
            + this._addZero(defaultTemp.toString(16), 4);
    return parseInt(params, 16);
  }

  static getQuxianParams(quxian) {
    console.log(`quxian->${ quxian }`);
    let t = `${ powerOnState ? 1 : 0 }${
      turnOnState ? 1 : 0 }${
      acStatus ? 1 : 0 }${
      traverse_switch ? 1 : 0 }${
      isShowHelpLight ? 1 : 0 }${
      helpLight ? 1 : 0 }${
      fenDuanSwitch ? 1 : 0 }${
      quxian ? 1 : 0 }`;

    let s = parseInt(t, 2);
    console.log(`s->${ s }`);
    let params = this.convert(s) + this.convert(defaultBright)
            + this._addZero(defaultTemp.toString(16), 4);
    return parseInt(params, 16);
  }


  static getSetStartColorParams(startColor) {
    let t = `${
      sleep ? 1 : 0 }${
      number.getBitValue(sleep_time, 6) }${
      number.getBitValue(sleep_time, 5) }${
      number.getBitValue(sleep_time, 4) }${
      number.getBitValue(sleep_time, 3) }${
      number.getBitValue(sleep_time, 2) }${
      number.getBitValue(sleep_time, 1) }${
      number.getBitValue(sleep_time, 0) }`;

    let s = parseInt(t, 2);
    let params = this.convert(s) + this.convert(startBright) + this._addZero(startColor.toString(16), 4);
    return parseInt(params, 16);
  }

  static getSetStartBrightParams(startBright) {
    let t = `${
      sleep ? 1 : 0 }${
      number.getBitValue(sleep_time, 6) }${
      number.getBitValue(sleep_time, 5) }${
      number.getBitValue(sleep_time, 4) }${
      number.getBitValue(sleep_time, 3) }${
      number.getBitValue(sleep_time, 2) }${
      number.getBitValue(sleep_time, 1) }${
      number.getBitValue(sleep_time, 0) }`;

    let s = parseInt(t, 2);
    let params = this.convert(s) + this.convert(startBright) + this._addZero(startColor.toString(16), 4);
    return parseInt(params, 16);
  }

  static getSetSleepTimeParams(sleep_time) {
    let t = `${
      sleep ? 1 : 0 }${
      number.getBitValue(sleep_time, 6) }${
      number.getBitValue(sleep_time, 5) }${
      number.getBitValue(sleep_time, 4) }${
      number.getBitValue(sleep_time, 3) }${
      number.getBitValue(sleep_time, 2) }${
      number.getBitValue(sleep_time, 1) }${
      number.getBitValue(sleep_time, 0) }`;

    let s = parseInt(t, 2);
    let params = this.convert(s) + this.convert(startBright) + this._addZero(startColor.toString(16), 4);
    return parseInt(params, 16);
  }

  static getSetAwakeTimeParams(awake_time) {
    let t = `${
      awake ? 1 : 0 }${
      number.getBitValue(awake_time, 6) }${
      number.getBitValue(awake_time, 5) }${
      number.getBitValue(awake_time, 4) }${
      number.getBitValue(awake_time, 3) }${
      number.getBitValue(awake_time, 2) }${
      number.getBitValue(awake_time, 1) }${
      number.getBitValue(awake_time, 0) }`;

    let s = parseInt(t, 2);
    let params = this.convert(s) + this.convert(endBright) + this._addZero(endColor.toString(16), 4);
    return parseInt(params, 16);
  }

  static getSetAwakeParams(awake) {
    let t = `${
      awake ? 1 : 0 }${
      number.getBitValue(awake_time, 6) }${
      number.getBitValue(awake_time, 5) }${
      number.getBitValue(awake_time, 4) }${
      number.getBitValue(awake_time, 3) }${
      number.getBitValue(awake_time, 2) }${
      number.getBitValue(awake_time, 1) }${
      number.getBitValue(awake_time, 0) }`;

    let s = parseInt(t, 2);
    let params = this.convert(s) + this.convert(endBright) + this._addZero(endColor.toString(16), 4);
    return parseInt(params, 16);
  }

  static getSetAwakeAllParams(endBright, endColor, awake) {
    let t = `${
      awake ? 1 : 0 }${
      number.getBitValue(awake_time, 6) }${
      number.getBitValue(awake_time, 5) }${
      number.getBitValue(awake_time, 4) }${
      number.getBitValue(awake_time, 3) }${
      number.getBitValue(awake_time, 2) }${
      number.getBitValue(awake_time, 1) }${
      number.getBitValue(awake_time, 0) }`;

    let s = parseInt(t, 2);

    let params = this.convert(s) + this.convert(endBright) + this._addZero(endColor.toString(16), 4);
    return parseInt(params, 16);
  }

  static getSetSleepParams(sleep) {
    let t = `${
      sleep ? 1 : 0 }${
      number.getBitValue(sleep_time, 6) }${
      number.getBitValue(sleep_time, 5) }${
      number.getBitValue(sleep_time, 4) }${
      number.getBitValue(sleep_time, 3) }${
      number.getBitValue(sleep_time, 2) }${
      number.getBitValue(sleep_time, 1) }${
      number.getBitValue(sleep_time, 0) }`;

    let s = parseInt(t, 2);
    let params = this.convert(s) + this.convert(startBright) + this._addZero(startColor.toString(16), 4);
    return parseInt(params, 16);
  }

  static getSetSleepAllParams(startBright, startColor, sleep) {
    console.log(`startBright=${ startBright }`);
    console.log(`startColor=${ startColor }`);
    console.log(`sleep=${ sleep }`);

    let t = `${
      sleep ? 1 : 0 }${
      number.getBitValue(sleep_time, 6) }${
      number.getBitValue(sleep_time, 5) }${
      number.getBitValue(sleep_time, 4) }${
      number.getBitValue(sleep_time, 3) }${
      number.getBitValue(sleep_time, 2) }${
      number.getBitValue(sleep_time, 1) }${
      number.getBitValue(sleep_time, 0) }`;

    let s = parseInt(t, 2);

    let params = this.convert(s) + this.convert(startBright) + this._addZero(startColor.toString(16), 4);
    return parseInt(params, 16);
  }

  static parse3_2(data) {
    let bytes = this.intToBytesBigEndian(data, 4);
    console.log(`
        parse3_2->${ this.bytesToHexString(bytes) }`);
    startColor = (((bytes[1] & 0xff) << 8) | bytes[0] & 0xff);
    startBright = bytes[2];
    sleep_time = this.getBits(bytes[3], 0, 7);
    sleep = this.getBits(bytes[3], 7, 1) == 1;

    console.log(`
        startColor->${ startColor }`);
    console.log(`
        startBright->${ startBright }`);
    console.log(`
        sleep_time->${ sleep_time }`);
    console.log(`
        sleep->${ sleep }`);
  }

  static parse3_3(data) {
    let bytes = this.intToBytesBigEndian(data, 4);
    endColor = (((bytes[1] & 0xff) << 8) | bytes[0] & 0xff);
    endBright = bytes[2];
    awake_time = this.getBits(bytes[3], 0, 7);
    awake = this.getBits(bytes[3], 7, 1) == 1;

    console.log(`
        endColor->${ endColor }`);
    console.log(`
        endBright->${ endBright }`);
    console.log(`
        awake_time->${ awake_time }`);
    console.log(`
        awake->${ awake }`);
  }

  static parse3_4(data) {
    let bytes = this.intToBytesBigEndian(data, 4);
    startMin = bytes[0];
    startHour = bytes[1];
    endMin = bytes[2];
    endHour = this.getBits(bytes[3], 0, 7);
    nightLightSwitch = this.getBits(bytes[3], 7, 1) == 1;

    console.log(`
        startMin->${ startMin }`);
    console.log(`
        startHour->${ startHour }`);
    console.log(`
        endMin->${ endMin }`);
    console.log(`
        endHour->${ endHour }`);
    console.log(`
        nightLightSwitch->${ nightLightSwitch }`);
  }

  static get3_8() {
    return [breakMode, breakTemp2, breakBright2, breakTemp1, breakBright1, breakTime];
  }

  static parse3_8(data) {
    // 解析呼吸
    let binArray = this.reverseString(this._addZero(data.toString(2), 32));
    console.log(`binArray->${ this.reverseString(binArray.toString(2)) }`);
    breakMode = parseInt(this.reverseString(binArray.substring(1, 2)), 2);
    breakTemp2 = parseInt(this.reverseString(binArray.substring(2, 8)), 2);
    breakBright2 = parseInt(this.reverseString(binArray.substring(8, 15)), 2);
    breakTemp1 = parseInt(this.reverseString(binArray.substring(15, 21)), 2);
    breakBright1 = parseInt(this.reverseString(binArray.substring(21, 28)), 2);
    breakTime = parseInt(this.reverseString(binArray.substring(28, 32)), 2);

    console.log(`oo->${ this.reverseString(binArray.substring(21, 28)) }`);

    console.log(`
        breakMode->${ breakMode }`);
    console.log(`
        breakTemp2->${ breakTemp2 }`);
    console.log(`
        breakBright2->${ breakBright2 }`);
    console.log(`
        breakTemp1->${ breakTemp1 }`);
    console.log(`
        breakBright1->${ breakBright1 }`);
    console.log(`
        breakTime->${ breakTime }`);
  }

  static set3_8(breakMode, breakTemp2, breakBright2, breakTemp1, breakBright1, breakTime) {
    // 设置呼吸
    let breakTimeBinArray = this._addZero(breakTime.toString(2), 4);
    console.log(`breakTimeBinArray->${ breakTimeBinArray }`);

    let breakBright1BinArray = this._addZero(breakBright1.toString(2), 7);
    let breakTemp1BinArray = this._addZero(breakTemp1.toString(2), 6);
    let breakBright2BinArray = this._addZero(breakBright2.toString(2), 7);
    let breakTemp2BinArray = this._addZero(breakTemp2.toString(2), 6);
    let breakModeBinArray = this._addZero(breakMode.toString(2), 1);

    //  0101 0010011 000000 0010011  011001 1 0

    let command = parseInt(`${ breakTimeBinArray +
            breakBright1BinArray +
            breakTemp1BinArray +
            breakBright2BinArray +
            breakTemp2BinArray +
            breakModeBinArray }0`, 2);

    return command;
  }

  static get3_9() {
    return [ldMode, ldTemp2, ldBright2, ldTemp1, ldBright1, ldTime];
  }

  static parse3_9(data) {
    // 解析律动
    let binArray = this.reverseString(this._addZero(data.toString(2), 32));
    console.log(`binArray->${ this.reverseString(data.toString(2)) }`);
    ldMode = parseInt(this.reverseString(binArray.substring(1, 2)), 2);
    ldTemp2 = parseInt(this.reverseString(binArray.substring(2, 8)), 2);
    ldBright2 = parseInt(this.reverseString(binArray.substring(8, 15)), 2);
    ldTemp1 = parseInt(this.reverseString(binArray.substring(15, 21)), 2);
    ldBright1 = parseInt(this.reverseString(binArray.substring(21, 28)), 2);
    ldTime = parseInt(this.reverseString(binArray.substring(28, 32)), 2);

    console.log(`
        ldMode->${ ldMode }`);
    console.log(`
        ldTemp2->${ ldTemp2 }`);
    console.log(`
        ldBright2->${ ldBright2 }`);
    console.log(`
        ldTemp1->${ ldTemp1 }`);
    console.log(`
        ldBright1->${ ldBright1 }`);
    console.log(`
        ldTime->${ ldTime }`);
  }

  static getJl1() {
    return jvLight1;
  }

  static getJl2() {
    return jvLight2;
  }

  static getJl3() {
    return jvLight3;
  }

  static getJl4() {
    return jvLight4;
  }

  static getJl5() {
    return jvLight5;
  }

  static getJl6() {
    return jvLight6;
  }

  static setJL(enable, time, temp, bright, custom_time, mode) {
    // 设置节律
    let enableBinArray = this._addZero(enable.toString(2), 1);
    let timeBinArray = this._addZero(time.toString(2), 11);
    let tempBinArray = this._addZero(((temp - 2700) / 100).toString(2), 6);
    let brightBinArray = this._addZero(bright.toString(2), 7);
    let custom_timeBinArray = this._addZero(custom_time.toString(2), 5);
    let modeBinArray = this._addZero(mode.toString(2), 2);

    console.log(`aa->${ modeBinArray 
    }${ custom_timeBinArray 
    }${ brightBinArray 
    }${ tempBinArray 
    }${ timeBinArray }${ enableBinArray }`);

    let command = parseInt(modeBinArray +
            custom_timeBinArray +
            brightBinArray +
            tempBinArray +
            timeBinArray + enableBinArray, 2);

    return command;
  }

  static resetJv() {
    jvSwitch = false;
    jvRepeat = [1, 2, 3, 4, 5, 6, 7];
    jvLight1 = {
      "enable": 1,
      "time": 450,
      "temp": 4600,
      "bright": 100,
      "custom_time": 15,
      "mode": 3
    };
    jvLight2 = {
      "enable": 1,
      "time": 630,
      "temp": 6500,
      "bright": 100,
      "custom_time": 10,
      "mode": 2
    };
    jvLight3 = {
      "enable": 1,
      "time": 765,
      "temp": 4600,
      "bright": 0,
      "custom_time": 5,
      "mode": 3
    };
    jvLight4 = {
      "enable": 1,
      "time": 825,
      "temp": 6500,
      "bright": 100,
      "custom_time": 5,
      "mode": 3
    };
    jvLight5 = {
      "enable": 1,
      "time": 1110,
      "temp": 3800,
      "bright": 100,
      "custom_time": 20,
      "mode": 3
    };
    jvLight6 = {
      "enable": 1,
      "time": 1410,
      "temp": 2700,
      "bright": 0,
      "custom_time": 25,
      "mode": 3
    };
  }

  static parse3_7(data) {
    // 解析节律1
    let binArray = this.reverseString(this._addZero(data.toString(2), 32));
    console.log(`binArray->${ binArray }`);

    let enable = parseInt(this.reverseString(binArray.substring(0, 1)), 2);
    let time = parseInt(this.reverseString(binArray.substring(1, 12)), 2);
    let temp = parseInt(this.reverseString(binArray.substring(12, 18)), 2) * 100 + 2700;
    let bright = parseInt(this.reverseString(binArray.substring(18, 25)), 2);
    let custom_time = parseInt(this.reverseString(binArray.substring(25, 30)), 2);
    let mode = parseInt(this.reverseString(binArray.substring(30, 32)), 2);

    console.log(`
        time->${ time }`);
    console.log(`
        temp->${ temp }`);
    console.log(`
        bright->${ bright }`);
    console.log(`
        custom_time->${ custom_time }`);
    console.log(`
        mode->${ mode }`);

    jvLight1 = {
      "enable": enable,
      "time": time,
      "temp": temp,
      "bright": bright,
      "custom_time": custom_time,
      "mode": mode
    };
  }

  static parse3_10(data) {
    // 解析节律2
    let binArray = this.reverseString(this._addZero(data.toString(2), 32));
    console.log(`binArray->${ data.toString(2) }`);

    let enable = parseInt(this.reverseString(binArray.substring(0, 1)), 2);
    let time = parseInt(this.reverseString(binArray.substring(1, 12)), 2);
    let temp = parseInt(this.reverseString(binArray.substring(12, 18)), 2) * 100 + 2700;
    let bright = parseInt(this.reverseString(binArray.substring(18, 25)), 2);
    let custom_time = parseInt(this.reverseString(binArray.substring(25, 30)), 2);
    let mode = parseInt(this.reverseString(binArray.substring(30, 32)), 2);

    console.log(`
        time->${ time }`);
    console.log(`
        temp->${ temp }`);
    console.log(`
        bright->${ bright }`);
    console.log(`
        custom_time->${ custom_time }`);
    console.log(`
        mode->${ mode }`);

    jvLight2 = {
      "enable": enable,
      "time": time,
      "temp": temp,
      "bright": bright,
      "custom_time": custom_time,
      "mode": mode
    };
  }

  static parse3_11(data) {
    // 解析节律3
    let binArray = this.reverseString(this._addZero(data.toString(2), 32));
    console.log(`binArray->${ data.toString(2) }`);

    let enable = parseInt(this.reverseString(binArray.substring(0, 1)), 2);
    let time = parseInt(this.reverseString(binArray.substring(1, 12)), 2);
    let temp = parseInt(this.reverseString(binArray.substring(12, 18)), 2) * 100 + 2700;
    let bright = parseInt(this.reverseString(binArray.substring(18, 25)), 2);
    let custom_time = parseInt(this.reverseString(binArray.substring(25, 30)), 2);
    let mode = parseInt(this.reverseString(binArray.substring(30, 32)), 2);

    console.log(`
        time->${ time }`);
    console.log(`
        temp->${ temp }`);
    console.log(`
        bright->${ bright }`);
    console.log(`
        custom_time->${ custom_time }`);
    console.log(`
        mode->${ mode }`);

    jvLight3 = {
      "enable": enable,
      "time": time,
      "temp": temp,
      "bright": bright,
      "custom_time": custom_time,
      "mode": mode
    };
  }

  static parse3_12(data) {
    // 解析节律4
    let binArray = this.reverseString(this._addZero(data.toString(2), 32));
    console.log(`binArray->${ data.toString(2) }`);

    let enable = parseInt(this.reverseString(binArray.substring(0, 1)), 2);
    let time = parseInt(this.reverseString(binArray.substring(1, 12)), 2);
    let temp = parseInt(this.reverseString(binArray.substring(12, 18)), 2) * 100 + 2700;
    let bright = parseInt(this.reverseString(binArray.substring(18, 25)), 2);
    let custom_time = parseInt(this.reverseString(binArray.substring(25, 30)), 2);
    let mode = parseInt(this.reverseString(binArray.substring(30, 32)), 2);

    console.log(`
        time->${ time }`);
    console.log(`
        temp->${ temp }`);
    console.log(`
        bright->${ bright }`);
    console.log(`
        custom_time->${ custom_time }`);
    console.log(`
        mode->${ mode }`);

    jvLight4 = {
      "enable": enable,
      "time": time,
      "temp": temp,
      "bright": bright,
      "custom_time": custom_time,
      "mode": mode
    };
  }

  static parse3_13(data) {
    // 解析节律5
    let binArray = this.reverseString(this._addZero(data.toString(2), 32));
    console.log(`binArray->${ data.toString(2) }`);

    let enable = parseInt(this.reverseString(binArray.substring(0, 1)), 2);
    let time = parseInt(this.reverseString(binArray.substring(1, 12)), 2);
    let temp = parseInt(this.reverseString(binArray.substring(12, 18)), 2) * 100 + 2700;
    let bright = parseInt(this.reverseString(binArray.substring(18, 25)), 2);
    let custom_time = parseInt(this.reverseString(binArray.substring(25, 30)), 2);
    let mode = parseInt(this.reverseString(binArray.substring(30, 32)), 2);

    console.log(`
        time->${ time }`);
    console.log(`
        temp->${ temp }`);
    console.log(`
        bright->${ bright }`);
    console.log(`
        custom_time->${ custom_time }`);
    console.log(`
        mode->${ mode }`);

    jvLight5 = {
      "enable": enable,
      "time": time,
      "temp": temp,
      "bright": bright,
      "custom_time": custom_time,
      "mode": mode
    };
  }

  static parse3_14(data) {
    // 解析节律6
    let binArray = this.reverseString(this._addZero(data.toString(2), 32));
    console.log(`binArray->${ data.toString(2) }`);

    let enable = parseInt(this.reverseString(binArray.substring(0, 1)), 2);
    let time = parseInt(this.reverseString(binArray.substring(1, 12)), 2);
    let temp = parseInt(this.reverseString(binArray.substring(12, 18)), 2) * 100 + 2700;
    let bright = parseInt(this.reverseString(binArray.substring(18, 25)), 2);
    let custom_time = parseInt(this.reverseString(binArray.substring(25, 30)), 2);
    let mode = parseInt(this.reverseString(binArray.substring(30, 32)), 2);

    console.log(`
        time->${ time }`);
    console.log(`
        temp->${ temp }`);
    console.log(`
        bright->${ bright }`);
    console.log(`
        custom_time->${ custom_time }`);
    console.log(`
        mode->${ mode }`);

    jvLight6 = {
      "enable": enable,
      "time": time,
      "temp": temp,
      "bright": bright,
      "custom_time": custom_time,
      "mode": mode
    };
  }

  static set3_9(ldMode, ldTemp2, ldBright2, ldTemp1, ldBright1, ldTime) {
    // 设置呼吸
    let ldTimeBinArray = this._addZero(ldTime.toString(2), 4);
    let ldBright1BinArray = this._addZero(ldBright1.toString(2), 7);
    let ldTemp1BinArray = this._addZero(ldTemp1.toString(2), 6);
    let ldBright2BinArray = this._addZero(ldBright2.toString(2), 7);
    let ldTemp2BinArray = this._addZero(ldTemp2.toString(2), 6);
    let ldModeBinArray = this._addZero(ldMode.toString(2), 1);

    //  0101 0010011 000000 0010011  011001 1 0

    let command = parseInt(`${ ldTimeBinArray +
            ldBright1BinArray +
            ldTemp1BinArray +
            ldBright2BinArray +
            ldTemp2BinArray +
            ldModeBinArray }0`, 2);

    return command;
  }

  static parseJLD(data) {
    // 解析节律灯
    let binArray = this.reverseString(data.toString(2));
    console.log(`binArray->${ data.toString(2) }`);

    let time = parseInt(binArray.substring(1, 12), 2);
    let temp = parseInt(binArray.substring(12, 18), 2);
    let bright = parseInt(binArray.substring(18, 25), 2);
    let customTime = parseInt(binArray.substring(25, 30), 2);
    let mode = parseInt(binArray.substring(30, 32), 2);

    console.log(`
        time->${ time }`);
    console.log(`
        temp->${ temp }`);
    console.log(`
        bright->${ bright }`);
    console.log(`
        customTime->${ customTime }`);
    console.log(`
        mode->${ mode }`);
  }

  static getNightLightSwitchParams(nightLightSwitch) {
    console.log(`
        nightLightSwitch->${ nightLightSwitch }`);
    let t = `${
      nightLightSwitch ? 1 : 0 }${
      number.getBitValue(endHour, 6) }${
      number.getBitValue(endHour, 5) }${
      number.getBitValue(endHour, 4) }${
      number.getBitValue(endHour, 3) }${
      number.getBitValue(endHour, 2) }${
      number.getBitValue(endHour, 1) }${
      number.getBitValue(endHour, 0) }`;

    let s = parseInt(t, 2);
    console.log(`
        s->${ s }`);
    let params = this.convert(s) + this.convert(endMin)
            + this.convert(startHour)
            + this.convert(startMin);
    return parseInt(params, 16);
  }

  static getNightLightStartParams(startHour, startMin) {
    let t = `${
      nightLightSwitch ? 1 : 0 }${
      number.getBitValue(endHour, 6) }${
      number.getBitValue(endHour, 5) }${
      number.getBitValue(endHour, 4) }${
      number.getBitValue(endHour, 3) }${
      number.getBitValue(endHour, 2) }${
      number.getBitValue(endHour, 1) }${
      number.getBitValue(endHour, 0) }`;

    let s = parseInt(t, 2);
    let params = this.convert(s) + this.convert(endMin)
            + this.convert(startHour)
            + this.convert(startMin);
    return parseInt(params, 16);
  }

  static getNightLightEndParams(endHour, endMin) {
    let t = `${
      nightLightSwitch ? 1 : 0 }${
      number.getBitValue(endHour, 6) }${
      number.getBitValue(endHour, 5) }${
      number.getBitValue(endHour, 4) }${
      number.getBitValue(endHour, 3) }${
      number.getBitValue(endHour, 2) }${
      number.getBitValue(endHour, 1) }${
      number.getBitValue(endHour, 0) }`;

    let s = parseInt(t, 2);
    let params = this.convert(s) + this.convert(endMin)
            + this.convert(startHour)
            + this.convert(startMin);
    return parseInt(params, 16);
  }


  static parse3_5(data) {
    let bytes = this.intToBytesBigEndian(data, 4);
    gradient_duration_aj = bytes[1];
    gradient_duration_off = bytes[2];
    gradient_duration_on = bytes[3];

    console.log(`
        gradient_duration_aj->${ gradient_duration_aj }`);
    console.log(`
        gradient_duration_off->${ gradient_duration_off }`);
    console.log(`
        gradient_duration_on->${ gradient_duration_on }`);
  }

  static getGradientDurationParams(gradient_duration_on, gradient_duration_off, gradient_duration_aj) {
    let params = `${ this.convert(gradient_duration_on) +
        this.convert(gradient_duration_off) +
        this.convert(gradient_duration_aj)
    }00`;

    console.log(`getGradientDurationParams->${ params }`);
    return parseInt(params, 16);
  }

  static getGradientDurationAjParams(gradient_duration_aj) {
    let params = `${ this.convert(gradient_duration_on) +
        this.convert(gradient_duration_off) +
        this.convert(gradient_duration_aj)
    }00`;
    return parseInt(params, 16);
  }

  static getGradientDurationOffParams(gradient_duration_off) {
    let params = `${ this.convert(gradient_duration_on) +
        this.convert(gradient_duration_off) +
        this.convert(gradient_duration_aj)
    }00`;
    return parseInt(params, 16);
  }

  static getGradientDurationOnParams(gradient_duration_on) {
    console.log(`gradient_duration_on->${ gradient_duration_on }`);
    let params = `${ this.convert(gradient_duration_on) +
        this.convert(gradient_duration_off) +
        this.convert(gradient_duration_aj)
    }00`;
    console.log(`
        params->${ params }`);
    return parseInt(params, 16);
  }


  static getMinimumBriSetParams(minimum_bri_set) {
    let t = `${
      jvSwitch ? 1 : 0 }${
      jvRepeat.indexOf(7) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(6) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(5) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(4) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(3) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(2) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(1) != -1 ? 1 : 0 }`;

    let s = parseInt(t, 2);

    console.log(`minimum_bri_set.toString(16) ->${ minimum_bri_set.toString(16) }`);
    let params = `${ minimum_bri_factory.toString(16) + minimum_bri_set.toString(16) }00${ this.convert(s) }`;
    return parseInt(params, 16);
  }

  static getJvRepeat() {
    return jvRepeat;
  }

  static getJvSwitch() {
    return jvSwitch;
  }

  static setJvSwitch2(isOpen, jvRepeat) {
    let t = `${
      isOpen ? 1 : 0 }${
      jvRepeat.indexOf(7) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(6) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(5) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(4) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(3) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(2) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(1) != -1 ? 1 : 0 }`;

    let s = parseInt(t, 2);

    let params = `${ this._addZero(minimum_bri_factory.toString(16), 2) + this._addZero(minimum_bri_set.toString(16), 2) }00${ this.convert(s) }`;
    return parseInt(params, 16);
  }

  static setJvSwitch(isOpen) {
    let t = `${
      isOpen ? 1 : 0 }${
      jvRepeat.indexOf(7) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(6) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(5) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(4) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(3) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(2) != -1 ? 1 : 0 }${
      jvRepeat.indexOf(1) != -1 ? 1 : 0 }`;

    let s = parseInt(t, 2);

    let params = `${ this._addZero(minimum_bri_factory.toString(16), 2) + this._addZero(minimum_bri_set.toString(16), 2) }00${ this.convert(s) }`;
    return parseInt(params, 16);
  }

  static setJvRepeat(repeat) {
    let t = `${
      jvSwitch ? 1 : 0 }${
      repeat.indexOf(7) != -1 ? 1 : 0 }${
      repeat.indexOf(6) != -1 ? 1 : 0 }${
      repeat.indexOf(5) != -1 ? 1 : 0 }${
      repeat.indexOf(4) != -1 ? 1 : 0 }${
      repeat.indexOf(3) != -1 ? 1 : 0 }${
      repeat.indexOf(2) != -1 ? 1 : 0 }${
      repeat.indexOf(1) != -1 ? 1 : 0 }`;

    let s = parseInt(t, 2);

    let params = `${ this._addZero(minimum_bri_factory.toString(16), 2) + this._addZero(minimum_bri_set.toString(16), 2) }00${ this.convert(s) }`;
    return parseInt(params, 16);
  }

  static parse3_6(data) {
    let bytes = this.intToBytesBigEndian(data, 4);

    minimum_bri_factory = bytes[3];
    minimum_bri_set = bytes[2];

    let repeat = bytes[0];
    jvRepeat = [];
    if (number.getBitValue(repeat, 0) == 1) {
      jvRepeat.push(1);
    }
    if (number.getBitValue(repeat, 1) == 1) {
      jvRepeat.push(2);
    }
    if (number.getBitValue(repeat, 2) == 1) {
      jvRepeat.push(3);
    }
    if (number.getBitValue(repeat, 3) == 1) {
      jvRepeat.push(4);
    }
    if (number.getBitValue(repeat, 4) == 1) {
      jvRepeat.push(5);
    }
    if (number.getBitValue(repeat, 5) == 1) {
      jvRepeat.push(6);
    }
    if (number.getBitValue(repeat, 6) == 1) {
      jvRepeat.push(7);
    }
    jvSwitch = number.getBitValue(repeat, 7) == 1;

    console.log(`
        minimum_bri_set->${ minimum_bri_set }`);
    console.log(`
        minimum_bri_factory->${ minimum_bri_factory }`);
  }

  static getHelpLight() {
    return [isShowHelpLight, helpLight];
  }


  static saveWifiProfessData(_wifi_gradient_duration_on, _wifi_gradient_duration_off, _wifi_gradient_duration_aj,) {
    wifi_gradient_duration_on = _wifi_gradient_duration_on;
    wifi_gradient_duration_off = _wifi_gradient_duration_off;
    wifi_gradient_duration_aj = _wifi_gradient_duration_aj;
  }

  static getWifiProfessData() {
    return [wifi_gradient_duration_on, wifi_gradient_duration_off, wifi_gradient_duration_aj];
  }

  static saveProfessData(_gradient_duration_on, _gradient_duration_off, _gradient_duration_aj, _minimum_bri_factory, _minimum_bri_set) {
    gradient_duration_on = _gradient_duration_on;
    gradient_duration_off = _gradient_duration_off;
    gradient_duration_aj = _gradient_duration_aj;
    minimum_bri_factory = _minimum_bri_factory;
    minimum_bri_set = _minimum_bri_set;
  }

  static getProfessData() {
    return [gradient_duration_on, gradient_duration_off, gradient_duration_aj, minimum_bri_factory, minimum_bri_set];
  }


  static getNightLightData() {
    return [nightLightSwitch, startHour, startMin, endHour, endMin];
  }

  static saveAwakeData(_sleep_time, _sleep, _awake_time, _awake, _startBright, _endBright, _startColor, _endColor) {
    sleep_time = _sleep_time;
    sleep = _sleep;
    awake_time = _awake_time;
    awake = _awake;
    startBright = _startBright;
    endBright = _endBright;
    startColor = _startColor;
    endColor = _endColor;
  }

  static getAwakeData() {
    return [sleep_time, sleep, awake_time, awake, startBright, endBright, startColor, endColor];
  }

  static saveDefaultData(_lightPower, _brightness, _color_temperature, _powerOnState, _turnOnState, _defaultBright, _defaultTemp) {
    lightPower = _lightPower;
    brightness = _brightness;
    color_temperature = _color_temperature;
    powerOnState = _powerOnState;
    turnOnState = _turnOnState;
    defaultBright = _defaultBright;
    defaultTemp = _defaultTemp;
  }

  static getFenDuanData() {
    return [fenDuanSwitch];
  }

  static getQuXianData() {
    return [quXianSwitch];
  }

  static getDefaultData() {
    return [lightPower, brightness, color_temperature, powerOnState, turnOnState, defaultBright, defaultTemp];
  }

  static saveTraverseSwitchData(_traverse_switch) {
    traverse_switch = _traverse_switch;
  }

  static getTraverseSwitchData() {
    return [traverse_switch];
  }

  static setLightPower(_lightPower) {
    lightPower = _lightPower;
  }

  static setBrightness(_brightness) {
    brightness = _brightness;
  }

  static setColorTemperature(_color_temperature) {
    color_temperature = _color_temperature;
  }

  static reverseString(str) {
    let reversedStr = '';
    for (let i = str.length - 1; i >= 0; i--) {
      reversedStr += str[i];
    }
    return reversedStr;
  }

  static _addZero(string, length) { // 补齐0  补齐n位
    let temp = string;
    if (string.toString().length != length)
      for (let i = 0; i < length - string.toString().length; i++) {
        temp = `0${ temp }`;
      }

    return temp;
  }
}