import React, { Component } from 'react';
import {View, Image, TouchableHighlight, Text, ScrollView, FlatList, Dimensions, TouchableOpacity,TextInput} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Thumbnail, List, ListItem, Separator } from 'native-base';
import { connect } from 'react-redux';
import Modal from "react-native-modal";
import { Empty } from 'components';
import { faMapMarker, faPhoneAlt,faTimes, faPepperHot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import styles from './Style.js';
import { Routes, Color, Helper, BasicStyles } from 'common';
import Currency from 'services/Currency.js';
import * as Progress from 'react-native-progress';
import { Spinner } from 'components';
import Api from 'services/api/index.js';
import {ledgerData} from './ledger-data-test';
import {Ledger} from 'components/Ledger'
import Otp from 'components/Modal/Otp.js';
import _ from 'lodash';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 0;
  return layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom;
};


const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

class Ledgers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      isLoading: false,
      selected: null,
      isOtpModal: false,
      transferModal: false,
      type: "PHP",
      limit: 5,
      offset: 0,
      location: 0,
      history: [],
      balance: []
    } 
  }

  componentDidMount=()=>
  {
    if(this.props.state.user!=null)
    {
      this.retrieve({offset:this.state.offset})
    }
  }

  retrieve = ({offset}) => {
    const { user } = this.props.state;
    if(user == null){
      return
    }
  
    const summaryParameter = {
      account_id: user.id,
      account_code: user.code
    }
    
    this.setState({
      isLoading: true
    })

    Api.request(Routes.ledgerSummary, summaryParameter, response => {
      console.log('ledgerSummary', response)
      this.setState({
        balance: response.data.length > 0 ? response.data : [{
          currency: 'PHP',
          balance: 0
        }]
      })
      this.setState({isLoading: false})
    },error => {
      this.setState({isLoading: false})
      console.log(error)
    });

    const historyParameter = {
      account_id: user.id,
      account_code: user.code,
      limit: this.state.limit,
      offset: offset,
    }

    Api.request(Routes.ledgerHistory, historyParameter, response => {
      if (response.data.length > 0) {
        this.setState({
          isLoading: false,
          history: response.data,
        })        
      }
    },error => {
      this.setState({isLoading: false})
      console.log(error)
    });
  }


  onSuccess = () => {
    const parameter2 = {
      amount:this.state.amount,
      account_id:this.props.state.user.id,
      account_code:this.props.state.user.code,
      currency:this.state.type,
      payment_payload:1,
      payment_payload_value:1,
      notes:"test",
      stage:2,
      charge:0,
    }

    this.setState({ isLoading: false })
    Api.request(Routes.withdrawalCreate, parameter2, response => {
      this.setState({ isLoading: false })
    }, error => {
      this.setState({ isLoading: false })
      console.log({ error })
    })
    this.setState({isOtpModal:false})
  }

  OTPmodalOpen = (resend) => {
    this.setState({ isLoading: true })
    const parameter = {
      amount: this.state.amount,
      account_id: this.props.state.user.id,
      account_code: this.props.state.user.code,
      currency: this.state.type,
      payment_payload: 1,
      payment_payload_value: 1,
      notes: "test",
      stage: 1,
      charge: 0
    }

    this.setState({ isLoading: false })
    console.log(parameter)
    Api.request(Routes.withdrawalCreate, parameter, response => {
      console.log("request",response)
      this.setState({ isLoading: false })
    }, error => {
      this.setState({ isLoading: false })
      console.log({ error })
    })

    if(resend == false){
      this.setState({isOtpModal:true})
    }
  }

  balanceRender = (data) => {
    return(
      <View>
        {
          data.map(item => {
            return (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderBottomWidth: 0.25,
                marginHorizontal: 20,
                padding: 15
              }}>
                <Text style={{
                  fontWeight: 'bold',
                  fontSize: 15
                }}>
                  {
                    item.currency
                  }
                </Text>
                <Text style={{
                  fontSize:15,
                  fontWeight: 'bold'
                }}>
                  {
                    parseFloat(item.balance).toFixed(2)
                  }
                </Text>
              </View>
            )
          })
        }
      </View>
    )
  }

  renderHistory = (data) => {
    return(
      <View>
        {
          data.map(item => {
            return (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderBottomWidth: 0.25,
                marginHorizontal: 20,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 15,
                paddingBottom: 15
              }}>
                <Text style={{
                }}>
                  {
                    item.description
                  }
                </Text>
                <Text style={{
                  color: item.amount >= 0 ? Color.primary : Color.danger,
                  fontWeight: 'bold'
                }}>
                  {
                    (item.amount >= 0 ? '+' : '-') + Currency.display(item.amount, item.currency)
                  }
                </Text>
              </View>
            )
          })
        }
      </View>
    )
  }

 transferModalOpen = () => {
   return(
    <Modal isVisible={this.state.transferModal}>
      <View style={styles.modalContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={{
              width: '70%'
            }}
            >
              <Text style={styles.text}>Transfer</Text>
            </View>
            <View style={{
              width: '30%',
              alignItems: 'flex-end',
              justifyContent: 'center'
            }}>
              <TouchableOpacity onPress={() => this.setState({transferModal:false})} style={styles.close}>
                <FontAwesomeIcon icon={ faTimes } style={{
                  color: Color.danger
                }} size={BasicStyles.iconSize} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.content}>
          <View style={{flexDirection:'row',justifyContent:'space-evenly',marginTop:25, marginBottom:15}}>
          <TouchableOpacity
                onPress={()=>{this.setState({type:"PHP"})}}
                style={this.state.type=="PHP" ? styles.buttonPicked : styles.notPicked}
                >
                <Text style={{
                    color:this.state.type=="PHP" ? '#FF5B04' : '#CCCCCC',
                  textAlign: 'center',
                  
                }}>PHP</Text>
              </TouchableOpacity>

              <TouchableOpacity
               onPress={()=>{this.setState({type:"USD"})}}
               style={this.state.type=="USD" ? styles.buttonPicked : styles.notPicked}
                >
                <Text style={{
                  color:this.state.type=="USD" ? '#FF5B04' : '#CCCCCC',
                  textAlign: 'center',
                  
                }}>USD</Text>
              </TouchableOpacity>
      
          </View>
          <View style={{paddingLeft:15,paddingTop:5,paddingBottom:5}}>
          <View style={{
            position: 'relative', width:'100%'
          }}>
          <Text>Input Amount to Transfer:</Text>
          </View>
           <TextInput
              style={{fontSize:20}}
              onChangeText={(amount) => {
                this.setState({amount})
              }}
              value={this.state.amount}
              placeholder={Currency.display(0,this.state.type)}
            />
            </View>
          </View>
          {
              this.footerActions()   
          }
        </View>
      </View>
    
      {this.state.isLoading ? <Spinner mode="overlay"/> : null }
    </Modal>
    )
 }

 check = () => {
   console.log(Currency.display(0,this.state.type))
 }

 footerActions = () => {
  return (
    <View style={[styles.action, {flexDirection: 'row'}]}>
      <View style={{
        width: '50%',
        alignItems: 'center'
      }}>
        <TouchableOpacity 
          onPress={() => this.setState({transferModal:false})}
          underlayColor={Color.gray}
          >
          <Text style={[styles.text, {
            color: Color.danger
          }]}>Cancel</Text>
        </TouchableOpacity>
      </View>    
        <View style={{
          width: '50%',
          alignItems: 'center',
          borderLeftColor: Color.gray,
          borderLeftWidth: 1
        }}>
          <TouchableOpacity 
            onPress={() => this.OTPmodalOpen(false)}
            underlayColor={Color.gray}
            >
            <Text style={[styles.text, {
              color: Color.primary
            }]}>Proceed</Text>
          </TouchableOpacity>
        </View>
    </View>

  );
}

  render() {
    const { user, isLoading } = this.props.state; 
    const { data, selected } = this.state;
    const { balance, history } = this.state;
    return (
      <ScrollView
        style={styles.ScrollView}
        > 
          <Image
            source={require("src/assets/logo-alt.png")}
            style={{marginTop:20,height:80,width:80, alignSelf:'center'}} 
           />

          <View style={{marginTop:15}}>
            <Text style={{
              alignSelf:'center',
              fontWeight:'bold',
              marginBottom:10
            }}>E-Wallet Balance</Text>
            {
              this.balanceRender(balance)
            }
          </View>

          {
            history.length > 0 && (
            <View style={{marginTop:15}}>
              <Text style={{
              paddingLeft: 20,
              fontWeight: 'bold',
              marginBottom:10,
              marginTop: 10
            }}>Recent Activity</Text>
                {
                  this.renderHistory(history)
                }
              </View>
            )
          }
      
     
            <Otp visible={this.state.isOtpModal} 
                title={"OTP"}    
                actionLabel={{
                yes: 'Authenticate',
                no: 'Cancel'
              }}
              error={''}
              blockedFlag={false}
              onSuccess={()=>this.onSuccess()}
              onResend={()=>this.OTPmodalOpen(true)}
              onCancel={() => this.setState({isOtpModal: false,isLoading:false})}
            />
         
          {this.transferModalOpen()}

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
)(Ledgers);
