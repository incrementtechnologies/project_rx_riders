import React, { Component } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import Page from 'modules/delivery';
import {NavigationActions, StackActions} from 'react-navigation';
import { Color, BasicStyles } from 'common';
import { connect } from 'react-redux';
import MessengerMessages from 'components/Messenger/MessagesV2';

class HeaderOptions extends Component {
  constructor(props){
    super(props);
  }
  
  back = () => {
    // this.props.navigationProps.navigate('drawerStack');
    const { user } = this.props.state;
    if(user == null) return
    const navigateAction = NavigationActions.navigate({
      routeName: 'drawerStack',
      action: StackActions.reset({
        index: 0,
        key: null,
        actions: [
            NavigationActions.navigate({routeName: user.account_type == 'MERCHANT' ? 'MyOrders' : 'Delivery'}),
        ]
      })
    });
    this.props.navigationProps.dispatch(navigateAction);
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

const mapStateToProps = state => ({ state: state });

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux');
  return {
    logout: () => dispatch(actions.logout())
  };
};

let HeaderOptionsConnect = connect(mapStateToProps, mapDispatchToProps)(HeaderOptions);

const MapStack = createStackNavigator({
  MapScreen: {
    screen: Page, 
    navigationOptions: ({ navigation }) => ({
      title: 'Map',
      headerLeft: <HeaderOptionsConnect navigationProps={navigation} />,
      drawerLabel: 'Map',
      headerStyle: {
        backgroundColor: 'transparent',
      },
      headerTransparent: true
    })
  },
  MessengerMessages: {
    screen: MessengerMessages,
    navigationOptions: ({ navigation }) => ({
      title: navigation.getParam('messengerHeaderTitle'),
      headerTintColor: '#000'
    }),
  },
})


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapStack);