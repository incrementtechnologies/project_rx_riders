import React, { Component } from 'react';
import {
  ScrollView,
  View,
  Text,
  Button,
  Dimensions,
  Animated,
  TouchableOpacity
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

import OrderManagementCard from './OrderManagementCard';

const height = Math.round(Dimensions.get('window').height);

class OrderManagement extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoading: false,
      data: [],
      selected: null,
      bounceValue: new Animated.Value(100)
    }
  }

  componentDidMount() {
    this.retrieve()
  }

  retrieve = () => {
    const { user } = this.props.state;
    if(user === null || user.sub_account == null || user.sub_account.merchant == null) {
      return
    }
    let parameter = {
      condition: [{
        value: user.sub_account.merchant.id,
        clause: '=',
        column: 'merchant_id'
      }],
      sort: {
        status: 'desc'
      },
      limit: 5,
      offset: 0
    }
    
    this.setState({
      isLoading: true
    })

    Api.request(Routes.checkoutRetrieveOrdersMerchant, parameter, response => {
      this.setState({isLoading: false, data: response.data})
    },error => {
      this.setState({isLoading: false, data: []})
    });
  }

  showOptions(data){
    const { selected } = this.state;
    if(selected){
      this.setState({
        selected: null
      })
    }else{
      this.setState({
        selected: data
      })
    }
  }

  options(){
    const { selected } = this.state;
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
            height: height * 0.4,
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
              Order #: {selected.order_number}
            </Text>
            <TouchableOpacity 
              style={{
                width: '20%',
                alignItems: 'flex-end',
                paddingRight: 10
              }}
              onPress={() => {
                this.setState({
                  selected: null
                })
              }}
              >
              <FontAwesomeIcon
                icon={faTimes}
              />
            </TouchableOpacity>
          </View>

          {
            selected.status == 'pending' && (
              <TouchableOpacity style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 10,
                paddingRight: 10,
                borderBottomColor: Color.lightGray,
                borderBottomWidth: 1
              }}>
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
              </TouchableOpacity>
            )
          }

          <TouchableOpacity style={{
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 10,
            paddingRight: 10,
            borderBottomColor: Color.lightGray,
            borderBottomWidth: 1
          }}>
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
          </TouchableOpacity>

          <TouchableOpacity style={{
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 10,
            paddingRight: 10,
            borderBottomColor: Color.lightGray,
            borderBottomWidth: 1
          }}>
            <View style={{
              flexDirection: 'row'
            }}>
              <Text style={{
                width: '80%'
              }}>Show Products</Text>
              <Text style={{
                  width: '20%',
                  textAlign: 'right'
                }}>
                <FontAwesomeIcon icon={faEye}  />
              </Text>
            </View>
          </TouchableOpacity>


          {
            (selected.status == 'pending' && item.assigned_rider == null && item.scope_location != null) && (
              <TouchableOpacity style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 10,
                paddingRight: 10,
                borderBottomColor: Color.lightGray,
                borderBottomWidth: 1
              }}>
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
              </TouchableOpacity>
            )
          }

          {
            selected.status != 'completed' && (
              <TouchableOpacity style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 10,
                paddingRight: 10,
                borderBottomColor: Color.lightGray,
                borderBottomWidth: 1
              }}>
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
              </TouchableOpacity>
            )
          }
          

          <TouchableOpacity style={{
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 10,
            paddingRight: 10,
            borderBottomColor: Color.lightGray,
            borderBottomWidth: 1
          }}>
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
          </TouchableOpacity>

          <TouchableOpacity style={{
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 10,
            paddingRight: 10,
            borderBottomColor: Color.lightGray,
            borderBottomWidth: 1
          }}>
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
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>
    );
  }

  render() {
    const { user, theme } = this.props.state
    const { isLoading, data,selected } = this.state
    return (
      <View style={Style.MainContainer}>
        <ScrollView style={Style.ScrollView} showsVerticalScrollIndicator={false}>
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
          selected && (
            this.options()
          )
        }
      </View>
    )
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
)(OrderManagement);