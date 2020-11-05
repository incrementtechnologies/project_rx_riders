import AsyncStorage from '@react-native-community/async-storage';
import Data from 'services/Data';
import { Helper, Color } from 'common';

const types = {
  LOGOUT: 'LOGOUT',
  LOGIN: 'LOGIN',
  UPDATE_USER: 'UPDATE_USER',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  UPDATE_NOTIFICATIONS: 'UPDATE_NOTIFICATIONS',
  SET_THEME: 'SET_THEME',
  SET_ORDER: 'SET_ORDER',
  nav: null,
  SET_MESSAGES: 'SET_MESSAGES',
  SET_MESSENGER_GROUP: 'SET_MESSENGER_GROUP',
  UPDATE_MESSENGER_GROUP: 'UPDATE_MESSENGER_GROUP',
  SET_MESSAGES_ON_GROUP: 'SET_MESSAGES_ON_GROUP',
  UPDATE_MESSAGES_ON_GROUP: 'UPDATE_MESSAGES_ON_GROUP',
  UPDATE_MESSAGE_BY_CODE: 'UPDATE_MESSAGE_BY_CODE',
  UPDATE_MESSAGES_ON_GROUP_BY_PAYLOAD: 'UPDATE_MESSAGES_ON_GROUP_BY_PAYLOAD',
}

export const actions = {
  login: (user, token) => {
    return { type: types.LOGIN, user, token };
  },
  logout() {
    return { type: types.LOGOUT };
  },
  updateUser: (user) => {
    return { type: types.UPDATE_USER, user };
  },
  setNotifications(unread, notifications){
    return { type: types.SET_NOTIFICATIONS, unread, notifications };
  }, 
  updateNotifications(unread, notification){
    return { type: types.UPDATE_NOTIFICATIONS, unread, notification };
  },
  setTheme(theme){
    return { type: types.SET_THEME, theme };
  },
  setOrder(order){
    return { type: types.SET_ORDER, order };
  },
  setMessenger(unread, messages){
    return { type: types.SET_MESSAGES, unread, messages};
  },
  setMessengerGroup(messengerGroup){
    return { type: types.SET_MESSENGER_GROUP, messengerGroup};
  },
  updateMessengerGroup(messengerGroup){
    return { type: types.UPDATE_MESSENGER_GROUP, messengerGroup}
  },
  updateMessagesOnGroupByPayload(messages){
    return { type: types.UPDATE_MESSAGES_ON_GROUP_BY_PAYLOAD, messages}
  },
  setMessagesOnGroup(messagesOnGroup){
    console.log({ settingMessagesOnGroup: messagesOnGroup })
    return { type: types.SET_MESSAGES_ON_GROUP, messagesOnGroup};
  },
  updateMessagesOnGroup(message){
    return { type: types.UPDATE_MESSAGES_ON_GROUP, message};
  },
  updateMessageByCode(message){
    return { type: types.UPDATE_MESSAGE_BY_CODE, message}
  },
};

const initialState = {
  token: null,
  user: null,
  notifications: null,
  messenger: {
    unread: null,
    messages: null
  },
  messengerGroup: null,
  messagesOnGroup: {
    groupId: null,
    messages: null
  },
  theme: null,
  order: null
}

storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(`${Helper.APP_NAME}${key}`, value)
  } catch (e) {
    // saving error
  }
}

