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
import { Empty } from 'components';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Style from './Style.js';
import { Routes, Color, Helper, BasicStyles } from 'common';
import Currency from 'services/Currency.js';
import { Spinner } from 'components';
import Api from 'services/api/index.js';
import Config from 'src/config.js';

const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

class newDelivery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      delivery_details: null,
      merchant_details: null
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
          this.setState({ delivery_details: response.data[0] })
        }
      }, error => {
        console.log({ errorRetrievingCheckout: error })
      })

      Api.request(Routes.merchantsRetrieve, {
        condition: [{
          column: 'id',
          clause: '=',
          value: data.merchant_id
        }]
      }, response => {
        if (response.data.length) {
          this.setState({ merchant_details: response.data[0], isLoading: false })
        }
      }, error => {
        console.log({ errorRetrievingMerchant: error })
      })
    }
  }

  acceptDelivery() {
    const { user } = this.props.state;
    const { navigate } = this.props.navigation;
    const { data } = this.props.navigation.state.params
    if (user == null) {
      Alert.alert('You must login first')
      return
    }

    const parameter = {
      account_id: parseInt(user.id),
      checkout_id: parseInt(data.checkout_id),
      merchant_id: parseInt(data.merchant_id),
      rider: parseInt(user.id),
    }
    console.log({ deliveryCreateParameter: parameter })
    this.setState({ isLoading: true })
    Api.request(Routes.deliveryCreate, parameter, response => {
      if (response.data) {
        Alert.alert(
          "Successful",
          "Delivery entry is already added to your list",
          [
            { text: "OK", onPress: () => navigate('Delivery') }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "Notice",
          "Sorry, this entry is already been taken",
          [
            { text: "OK", onPress: () => navigate('Delivery') }
          ],
          { cancelable: false }
        );
      }
      this.setState({ isLoading: false })
    }, error => {
      console.log({ deliveryCreateError: error })
      Alert.alert('An error occured. Please try again')
      this.setState({ isLoading: false })
    })
  }

  render() {
    const { user } = this.props.state;
    const { navigate } = this.props.navigation;
    const { isLoading } = this.state;
    const { merchant_details, delivery_details } = this.state;

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

        {merchant_details == null && delivery_details == null && (
          <Empty refresh={true} onRefresh={() => this.retrieve()}/>
        )}

        <View style={[Style.MainContainer, {
          minHeight: height + 50,
          width: '100%',
          alignItems: 'center'
        }]}>
          {
            merchant_details && (
              <View style={{
                width: '90%',
                minHeight: 400,
                borderWidth: 0.5,
                borderRadius: 5,
                padding: 20
              }}>
                <View style={{ alignItems: 'center' }}>
                  {
                    // merchant_details.logo
                    false
                    ? (
                        <Image
                          source={{uri: Config.BACKEND_URL  + merchant_details.logo }}
                          style={{
                            height: 100,
                            width: 100,
                            borderRadius: 50
                          }}
                        />
                      )
                    : (
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          size={100}
                          style={{
                            color: Color.primary
                          }}
                        />
                      )
                  }
                  <Text style={{ fontSize: 16, marginTop: 5 }}>
                    New Delivery!
                  </Text>
                  <Text style={{ fontSize: 11 }}>
                    {`from ${merchant_details.name || ''}`}
                  </Text>
                </View>

                {
                  delivery_details
                  ? (
                      <>
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                          <View>
                            <Text style={{ color: Color.darkGray }}>
                              Order #:
                              <Text style={{ color: '#000' }}>
                                {` ${delivery_details.order_number || 'No data'}`}
                              </Text>
                            </Text>
                            <Text style={{ color: Color.darkGray }}>
                              Deliver to:
                              <Text style={{ color: '#000' }}>
                                {` ${delivery_details.location || 'Not specified'}`}
                              </Text>
                            </Text>
                            <Text style={{ color: Color.darkGray }}>
                              Type:
                              <Text style={{ color: '#000', textTransform: 'uppercase' }}>
                                { ` ${delivery_details.type || 'COD'}` }
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
