import React, { Component } from 'react';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import {
  View,
  TextInput,
  TouchableHighlight,
  Text,
  ScrollView,
  Platform,
  AppState,
  Alert
} from 'react-native';
import {NavigationActions} from 'react-navigation';
import moment from 'moment';
import Style from './Style.js';
import { Spinner } from 'components';
import CustomError from 'components/Modal/Error.js';
import Api from 'services/api/index.js';
import { Routes, Color, Helper, BasicStyles } from 'common';
import PasswordWithIcon from 'components/InputField/Password.js';
import Header from '../basics/Header'
import config from 'src/config';
import Pusher from 'services/Pusher.js';
import SystemVersion from 'services/System.js';
import { Player } from '@react-native-community/audio-toolkit';
import OtpModal from 'components/Modal/Otp.js';
import { Notifications } from 'react-native-notifications';

const MAX_BACKGROUND_SESSION_IN_MINUTES = 60

class Login extends Component {
  //Screen1 Component
  constructor(props){
    super(props);
    this.state = {
      username: null,
      password: null,
      isLoading: false,
      token: null,
      error: 0,
      isResponseError: false,
      responseErrorMessage: null,
      isOtpModal: false,
      blockedFlag: false,
      notifications: [],
      appState: AppState.currentState
    };
    this.bgTimestamp = null
    this.audio = null;
    this.registerNotificationEvents();
  }

  async componentDidMount(){
    AppState.addEventListener('change', this._handleAppStateChange);
    this.getTheme()
    if(config.versionChecker == 'store'){
      this.setState({isLoading: true})
      SystemVersion.checkVersion(response => {
        this.setState({isLoading: false})
        if(response == true){
          this.getData();
        }
      })
    }else{
      this.getData(); 
    }
    this.audio = new Player('assets/notification.mp3');
    const initialNotification = await Notifications.getInitialNotification();
    if (initialNotification) {
      this.setState({notifications: [initialNotification, ...this.state.notifications]});
    }
  }

   getTheme = async () => {
    try {
      const primary = await AsyncStorage.getItem(Helper.APP_NAME + 'primary');
      const secondary = await AsyncStorage.getItem(Helper.APP_NAME + 'secondary');
      const tertiary = await AsyncStorage.getItem(Helper.APP_NAME + 'tertiary');
      console.log('primary', primary)
      if(primary != null && secondary != null && tertiary != null) {
        const { setTheme } = this.props;
        setTheme({
          primary: primary,
          secondary: secondary,
          tertiary: tertiary
        })
      }
    } catch (e) {
      console.log(e)
    }
  }


  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = appState => {
    const { user } = this.props.state
    const { logout } = this.props

    if (user) {
      if (appState === 'background') {
        this.bgTimestamp = new moment()
      } else if (appState === 'active') {
        const currentTime = new moment()
        const diffInMinutes = currentTime.diff(this.bgTimestamp, 'minutes')

        if (diffInMinutes >= MAX_BACKGROUND_SESSION_IN_MINUTES) {          
          Alert.alert('Session Expired', 'Please log in your account')
          logout()
          this.props.navigation.navigate('loginStack');
        }
      }
    }
    this.setState({ appState });
  };

  retrieveSystemNotification = () => {
    let parameter = {
      condition: [{
        value: '%' + Platform.OS + '%',
        clause: 'like',
        column: 'device'
      }],
      sort: {
        created_at: 'desc'
      }
    }
    Api.request(Routes.systemNotificationRetrieve, parameter, response => {
      const { setSystemNotification } = this.props;
      if(response.data.length > 0){
        setSystemNotification(response.data[0])
      }else{
        setSystemNotification(null)
      }
    }, error => {
      console.log('error', error)
    });
  }

  redirectToDrawer = (payload) => {
    const { user } =  this.props.state;
    if(user !== null){
      let route = ''
      switch(payload){
        case 'Messenger':
          route = 'Messenger'
          break;
        case 'request':
          route = 'Requests'
          const { setSearchParameter } = this.props;
          let searchParameter = {
            column: 'id',
            value: notification.payload_value
          }
          setSearchParameter(searchParameter)
          break;
        case 'ledger':
          route = 'Dashboard'
          break
      }
      const navigateAction = NavigationActions.navigate({
        routeName: route
      });
      this.props.navigation.dispatch(navigateAction); 
    }
  }

