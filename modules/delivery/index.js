import React, { Component } from 'react';
import {View, Image, TouchableHighlight, Text, ScrollView, FlatList, Dimensions, TouchableOpacity, Alert} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Thumbnail, List, ListItem, Separator } from 'native-base';
import { connect } from 'react-redux';
import { faMapMarker, faPhoneAlt, faStar, faComment } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Style from './Style.js';
import MapView, { PROVIDER_GOOGLE, Marker,Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { Routes, Color, Helper, BasicStyles } from 'common';
import Currency from 'services/Currency.js';
import * as Progress from 'react-native-progress';
// import MapViewDirections from 'react-native-maps-directions';
import CONFIG from 'src/config.js';
import Api from 'services/api/index.js';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import CreateRatings from 'components/Rating/StandardRatings.js';

const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

class Delivery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewerHeight: 50,
      region: {
        latitude: 123.885437,
        longitude: 10.315699,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      data: {},
      ratingModal: false,
      ratingData: null
    } 
  }

  componentDidMount(){
    // Geolocation.getCurrentPosition(info => {
    //   this.setState({region:{
    //     ...this.state.region,
    //     latitude:info.coords.latitude,
    //     longitude:info.coords.longitude
    //   }});

    //  }
    this.retrieve()
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      startOnBoot: false,
      debug:false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 120000,
      fastestInterval: 50000,
      activitiesInterval: 100000,
      stopOnStillActivity: false,
      url: 'http://192.168.81.15:3000/location',
    
    });

    BackgroundGeolocation.start(); //triggers start on start event


    BackgroundGeolocation.on('location', (location) => {
      this.setState({region:{
        ...this.state.region,
        latitude:location.latitude,
        longitude:location.longitude,
      }})
      console.log(location)
      const parameter = {
        checkout_id: this.state.data.id,
        sender: "rider",
        longitude: location.longitude,
        latitude: location.latitude,
      }
      console.log(parameter)
      BackgroundGeolocation.startTask(taskKey => {
        Api.request(Routes.locationSharing, parameter, response => {
          console.log("testing22",response)
        })
        BackgroundGeolocation.endTask(taskKey);
      });
    });
    
  
    
  }

  componentWillUnmount=()=>
  {
    BackgroundGeolocation.removeAllListeners()
  }

  retrieve(){
    const { order, user } = this.props.state;

    if(order == null || user == null){
      this.props.navigation.navigate('drawerStack');
      return
    }
    let parameter = {
      condition: [{
        value: order.checkout_id,
        column: 'id',
        clause: '='
      }],
      rider: user.id
    }
    Api.request(Routes.checkoutRetrieveByRider, parameter, response => {
      console.log(response.data[0])
      if(response.data.length > 0){
        this.setState({
          data: response.data[0]
        })
        if(response.data[0].location !== null){
          this.setState({
            region: {
              ...this.state.region,
              latitude: parseFloat(response.data[0].location.latitude),
              longitude: parseFloat(response.data[0].location.longitude)
            }
          })
        }
      }else{
        this.props.navigation.navigate('drawerStack');
      }
    })
  }

  goToMessenger(data) {
    if (data.code == null) return
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

  continueCompleteOrder(){
    const { data } = this.state;
    const { order } = this.props.state;
    if(data == null){
      // unable to update
      Alert.alert(
        "Error Message",
        "Incomplete data, unable to update!",
        [
          { text: "OK", onPress: () => {BackgroundGeolocation.removeAllListeners()}}
        ],
        { cancelable: true }
      );
      return
    }
    let parameter = {
      id: order.id,
      status: 'completed'
    }
    Api.request(Routes.deliveryUpdate, parameter, response => {
      if(response.data == true){
        Alert.alert(
          "Success Message",
          "Transaction completed!",
          [
            { text: "OK", onPress: () => {}}
          ],
          { cancelable: true }
        );
        let order = {
          ...order,
          status: 'completed'
        }
        const { setOrder} =  this.props;
        setOrder(order)
      }else{
        Alert.alert(
          "Error Message",
          "Unable to update.",
          [
            { text: "OK", onPress: () => {}}
          ],
          { cancelable: true }
        );
      }
    })
  }

  completeOrder(){
    Alert.alert(
      "Confirmation Message",
      "Are you sure you want to continue this action?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
        { text: "OK", onPress: () => this.continueCompleteOrder()}
      ],
      { cancelable: false }
    );
  }

  submitRatings(type){
    const { order } = this.props.state;
    if(order == null){
      return
    }
    console.log('order', order)
    let data = {
      payload: type,
      payload_value: type == 'merchant' ? order.merchant_id : order.account_id,
      payload1: 'checkout',
      payload_value1: order.checkout_id
    }
    this.setState({
      ratingModal: true,
      ratingData: data
    })
  }

  viewMore = () => {
    this.setState({
      viewerHeight: this.state.viewerHeight != 70 ? 70 : '50%'
    })
  }



  onRegionChange=(regionUpdate)=> {
    console.log('test',regionUpdate);
    this.setState({ region:regionUpdate });
  }

  _viewMore = () => {
    const { data } = this.state;
    const { order } = this.props.state;
    return (
        <View style={{
          width: '100%',
          paddingLeft: 10,
          paddingRight: 10,
          marginTop: 10
        }}>
          {
            data.merchant_location != null && (
              <View style={[Style.borderTop, {
                flexDirection: 'row',
              }]}>
                <Text style={[
                    BasicStyles.normalFontSize, {
                      color: Color.primary
                    }
                  ]}>
                  From {data.merchant_location.route + ', ' + data.merchant_location.locality}
                </Text>
              </View>
            )
          }

          {
            data.location != null && (
              <View style={[Style.borderTop, {
                flexDirection: 'row',
              }]}>
                <Text style={[
                    BasicStyles.normalFontSize, {
                      color: Color.primary
                    }
                  ]}>
                  To {data.location.route + ', ' + data.location.locality}
                </Text>
              </View>
              
            )
          }

          <View style={[Style.borderTop, {
            flexDirection: 'row',
            justifyContent: 'center'
          }]}>
            <Text style={[
                BasicStyles.normalFontSize, {
                }
              ]}>
              Order #: {data.order_number}
            </Text>
          </View>

          {
            /*
              Loop items here

           
           <View style={[Style.borderTop, {
            flexDirection: 'row',
            paddingLeft: 10
          }]}>
            <Text style={[BasicStyles.normalFontSize, {
              width: '50%'
            }]}>
              Item 1
            </Text>
            <Text style={[
                BasicStyles.normalFontSize, {
                  color: Color.gray,
                  width: '50%',
                  textAlign: 'right'
                }
              ]}>
              {
                Currency.display(100, 'PHP')
              }
            </Text>
          </View>

           */
          }

          <View style={[Style.borderTop, {
            flexDirection: 'row'
          }]}>
            <Text style={[BasicStyles.normalFontSize, {
              width: '50%'
            }]}>
              Subtotal 
            </Text>
            <Text style={[
                BasicStyles.normalFontSize, {
                  width: '50%',
                  textAlign: 'right'
                }
              ]}>
              {
                Currency.display(data.sub_total, data.currency ? data.currency : 'PHP')
              }
            </Text>
          </View>

          <View style={[Style.borderTop, {
            flexDirection: 'row'
          }]}>
            <Text style={[BasicStyles.normalFontSize, {
              width: '50%'
            }]}>
              Delivery fee 
            </Text>
            <Text style={[
                BasicStyles.normalFontSize, {
                  width: '50%',
                  textAlign: 'right'
                }
              ]}>
              {
                Currency.display(data.shipping_fee, data.currency ? data.currency : 'PHP')
              }
            </Text>
          </View>

          <View style={[Style.borderTop, {
            flexDirection: 'row'
          }]}>
            <Text style={[BasicStyles.normalFontSize, {
              width: '50%',
              color: Color.primary,
              fontWeight: 'bold'
            }]}>
              Total 
            </Text>
            <Text style={[
                BasicStyles.normalFontSize, {
                  width: '50%',
                  textAlign: 'right',
                  color: Color.primary,
                  fontWeight: 'bold'
                }
              ]}>
              {
                Currency.display(data.total, data.currency ? data.currency : 'PHP')
              }
            </Text>
          </View>
          {
            order.status === 'completed' && (
              <View style={[Style.borderTop, {
              }]}>

              {
                (data.merchant_rating == null || data.customer_rating == null) && (

                  <View style={{
                    flexDirection: 'row',
                    paddingTop: 10,
                    paddingBottom: 10
                  }}>
                    {
                      data.merchant_rating == null && (
                        <TouchableOpacity style={{
                          width: '45%',
                          paddingLeft: 10,
                          paddingRight: 10,
                          backgroundColor: Color.primary,
                          height: 50,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 5,
                          marginBottom: 10,
                          marginRight: '5%'
                        }}
                        onPress={()=>this.submitRatings('merchant')}
                        underlayColor={Color.primary}
                          >
                          <Text style={{
                            width: '50%',
                            textAlign: 'center',
                            color: Color.white
                          }}>
                            Rate Merchant
                          </Text>
                        </TouchableOpacity>
                      )
                    }
                    {
                      data.customer_rating == null && (
                        <TouchableOpacity style={{
                            width: '45%',
                            paddingLeft: 10,
                            paddingRight: 10,
                            backgroundColor: Color.secondary,
                            height: 50,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                            marginBottom: 10,
                            marginLeft: '5%'
                          }}
                          onPress={()=>this.submitRatings('customer')}
                          underlayColor={Color.primary}
                          >
                          <Text style={{
                            width: '50%',
                            textAlign: 'center',
                            color: Color.white
                          }}>
                            Rate Customer
                          </Text>
                        </TouchableOpacity>

                      )
                    }
                  </View>
                )
              }
                

                <Text style={[BasicStyles.normalFontSize, {
                  width: '100%',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }]}>
                  {order.status.toUpperCase()} 
                </Text>
              </View>
            )
          }
          {
            order.status != 'completed' && (
              <TouchableOpacity style={{
                  width: '100%',
                  paddingLeft: 10,
                  paddingRight: 10,
                  backgroundColor: Color.primary,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 5,
                  marginBottom: 10
                }}
                // onPress={() => this.completeOrder()}
                onPress={()=>this.completeOrder()}
                underlayColor={Color.primary}
                >
                <Text style={{
                  color: Color.white
                }}>Complete</Text>
              </TouchableOpacity>
            )
          }
          
        </View>
    )
  }
  
  _order = () => {
    const { data } = this.state;
    return (
      <View>
        <TouchableOpacity style={{
          width: '100%',
          paddingLeft: 10,
          paddingRight: 10
        }}
        onPress={() => this.viewMore()}
        underlayColor={Color.primary}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            height: 50
          }}>
            <Text style={{
              textAlign: 'left',
              width: '50%',
              fontWeight: 'bold'
            }}>{
              data.distance
            }</Text>
            <Text style={{
              textAlign: 'right',
              color: Color.primary,
              width: '50%',
              fontWeight: 'bold'
            }}>{
              data.name
            }</Text>
            {
              /*

              <View style={{
                width: '15%',
                alignItems: 'flex-end',
                justifyContent: 'center'
              }}>
                <TouchableOpacity style={{
                    backgroundColor: Color.success,
                    height: 40,
                    borderRadius: 25,
                    width: 40,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={() => {}}
                  underlayColor={Color.primary}
                  >
                    <FontAwesomeIcon icon={faPhoneAlt} color={Color.white}/>
                </TouchableOpacity>
              </View>

              */
            }
            
          </View>
        </TouchableOpacity>

        {/*
        <View style={{
          width: '100%',
          marginBottom: 2,
          height: 10,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Progress.Bar progress={0.3} width={width * .98}  color={Color.secondary}/>
        </View>
        */}
      </View>
    );
  }
  render() {
    const { data, ratingData, ratingModal } = this.state;
    return (
      <View style={Style.MainContainer}>
        <View style={{
          position: 'absolute'
        }}>
          <MapView
            style={Style.map}
            ref={(ref)=>this.mapView=ref}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            followsUserLocation={true}
            region={this.state.region}
            //onPress={()=>this.animate()}
            >
            {
              (data != null && data.merchant_location != null) && (
                <Marker
                  coordinate={{
                    longitude: parseFloat(data.merchant_location.longitude),
                    latitude: parseFloat(data.merchant_location.latitude),
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  draggable
                  onDragEnd={(e) => {
                    // this.manageOnDragEnd(e)
                  }}
                  title={data.merchant_location.route}
                />                
              )
            }


            {
              (data != null && data.location != null) && (
                <Marker
                  coordinate={{
                    longitude: parseFloat(data.location.longitude),
                    latitude: parseFloat(data.location.latitude),
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  draggable
                  onDragEnd={(e) => {
                    // this.manageOnDragEnd(e)
                  }}
                  title={data.location.route}
                />                
              )
            }

            {/*
              (order != null && order.merchant != null && order.location != null) && (
                <MapViewDirections
                  origin={order.merchant.location}
                  destination={order.location}
                  apikey={CONFIG.GOOGLE.API_KEY}
                  strokeWidth={3}
                  strokeColor={Color.primary}
                  timePrecision={'now'}
                  mode={''}
                />
              )*/
            }

          </MapView>
          <TouchableHighlight
            style={Style.messengerIcon}
            onPress={() => this.goToMessenger(data)}
          >
            <FontAwesomeIcon icon={faComment} color={Color.white} size={30} />
          </TouchableHighlight>
          <View style={{
            position: 'absolute',
            zIndex: 100,
            backgroundColor: Color.white,
            minHeight: this.state.viewerHeight,
            width: '100%',
            bottom: 0,
            borderTopRightRadius: 5,
            borderTopLeftRadius: 5
          }}>
          { data !== null && this._order() }
          {
            (data !== null && this.state.viewerHeight !== 50) && this._viewMore()
          }
          </View>
          {
            (ratingModal && ratingData) && (
              <CreateRatings data={ratingData} 
              visible={ratingModal}
              action={(flag) => {
                this.setState({
                  ratingModal: flag,
                  ratingData: null
                })
                this.retrieve()
              }}
              title={'RATE ' + ratingData.payload.toUpperCase()}
              actionLabel={{
                no: 'Cancel',
                yes: 'Submit'
              }}
              />
            )
          }
        </View>
      </View>
    );
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
)(Delivery);
