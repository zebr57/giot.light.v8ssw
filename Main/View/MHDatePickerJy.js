import PropTypes from 'prop-types';
import React from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight, TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import HomeLocalizableString from '../HomeLocalizableString';
import { strings, Styles } from '../../../../miot-sdk/resources';
import { formatString } from '../../../../miot-sdk/resources/Strings';
import Separator from '../../../../miot-sdk/ui/Separator';
import StringSpinner from "../../../../miot-sdk/ui/StringSpinner";
import { FontDefault } from "../../../../miot-sdk/utils/fonts";
import DataUtils from "../Utils/DataUtils";

/**
 * @description 时间选择器类型
 * @enum {string}
 */
const TYPE = {
  /**
     * 单个picker
     */
  SINGLE: 'single',
  /**
     * 选择小时分钟，24小时制
     */
  TIME24: 'time24',
  /**
     * 选择小时分钟，12小时制
     */
  TIME12: 'time12',
  /**
     * 选择年月日
     */
  DATE: 'date'
};
Object.freeze(TYPE);
/**
 * @description 单个picker时选择器的类型，也就是显示的单位
 * @enum {string}
 */
const SINGLE_TYPE = {
  /**
     * 月
     */
  MONTH: 'month',
  /**
     * 日
     */
  DAY: 'day',
  /**
     * 时
     */
  HOUR: 'hour',
  /**
     * 分
     */
  MINUTE: 'minute',
  /**
     * 秒
     */
  SECOND: 'second'
};
Object.freeze(SINGLE_TYPE);

/**
 *
 * @param {number} length
 * @param {bool} zeroPrefix 是否前补0
 * @param {bool} fromZero 是否从0开始
 */
function constructArray(length, zeroPrefix = true, fromZero = false) {
  const maxLength = (length - (fromZero ? 1 : 0)).toString().length;
  return Array.from({ length }, (v, i) => {
    return ((zeroPrefix ? '0000000000000' : '') + (i + (fromZero ? 0 : 1))).slice(-maxLength);
  });
}

const screenBackgroundColor = 'rgba(0,0,0,0.4)';
const margin = 10;
const borderRadius = 20;
const titleHeightThin = 66;
const titleHeightFat = 85;
const rowHeight = 52;
const pickerContainerHeight = Platform.select({ android: rowHeight * 5, ios: 220 });
const buttonHeight = 46;
const { width, height } = Dimensions.get('window');
const modalWidth = width;
// 选择器样式，固定
const pickerInnerStyle = {
  lineColor: '#rgba(0,0,0,0)',
  textColor: '#666666',
  fontSize: 15,
  selectTextColor: "#4396EB",
  selectFontSize: 20,
  unitTextColor: '#4396EB',
  unitFontSize: 10,
  rowHeight
  // selectBgColor: "#f3f3f3"
};
const months = constructArray(12, 1, 0);
const days = constructArray(31, 1, 0);
const hours24 = constructArray(24, 1, 1);
const timeSystem = [strings.am, strings.pm];
const hours12 = hours24.slice(1, 13);
const minutes = constructArray(60, 1, 1);
const singleDataSource = {
  [SINGLE_TYPE.MONTH]: months,
  [SINGLE_TYPE.DAY]: days,
  [SINGLE_TYPE.HOUR]: constructArray(24, 1, 0),
  [SINGLE_TYPE.MINUTE]: constructArray(60, 1, 0),
  [SINGLE_TYPE.SECOND]: constructArray(60, 1, 0)
};
Object.freeze(singleDataSource);
const days31 = ['01', '03', '05', '07', '08', '10', '12'];
const days30 = ['04', '06', '09', '11'];
const defaultYearOffset = 15;
/**
 * @export
 * @author Geeook
 * @since 10021
 * @module MHDatePicker
 * @description 米家插件常用的时间选择器
 * @param {string} animationType - modal 显示动效, 参考 https://facebook.github.io/react-native/docs/0.54/modal#animationtype
 * @param {bool} visible -  是否显示 modal, 参考 https://facebook.github.io/react-native/docs/0.54/modal#visible
 * @param {string} title - 标题
 * @param {bool} showSubtitle - 是否显示副标题，副标题显示的内容固定，和`type`有关
 * @param {string} confirmColor - 确定按钮的颜色，默认米家绿
 * @param {TYPE} type - 时间选择器类型, enum('single', 'time24', 'time12', 'date')
 * @param {SINGLE_TYPE} singleType - 单个picker时的选择器类型, enum('month', 'day', 'hour', 'minute', 'second')
 * @param {array<string>|array<number>|Date} current - 当前选中值，可传入数字数组，字符串数组，Date实例，对所有时间选择器类型有效
 * @param {array<string>|array<number>|Date} min - 最小值，可传入数字数组，字符串数组，Date实例，只对`'single'`和`'date'`类型生效。对于 date 类型，默认值：现在向前15年
 * @param {array<string>|array<number>|Date} max - 最大值，可传入数字数组，字符串数组，Date实例，只对`'single'`和`'date'`类型生效。对于 date 类型，默认值：现在向后15年
 * @param {function} onSelect - 选好之后的回调函数，返回所有picker的选中值 组成的数组 / 拼接的字符串 / 以及计算出的Date实例, 详见使用 demo
 * @param {function} onDismiss - 点击`Modal`内容外面/取消按钮/确定按钮，Modal隐藏时的回调函数
 */
