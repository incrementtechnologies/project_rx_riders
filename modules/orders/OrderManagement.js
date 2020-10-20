import React, { Component } from 'react';
import {
  ScrollView,
  View,
  Text,
  Button,
  Dimensions,
  Animated,
  TouchableHighlight,
  ActivityIndicator
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import { connect } from 'react-redux';
import { Table, Row, Rows } from 'react-native-table-component';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBan, faTimes, faComment, faEye, faBiking, faStar, faMapMarkerAlt, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from 'components';
import Api from 'services/api';
import { Routes, Helper, BasicStyles, Color } from 'common';
import Style from './Style';
import _ from 'lodash';
import OrderManagementCard from './OrderManagementCard';
import CreateRatings from 'components/Rating/StandardRatings.js';
import OrderItems from 'modules/orders/OrderItems.js';

const height = Math.round(Dimensions.get('window').height);

class OrderManagement extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoading: false,
      data: [],
      selected: null,
      bounceValue: new Animated.Value(100),
      ratingModal: false,
      ratingData: null,
      checkout: null,
      limit: 5,
      offset: 0,
      numberOfPages: null,
      isViewItem: false,
      isBroadcasting: false
    }
  }

  componentDidMount() {
    this.retrieve(true)
  }

  retrieve = (flag) => {
    const { user } = this.props.state;
    if(user === null || user.sub_account == null || user.sub_account.merchant == null) {
      return
    }
    let parameter = {
      condition: [{
        value: user.sub_account.merchant.id,
        clause: '=',
        column: 'merchant_id'
      }, {
        value: 'completed',
        clause: '!=',
        column: 'status'
      }],
      sort: {
        created_at: 'desc'
      },
      limit: this.state.limit,
      offset: flag == true && this.state.offset > 0 ? (this.state.offset * this.state.limit) : this.state.offset
    }
    
    this.setState({
      isLoading: true
    })

    Api.request(Routes.checkoutRetrieveOrdersMerchantMobile, parameter, response => {
      this.setState({isLoading: false})
      if(response.data.length > 0){
        this.setState({
          data: flag == false ? response.data : _.uniqBy([...this.state.data, ...response.data], 'id'),
          numberOfPages: parseInt(response.size / this.state.limit) + (response.size % this.state.limit ? 1 : 0),
          offset: flag == false ? 1 : (this.state.offset + 1)
        })
      }else{
        this.setState({
          data: flag == false ? [] : this.state.data,
          numberOfPages: null,
          offset: flag == false ? 0 : this.state.offset
        })
      }
    },error => {
      this.setState({isLoading: false, data: []})
    });
  }

  showOptions(data){
    const { selected, checkout } = this.state;
    if(selected || checkout){
      this.setState({
        selected: null,
        checkout: null
      })
    }else{
      this.setState({
        selected: data
      })
      this.retrieveItem(data)
    }
  }

  retrieveItem = (data) => {
    if(data == null) {
      return
    }
    let parameter = {
      condition: [{
        value: data.id,
        clause: '=',
        column: 'id'
      }]
    }

    this.setState({
      isLoading: true
    })

    Api.request(Routes.checkoutRetrieveOrdersMerchant, parameter, response => {
      console.log('checkout', response.data)
      this.setState({isLoading: false, checkout: response.data[0]})
    },error => {
      this.setState({isLoading: false, checkout: null})
    });
  }

  acceptOrders = (data) => {
    if(data == null) {
      return
    }
    let parameter = {
      id: data.id,
      status: 'accepted'
    }

    this.setState({
      isBroadcasting: true
    })

    Api.request(Routes.checkoutUpdate, parameter, response => {
      this.retrieveItem(data)
    },error => {
      this.setState({isBroadcasting: false})
    });
  }

  searchRider = (data) => {
    const { user } = this.props.state;

    if(data == null || user == null) {
      return
    }
    
    let parameter = {
      merchant: user.sub_account.merchant.code,
      checkout_id: data.id,
      scope: user.scope_location
    }

    this.setState({
      isBroadcasting: true
    })

    Api.request(Routes.broadcastRiderSearch, parameter, response => {
      this.setState({
        isBroadcasting: false
      })
    },error => {
      this.setState({
        isBroadcasting: false
      })
    });

  }

  goToMessenger(data) {
    if (data.code == null) return
    const { setOrder } = this.props;
    setOrder({
      ...data,
      checkout_id: data.id
    })
    this.props.navigation.navigate('MessengerMessages', { 
      checkoutData: {
        id: data.id,
        code: data.code,
        merchantId: data.merchant_id,
        customerId: data.account_id
      },
      messengerHeaderTitle: `***${data.code.slice(-8)}`
    });
  }

  submitRatings(data, type){
    const { setOrder } = this.props;
    setOrder({
      ...params,
      checkout_id: params.id
    })
    this.props.navigation.navigate('mapStack');
    let rating = {
      payload: type,
      payload_value: type == 'rider' ? data.assigned_rider.id : data.account_id,
      payload1: 'checkout',
      payload_value1: data.id
    }
    this.setState({
      ratingModal: true,
      ratingData: rating
    })
  }

  viewOrder(params){
    const { setOrder } = this.props;
    setOrder({
      ...params,
      checkout_id: params.id
    })
    this.props.navigation.navigate('mapStack');
  }

  options(){
    const { checkout } = this.state;
    const { user } = this.props.state;
    Animated.spring(
      this.state.bounceValue,
      {
        toValue: 0,
        velocity: 3,
        tension: 2,
        friction: 8,
      }
    ).start();
    return(
      <Animated.View
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: height * 0.5,
            backgroundColor: Color.white,
            transform: [{translateY: this.state.bounceValue}],
            borderTopColor: Color.primary,
            borderTopWidth: 1
          }}
        >
        <ScrollView style={Style.ScrollView} showsVerticalScrollIndicator={false}>
          <View style={{
            flexDirection: 'row',
            justifyItems: 'center',
            paddingTop: 20,
            paddingBottom: 20
          }}>
            <Text style={{
              paddingLeft: 10,
              color: Color.primary,
              fontWeight: 'bold',
              width: '80%'
            }}>
              Order #: {checkout.order_number}
            </Text>
            <TouchableHighlight 
              style={{
                width: '20%',
                alignItems: 'flex-end',
                paddingRight: 10
              }}
              onPress={() => {
                this.setState({
                  selected: null,
                  checkout: null
                })
              }}
              underlayColor={Color.gray}
              >
              <FontAwesomeIcon
                icon={faTimes}
              />
            </TouchableHighlight>
          </View>

          {
            checkout.status == 'pending' && (
              <TouchableHighlight style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 10,
                paddingRight: 10,
                borderBottomColor: Color.lightGray,
                borderBottomWidth: 1
              }}
              onPress={() => {
                this.acceptOrders(checkout)
              }}
              underlayColor={Color.gray}
              >
                <View style={{
                  flexDirection: 'row'
                }}>
                  <Text style={{
                    width: '80%'
                  }}>Accept Order</Text>
                  <Text style={{
                      width: '20%',
                      textAlign: 'right'
                    }}>
                    <FontAwesomeIcon icon={faCheck}  />
                  </Text>
                </View>
              </TouchableHighlight>
            )
          }

          <TouchableHighlight style={{
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 10,
            paddingRight: 10,
            borderBottomColor: Color.lightGray,
            borderBottomWidth: 1
          }}
          onPress={() => {
            this.goToMessenger(checkout)
          }}
          underlayColor={Color.gray}
          >
            <View style={{
              flexDirection: 'row'
            }}>
              <Text style={{
                width: '80%'
              }}>Message</Text>
              <Text style={{
                  width: '20%',
                  textAlign: 'right'
                }}>
                <FontAwesomeIcon icon={faComment}  />
              </Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight style={{
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 10,
            paddingRight: 10,
            borderBottomColor: Color.lightGray,
            borderBottomWidth: 1
          }}
          onPress={() => {
            this.setState({
              isViewItem: true
            })
          }}
          underlayColor={Color.gray}
          >
            <View style={{
              flexDirection: 'row'
            }}>
              <Text style={{
                width: '80%'
              }}>View Products</Text>
              <Text style={{
                  width: '20%',
                  textAlign: 'right'
                }}>
                <FontAwesomeIcon icon={faEye}  />
              </Text>
            </View>
          </TouchableHighlight>


          {
            (checkout.status == 'pending' && checkout.assigned_rider == null && user && user.scope_location != null) && (
              <TouchableHighlight style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 10,
                paddingRight: 10,
                borderBottomColor: Color.lightGray,
                borderBottomWidth: 1
              }}
              onPress={() => {
                this.searchRider(checkout)
              }}
              underlayColor={Color.gray}
              >
                <View style={{
                  flexDirection: 'row'
                }}>
                  <Text style={{
                    width: '80%'
                  }}>Broadcast</Text>
                  <Text style={{
                      width: '20%',
                      textAlign: 'right'
                    }}>
                    <FontAwesomeIcon icon={faBiking}  />
                  </Text>
                </View>
              </TouchableHighlight>
            )
          }

          {
            checkout.status != 'completed' && (
              <TouchableHighlight style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 10,
                paddingRight: 10,
                borderBottomColor: Color.lightGray,
                borderBottomWidth: 1
              }}
              onPress={() => {
                this.viewOrder(checkout)
              }}
              underlayColor={Color.gray}
              >
                <View style={{
                  flexDirection: 'row'
                }}>
                  <Text style={{
                    width: '80%'
                  }}>Track Location</Text>
                  <Text style={{
                      width: '20%',
                      textAlign: 'right'
                    }}>
                    <FontAwesomeIcon icon={faMapMarkerAlt}  />
                  </Text>
                </View>
              </TouchableHighlight>
            )
          }
          

          {
            (checkout.customer_rating == null && (checkout.status == 'completed' || checkout.status == 'cancelled')) && (
              <TouchableHighlight style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 10,
                paddingRight: 10,
                borderBottomColor: Color.lightGray,
                borderBottomWidth: 1
              }}
                onPress={() => {
                  this.submitRatings(checkout, 'customer')
                }}
                underlayColor={Color.gray}
                >
                <View style={{
                  flexDirection: 'row'
                }}>
                  <Text style={{
                    width: '80%'
                  }}>Rate Customer</Text>
                  <Text style={{
                      width: '20%',
                      textAlign: 'right'
                    }}>
                    <FontAwesomeIcon icon={faStar}  />
                  </Text>
                </View>
              </TouchableHighlight>
            )
          }

          {
            (checkout.rider_rating == null && checkout.assigned_rider != null && (checkout.status == 'completed' || checkout.status == 'cancelled')) && (
              <TouchableHighlight style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 10,
                paddingRight: 10,
                borderBottomColor: Color.lightGray,
                borderBottomWidth: 1
              }}
              onPress={() => {
                this.submitRatings(checkout, 'rider')
              }}
              underlayColor={Color.gray}
              >
                <View style={{
                  flexDirection: 'row'
                }}>
                  <Text style={{
                    width: '80%'
                  }}>Rate Rider</Text>
                  <Text style={{
                      width: '20%',
                      textAlign: 'right'
                    }}>
                    <FontAwesomeIcon icon={faStar}  />
                  </Text>
                </View>
              </TouchableHighlight>
            )
          }

        </ScrollView>
      </Animated.View>
    );
  }

  render() {
    const { user, theme } = this.props.state
    const { isLoading, data,selected, ratingData, ratingModal, checkout } = this.state
    const { isViewItem, isBroadcasting } = this.state;
    return (
      <View style={Style.MainContainer}>
        {
          isBroadcasting && (
            <ActivityIndicator size="large" color={Color.primary} />
          )
        }
        <ScrollView
          style={Style.ScrollView}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            let scrollingHeight = event.nativeEvent.layoutMeasurement.height + event.nativeEvent.contentOffset.y
            let totalHeight = event.nativeEvent.contentSize.height - 20
            if(event.nativeEvent.contentOffset.y <= 0) {
              if(isLoading == false){
                this.retrieve(false)
              }
            }
            if(scrollingHeight >= (totalHeight + 10)) {
              if(isLoading == false){
                this.retrieve(true)
              }
            }
          }}
          >
          { isLoading ? <Spinner mode="overlay"/> : null }
          <View style={[Style.MainContainer, {
            minHeight: height
          }]}>
            {
              user === null ? 
              <View style={Style.notLoggedIn}>
                <FontAwesomeIcon
                  icon={faBan}
                  size={30}
                  style={{
                    color: Color.danger,
                    marginRight: 10
                  }}
                />
                <Text>You must log in first</Text>
              </View>
              :
              <View style={Style.orderHistory}>
                {
                  data.map((order, idx) => (
                    <OrderManagementCard
                      key={idx}
                      length={data.length - 1}
                      data={order}
                      onClick={(data) => this.showOptions(data)}
                    />
                  ))
                }
              </View>
            }
          </View>
        </ScrollView>
        {
          checkout && (
            this.options()
          )
        }
        {
            (ratingModal && ratingData) && (
              <CreateRatings data={ratingData} 
              visible={ratingModal}
              action={(flag) => {
                this.setState({
                  ratingModal: flag,
                  ratingData: null
                })
                this.retrieveItem(selected)
              }}
              title={'RATE ' + ratingData.payload.toUpperCase()}
              actionLabel={{
                no: 'Cancel',
                yes: 'Submit'
              }}
              />
            )
          }
          {
            (isViewItem && checkout) && (
              <OrderItems
                visible={isViewItem}
                data={checkout}
                setVisible={() => this.setState({ isViewItem: false })}
              />
            )
          }
          
      </View>
    )
  }
}

const mapStateToProps = state => ({state: state});

const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux');
  return {
    setOrder: (order) => dispatch(actions.setOrder(order))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OrderManagement);