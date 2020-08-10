import React, { Component } from 'react';
import { View, TouchableOpacity, Text, Platform, Dimensions } from 'react-native';
import {NavigationActions} from 'react-navigation';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faShoppingCart, faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { Color, BasicStyles } from 'common';

const width = Math.round(Dimensions.get('window').width);
import { connect } from 'react-redux';
class NavigationDrawerStructureRight extends Component {
  constructor(props){
    super(props);
    this.state = {
      selected: null
    }
  }
  goTo = (screen) => {
    this.props.navigationProps.navigate(screen)
  }

  navigateToScreen = (route) => {
    const navigateAction = NavigationActions.navigate({
      routeName: route
    });
    this.props.navigationProps.dispatch(navigateAction);
    // const { setActiveRoute } = this.props;
    // setActiveRoute(route)
  }
  
  render() {
    const { notifications, user, activeRoute } = this.props.state;
    const { theme } = this.props.state
    return (
      <View style={{
        flexDirection: 'row',
        width: width - (width * .10)
      }}>
        
      </View>
    );
  }
}

const mapStateToProps = state => ({state: state});

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux');
  return {
    setActiveRoute: (route) => dispatch(actions.setActiveRoute(route))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(NavigationDrawerStructureRight);