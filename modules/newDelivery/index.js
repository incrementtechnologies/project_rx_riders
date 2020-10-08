import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation'
import { Empty } from 'components';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Style from './Style.js';
import { Routes, Color, Helper, BasicStyles } from 'common';
import Currency from 'services/Currency.js';
import { Spinner } from 'components';
import Api from 'services/api/index.js';
import Config from 'src/config.js';
import DeviceInfo from 'react-native-device-info';


const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

class newDelivery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      delivery_details: null
    } 
  }

  componentDidMount(){
    this.retrieve()
  }

  componentDidUpdate(prevProps, _) {
    const prevCheckoutId = prevProps.navigation.state.params.data.checkout_id
    const currCheckoutId = this.props.navigation.state.params.data.checkout_id
    if (prevCheckoutId !== currCheckoutId) {
      this.retrieve()
    }
  }

  retrieve(){
    const { user } = this.props.state;
    const { type, data } = this.props.navigation.state.params
    if (user == null) return

    this.setState({ isLoading: true })
    if (type === Helper.pusher.rider) {
      Api.request(Routes.checkoutRetrieve, {
        condition: [{
          column: 'id',
          clause: '=',
          value: data.checkout_id
        }]
      }, response => {
        if (response.data.length) {
          this.setState({ delivery_details: response.data[0], isLoading: false })
        }
      }, error => {
        console.log({ errorRetrievingCheckout: error })
      })
    }
  }

  getBatteryInfo = async () => {
    const batteryLevel = await DeviceInfo.getBatteryLevel().then(batteryLevel => {
      return batteryLevel;
    });
    return batteryLevel
  }

  async acceptDelivery() {
    const { delivery_details } = this.state;
    const { user } = this.props.state;
    const { navigate } = this.props.navigation;
    const { data } = this.props.navigation.state.params
    const batteryLevel = await this.getBatteryInfo();

    if (user == null) {
      Alert.alert('You must login first')
      const proceedToLogin = NavigationActions.navigate({
        routeName: 'loginStack'
      });
      this.props.navigation.dispatch(proceedToLogin)
      return
    }

    if (batteryLevel < 0.50) {
      Alert.alert(
        "Battery Low",
        "You must have at least 50% battery to accept delivery requests"
      )
      return
    }

    const parameter = {
      account_id: parseInt(delivery_details.account_id),
      checkout_id: parseInt(data.checkout_id),
      merchant_id: parseInt(delivery_details.merchant_id),
      rider: parseInt(user.id),
      delivery_fee: parseFloat(delivery_details.shipping_fee),
      total: parseFloat(delivery_details.total),
      currency: delivery_details.currency
    }

    this.setState({ isLoading: true })
    Api.request(Routes.deliveryCreate, parameter, response => {
      if (Array.isArray(response.error) === false && typeof (response.error) !== "string") {
        Alert.alert('An error occured in accepting delivery request. Please try again')
        this.setState({ isLoading: false })
      } else {
        if (response.data) {
          Alert.alert(
            "Successful",
            "Delivery request is added to your list",
            [
              { text: "OK", onPress: () => navigate('Delivery') }
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert(
            "Notice",
            "Sorry, this request has already been taken",
            [
              { text: "OK", onPress: () => navigate('Delivery') }
            ],
            { cancelable: false }
          );
        }
        this.setState({ isLoading: false })
      }
    }, () => {
      Alert.alert('An error occured. Please try again')
      this.setState({ isLoading: false })
    })
  }

  render() {
    const { navigate } = this.props.navigation;
    const { isLoading } = this.state;
    const { delivery_details } = this.state;

    return (
      <ScrollView
        style={Style.ScrollView}
        onScroll={(event) => {
          if(event.nativeEvent.contentOffset.y <= 0) {
            if(this.state.isLoading == false){
              this.retrieve()
            }
          }
        }}
      >

        {isLoading ? <Spinner mode="full"/> : null }

        {delivery_details == null && (
          <Empty refresh={true} onRefresh={() => this.retrieve()}/>
        )}

        <View style={[Style.MainContainer, {
          minHeight: height + 50,
          width: '100%',
          alignItems: 'center'
        }]}>
          {
            delivery_details
            ? (
                <>
                  <View style={{
                    alignItems: 'center',
                    marginTop: 10,
                    borderWidth: 1,
                    padding: 15,
                    borderRadius: 5,
                    borderColor: Color.primary
                  }}>
                    <View>
                      <Text style={{ color: Color.darkGray }}>
                        Order #:
                        <Text style={{ color: '#000' }}>
                          {` ${delivery_details.order_number || 'No data'}`}
                        </Text>
                      </Text>
                      <Text style={{ color: Color.darkGray }}>
                        Receiver:
                        <Text style={{ color: '#000' }}>
                          {` ${delivery_details.name || 'Not specified'}`}
                        </Text>
                      </Text>
                      <Text style={{ color: Color.darkGray }}>
                        Deliver from:
                        <Text style={{ color: '#000' }}>
                          {` ${delivery_details.merchant_location.route  || ''} ${delivery_details.merchant_location.locality  || ''}`}
                        </Text>
                      </Text>
                      <Text style={{ color: Color.darkGray }}>
                        Deliver to:
                        <Text style={{ color: '#000' }}>
                          {` ${delivery_details.location.route  || ''} ${delivery_details.location.locality  || ''}`}
                        </Text>
                      </Text>
                      <Text style={{ color: Color.darkGray }}>
                        With distance of:
                        <Text style={{ color: '#000' }}>
                          {` ${delivery_details.distance || 'No data'}`}
                        </Text>
                      </Text>
                      <Text style={{ color: Color.darkGray }}>
                        Type:
                        <Text style={{ color: '#000', textTransform: 'uppercase' }}>
                          { ` ${delivery_details.type || 'No data'}` }
                        </Text>
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <TouchableOpacity onPress={() => this.acceptDelivery()}>
                      <View style={{ 
                        paddingVertical: 10,
                        paddingHorizontal: 50,
                        margin: 10,
                        color: Color.white,
                        backgroundColor: Color.primary,
                        borderRadius: 5
                      }}>
                        <Text style={{
                          color: Color.primary === '#003049' ? '#fff' : '#000'
                        }}>
                          ACCEPT
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigate('Delivery')}>
                      <View
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 50,
                          margin: 10,
                          color: Color.white,
                          backgroundColor: Color.warning,
                          borderRadius: 5
                        }}
                      >
                        <Text>DECLINE</Text>
                      </View>
                    </TouchableOpacity>
                  </View> 
                </>
              )
            : (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>
                  Loading..
                </Text>
              )
          }
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => ({state: state});

const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux');
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(newDelivery);
