import React, { Component } from 'react';
import {View, Image, TouchableHighlight, Text, ScrollView, FlatList, Dimensions, TouchableOpacity} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Thumbnail, List, ListItem, Separator } from 'native-base';
import { connect } from 'react-redux';
import { Empty } from 'components';
import { faMapMarker, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Style from './Style.js';
import { Routes, Color, Helper, BasicStyles } from 'common';
import Currency from 'services/Currency.js';
import * as Progress from 'react-native-progress';
import { Spinner } from 'components';
import Api from 'services/api/index.js';

const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

class MyDelivery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      isLoading: false,
      selected: null
    } 
  }

  componentDidMount(){
    this.retrieve()
  }

  retrieve(){
    const { user } = this.props.state;
    if(user == null){
      return
    }
    this.setState({
      isLoading: true
    })
    let parameter = {
      condition: [{
        column: 'rider',
        clause: '=',
        value: user.id
      }]
    }
    Api.request(Routes.deliveryRetrieve, parameter, response => {
      this.setState({
        isLoading: false
      })
      if(response.data.length > 0){
        this.setState({
          data: response.data
        })
      }else{
        this.setState({
          data: [{
            account: {
              first_name: 'Kennette',
              last_name: 'Canales'
            },
            location: {
              route: 'Casili',
              latitude: 10.384326,
              longitude: 123.9310962
            },
            checkout: {
              order_number: '1234',
              sub_total: 150,
              total: 200,
              shipping_fee: 50,
              currency: 'PHP'
            },
            merchant: {
              location: {
                route: 'McDo',
                latitude: 10.342326,
                longitude: 123.8957059
              }
            },
            status: 'pending'
          }]
        })
      }
    }, error => {
      console.log('error', error)
    });
  }

  viewOrder(params){
    console.log(params)
    const { setOrder } = this.props;
    setOrder(params)
    this.props.navigation.navigate('mapStack');
  }


  render() {
    const { user, isLoading } = this.props.state; 
    const { data, selected } = this.state;
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
        {data == null && (<Empty refresh={true} onRefresh={() => this.retrieve()}/>)}
        {isLoading ? <Spinner mode="overlay"/> : null }
        <View style={[Style.MainContainer, {
          minHeight: height + 50
        }]}>
          {
            data && (
                <FlatList
                  data={data}
                  extraData={selected}
                  ItemSeparatorComponent={this.FlatListItemSeparator}
                  renderItem={({ item, index }) => (
                    <View style={{
                      paddingTop: 10,
                      paddingBottom: 10,
                      borderBottomColor: Color.lightGray,
                      borderBottomWidth: 1
                    }}>
                      <TouchableHighlight
                        onPress={() => {this.viewOrder(item)}}
                        underlayColor={Color.primary}
                        style={{
                          width: '100%'
                        }}
                        >
                        <View style={[Style.TextContainer, {
                          backgroundColor: Color.white
                        }]}>
                          <View style={{
                            flexDirection: 'row',
                            width: '100%'
                          }}>
                            <Text style={[BasicStyles.normalFontSize, {
                              width: '50%'      
                            }]}>
                            {
                              'Order Number: #' + item.checkout.order_number
                            }
                            </Text>

                            <Text style={[BasicStyles.normalFontSize, {
                              width: '50%',
                              color: Color.primary,
                              fontWeight: 'bold',
                              textAlign: 'right'
                            }]}>
                            {
                              Currency.display(item.checkout.total, item.checkout.currency)
                            }
                            </Text>
                          </View>
                          <View style={{
                            flexDirection: 'row'
                          }}>

                            <View style={{
                              width: '50%'
                            }}>
                              {
                                /*
                                   From address
                                */
                              }
                              <View>
                                <Text style={[BasicStyles.normalFontSize, {
                                  color: Color.gray
                                }]}>From</Text>
                              </View>
                              <View style={{
                                flexDirection: 'row'
                              }}>
                                <FontAwesomeIcon icon={faMapMarker} color={Color.primary}/>
                                <Text style={[BasicStyles.normalFontSize, {
                                  
                                }]}>{
                                  item.merchant.location.route
                                }</Text>
                              </View>
                            </View>


                            <View style={{
                              width: '50%'
                            }}>
                              {
                                /*
                                   To address
                                */
                              }
                              <View>
                                <Text style={[BasicStyles.normalFontSize, {
                                  color: Color.gray
                                }]}>To</Text>
                              </View>
                              <View style={{
                                flexDirection: 'row'
                              }}>
                                <FontAwesomeIcon icon={faMapMarker} color={Color.primary}/>
                                <Text style={[BasicStyles.normalFontSize, {
                                  
                                }]}>{
                                  item.location.route
                                }</Text>
                              </View>
                            </View>

                          </View>

                          <View style={{
                            backgroundColor: Color.primary,
                            borderRadius: 5,
                            width: '30%',
                            marginTop: 5
                          }}>
                            <Text style={{
                              color: Color.white,
                              textAlign: 'center'
                            }}>
                              {
                                item.status.toUpperCase()
                              }
                            </Text>
                          </View>
                          
                          

                        </View>
                      </TouchableHighlight>
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
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
  return {
    setOrder: (order) => dispatch(actions.setOrder(order))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MyDelivery);
