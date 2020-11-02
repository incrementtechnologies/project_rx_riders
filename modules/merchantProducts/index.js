import React, { Component } from 'react';
import {View, Image, TouchableHighlight, Text, ScrollView, FlatList, Dimensions, TouchableOpacity, ToastAndroid,Alert} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Thumbnail, List, ListItem, Separator } from 'native-base';
import { connect } from 'react-redux';
import { Empty } from 'components';
import { faMapMarker, faPhoneAlt,faImage,faCartArrowDown,faCartPlus, faChevronDown } from '@fortawesome/free-solid-svg-icons';
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
      limit: 5,
      variationBoxShowID:null,
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

  ShowHideVariation = (id) =>{
    this.setState({
       variationBoxShowID : id===this.state.variationBoxShowID?null:id
    })
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
    Alert.alert(
      "Update Item",
      "Are you sure to update Items Status?",
      [
        {
          text: "Cancel",
          onPress: () => {return},
          style: "cancel"
        },
        { text: "OK", onPress: () => {  
          this.setState({isLoading:true})
          Api.request(Routes.productsUpdate, parameter, response => {
            if(response.data==true)
            {
              Alert.alert(
                "Item Status",
                "Item Status was updated successfully",
                [
                  {
                    text:"Ok",
                    onPress:()=>{this.setState({isLoading:false})}
                  }
                ]
              )
            }
          }, error => {
          console.log('error', error)
        });} }
      ],
      { cancelable: false }
    );
    console.log(this.props.state)
  
  }

  updateVariation=(index,status,variation)=>{
    const products=[...this.state.data];
    const productIndex=products.findIndex(product=>{
      if(product.variation!=null && product.variation[index]!=null)
      {
        return product.variation[index].id==variation.id
      }
    })

    products[productIndex].variation[index].status=status;

    console.log(`${products[productIndex].title}${products[productIndex].variation[index].payload_value}${products[productIndex].variation[index].status}`)
    
    this.setState({data:products})
   

    
    let parameters= {
      id:variation.id,
      status:status,
      }

    Api.request(Routes.variationsUpdate, parameters, response => {
      console.log(response)
        if(response.data==true)
        {
          Alert.alert(
            "Item Status",
            "Item Status was updated successfully",
            [
              {
                text:"Ok",
                onPress:()=>{this.setState({isLoading:false})}
              }
            ]
          )
        }
      }, error => {
      console.log('error', error)
    })
    
    
  
    // console.log(variation)
    // console.log(item)


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
                          <View style={{flexDirection:"row",justifyContent:'space-between'}}>
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
                          {
                            item.variation && 
                            <TouchableOpacity style={{paddingTop:15}}onPress={()=>{this.ShowHideVariation(item.id)}}>
                             <FontAwesomeIcon icon={faChevronDown} size={25} style={[Style.image, {color: '#ccc',alignSelf:'center',marginRight:3}]} />
                             </TouchableOpacity>
                          }
                        </View>
                      
                   
                        </View>
                        {item.variation!=null && this.state.variationBoxShowID===item.id? (
                          <View style={{  marginTop:3,borderTopColor: Color.lightGray,
                            borderTopWidth: 1}}>
                          {/*                 FLAT LIST FOR VARIATIONS                */}
                               <FlatList
                               data={item.variation}
                               extraData={this.state.selected}
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
                                   {item.payload_value}
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
                                  <View style={{flexDirection:"row",justifyContent:'space-between'}}>
                                  <TouchableOpacity style={{
                                    backgroundColor: item.status != 'completed' ? Color.danger : Color.gray,
                                    borderRadius: 5,
                                    width: '35%',
                                    marginTop:5,
                                    height:35,
                                    flexDirection:'row',
                                    justifyContent:'center'
                                  }}
                                  onPress={()=> this.updateVariation(index,item.status=="outOfStock"?"published":"outOfStock",item)}
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
                                <Text style={{paddingTop:10}}>{Currency.display(item.price, 'PHP')}</Text>
                                </View>
                              
                           
                                </View>
                            
                              </View>
                           ////////////////////////////////////////FLAT LIST FOR VARIATIONS////////////////////////////
                               )}
                               keyExtractor={(item, index) => index.toString()}
                             />
                             </View>
                        ) : null }
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