  registerNotificationEvents() {
    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      this.setState({
        notifications: [...this.state.notifications, notification]
      });

      completion({alert: notification.payload.showAlert, sound: true, badge: false});
    });

    Notifications.events().registerNotificationOpened((notification, completion) => {
      const { user } =  this.props.state
      if (user !== null) {
        if (notification.payload.extra === 'Delivery') {
          const navigateAction = NavigationActions.navigate({
            routeName: 'NewDelivery',
            params: notification.payload.data
          });
          this.props.navigation.dispatch(navigateAction); 
        } else if (notification.payload.extra != ''){
          this.redirectToDrawer(notification.payload.extra)
        }
      }
      completion();
    });
  }

  requestPermissions() {
    Notifications.registerRemoteNotifications();
  }

  sendLocalNotification(title, body, route, data = null) {
    Notifications.postLocalNotification({
        title: title,
        body: body,
        extra: route,
        data
    });
  }

  test = () => {
    if(config.TEST == true){
      this.props.navigation.navigate('drawerStack');
      return true;
    }
  }

  redirect = (route) => {
    this.props.navigation.navigate(route);
  }

  playAudio = () => {
    if(this.audio){
      this.audio.play();
    }
  }

  managePusherResponse = (response) => {
    const { messagesOnGroup } = this.props.state
    const { user } = this.props.state;
    const { appState } = this.state;
    const data = response.data;
    if(user == null){
      return;
    }
    if(response.type == Helper.pusher.notifications){
      console.log(Helper.pusher.notifications, response);
      if(user.id == parseInt(data.to)){
        const { notifications } = this.props.state;
        const { updateNotifications } = this.props;
        console.log('notif pusher', data)
        this.sendLocalNotification(data.title, data.description, data.payload)
        updateNotifications(1, data);
        this.playAudio()
      }
    } else if(response.type == Helper.pusher.rider) {
      const { user } = this.props.state;
      if (response.data.hasOwnProperty('assigned_rider')) return
      if(user && user.account_type === 'MERCHANT') return
      if (response.data.scope !== user.scope_location) return
      if (appState === 'active') {
        Alert.alert(
        `Hello ${user.username}!`,
        "A new delivery is available!",
        [
          { text: "VIEW", onPress: () => {
            const navigateAction = NavigationActions.navigate({
              routeName: 'NewDelivery',
              params: response
            });
            this.props.navigation.dispatch(navigateAction); 
          } },
          { text: "CANCEL", onPress: () => this.props.navigation.navigate('Delivery') }
        ],
        { cancelable: false }
        );
      }
      this.sendLocalNotification(
        'New delivery from RunwayExpress!',
        `Hi there ${user.username}! click to Accept/Decline`,
        'Delivery',
        response
      )
      this.playAudio()
    } else if (response.type == Helper.pusher.messages) {
      this.playAudio();
      const { updateMessagesOnGroup } = this.props;
      // console.log(Helper.pusher.messages, response);  
      if (parseInt(data.messenger_group_id) == messagesOnGroup.groupId && parseInt(data.account_id) != user.id) {
        this.playAudio();
        updateMessagesOnGroup(data);
        this.sendLocalNotification('Messenger', data.account.username  + 'sent a message: '  + data.message, 'Messenger')
      }
      // else if (parseInt(data.messenger_group_id) != messagesOnGroup.groupId && parseInt(data.account_id) != user.id) {
      //   this.sendLocalNotification('Messenger', data.account.username  + 'sent a message: '  + data.message, 'Messenger')
      //   const { setMessenger } = this.props;
      //   const { messenger } = this.props.state;
      //   var unread = parseInt(messenger.unread) + 1;
      //   setMessenger(unread, messenger.messages);
      // }
    } else if (response.type == Helper.pusher.messageGroup) {
      console.log(Helper.pusher.messageGroup, response);
      const { updateMessengerGroup, updateMessagesOnGroupByPayload } = this.props;
      const { messengerGroup } = this.props.state;
      if (parseInt(data.id) == parseInt(messengerGroup.id)) {
        this.playAudio();
        updateMessengerGroup(data)
        if(data.message_update == true){
          // update messages
          const { messengerGroup } = this.props.state;
          CommonRequest.retrieveMessages(messengerGroup, messagesResponse => {
            updateMessagesOnGroupByPayload(messagesResponse.data)
          })
        }
      } else {
        const { setMessenger } = this.props;
        const { messenger } = this.props.state;
        var unread = parseInt(messenger.unread) + 1;
        setMessenger(unread, messenger.messages);
      }
    }
  }

  retrieveUserData = (accountId) => {
    const { user } = this.props.state
    if(Helper.retrieveDataFlag == 1){
      Pusher.listen(response => {
        this.managePusherResponse(response)
      });
      this.setState({isLoading: false});

      if ((user.account_type + '').toLowerCase() === 'merchant') {
        this.props.navigation.navigate('MyOrders');  
      } else {
        this.props.navigation.navigate('drawerStack');
      }
    }else{
      const { setNotifications, setMessenger } = this.props;
      let parameter = {
        account_id: accountId
      }
      this.retrieveSystemNotification();
      Api.request(Routes.notificationsRetrieve, parameter, notifications => {
        setNotifications(notifications.size, notifications.data)
        Api.request(Routes.messagesRetrieve, parameter, messages => {
          setMessenger(messages.total_unread_messages, messages.data)
          this.setState({isLoading: false});
          Pusher.listen(response => {
            this.managePusherResponse(response)
          });
          // this.props.navigation.replace('loginScreen')
          this.checkOtp()
        }, error => {
          this.setState({isResponseError: true})
        })
      }, error => {
        this.setState({isResponseError: true})
      })
    }
  }

  login = () => {
    this.test();
    const { login } = this.props;
    if(this.state.token != null){
      this.setState({isLoading: true});
      Api.getAuthUser(this.state.token, (response) => {
        login(response, this.state.token);
        let parameter = {
          condition: [{
            value: response.id,
            clause: '=',
            column: 'id'
          }]
        }

        Api.request(Routes.accountRetrieve, parameter, userInfo => {
          if(userInfo.data.length > 0){
            login({
              ...userInfo.data[0],
              scope_location: response.scope_location
            }, this.state.token);
            this.retrieveUserData(userInfo.data[0].id)
          }else{
            this.setState({isLoading: false});
            login(null, null)
          }
        }, error => {
          this.setState({isResponseError: true})
        })
      }, error => {
        this.setState({isResponseError: true})
      })
    }
  }

  getData = async () => {
    try {
      const token = await AsyncStorage.getItem(Helper.APP_NAME + 'token');
      if(token != null) {
        this.setState({token});
        this.login();
      }
    } catch(e) {
      // error reading value
    }
  }
  
  checkOtp = () => {
    const { user } = this.props.state;
    if(user.notification_settings != null){
      let nSettings = user.notification_settings
      if(parseInt(nSettings.email_otp) == 1 || parseInt(nSettings.sms_otp) == 1){
        this.setState({
          isOtpModal: true,
          blockedFlag: false
        })
        return
      }
    }
    this.props.navigation.navigate('drawerStack');
  }

  onSuccessOtp = () => {
    this.setState({isOtpModal: false})
    this.props.navigation.navigate('drawerStack');
  }

  submit(){
    this.test();
    const { username, password } = this.state;
    const { login } = this.props;
    if((username != null && username != '') && (password != null && password != '')){
      this.setState({isLoading: true, error: 0});
      // Login
      Api.authenticate(username, password, (response) => {
        if(response.error){
          this.setState({error: 2, isLoading: false});
        }
        if(response.token){
          const token = response.token;
          Api.getAuthUser(response.token, (response) => {
            // check if user if RIDER
            if (response.account_type !== 'MERCHANT' && response.account_type !== 'RIDER' && response.account_type !== 'ADMIN') {
              this.setState({
                isResponseError: true,
                responseErrorMessage: 'Please verify your account first. Contact RunwayExpress.support'
              })
              return
            }

            login(response, token);
            let parameter = {
              condition: [{
                value: response.id,
                clause: '=',
                column: 'id'
              }]
            }
            Api.request(Routes.accountRetrieve, parameter, userInfo => {
              if(userInfo.data.length > 0){
                login({
                  ...userInfo.data[0],
                  scope_location: response.scope_location
                }, token);
                this.retrieveUserData(userInfo.data[0].id)
              }else{
                this.setState({isLoading: false});
                this.setState({error: 2})
              }
            }, error => {
              this.setState({isResponseError: true})
            })
          }, error => {
            this.setState({isResponseError: true})
          })
        }
      }, error => {
        this.setState({isResponseError: true})
      })
      // this.props.navigation.navigate('drawerStack');
    }else{
      this.setState({error: 1});
    }
  }

  render() {
    const { isLoading, error, isResponseError, responseErrorMessage } = this.state;
    const {  blockedFlag, isOtpModal } = this.state;
    const { theme } = this.props.state;
    return (
      <ScrollView style={Style.ScrollView}>
        <View style={Style.MainContainer}>
          <Header params={"Login"}></Header>

          {error > 0 ? <View style={Style.messageContainer}>
            {error == 1 ? (
              <Text style={Style.messageText}>Please fill up the required fields.</Text>
            ) : null}

            {error == 2 ? (
              <Text style={Style.messageText}>Username and password didn't match.</Text>
            ) : null}
          </View> : null}
          
          <View style={Style.TextContainer}>
            <TextInput
              style={BasicStyles.formControl}
              onChangeText={(username) => this.setState({username})}
              value={this.state.username}
              placeholder={'Username or Email'}
            />
            {/*<TextInput
              style={BasicStyles.formControl}
              onChangeText={(password) => this.setState({password})}
              value={this.state.password}
              placeholder={'********'}
              secureTextEntry={true}
            />*/}
            <PasswordWithIcon onTyping={(input) => this.setState({
              password: input
            })}/>
            <TouchableHighlight
              style={[BasicStyles.btn, {
                backgroundColor: theme ? theme.primary : Color.primary
              }]}
              onPress={() => this.submit()}
              underlayColor={Color.gray}>
              <Text style={BasicStyles.textWhite}>
                Login
              </Text>
            </TouchableHighlight>

            
            <TouchableHighlight
              style={[BasicStyles.btn, BasicStyles.btnWarning]}
              onPress={() => this.redirect('forgotPasswordStack')}
              underlayColor={Color.gray}>
              <Text style={BasicStyles.textWhite}>
                Forgot your Password?
              </Text>
            </TouchableHighlight>
            

            <View style={{
              height: 1,
              backgroundColor: Color.gray
            }}>
            </View>

            <View style={{
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{
                paddingTop: 10,
                paddingBottom: 10,
                color: Color.gray
              }}>Don't have an account?</Text>
            </View>
            <TouchableHighlight
              style={[BasicStyles.btn, BasicStyles.btnSecondary, {
                backgroundColor: theme ? theme.secondary : Color.secondary
              }]}
              onPress={() => this.redirect('registerStack')}
              underlayColor={Color.gray}>
              <Text style={BasicStyles.textWhite}>
                Register Now!
              </Text>
            </TouchableHighlight>
          </View>
        </View>

        <OtpModal
          visible={isOtpModal}
          title={blockedFlag == false ? 'Authentication via OTP' : 'Blocked Account'}
          actionLabel={{
            yes: 'Authenticate',
            no: 'Cancel'
          }}
          onCancel={() => this.setState({isOtpModal: false})}
          onSuccess={() => this.onSuccessOtp()}
          onResend={() => {
            this.setState({isOtpModal: false})
            this.submit()
          }}
          error={''}
          blockedFlag={blockedFlag}
        ></OtpModal>

        {isLoading ? <Spinner mode="overlay"/> : null }
        {
          isResponseError 
          ? <CustomError
              message={responseErrorMessage}
              visible={isResponseError} 
              onCLose={() => {
                this.setState({
                  isResponseError: false,
                  isLoading: false,
                  responseErrorMessage: null
                })
              }}
            />
          : null
        }
      </ScrollView>
    );
  }
}
 
