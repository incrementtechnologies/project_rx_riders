import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import Slider from 'modules/slider';
import { Color, BasicStyles } from 'common';
import Dashboard from 'modules/delivery';
import Delivery from 'modules/delivery/MyDelivery.js';
import Notification from 'modules/notification';
import Profile from 'modules/profile';
import HelpCenter from 'modules/helpCenter';
import OptionRight from './OptionRight';
import TermsAndConditions from 'modules/terms';
import PrivacyPolicy from 'modules/privacy';
import Merchant from 'modules/merchant';
import MyAddress from 'modules/myAddresses';
import Settings from 'modules/settings';
import Referral from 'modules/referral';
import NewDelivery from 'modules/newDelivery';
import Deposit from 'modules/deposit';
import OrderManagement from 'modules/orders/OrderManagement.js';
import { connect } from 'react-redux';
import Ledger from 'modules/Ledger';
import Products from 'modules/merchantProducts';


class MenuDrawerContentStructure extends Component {
  constructor(props){
    super(props);
    this.state = {
      loginState: true
    };
  }
  toggleDrawer = () => {
    this.props.navigationProps.toggleDrawer();
  };
  render() {
    const { theme } = this.props.state;
    return (
      <View style={{ flexDirection: 'row' }}>
        {this.state.loginState === true && 
          <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
            {/*Donute Button Image */}
            <FontAwesomeIcon icon={ faBars } size={BasicStyles.iconSize} style={[BasicStyles.iconStyle, {
              color: theme ? theme.primary : Color.primary
            }]}/>
          </TouchableOpacity>
        }
        
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

let MenuDrawerStructure = connect(mapStateToProps, mapDispatchToProps)(MenuDrawerContentStructure);

const StackNavigator = createStackNavigator({
  Delivery: {
    screen: Delivery,
    navigationOptions: ({ navigation }) => ({
      title: 'My Deliveries',
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: Color.primary,
    }),
  },
  NewDelivery: {
    screen: NewDelivery,
    navigationOptions: ({ navigation }) => ({
      title: 'New Delivery',
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: Color.primary,
    }),
  },
  Ledger: {
    screen: Ledger,
    navigationOptions: ({ navigation }) => ({
      title: 'My Wallet',
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: Color.primary,
    }),
  },
  Dashboard: {
    screen: Dashboard,
    navigationOptions: ({ navigation }) => ({
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: 'transparent',
      },
      headerTransparent: true
    }),
  },
  HelpCenter: {
    screen: HelpCenter,
    navigationOptions: ({ navigation }) => ({
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: '#fff',
    }),
  },
  PrivacyPolicy: {
    screen: PrivacyPolicy,
    navigationOptions: ({ navigation }) => ({
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: '#fff',
    }),
  },
  TermsAndConditions: {
    screen: TermsAndConditions,
    navigationOptions: ({ navigation }) => ({
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: '#fff',
    }),
  },
  TermsAndConditions: {
    screen: TermsAndConditions,
    navigationOptions: ({ navigation }) => ({
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: '#fff',
    }),
  },
  Notification: {
    screen: Notification,
    navigationOptions: ({ navigation }) => ({
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: '#fff',
    }),
  },
  Profile: {
    screen: Profile,
    navigationOptions: ({ navigation }) => ({
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: '#fff',
    }),
  },
  Settings: {
    screen: Settings,
    navigationOptions: ({ navigation }) => ({
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: '#fff',
    }),
  },
  InviteFriends: {
    screen: Referral,
    navigationOptions: ({ navigation }) => ({
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: '#fff',
    }),
  },
  Deposit: {
    screen: Deposit,
    navigationOptions: ({ navigation }) => ({
      title: 'My Deposits',
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: Color.primary,
    }),
  },
  MyOrders: {
    screen: OrderManagement,
    navigationOptions: ({ navigation }) => ({
      title: 'My Orders',
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: Color.primary,
    }),
  },
  Products: {
    screen: Products,
    navigationOptions: ({ navigation }) => ({
      title: 'Products',
      headerLeft: <MenuDrawerStructure navigationProps={navigation} />,
      headerRight: <OptionRight navigationProps={navigation} />,
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: Color.primary,
    }),
  },
});

const Drawer = createDrawerNavigator({
  Delivery: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: 'My Deliveries',
    },
  },
  MyOrders: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: 'My Orders',
    },
  },
  Products: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: 'Products',
    },
  },
  Dashboard: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: '',
    },
  },
  Ledger: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: 'Wallet',
    },
  },
  HelpCenter: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: '',
    },
  },
  Profile: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: '',
    },
  },
  TermsAndConditions: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: '',
    },
  },
  PrivacyPolicy: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: '',
    },
  },
  Notification: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: '',
    },
  },
  Settings: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: '',
    },
  },
  Deposit: {
    screen: StackNavigator,
    navigationOptions: {
      drawerLabel: 'My Deposits',
    },
  },
}, {
  contentComponent: Slider
});

export default Drawer;