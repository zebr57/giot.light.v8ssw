import React from "react";
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { DarkMode } from "miot";

export default class IconButton extends React.Component {
  static get propTypes() {
    return {
      width: PropTypes.number,
      active: PropTypes.bool,
      activeIcon: PropTypes.any,
      inactiveIcon: PropTypes.any,
      title: PropTypes.string,
      onPress: PropTypes.func,
      theme: PropTypes.object,
      disabled: PropTypes.bool
    };
  }

  constructor(props) {
    super(props);
    this.styles = StyleSheet.create({
      wrapper: {
        padding: 5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      },
      icon: {
        width: props.width !== undefined ? props.width * 1.0 : 30,
        height: props.width !== undefined ? props.width * 1.0 : 30

      },
      iconWrapper: {
        width: props.width || 50,
        height: props.width || 50,
        borderRadius: props.width !== undefined ? props.width / 2 : 25,
        justifyContent: 'center',
        alignItems: 'center'
      },
      iconActive: {
        backgroundColor: props.theme.iconButtonActiveBgColor
      },
      iconInactive: {
        backgroundColor: props.theme.iconButtonInActiveBgColor,
        borderColor: props.theme.iconButtonInActiveBorderColor,
        borderWidth: 1
      },
      title: {
        color: "#999999",
        fontSize: 12,
        marginTop: 10
      }
    });
  }

  render() {

    const { title, onPress, disabled, active, activeIcon, inactiveIcon, theme } = this.props;

    return (

      <View style={this.styles.wrapper}>
        <TouchableHighlight
          style={[this.styles.iconWrapper, active && !disabled ? this.styles.iconActive : this.styles.iconInactive]}
          underlayColor={theme.iconButtonTouchUnderlayColor}
          onPress={onPress}
          disabled={disabled}
        >
          <Image
            style={this.styles.icon}
            source={active && !disabled ? activeIcon : inactiveIcon}
          />
        </TouchableHighlight>
        {
          title && (
            <Text style={{
              color: disabled ? DarkMode.getColorScheme() === 'dark' ? 'xm#3e3e3e' : "#eaeaea" : "#999999",
              fontSize: 12,
              marginTop: 10
            }}>
              {title}
            </Text>
          )
        }
      </View>
    );
  }
}
