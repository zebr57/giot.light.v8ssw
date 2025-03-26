import React from "react";
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DarkMode } from "miot";

export default class IconButton extends React.Component {
  static get propTypes() {
    return {
      bri: PropTypes.number,
      temp: PropTypes.number,
      width: PropTypes.number,
      active: PropTypes.bool,
      activeColor: PropTypes.string,
      inactiveColor: PropTypes.string,
      onPress: PropTypes.func,
      theme: PropTypes.object,
      disabled: PropTypes.bool,
      selected: PropTypes.bool
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

    const { onPress, selected, disabled, active, activeColor, inactiveColor, theme, bri, temp } = this.props;

    return (

      <View style={this.styles.wrapper}>
        <TouchableOpacity
          style={[this.styles.iconWrapper, active && !disabled ? this.styles.iconActive : this.styles.iconInactive]}
          // underlayColor={theme.iconButtonTouchUnderlayColor}
          onPress={onPress}
          disabled={disabled}
        >
          {selected ?
            <View
              style={{
                borderColor: activeColor,
                borderWidth: 1,
                borderRadius: 29, padding: 3
              }}>
              <View
                style={[this.styles.icon, { borderRadius: 25 }]}
                backgroundColor={activeColor}
              />

              <View
                style={
                  [this.styles.iconWrapper,
                    {
                      position: 'absolute',
                      margin: 3
                    }]}>

                <Image
                  style={{
                    resizeMode: 'contain',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  source={require('../../resources/edit_ic.png')}/>
              </View>
            </View>
            : <View
              style={[this.styles.icon, { borderRadius: 25 }]}
              backgroundColor={(active && !disabled) ? activeColor : inactiveColor}>

              <View
                style={
                  [this.styles.iconWrapper,
                    {
                      position: 'absolute'
                    }]}>

                <View style={{ flexDirection: 'column' }}>

                  <Text style={{
                    color: disabled ? DarkMode.getColorScheme() === 'dark' ? 'xm#383838' : '#dfdfdf' : '#999999',
                    textAlign: 'center',
                    fontSize: 10
                  }}>{bri}%</Text>

                  <Text style={{
                    color: disabled ? DarkMode.getColorScheme() === 'dark' ? 'xm#383838' : "#dfdfdf" : '#999999',
                    textAlign: 'center',
                    fontSize: 10
                  }}>{temp}k</Text>
                </View>
              </View>
            </View>
          }
        </TouchableOpacity>
      </View>
    );
  }

}
