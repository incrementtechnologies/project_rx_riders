import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  FlatList,
  TouchableHighlight,
  ToastAndroid,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';
import { createStackNavigator } from 'react-navigation-stack';
import {NavigationActions, StackActions} from 'react-navigation';
import { Empty } from 'components';
import { faUserCircle, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Style from './Style.js';
import { Routes, Color, Helper, BasicStyles } from 'common';
import Currency from 'services/Currency.js';
import { Spinner } from 'components';
import Api from 'services/api/index.js';
import Config from 'src/config.js';
import DeviceInfo from 'react-native-device-info';
import ImageModal from 'components/Image';
import BasicSwipeable from 'components/Swipeable/Basic.js';
import Dropdown from 'components/InputField/Dropdown.js';

const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

class CreateStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      data: null,
      files: [],
      tags: [],
      imageModal: false,
      deliveries: [],
      selected: null,
      isSubmit: false,
      added: [],
      currency: 'PHP',
      amount: 0,
      notes: null,
      payload: Helper.paymentCenters[0].value,
      payload_value: Helper.paymentCenters[0]
    } 
  }

  componentDidMount(){
    
  }

  retrieveCODDeliveries(){
    const { user } = this.props.state;
    if(user == null){
      return
    }
    let parameter = {
      condition: [{
        column: 'rider',
        clause: '=',
        value: user.id
      }, {
        column: 'status',
        clause: '=',
        value: 'completed'
      }],
      sort: {
        created_at: 'desc'
      }
    }
    Api.request(Routes.myDeliveryRetrieve, parameter, response => {
      console.log(response)
      this.setState({
        deliveries: response.data
      })
    }, error => {
      console.log('error', error)
    });
  }

  submit(){
    const { amount, currency, payload, payload_value, notes, added, files} = this.state;
    if(amount < 1000){
      ToastAndroid.show('Minimum amount is ' + currency +' 1000', ToastAndroid.LONG);
    }
    if(payload == null){
      ToastAndroid.show('Payment Center is required', ToastAndroid.LONG);
    }
    if(files.length == 0){
      ToastAndroid.show('Deposit Receipt is required', ToastAndroid.LONG);
    }
    if(added.length == 0){
      ToastAndroid.show('Deliveries is required', ToastAndroid.LONG);
    }
    const { user } = this.props.state;
    if(user == null){
      ToastAndroid.show('Invalid user.', ToastAndroid.LONG);
      return
    }
    let parameter = {
      account_id: user.id,
      account_code: user.code,
      currency: currency,
      amount: amount,
      payload: payload,
      payload_value: JSON.stringify(payload_value),
      notes: notes,
      tags: JSON.stringify(added),
      files: JSON.stringify(files)
    }
    console.log('parameter', parameter)
    Api.request(Routes.depositCreate, parameter, response => {
      console.log(response)
      const navigateAction = NavigationActions.navigate({
        routeName: 'drawerStack',
        action: StackActions.reset({
          index: 0,
          key: null,
          actions: [
              NavigationActions.navigate({routeName: 'Deposit'}),
          ]
        })
      });
      this.props.navigation.dispatch(navigateAction);
    }, error => {
      console.log('error', error)
    });
  }

  addImageToFiles(url){
    let files = [...this.state.files, url]
    this.setState({
      files: files,
      imageModal: false
    })
    this.retrieveCODDeliveries()
  }

  setPaymentCenter(input){
    console.log(input)
    this.setState({
      payload: input
    })
    Helper.paymentCenters.map((item) => {
      if(item.value == input){
        this.setState({
          payload_value: {
            account_name: item.account_name,
            account_number: item.account_number
          }
        })
      }
    })
  }

  onAdd(){
    const { selected, added } = this.state;
    if(selected == null) return

    if(added.indexOf(selected.id) > -1){
      ToastAndroid.show('Order Number' + selected.checkout.order_number + ' already exist!', ToastAndroid.LONG);
      return
    }

    let addedList = [...this.state.added, selected.id]
    this.setState({
      added: addedList
    })
    if(addedList.length > 0){
      this.setState({
        isSubmit: true
      })
    }else{
      this.setState({
        isSubmit: false
      })
    }
  }

  onDelete(){
    const { selected, added } = this.state;
    if(selected == null) return

    let addedList = added.map((item) => {
      if(item !== selected.id){
        return item
      }
    })

    this.setState({
      added: addedList
    })
    if(addedList.length > 0){
      this.setState({
        isSubmit: true
      })
    }else{
      this.setState({
        isSubmit: false
      })
    }
  }

  onAddAlert(item){
    this.setState({
      selected: item
    })
    Alert.alert(
      "Confirmation",
      "Are you sure you want to add Order Number " + item.checkout.order_number + ' on the list?',
      [
        { text: "Cancel", onPress: () => {
          //
        }},
        { text: "Yes", onPress: () => {
          this.onAdd()
        }}
      ],
      { cancelable: true }
    );
  }

  onDeleteAlert(item){
    this.setState({
      selected: item
    })
    Alert.alert(
      "Confirmation",
      "Are you sure you want to delete Order Number " + item.checkout.order_number + '?',
      [
        { text: "Cancel", onPress: () => {
          //
        }},
        { text: "Yes", onPress: () => {
          this.onDelete()
        }}
      ],
      { cancelable: true }
    );
  }

  _amount(){
    const { payload_value } = this.state;
    return (
      <View style={{
          paddingLeft: 10,
          paddingRight: 10
        }}>
        <Dropdown
          data={Helper.currency}
          onChange={(input) => this.setState({
            currency: input
          })}
          label={'Select Currency'}
          placeholder={'Select Currency'}
        />

        <View>
          <Text style={{
          }}>Amount</Text>
          <TextInput
            style={BasicStyles.formControlCreate}
            onChangeText={(amount) => this.setState({amount})}
            value={this.state.amount}
            placeholder={'0'}
            keyboardType={'numeric'}
          />
        </View>

        <Dropdown
          data={Helper.paymentCenters}
          onChange={(input) => this.setPaymentCenter(input)}
          label={'Select Payment Center'}
          placeholder={'Select Payment Center'}
        />

        {
          (payload_value) && (
            <View style={{
              paddingLeft: 5,
              paddingRight: 5
            }}>

              <Text style={{
                fontWeight: 'bold',
                paddingTop: 10,
                paddingBottom: 10
              }}>Deposit to</Text>
              <View style={{
                flexDirection: 'row'
              }}>
                <Text style={{
                }}>Account Name:</Text>
                <Text style={{
                  fontWeight: 'bold',
                  paddingLeft: 5
                }}>{payload_value.account_name}</Text>
              </View>

              <View style={{
                flexDirection: 'row'
              }}>
                <Text style={{
                }}>Account Number:</Text>
                <Text style={{
                  fontWeight: 'bold',
                  paddingLeft: 5
                }}>{payload_value.account_number}</Text>
              </View>
              
            </View>
          )
        }

        <View>
          <Text style={{
            paddingTop: 10,
            paddingBottom: 10
          }}>Notes</Text>
          <TextInput
            style={ Platform.OS == 'android' ? {
              borderColor: Color.gray,
              borderWidth: 1,
              width: '100%',
              marginBottom: 20,
              textAlignVertical: 'top',
              borderRadius: 5,
              paddingLeft: 10
            } : {
              borderColor: Color.gray,
              borderWidth: 1,
              width: '100%',
              marginBottom: 20,
              textAlignVertical: 'top',
              borderRadius: 5,
              minHeight: 50,
              textAlignVertical: 'middle',
              paddingLeft: 10,
              paddingTop: 10
            }}
            onChangeText={(notes) => this.setState({notes})}
            value={this.state.notes}
            placeholder={'Enter notes here...'}
            multiline = {true}
            numberOfLines = {5}
          />
        </View>
      </View>
    );
  }

  _renderUpdateImage (){
    const { files } = this.state;
    return(
        <View style={{
          paddingLeft: 10,
          paddingRight: 10
        }}>
          <Text style={{
            paddingTop: 10,
            paddingBottom: 10,
            fontWeight: 'bold'
          }}>
            Deposit Receipt:
          </Text>
          <View style={{
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            flexDirection: 'row'
          }}>
          {
            files.length > 0 && (
              files.map((item, index) => {
                return(
                  <View style={{
                    width: '50%',
                    height: 100
                  }}>
                    <Image
                      source={{uri: Config.BACKEND_URL + item}}
                      style={{
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}/>
                  </View>
                )
              })
            )
          }
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
              marginBottom: 10,
              marginTop: 10
            }}
            onPress={() => {
              this.setState({
                imageModal: true
              })
            }}
            underlayColor={Color.primary}
            >
            <Text style={{
              color: Color.white
            }}>
            {
              this.state.files.length > 0 ? 'Add images' : 'Select Images'
            }
            </Text>
          </TouchableOpacity>
        </View>

    );
  }

  _renderTagDeliveries(){
    const { deliveries, selected, added } = this.state;
    return(
        <View style={{
          marginBottom: 100
        }}>
          <Text style={{
            paddingTop: 10,
            paddingBottom: 10,
            fontWeight: 'bold',
            paddingLeft: 10,
            paddingRight: 10
          }}>
            Select deliveries
          </Text>
          {
            deliveries && (
                <BasicSwipeable
                  data={deliveries}
                  onAdd={(item) => {
                    this.onAddAlert(item)
                  }}
                  onDelete={(item) => {
                    this.onDeleteAlert(item)
                  }}
                  added={added}
                />
            )
          }
        </View>

    ); 
  }

  render() {
    const { isLoading, data, imageModal, files, isSubmit } = this.state;
    const { user } = this.props.state;

    return (
      <View style={Style.MainContainer}>
        <ScrollView
          style={Style.ScrollView}
        >

          {isLoading ? <Spinner mode="full"/> : null }

          <View style={[Style.MainContainer, {
            minHeight: height + 50,
            width: '100%'
          }]}>

            {
              this._amount()
            }

            {
              this._renderUpdateImage()
            }

            {
              (files.length > 0) && this._renderTagDeliveries()
            }
            
          </View>
        </ScrollView>

        {
          (isSubmit) && (
            <TouchableOpacity style={{
                width: '90%',
                paddingLeft: 10,
                paddingRight: 10,
                backgroundColor: Color.primary,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 5,
                marginBottom: 10,
                marginTop: 10,
                position: 'absolute',
                marginLeft: '5%',
                bottom: 5
              }}
              onPress={() => {
                this.submit()
              }}
              underlayColor={Color.primary}
              >
              <Text style={{
                color: Color.white
              }}>
                Submit
              </Text>
            </TouchableOpacity>
          )
        }
        {
          imageModal && (
            <ImageModal
              visible={imageModal}
              onSelect={(url) => {
                this.addImageToFiles(url)
              }}
              onCLose={() => {
                this.setState({
                  imageModal: false
                })
              }}
              />
          )
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({state: state});

const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux');
  return {};
};


let CreateStackConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateStack);

class HeaderOptions extends Component {
  constructor(props){
    super(props);
  }
  
  back = () => {
    // this.props.navigationProps.navigate('drawerStack');
    const navigateAction = NavigationActions.navigate({
      routeName: 'drawerStack',
      action: StackActions.reset({
        index: 0,
        key: null,
        actions: [
            NavigationActions.navigate({routeName: 'Deposit'}),
        ]
      })
    });
    this.props.navigationProps.dispatch(navigateAction);
  };

  render() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={this.back.bind(this)}>
          {/*Donute Button Image */}
          <FontAwesomeIcon icon={ faChevronLeft } size={BasicStyles.iconSize} 
            style={[BasicStyles.iconStyle, {
            color: Color.primary
          }]}/>
        </TouchableOpacity>
      </View>
    );
  }
}

const CreateDepositStack = createStackNavigator({
  CreateDepositScreen: {
    screen: CreateStackConnect, 
    navigationOptions: ({ navigation }) => ({
      title: 'Create Deposit',
      headerLeft: <HeaderOptions navigationProps={navigation} />,
      drawerLabel: 'Create Deposit',
      headerStyle: {
        backgroundColor: Color.white,
      },
      headerTintColor: Color.primary,
    })
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateDepositStack);
