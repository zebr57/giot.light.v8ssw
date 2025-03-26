import { Host } from 'miot';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity
} from 'react-native';
import { strings, Styles } from '../../../../miot-sdk/resources';
import Separator from '../../../../miot-sdk/ui/Separator';
import HomeLocalizableString from '../HomeLocalizableString';
const { width, height } = Dimensions.get('window');
const underlayColor = 'rgba(0,0,0,.05)';
/**
 * 按钮
 * @typedef {Object} Button
 * @property {string} text - 按钮的文字
 * @property {style} style - 按钮的样式
 * @property {function} callback - 点击按钮的回调函数
 */
/**
 * @export
 * @author Geeook
 * @since 10021
 * @module AbstractDialog
 * @description 通用弹窗容器，包括头部标题和底部按钮，内容自定义
 * @param {string} animationType - modal 显示动效, 默认`'fade'`，参考 https://facebook.github.io/react-native/docs/0.54/modal#animationtype
 * @param {bool} visible - 是否显示 modal, 默认`false`，参考 https://facebook.github.io/react-native/docs/0.54/modal#visible
 * @param {style} style - modal 的自定义样式
 * @param {string} title - 标题
 * @param {string} subtitle - 副标题
 * @param {bool} showTitle - 是否显示标题，如果`false`，整个标题都不显示（包括副标题），默认`true`
 * @param {bool} showSubtitle - 是否显示副标题，默认`false`
 * @param {bool} canDismiss - 是否允许点击蒙层背景隐藏 Modal，默认`true`
 * @param {Button[]} buttons - 按钮数组，定义底部按钮的属性，只能显示1～2个按钮，多传将失效。默认左取消右确定，左灰右绿，点击回调都是隐藏 Modal
 * @param {bool} showButton - 是否显示按钮，默认`true`
 * @param {function} onDismiss - 点击`Modal`内容外面/取消按钮/确定按钮，Modal隐藏时的回调函数
 */
export default class AbstractDialog1 extends React.Component {
    static propTypes = {
      animationType: PropTypes.string,
      visible: PropTypes.bool,
      style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
      title: PropTypes.string,
      subtitle: PropTypes.string,
      showTitle: PropTypes.bool,
      showSubtitle: PropTypes.bool,
      canDismiss: PropTypes.bool,
      buttons: PropTypes.arrayOf(PropTypes.object),
      showButton: PropTypes.bool,
      onDismiss: PropTypes.func
    }
    static defaultProps = {
      animationType: 'fade',
      visible: false,
      showTitle: true,
      showSubtitle: false,
      canDismiss: true,
      buttons: [
        {
          text: HomeLocalizableString.cancel
        },
        {
          text: HomeLocalizableString.ok,
          style: {
            color: Styles.common.MHGreen
          }
        }
      ],
      showButton: true
    }
    constructor(props, context) {
      super(props, context);
      this.state = {
        visible: this.props.visible,
        keyboardHeight: 0
      };
    }

