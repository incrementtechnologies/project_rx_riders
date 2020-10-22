import React, { Component } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Color, BasicStyles } from 'common';

class HeaderOptions extends Component {
  constructor(props){
    super(props);
  }
  back = () => {
    this.props.navigationProps.pop();
  };
  render() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={this.back.bind(this)}>
          {/*Donute Button Image */}
          <FontAwesomeIcon icon={ faChevronLeft } size={BasicStyles.iconSize} style={BasicStyles.iconStyle}/>
        </TouchableOpacity>
      </View>
    );
  }
}

export default HeaderOptions;