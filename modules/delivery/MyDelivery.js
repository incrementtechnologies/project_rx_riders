import React, { Component } from 'react';
import {View, Image, TouchableHighlight, Text, ScrollView, FlatList, Dimensions, TouchableOpacity, ToastAndroid} from 'react-native';
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
      selected: null,
      offset: 0,
      limit: 5
    } 
  }

  componentDidMount(){
    this.retrieve(this.state.offset)
  }

  retrieve(active){
    let page = active
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
      }],
      sort: {
        created_at: 'desc'
      },
      limit: this.state.limit,
      offset: (page * this.state.limit)
    }
    Api.request(Routes.myDeliveryRetrieve, parameter, response => {
      console.log(response)
      this.setState({
        isLoading: false
      })

      // if(response.data.length > 0){
      // temporary --- (false)
      if (response.data.length > 0) {
        if(active == 0){
          if(this.state.data == null){
            this.setState({
              data: response.data
            })
            this.setState({
              offset: page + 1
            })  
          }
        }else{
          let previousData = this.state.data
          previousData.push(...response.data)
          this.setState({
            data: previousData
          })
          this.setState({
            offset: page + 1
          })
        }
      } else {
        if(active > 0){
          ToastAndroid.show('Nothing follows!', ToastAndroid.LONG);
        }
      }
    }, error => {
      console.log('error', error)
    });
  }

  viewOrder(params){
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
          let scrollingHeight = event.nativeEvent.layoutMeasurement.height + event.nativeEvent.contentOffset.y
          let totalHeight = event.nativeEvent.contentSize.height - 20
          if(event.nativeEvent.contentOffset.y <= 0) {
            this.retrieve(0)
          }
          if(scrollingHeight >= totalHeight) {
            if(this.state.isLoading == false){
              this.retrieve(this.state.offset)
            }
          }
        }}
        >
        {isLoading ? <Spinner mode="overlay" style={{
          zIndex: 100
        }}/> : null }

        <View>
          <Text style={{
            textAlign: 'center',
            paddingTop: 10
          }}>Scroll down to load more</Text>
        </View>

        {data == null && (<Empty refresh={true} onRefresh={() => this.retrieve()}/>)}
        <View style={[Style.MainContainer, {
          minHeight: height
        }]}>
          {
            data && (
                <FlatList
                  data={data}
                  extraData={selected}
                  ItemSeparatorComponent={this.FlatListItemSeparator}
                  renderItem={({ item, index }) => (
                      <TouchableHighlight
                        onPress={() => {this.viewOrder(item)}}
                        underlayColor={Color.primary}
                        style={{
                          width: '100%',
                          paddingTop: 10,
                          paddingBottom: 10,
                          paddingLeft: 20,
                          paddingRight: 20,
                          borderBottomColor: Color.lightGray,
                          borderBottomWidth: 1
                        }}
                        >
                        <View style={[Style.TextContainer, {
                        }]}>
                          <View>
                            <Text style={[BasicStyles.normalFontSize, {
                              color: Color.gray
                            }]}>{item.date}</Text>
                          </View>
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
                              item.checkout.shipping_fee &&
                              item.checkout.currency &&
                              Currency.display(item.checkout.shipping_fee, item.checkout.currency)
                            }
                            </Text>
                          </View>
                          {/*
                          <View style={{
                            flexDirection: 'row'
                          }}>

                            <View style={{
                              width: '50%'
                            }}>
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
                                  item.merchant_location.route
                                }</Text>
                              </View>
                            </View>


                            <View style={{
                              width: '50%'
                            }}>
                              <View>
                                <Text style={[BasicStyles.normalFontSize, {
                                  color: Color.gray
                                }]}>To</Text>
                              </View>
                              <View style={{
                                flexDirection: 'row'
                              }}>
                                <FontAwesomeIcon icon={faMapMarker} color={Color.primary}/>
                                {
                                  item.location != null && (
                                    <Text style={[BasicStyles.normalFontSize, {
                                    }]}>{
                                      item.location.route
                                    }</Text>
                                  )
                                }
                              </View>
                            </View>

                          </View>
                          */}

                          <View style={{
                            backgroundColor: item.status != 'completed' ? Color.danger : Color.gray,
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
