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


const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

class Ledgers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      isLoading: false,
      selected: null,
      isOtpModal:false,
      transferModal:false,
      type:"PHP",
      balance:[],
    } 
  }

  componentDidMount=()=>
  {
    if(this.props.state.user!=null)
    {
      this.retrieve()
    }
  }

  retrieve = () => {
    const { user } = this.props.state;
  
    const parameter = {
      account_id:user.id,
      account_code:user.code

    }
    this.setState({
      isLoading: true
    })
    Api.request(Routes.ledgerSummary, parameter, response => {
      this.setState({isLoading: false})
      console.log('test',response)
      this.setState({balance:response.data})
    },error => {
      console.log(error)
    });
  }

  balanceRender=(details)=>
  {
    return(
   
      <View style={{flexDirection:'row', justifyContent:'space-between',borderBottomWidth:0.25,marginHorizontal:20,padding:15}}>
     
      <Text style={{fontWeight:'bold',fontSize:15}} >{details.currency}</Text>
      <Text style={{fontSize:15}}>{`${details.currency} ${details.balance}`}</Text>
      
      </View>
    )
  }

 OTPmodalOpen=()=>
 {
  
  this.setState({ isLoading: true })
  const parameter = {
    amount:this.state.amount,
    account_id:this.props.state.user.id,
    account_code:this.props.state.user.code,
    currency:this.state.type,
    payment_payload:1,
    payment_payload_value:1,
    notes:"test",
    stage:1,
    charge:0,
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

  
  this.setState({isOtpModal:true})
 }

 transferModalOpen=()=>
 {
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
            <TouchableOpacity onPress={() => alert("Cancel")} style={styles.close}>
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

 check=()=>
 {
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
              onPress={() => this.OTPmodalOpen()}
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
 
onSuccess=()=>
{
  alert("success");
}

  render() {
    const { user, isLoading } = this.props.state; 
    const { data, selected } = this.state;
    const {balance}=this.state;
    return (
      <ScrollView
        style={styles.ScrollView}
    
        >
          <Image
            source={require("../../assets/logo-alt.png")}
           style={{marginTop:20,height:80,width:80, alignSelf:'center'}} /> 
          <View style={{marginTop:15}}>
            <Text style={{alignSelf:'center',fontWeight:'bold',fontSize:20,marginBottom:10}}>E-Wallet Balance</Text>
            {balance.map((details)=>this.balanceRender(details))}
          </View>
        

          <View style={{paddingHorizontal:20,marginTop:15}}>
     
        {ledgerData.map((details)=>(
            <Ledger details={details} key={details.id}/>
          ))}
          </View>

          <View style={{justifyContent:'center',width:'100%',flexDirection:'row',backgroundColor:'white',height:90}}>
      <TouchableOpacity
              onPress={() => this.setState({transferModal:true})} 
              style={{
                position:'absolute',
                justifyContent: 'center',
                height: 50,
                width: '60%',
                borderRadius:10,
                bottom:20,
                backgroundColor:'#FF5B04',
              
                
              }}
              >
                <View style={{flexDirection:'row',justifyContent:'center'}}>
             
              <Text style={{
                color:'white',
                alignSelf:'center',
            
              }}>Withdraw</Text>
                  
             </View>
        </TouchableOpacity>
        
        </View>
     
        <Otp visible={this.state.isOtpModal} 
title={"OTP"}    
actionLabel={{
    yes: 'Authenticate',
    no: 'Cancel'
  }}
  error={''}
  blockedFlag={false}
  onSuccess={()=>this.onSuccess()}
  onCancel={() => this.setState({isOtpModal: false,isLoading:false})}/>
  
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
