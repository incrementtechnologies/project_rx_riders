import React, { Component } from 'react';
import {View, Image, TouchableHighlight, Text, ScrollView, FlatList, Dimensions, TouchableOpacity} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Thumbnail, List, ListItem, Separator } from 'native-base';
import { connect } from 'react-redux';
import { faMapMarker, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Style from './Style.js';
import MapView, { PROVIDER_GOOGLE, Marker,Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { Routes, Color, Helper, BasicStyles } from 'common';
import Currency from 'services/Currency.js';
import * as Progress from 'react-native-progress';
// import MapViewDirections from 'react-native-maps-directions';
import CONFIG from 'src/config.js';

const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

class Delivery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewerHeight: 70,
      region: {
        latitude: 10.342326,
        longitude: 123.8957059,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    } 
  }

  componentDidMount(){
    // Geolocation.getCurrentPosition(info => {
    //   this.setState({region:{
    //     ...this.state.region,
    //     latitude:info.coords.latitude,
    //     longitude:info.coords.longitude
    //   }});
    //  })
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
    return (
        <View style={{
          width: '100%',
          paddingLeft: 10,
          paddingRight: 10,
          marginTop: 10
        }}>
          <View style={[Style.borderTop, {
            flexDirection: 'row',
            justifyContent: 'center'
          }]}>
            <FontAwesomeIcon icon={faMapMarker} color={Color.primary}/>
            <Text style={[
                BasicStyles.normalFontSize, {
                  color: Color.primary
                }
              ]}>
              Casili, Consolacion, Cebu
            </Text>
          </View>
          <View style={[Style.borderTop, {
            flexDirection: 'row'
          }]}>
            <Text style={BasicStyles.normalFontSize}>
              Order Number : 
            </Text>
            <Text style={[
                BasicStyles.normalFontSize, {
                  color: Color.gray
                }
              ]}>
              123456
            </Text>
          </View>

          {
            /*
              Loop items here

            */
          }
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
                Currency.display(100, 'PHP')
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
                Currency.display(50, 'PHP')
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
                Currency.display(200, 'PHP')
              }
            </Text>
          </View>
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
            onPress={() => this.viewMore()}
            underlayColor={Color.primary}
            >
            <Text style={{
              color: Color.white
            }}>Complete</Text>
          </TouchableOpacity>
        </View>
    )
  }
  
  _order = () => {
    const { user } = this.props.state;
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
              color: Color.primary,
              width: '50%'
            }}>{
              '3.5 km: 30 mins'
            }</Text>
            <Text style={{
              textAlign: 'right',
              color: Color.primary,
              width: '35%',
              fontWeight: 'bold'
            }}>{
              user.username.toUpperCase()
            }</Text>
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
          </View>
        </TouchableOpacity>
        <View style={{
          width: '100%',
          marginBottom: 2,
          height: 10,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Progress.Bar progress={0.3} width={width * .90}  color={Color.secondary}/>
        </View>
      </View>
    );
  }
  render() {
    const { user, order } = this.props.state;
    return (
      <View style={Style.MainContainer}>
        <View style={{
          position: 'absolute'
        }}>
          <MapView
            style={Style.map}
            ref={(ref)=>this.mapView=ref}
            provider={PROVIDER_GOOGLE}
            region={this.state.region}
            onRegionChangeComplete={(e)=>this.onRegionChange(e)}
            //onPress={()=>this.animate()}
            >
            {
              (order != null && order.merchant_location != null) && (
                <Marker
                  coordinate={{
                    longitude: parseFloat(order.merchant_location.longitude),
                    latitude: parseFloat(order.merchant_location.latitude),
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  draggable
                  onDragEnd={(e) => {
                    // this.manageOnDragEnd(e)
                  }}
                  title={order.merchant_location.route}
                />                
              )
            }


            {
              (order != null && order.location != null) && (
                <Marker
                  coordinate={{
                    longitude: parseFloat(order.location.longitude),
                    latitude: parseFloat(order.location.latitude),
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  draggable
                  onDragEnd={(e) => {
                    // this.manageOnDragEnd(e)
                  }}
                  title={order.location.route}
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
          <View style={{
            position: 'absolute',
            zIndex: 100,
            backgroundColor: Color.white,
            minHeight: this.state.viewerHeight,
            width: '94%',
            bottom: 5,
            left: '3%',
            borderRadius: 5
          }}>
          { user !== null && this._order() }
          {
            (user !== null && this.state.viewerHeight !== 70) && this._viewMore()
          }
          </View>
        </View>
      </View>
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
)(Delivery);