    componentDidMount() {
      this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
        this.setState({ keyboardHeight: event.endCoordinates.height });
      });
      this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', (event) => {
        this.setState({ keyboardHeight: 0 });
      });
    }

    componentWillUnmount() {
      if (this.keyboardDidShowListener) {
        this.keyboardDidShowListener.remove();
      }
      if (this.keyboardDidHideListener) {
        this.keyboardDidHideListener.remove();
      }
    }

    componentWillReceiveProps(newProps) {
      if (newProps.visible !== this.state.visible) {
        this.setState({ visible: newProps.visible });
      }
    }
    /**
     * 标题部分
     */
    renderTitle() {
      if (!this.props.showTitle) return null;
      const { titleHeightFat, titleHeightThin } = Styles.dialog.title;
      let height = {
        height: this.props.showSubtitle ? titleHeightFat : titleHeightThin
      };
      const marginBottom = this.props.showSubtitle ? { marginBottom: 6 } : {};
      let language = Host.locale.language;
      let titleLines = 1;
      if (language !== 'zh') {
        // 当前米家 app 语言不是中文
        titleLines = 3;
        height.maxHeight = 86;
      }
      // 只给安卓手机设置字体为空字符串
      let fontFamily = {};
      if (Platform.OS === 'android') {
        // Android 设备或模拟器
        fontFamily.fontFamily = '';
      }
      return (
        <View style={[styles.titleContainer, height]}>
          <Text
            numberOfLines={titleLines}
            style={[
              {
                width: Styles.dialog.modal.width * 0.75,
                textAlign: 'center',
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000'
              },
              marginBottom,
              fontFamily
            ]}
          >
            {this.props.title || ''}
          </Text>
          {this.props.showSubtitle
            ? <Text
              numberOfLines={1}
              style={Styles.dialog.subtitle}
            >
              {this.props.subtitle}
            </Text>
            : null
          }
        </View>
      );
    }
    /**
     * 中间内容
     */
    renderContent() {
      if (this.props.children) return this.props.children;
      return (
        <View>
          <Separator />
          <View style={styles.content}>
            <Text>⬆️可自定义标题和副标题⬆️</Text>
            <Text>可自定义内容</Text>
            <Text>⬇️可自定义按钮文字和样式⬇️</Text>
          </View>
          <Separator />
        </View>
      );
    }
    /**
     * 底部按钮
     */
    renderButtonGroup() {
      if (!this.props.showButton) return null;
      const buttons = this.props.buttons;
      if (!(buttons instanceof Array)) return null;
      if (buttons.length === 1) return this.renderOneButton(buttons);
      if (buttons.length === 2) return this.renderTwoButtons(buttons);
      else {
        if (__DEV__ && console.warn) {
          console.warn('只允许设置1～2个按钮');
        }
        return null;
      }
    }
    /**
     * 一个按钮
     * @param {object[]} buttons
     */
    renderOneButton(buttons) {
      const button0 = buttons[0];
      if (typeof button0 !== 'object') return null;
      let callback = button0.callback;
      if (callback === undefined || !(callback instanceof Function)) {
        callback = (_) => this.dismiss();
      }
      return (
        <TouchableHighlight
          onPress={callback}
          underlayColor={underlayColor}
          style={{
            height: 46, // 底部按钮的高度
            // backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 23,
            // width:width-54,
            marginLeft: 27,
            marginRight: 27
          }}>
          <View
            style={[
              {
                height: 46, // 底部按钮的高度
                alignItems: 'center',
                justifyContent: 'center'
              }
            ]}
          >
            <Text style={[{
              color: '#4c4c4c',
              textAlign: 'center',
              fontSize: 16,
              fontFamily: 'D-DINCondensed-Bold' // TODO: 英文字体，中文加粗效果
            }]}>
              {button0.text || HomeLocalizableString.ok}
            </Text>
          </View>
        </TouchableHighlight>
      );
    }
    /**
     * 两个按钮
     * @param {object[]} buttons
     */
    renderTwoButtons(buttons) {
      const button0 = buttons[0], button1 = buttons[1];
      if (typeof button0 !== 'object'
            || typeof button1 !== 'object') return null;
      let callback0 = button0.callback;
      let callback1 = button1.callback;
      if (callback0 === undefined || !(callback0 instanceof Function)) {
        callback0 = (_) => this.dismiss();
      }
      if (callback1 === undefined || !(callback1 instanceof Function)) {
        callback1 = (_) => this.dismiss();
      }
      return (
        <View style={Styles.dialog.buttons}>
          <TouchableHighlight
            style={[
              button0.style,
              {
                borderBottomLeftRadius: 25,
                marginLeft: 27
              }
            ]}
            onPress={callback0}
            underlayColor={underlayColor}
          >
            <Text style={[{
              fontSize: 14,
              color: '#666',
              fontFamily: 'D-DINCondensed-Bold'
            }]}>
              {button0.text || HomeLocalizableString.cancel}
            </Text>
          </TouchableHighlight>
          {/* <Separator type="column" style={{ height: Styles.dialog.buttons.height }} /> */}
          <View style={{ width: 27, height: 1 }}/>
          <TouchableHighlight
            style={[
              button1.style,
              {
                borderBottomRightRadius: 25,
                marginRight: 27
              }
            ]}
            onPress={callback1}
            underlayColor={underlayColor}
          >
            <Text style={[{
              fontSize: 14,
              color: '#666',
              fontFamily: 'D-DINCondensed-Bold'
            }, { color: '#fff' }]}>
              {button1.text || HomeLocalizableString.ok}
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
          <View style={Styles.dialog.background}>
            <TouchableWithoutFeedback onPress={(_) => this.dismiss()} >
              <View style={{ width, height }} />
            </TouchableWithoutFeedback>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                Keyboard.dismiss();
              }}
              style={{
                position: 'absolute',
                bottom: 0, // 距离屏幕底部的边距
                marginHorizontal: 0, // 两端边距
                width: width, // 宽度
                borderRadius: 20, // 圆角
                backgroundColor: '#fff' // 内容背景色
              }}>
              {this.renderTitle()}
              {this.renderContent()}
              <View style={{
                marginBottom: 27,
                marginTop: 15
              }}>
                {this.renderButtonGroup()}
              </View>

              {
                Platform.OS === 'android' ?
                  null :
                  <View style={{
                    width: width,
                    height: this.state.keyboardHeight / 3
                    // backgroundColor: '#EFEFEF'
                  }}/>
              }

            </TouchableOpacity>
          </View>
        </Modal>
      );
    }
    /**
     * 隐藏 Modal
     */
    dismiss() {
      if (this.props.canDismiss) {
        this.setState({ visible: false });
        this.props.onDismiss && this.props.onDismiss();
      }
    }
}
const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    width: Styles.dialog.modal.width,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center'
  }
});