const reducer = (state = initialState, action) => {
  const { type, user, token } = action;
  const { unread } = action;
  const { notification } = action;
  const { theme, order } = action;
  const { messages, message } = action;
  const { messengerGroup, messagesOnGroup } = action;

  switch (type) {
    case types.LOGOUT:
      AsyncStorage.clear();
      return Object.assign({}, initialState);
    case types.LOGIN:
      storeData('username', user.username)
      storeData('token', token);
      console.log('LOGIN', true);
      Data.setToken(token)
      return { ...state, user, token };
    case types.UPDATE_USER:
      return {
        ...state,
        user
      }
    case types.SET_NOTIFICATIONS:
      let notifications = {
        unread,
        notifications: action.notifications
      }
      console.log('notifications', true);
      return {
        ...state,
        notifications
      }
    case types.UPDATE_NOTIFICATIONS:
      let updatedNotifications = null
      if(state.notifications == null){
        let temp = []
        temp.push(notification)
        updatedNotifications = {
          unread,
          notifications: temp
        }
      }else{
        let oldNotif = state.notifications
        if(oldNotif.notifications == null){
          let temp = []
          temp.push(notification)
          updatedNotifications = {
            unread,
            notifications: temp
          }
        }else{
          if(parseInt(notification.id) != parseInt(oldNotif.notifications[oldNotif.notifications.length - 1].id)){
            oldNotif.notifications.unshift(notification)
            updatedNotifications = {
              unread: oldNotif.unread + unread,
              notifications: oldNotif.notifications
            }
          }else{
            updatedNotifications = {
              unread: oldNotif.unread + unread,
              notifications: oldNotif.notifications
            }
          }
        }
      }
      return {
        ...state,
        notifications: updatedNotifications
      }
    case types.SET_THEME:
      console.log('theme', theme);
      storeData('primary', theme.primary);
      storeData('secondary', theme.secondary);
      storeData('tertiary', theme.tertiary);
      Color.setPrimary(theme.primary);
      Color.setSecondary(theme.secondary);
      Color.setTertiary(theme.tertiary);
      return{
        ...state,
        theme
      }
    case types.SET_ORDER:
      return{
        ...state,
        order
      }
    case types.SET_MESSAGES:
      let messenger = {
        unread,
        messages
      }
      return {
        ...state,
        messenger
      }
    case types.SET_MESSENGER_GROUP:
      return {
        ...state,
        messengerGroup
      }
    case types.UPDATE_MESSENGER_GROUP:
      return {
        ...state,
        messengerGroup: {
          ...state.messengerGroup,
          created_at_human: messengerGroup.created_at_human,
          rating: messengerGroup.rating,
          status: parseInt(messengerGroup.status),
          validations: messengerGroup.validations
        }
      }
    case types.SET_MESSAGES_ON_GROUP:
      return {
        ...state,
        messagesOnGroup
      }
    case types.UPDATE_MESSAGES_ON_GROUP:
      let updatedMessagesOnGroup = null
      if(state.messagesOnGroup != null){
        let oldMessages = state.messagesOnGroup.messages;
        if(oldMessages == null){
          let temp = []
          temp.push(message)
          updatedMessagesOnGroup = {
            ...state.messagesOnGroup,
            messages: temp
          } 
        }else{
          if(parseInt(message.id) != parseInt(oldMessages[oldMessages.length - 1].id)){
            updatedMessagesOnGroup = {
              ...state.messagesOnGroup,
              messages: oldMessages.push(message)
            }
          }else{
            updatedMessagesOnGroup = {
              ...state.messagesOnGroup
            }
          }
        }        
      }else{
        let temp = []
        temp.push(message);
        updatedMessagesOnGroup = {
          groupId: parseInt(message.messenger_group_id),
          messages: temp
        }
      }
      return {
        ...state,
        updatedMessagesOnGroup
      }
    case types.UPDATE_MESSAGE_BY_CODE:
      let newMessagesOnGroup = state.messagesOnGroup.messages.map((item, index) => {
        if(typeof item.code != undefined || typeof item.code != 'undefined'){
          if(parseInt(item.code) == parseInt(message.code)){
            return message;
          }
        }
        return item;
      })
      return {
        ...state,
        messagesOnGroup: {
          ...state.messagesOnGroup,
          messages: newMessagesOnGroup
        }
      }
    case types.UPDATE_MESSAGES_ON_GROUP_BY_PAYLOAD:
      let tempMessages = state.messagesOnGroup.messages.map((item, index) => {
        if(parseInt(item.id) == parseInt(action.messages[index].id) && item.payload_value != null){
          return action.messages[index];
        }
        return item;
      })
      return {
        ...state,
        messagesOnGroup: {
          ...state.messagesOnGroup,
          messages: tempMessages
        }
      }
    default:
      return {...state, nav: state.nav};
  }
}
export default reducer;