export default class MHDatePicker extends React.Component {
    static propTypes = {
      animationType: PropTypes.string,
      visible: PropTypes.bool,
      title: PropTypes.string,
      showSubtitle: PropTypes.bool,
      confirmColor: PropTypes.string,
      type: PropTypes.oneOf([TYPE.DATE, TYPE.SINGLE, TYPE.TIME12, TYPE.TIME24]),
      singleType: PropTypes.oneOf([
        SINGLE_TYPE.MONTH,
        SINGLE_TYPE.DAY,
        SINGLE_TYPE.HOUR,
        SINGLE_TYPE.MINUTE,
        SINGLE_TYPE.SECOND
      ]),
      current: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.arrayOf(PropTypes.number),
        PropTypes.instanceOf(Date)
      ]),
      min: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.arrayOf(PropTypes.number),
        PropTypes.instanceOf(Date)
      ]),
      max: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.arrayOf(PropTypes.number),
        PropTypes.instanceOf(Date)
      ]),
      onSelect: PropTypes.func,
      onDismiss: PropTypes.func
    }
    static defaultProps = {
      animationType: 'fade',
      visible: false,
      title: '开启时间',
      showSubtitle: true,
      confirmColor: 'xm#4396EB',
      type: TYPE.TIME24,
      singleType: SINGLE_TYPE.MINUTE,
      onSelect: (obj) => console.log(obj)
    }
    /**
     * @description 时间选择器类型
     * @enum {string}
     */
    static TYPE = TYPE;
    /**
     * @description 单个picker时选择器的类型，也就是显示的单位
     * @enum {string}
     */
    static SINGLE_TYPE = SINGLE_TYPE;

    constructor(props, context) {
      super(props, context);
      const { currentArray, dataSourceArray } = this.init(props);
      const subtitle = this.getSubtitle(currentArray);
      console.log(`arr[0]==${ currentArray[0] }`);
      this.state = {
        visible: this.props.visible,
        dataSourceArray, // 待显示的数据源数组
        currentArray, // 当前选中值数组
        subtitle,
        showToast: false,
        unit: HomeLocalizableString.分钟
      };
    }

    /**
     * 根据时间选择器类型、app 语言和初始值数组显示不同模板的副标题文案
     * @param {*} arr
     */
    getSubtitle(arr) {
      if (this.props.type === TYPE.SINGLE) {
        const count = parseInt(arr[0]);
        const unit = count > 1 ? strings[`${ this.props.singleType }s`] : strings[this.props.singleType]; // 英文单复数单位
        return formatString(strings.singleSubTitle, count, unit);
      }
      return formatString({
        [TYPE.DATE]: strings.dateSubTitle,
        [TYPE.TIME24]: strings.time24SubTitle,
        [TYPE.TIME12]: strings.time12SubTitle
      }[this.props.type], ...arr);
    }

    /**
     * 根据类型将 Date 实例或者 Array<number> 转换成 ['','','']形式
     * @param {*} cur
     * @param {string} type
     */
    convert(cur) {
      const { type } = this.props;
      if (cur instanceof Date) {
        switch (type) {
          case TYPE.DATE:
            return this.convert([cur.getFullYear(), cur.getMonth() + 1, cur.getDate()]);
          case TYPE.TIME24:
            return this.convert([cur.getHours(), cur.getMinutes()]);
          case TYPE.TIME12:
            return this.convertTo12([cur.getHours(), cur.getMinutes()]);
          case TYPE.SINGLE:
            return ['01'];
          default:
            return ['01'];
        }
      } else if (cur instanceof Array) {
        switch (type) {
          case TYPE.DATE:
            return cur.slice(0, 3).map((v, i) => i === 0 ? (`${ v }`) : ((`0${ v }`).slice(-2)));
          case TYPE.TIME24:
            return cur.slice(0, 2).map((v) => (`0${ v }`).slice(-2));
          case TYPE.TIME12:
            return this.convertTo12(cur);
          case TYPE.SINGLE:
            // if (parseInt(cur) > 0)
            //     return cur.slice(0, 1).map((v) => (`0${ v }`).slice(-2));
            // else
            return cur;
          default:
            return ['01'];
        }
      }
      // 异常处理1
      else if (typeof cur === 'string'
            || typeof cur === 'number') {
        return [`${ cur }`];
      }
      // 异常处理2
      else {
        return ['01'];
      }
    }

    /**
     * 将24小时制的数组转换成12小时制的数组
     * @param {Array} arr
     */
    convertTo12(arr) {
      if (arr.length === 2) {
        let newArr = arr.map((v) => parseInt(v));
        if (newArr.every((v) => Number.isInteger)) {
          let res;
          if (newArr[0] === 0) {
            res = [strings.am, 12, newArr[1]];
          } else {
            const timeSystem = newArr[0] > 11 ? strings.pm : strings.am; // 下午 12:34
            const hour = newArr[0] > 12 ? `${ newArr[0] - 12 }` : `${ newArr[0] }`;
            const minute = `${ newArr[1] }`;
            res = [timeSystem, hour, minute];
          }
          return res.map((v, i) => i > 0 ? (`0${ v }`).slice(-2) : v);
        }
      }
      return this.convert(new Date());
    }

    /**
     * 截取部分数组
     * @param {array} arr
     * @param {*} head
     * @param {*} tail
     */
    slice(arr, head, tail) {
      if (parseInt(head) == 1 && parseInt(tail) == 30) {
        return [HomeLocalizableString.立即变化, `1${ HomeLocalizableString.s }`, `2${ HomeLocalizableString.s }`, `3${ HomeLocalizableString.s }`, `4${ HomeLocalizableString.s }`, `5${ HomeLocalizableString.s }`, `6${ HomeLocalizableString.s }`, `7${ HomeLocalizableString.s }`, `8${ HomeLocalizableString.s }`, `9${ HomeLocalizableString.s }`, `10${ HomeLocalizableString.s }`
          , `1${ HomeLocalizableString.分钟 }`, `2${ HomeLocalizableString.分钟 }`, `3${ HomeLocalizableString.分钟 }`, `4${ HomeLocalizableString.分钟 }`, `5${ HomeLocalizableString.分钟 }`, `6${ HomeLocalizableString.分钟 }`, `7${ HomeLocalizableString.分钟 }`, `8${ HomeLocalizableString.分钟 }`, `9${ HomeLocalizableString.分钟 }`, `10${ HomeLocalizableString.分钟 }`
          , `11${ HomeLocalizableString.分钟 }`, `12${ HomeLocalizableString.分钟 }`, `13${ HomeLocalizableString.分钟 }`, `14${ HomeLocalizableString.分钟 }`, `15${ HomeLocalizableString.分钟 }`, `16${ HomeLocalizableString.分钟 }`, `17${ HomeLocalizableString.分钟 }`, `18${ HomeLocalizableString.分钟 }`, `19${ HomeLocalizableString.分钟 }`, `20${ HomeLocalizableString.分钟 }`
          , `21${ HomeLocalizableString.分钟 }`, `22${ HomeLocalizableString.分钟 }`, `23${ HomeLocalizableString.分钟 }`, `24${ HomeLocalizableString.分钟 }`, `25${ HomeLocalizableString.分钟 }`, `26${ HomeLocalizableString.分钟 }`, `27${ HomeLocalizableString.分钟 }`, `28${ HomeLocalizableString.分钟 }`, `29${ HomeLocalizableString.分钟 }`, `30${ HomeLocalizableString.分钟 }`];
      } else if (parseInt(head) == 1 && parseInt(tail) == 9) {
        return ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
      } else if (parseInt(head) == 300 && parseInt(tail) == 800) {
        return ['300', '400', '500', '600', '700', '800'];
      } else if (parseInt(head) == 30 && parseInt(tail) == 120) {
        /* return ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1', '2', '3', '4', '5', '6', '7', '8',
                     '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26'
                     , '27', '28', '29', '30']; */
        return ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1', '2', '3', '4', '5', '6', '7', '8',
          '9', '10'];
      } else if (parseInt(head) == 30 && parseInt(tail) == 100) {
        return ['30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100'];
      } else if (parseInt(head) == 40 && parseInt(tail) == 100) {
        return ['40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100'];
      } else if (parseInt(head) == 50 && parseInt(tail) == 200) {
        return this._getArray50_200_step1();
      } else if (parseInt(head) == 40 && parseInt(tail) == 80) {
        return this._getArray40_80_step1();
      } else if (parseInt(head) < 1) {
        return ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'];
      } else
        return arr;
    }

    _getArray50_200_step1() {
      let array = [];
      for (let i = 50; i <= 200; i++) {
        array.push(`${ i }`);
      }

      return array;
    }

    _getArray40_80_step1() {
      let array = [];
      for (let i = 40; i <= 80; i++) {
        array.push(`${ i }`);
      }

      return array;
    }

    /**
     * 计算出年份的范围
     * @param {*} min
     * @param {*} max
     */
    getYears(min, max) {
      this.min = this.convert(min); // 留一份滚动比较时候用
      this.max = this.convert(max);
      const minY = Number.parseInt(this.min[0]);
      const maxY = Number.parseInt(this.max[0]);
      return this.generateArray(minY, maxY);
    }

    /**
     * 根据极值生成步长为1的数组，并转换成字符串
     * @param {number} min
     * @param {number} max
     */
    generateArray(min, max) {
      if (min > max) {
        if (__DEV__ && console.warn) {
          console.warn('max < min');
        }
        return [];
      }
      return Array.from({ length: max - min + 1 }, (v, i) => i + min).map((v) => `${ v }`);
    }

    /**
     * 初始化数据，包括每个picker的范围和选中值
     */
    init(props) {
      const { type, singleType, current, min, max } = props;
      const currentArray = this.convert(current || new Date());
      switch (type) {
        case TYPE.DATE:
          const yearNow = new Date().getFullYear();
          const minDefault = new Date();
          minDefault.setFullYear(yearNow - defaultYearOffset); // Date 模式下，如果没 min，就往回 defaultYearOffset 年
          const maxDefault = new Date();
          maxDefault.setFullYear(yearNow + defaultYearOffset); // 如果没 max，就往后 defaultYearOffset 年
          const years = this.getYears(min || minDefault, max || maxDefault);
          const dataSourceArray = [years, months, days];
          this.updateDays(currentArray, dataSourceArray);
          this.unitArray = [strings.yearUnit, strings.monthUnit, strings.dayUnit];
          return {
            currentArray,
            dataSourceArray
          };
        case TYPE.TIME24:
          this.unitArray = [strings.hourUnit, strings.minuteUnit];
          return {
            currentArray,
            dataSourceArray: [hours24, minutes]
          };
        case TYPE.TIME12:
          this.unitArray = ['', strings.hourUnit, strings.minuteUnit];
          return {
            currentArray,
            dataSourceArray: [timeSystem, hours12, minutes]
          };
        case TYPE.SINGLE:
        default:
          this.unitArray = [strings[`${ singleType }Unit`]];
          return {
            currentArray,
            dataSourceArray: [this.slice(constructArray(parseInt(max), 0, 0), min, max)]
          };
      }
    }

    _getArray50_250_step5() {
      let array = [];
      for (let i = 50; i <= 250; i + 5) {
        array.push(`${ i }`);
      }

      return array;
    }

    componentWillReceiveProps(newProps) {
      if (newProps.visible !== this.state.visible) {
        this.setState({ visible: newProps.visible });

        if (newProps.toastMessage && newProps.visible) {
          this.timer = setTimeout(() => {
            this.setState({ showToast: true });
            this._startTime();
          }, 500);

        } else {
          this.setState({ showToast: false });
          this._stopTime();
        }
      }

      if (parseInt(newProps.current) == parseInt(this.props.current)) {
        return;
      }
      if (newProps.current === undefined
            || newProps.current !== this.props.current) {
        const currentArray = this.convert(newProps.current || new Date());
        this.setState({
          currentArray,
          subtitle: this.getSubtitle(currentArray)
        });
      }
    }

    _startTime() {
      this._stopTime();
      this.interval = setInterval(() => {
        this.setState({ showToast: false });
      }, 3000);
    }

    _stopTime() { // 停止计时
      if (this.interval) {
        clearInterval(this.interval);
      }
    }

    componentWillUnmount() {
      this._stopTime();
    }

    /**
     * 标题部分
     */
    renderTitle() {
      const height = {
        height: this.props.showSubtitle ? titleHeightFat : titleHeightThin
      };
      return (
        <View style={[styles.titleContainer, height]}>
          <Text
            numberOfLines={1}
            style={[Styles.common.title, styles.title]}
          >
            {this.props.title || ''}
          </Text>
          {this.props.showSubtitle
            ? <Text
              numberOfLines={1}
              style={styles.subtitle}
            >
              {this.state.subtitle}
            </Text>
            : null
          }
        </View>
      );
    }

    /**
     * picker 部分
     */
    renderContent() {
      const { currentArray, dataSourceArray } = this.state;
      const length = currentArray.length;
      const actualWidth = modalWidth - (length - 1) * StyleSheet.hairlineWidth; // 去掉分割线的真实宽度
      const normalWidth = actualWidth / length; // 均分宽度
      const yearWidth = normalWidth + 10; // 日期选择器的年份picker宽度稍微大一点
      const monthWidth = (actualWidth - yearWidth) / 2;
      return (
        <View style={styles.pickerContainer}>
          {dataSourceArray.map((dataSource, index) => {
            let style = { width: normalWidth };
            if (this.props.type === TYPE.DATE) {
              if (index === 0) style = { width: yearWidth };
              else style = { width: monthWidth };
            }
            return (
              <View
                key={index}
                style={[{ flexDirection: 'row' }, style]}>
                <StringSpinner
                  key={index + this.unitArray[index]}
                  style={style}
                  unit={''}
                  dataSource={dataSource}
                  defaultValue={currentArray[index]}
                  pickerInnerStyle={pickerInnerStyle}
                  onValueChanged={(data) => this._onValueChanged(index, data)}
                />
                {index < length - 1
                  ? <Separator type="column" style={{ height: pickerContainerHeight }}/>
                  : null
                }
              </View>
            );
          })}
        </View>
      );
    }

    /**
     * 底部按钮
     */
    renderButton() {
      return (
        <View style={styles.buttons}>
          <TouchableHighlight
            style={[{
              backgroundColor: '#f5f5f5',
              borderRadius: 23,
              flex: 1,
              height: 46,
              alignItems: 'center',
              justifyContent: 'center'
            }, { borderBottomLeftRadius: borderRadius }]}
            onPress={(_) => this.dismiss()}
            underlayColor="rgba(0,0,0,.05)"
          >
            <Text style={{
              color: '#4c4c4c',
              textAlign: 'center',
              fontSize: 16,
              fontFamily: 'D-DINCondensed-Bold' // TODO: 英文字体，中文加粗效果
            }}>
              {strings.cancel}
            </Text>
          </TouchableHighlight>

          <View style={{ width: 12, height: 1 }}/>
          {/* <Separator type="column" style={{ height: buttonHeight }}/> */}

          <TouchableHighlight
            style={{
              borderRadius: 23,
              flex: 1,
              height: 46,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: "#4396EB"
            }}
            onPress={() => {
              this.confirm();
            }}>
            <Text style={{
              fontFamily: "PingFangSC-Regular",
              fontSize: 16,
              color: "#fff",
              fontWeight: 'bold'
            }}>
              {strings.ok}
            </Text>
          </TouchableHighlight>

        </View>
      );
    }

    render() {
      return (
        <Modal
          animationType={this.props.animationType}
          transparent={true}
          visible={this.state.visible}
          onRequestClose={(_) => this.dismiss()}
        >
          <View style={styles.background}>
            <TouchableWithoutFeedback
              onPress={(_) => this.dismiss()}
            >
              <View style={{ width, height }}/>
            </TouchableWithoutFeedback>
            <View style={styles.modal}>
              {this.renderTitle()}
              {/* <Separator/> */}
              {this.renderContent()}
              {/* <Separator/> */}
              {this.renderButton()}

              {this.props.toastMessage && this.state.showToast ? this._toastView(this.props.toastMessage) : null}
            </View>
          </View>
        </Modal>
      );
    }

    _toastView(message) {
      return (
        <View style={{
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 26,
          paddingRight: 26,
          backgroundColor: '#fff',
          borderRadius: 12,
          borderWidth: 0.5,
          borderColor: 'rgba(0,0,0,0.2)',
          position: 'absolute', bottom: 86, flexShrink: 1, alignSelf: 'center', zIndex: 9999,
          paddingVertical: 9, paddingHorizontal: 15,
          shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 17 }
        }}>
          <Text style={{
            flexWrap: 'wrap',
            fontFamily: FontDefault,
            fontSize: 13,
            color: '#4C4C4C',
            textAlign: 'center'
          }}>{message}</Text>
        </View>
      );
    }

    /**
     * 是否是闰年
     * @param {number} y
     */
    isLeapYear(y) {
      return ((y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0 && y % 3200 !== 0));
    }

    /**
     * 比较`Date`时间数组的时间前后 ['2017','06','01'] > ['2017','05','31']
     * @param {array} arrA
     * @param {array} arrB
     */
    compareDateArray(arrA, arrB) {
      return arrA.join('') - arrB.join('');
    }

    /**
     * 计算当前年份和月份下的天数
     * @param {array} newCurrentArray
     * @param {array<array>} newDataSourceArray
     */
    updateDays(newCurrentArray, newDataSourceArray) {
      const [year, month, day] = newCurrentArray;
      if (days31.includes(month)) {
        newDataSourceArray[2] = days;
      } else if (days30.includes(month)) {
        newDataSourceArray[2] = days.slice(0, 30);
      } else {
        // 闰年2月29天, 平年28天
        if (this.isLeapYear(parseInt(year))) {
          newDataSourceArray[2] = days.slice(0, 29);
        } else {
          newDataSourceArray[2] = days.slice(0, 28);
        }
      }
      // 5月31日 -> 6月30日
      if (!newDataSourceArray[2].includes(day)) {
        newCurrentArray[2] = newDataSourceArray[2][newDataSourceArray[2].length - 1];
      }
    }

    /**
     * Picker 滚动回调
     * @param {number} index
     * @param {object} data
     */
    _onValueChanged(index, data) {
      let newCurrentArray = [...this.state.currentArray];
      newCurrentArray[index] = data.newValue;
      let newDataSourceArray = [...this.state.dataSourceArray];
      this.setState({
        currentArray: newCurrentArray,
        subtitle: this.getSubtitle(newCurrentArray)
      }, (_) => {
        console.log(`index->${ data.newValue }`);
        this.setState({ unit: HomeLocalizableString.分钟 });
        this.setState({
          subtitle: this.getSubtitle(newCurrentArray),
          currentArray: newCurrentArray,
          dataSourceArray: newDataSourceArray
        });
        /* if (this.props.type === TYPE.DATE) {
                let needUpdate = false;
                // 判断是否越界
                if (this.compareDateArray(newCurrentArray, this.max) > 0) {
                    newCurrentArray = this.max;
                    needUpdate = true;
                }
                if (this.compareDateArray(newCurrentArray, this.min) < 0) {
                    newCurrentArray = this.min;
                    needUpdate = true;
                }
                this.updateDays(newCurrentArray, newDataSourceArray);
                if (newDataSourceArray[2].length !== this.state.dataSourceArray[2].length) {
                    needUpdate = true;
                }
                needUpdate && this.setState({
                    subtitle: this.getSubtitle(newCurrentArray),
                    currentArray: newCurrentArray,
                    dataSourceArray: newDataSourceArray
                });
            } */
      });
    }

    /**
     * 隐藏 Modal
     */
    dismiss() {
      this.setState({ visible: false });
      this.props.onDismiss && this.props.onDismiss();
    }

    /**
     * 把时间数组转成 `Date` 实例
     * ['2019','06','03'] -> new Date()
     * ['15','36'] -> new Date()
     * ['下午','03','36'] -> new Date()
     */
    array2Date() {
      const { currentArray } = this.state;
      let date = new Date();
      switch (this.props.type) {
        case TYPE.DATE:
          date.setFullYear(currentArray[0]);
          date.setMonth(parseInt(currentArray[1]) - 1);
          date.setDate(parseInt(currentArray[2]));
          break;
        case TYPE.TIME24:
          date.setHours(currentArray[0]);
          date.setMinutes(currentArray[1]);
          break;
        case TYPE.TIME12:
          let hour = parseInt(currentArray[1]);
          if (currentArray[0] === strings.am) {
            hour = hour === 12 ? 0 : hour;
          } else {
            hour = hour < 12 ? hour + 12 : hour;
          }
          date.setHours(hour);
          date.setMinutes(currentArray[2]);
          break;
        case TYPE.SINGLE:
        default:
          return null;
      }
      return date;
    }

    confirm() {
      if (this.props.onSelect) {
        this.props.onSelect({
          rawArray: this.state.currentArray,
          rawString: this.state.subtitle,
          date: this.array2Date()
        });
      }
      this.dismiss();
    }
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: screenBackgroundColor
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    width: modalWidth,
    backgroundColor: '#fff',
    borderRadius
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontFamily: 'D-DINCondensed-Bold'
  },
  subtitle: {
    width: modalWidth,
    textAlign: 'center',
    fontSize: 13,
    color: '#666'
  },
  pickerContainer: {
    flexDirection: 'row',
    height: pickerContainerHeight,
    justifyContent: 'space-between'
  },
  buttons: {
    height: buttonHeight,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingLeft: 27,
    paddingRight: 27,
    marginBottom: 27
  },
  button: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 19,
    color: '#666',
    fontFamily: 'D-DINCondensed-Bold' // TODO: 英文字体，中文加粗效果
  }
});