const mapStateToProps = state => ({ state: state });

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux');
  return {
    login: (user, token) => dispatch(actions.login(user, token)),
    logout: () => dispatch(actions.logout()),
    setTheme: (theme) => dispatch(actions.setTheme(theme)),
    setNotifications: (unread, notifications) => dispatch(actions.setNotifications(unread, notifications)),
    updateNotifications: (unread, notification) => dispatch(actions.updateNotifications(unread, notification)),
    updateMessagesOnGroup: (message) => dispatch(actions.updateMessagesOnGroup(message)),
    setMessenger: (unread, messages) => dispatch(actions.setMessenger(unread, messages)),
    updateMessengerGroup: (messengerGroup) => dispatch(actions.updateMessengerGroup(messengerGroup)),
    setMessengerGroup: (messengerGroup) => dispatch(actions.setMessengerGroup(messengerGroup)),
    setMessagesOnGroup: (messagesOnGroup) => dispatch(actions.setMessagesOnGroup(messagesOnGroup)),
    updateMessagesOnGroupByPayload: (messages) => dispatch(actions.updateMessagesOnGroupByPayload(messages)),
    setSearchParameter: (searchParameter) => dispatch(actions.setSearchParameter(searchParameter)),
    setSystemNotification: (systemNotification) => dispatch(actions.setSystemNotification(systemNotification)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
