import React, { Component } from 'react';
import {View, Image, TouchableHighlight, Text, ScrollView, FlatList, Dimensions, TouchableOpacity, ToastAndroid} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Thumbnail, List, ListItem, Separator } from 'native-base';
import { connect } from 'react-redux';
import { Empty } from 'components';
import { faMapMarker, faPhoneAlt,faImage,faCartArrowDown,faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Style from './Style.js';
import { Routes, Color, Helper, BasicStyles } from 'common';
import Currency from 'services/Currency.js';
import * as Progress from 'react-native-progress';
import { Spinner } from 'components';
import Api from 'services/api/index.js';
import Config from 'src/config.js'

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
      inventory_type: null,
      account_id: this.props.state.user.sub_account.merchant.id,
      condition : [{
          column: 'merchant_id',
          clause: '=',
          value: this.props.state.user.sub_account.merchant.id
      }],
      sort: {
        created_at: 'desc'
      },
      limit: this.state.limit,
      offset: (page * this.state.limit)
    }
    Api.request(Routes.productsRetrieve, parameter, response => {
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

  updateItem=(index,status)=>
  {
    const products=[...this.state.data];
    products[index].status=status;
    this.setState({data:products,products});

    let parameter={
      id:products[index].id,
      status:status,
    };
    console.log(this.props.state)
    Api.request(Routes.productsUpdate, parameter, response => {
      alert(response.data)
    }, error => {
      console.log('error', error)
    });
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
        {this.state.isLoading ? <Spinner mode="overlay" style={{
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
                      <View
                       
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
                          <View style={{
                            flexDirection: 'row',
                           
                            width: '100%'
                          }}>
                       
                        
                            <Text style={[BasicStyles.normalFontSize, {
                              width: '50%',
                              fontWeight:'bold'      
                            }]}>
                           {item.title}
                            </Text>

                            <Text style={[BasicStyles.normalFontSize, {
                            
                              width: '50%',
                             color: item.status != 'outOfStock' ? Color.primary : Color.danger,
                              fontWeight: 'bold',
                              textAlign: 'right'
                            }]}>
                           {item.status.charAt(0).toUpperCase()+item.status.slice(1)}
                            </Text>
                          </View>
                          <View style={{flexDirection:"row"}}>
                          <TouchableOpacity style={{
                            backgroundColor: item.status != 'completed' ? Color.danger : Color.gray,
                            borderRadius: 5,
                            width: '35%',
                            marginTop:5,
                            height:50,
                            flexDirection:'row',
                            justifyContent:'center'
                          }}
                          onPress={()=> this.updateItem(index,item.status=="outOfStock"?"published":"outOfStock")}
                          >
                           
                            {item.status!="outOfStock" ? 
                            <React.Fragment>
                            <FontAwesomeIcon icon={faCartArrowDown} size={15} style={[Style.image, {color: '#ccc',alignSelf:'center',marginRight:3}]} /> 
                            <Text style={{color:Color.white,textAlignVertical:'center'}}>Out Of Stock</Text>
                            </React.Fragment> 
                            :
                            <React.Fragment>
                             <FontAwesomeIcon icon={faCartPlus} size={15} style={[Style.image, {color: '#ccc',alignSelf:'center',marginRight:3}]} />
                             <Text style={{color:Color.white,marginLeft:10,textAlign:'center',textAlignVertical:'center'}}>Publish</Text>
                             </React.Fragment> }
            
                          </TouchableOpacity>
                        </View>

                        </View>
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
