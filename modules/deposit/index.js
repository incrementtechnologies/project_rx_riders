import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation'
import { Empty } from 'components';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Style from './Style.js';
import { Routes, Color, Helper, BasicStyles } from 'common';
import Currency from 'services/Currency.js';
import { Spinner } from 'components';
import Api from 'services/api/index.js';
import Config from 'src/config.js';
import DeviceInfo from 'react-native-device-info';
import DoubleLineOneOption from 'components/Swipeable/DoubleLineOneOption.js';


const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

class Deposit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      data: null
    } 
  }

  componentDidMount(){
    this.retrieve()
  }

  retrieve(){
    const { user } = this.props.state;
    if (user == null) return
    let parameter = {
      condition: [{
        value: user.id,
        column: 'account_id',
        clause: '='
      }, {
        value: user.code,
        column: 'account_code',
        clause: '='
      }],
      sort: {
        created_at: 'desc'
      }
    }
    this.setState({
      isLoading: true
    })
    Api.request(Routes.depositRetrieve, parameter, response => {
      console.log('depositRetrieve', parameter)
      this.setState({
        isLoading: false,
        data: response.data
      })
    }, error => {
      this.setState({
        isLoading: false
      })
    })
  }

  redirect(item){
    this.props.navigation.navigate('MessengerMessages', { 
      depositData: {
        id: item.id,
        code: item.code,
      },
      messengerHeaderTitle: `***${item.code.slice(-8)}`
    });
  }

  createDeposit = () => {
    this.props.navigation.navigate('createDepositStack')
  }

  render() {
    const { isLoading, data } = this.state;

    return (
      <View style={Style.MainContainer}>
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

          {isLoading ? <Spinner mode="full"/> : null }

          {data == null && (
            <Empty refresh={true} onRefresh={() => this.retrieve()}/>
          )}
          {
            data && (
              <DoubleLineOneOption
                data={data}
                redirect={(item) => {
                  this.redirect(item)
                }}
                added={[]}
              />
            )
          }

          <View style={[Style.MainContainer, {
            minHeight: height + 50,
            width: '100%',
            alignItems: 'center'
          }]}>
            
          </View>
        </ScrollView>
        <TouchableOpacity
            style={[Style.floatingButton, {
              backgroundColor: Color.primary
            }]}
            onPress={() => this.createDeposit()}
          >
          <Text style={[Style.textFloatingBtn, {fontSize: 40}]}>+</Text>
        </TouchableOpacity>
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
)(Deposit);
