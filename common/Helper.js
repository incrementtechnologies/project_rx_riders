import Color from './Color.js';
import { faCreditCard, faEdit, faComments, faCheck, faPaperPlane, faUser, faTachometerAlt, faQuestionCircle, faUsers, faFile, faShippingFast } from '@fortawesome/free-solid-svg-icons';
export default {
  company: 'Increment Technologies',
  APP_NAME: '@RunwayExpressRiders_',
  APP_NAME_BASIC: 'RunwayExpressPartners',
  APP_EMAIL: 'support@runwayexpress.co.uk',
  APP_WEBSITE: 'www.runwayexpress.co.uk',
  APP_HOST: 'com.runwayexpressriders',
  DrawerMenu: [
  {
    title: 'Deliveries',
    route: 'Delivery',
    icon: faShippingFast,
    iconStyle: {
      color: Color.primary
    }
  },
  {
    title: 'Wallet',
    route: 'Ledger',
    icon: faCreditCard,
    iconStyle: {
      color: Color.primary
    }
  },
  {
    title: 'My Deposit',
    route: 'Deposit',
    icon: faCreditCard,
    iconStyle: {
      color: Color.primary
    }
  }
  ],
  DrawerMenuMerchant: [
  {
    title: 'My Orders',
    route: 'MyOrders',
    icon: faShippingFast,
    iconStyle: {
      color: Color.primary
    }
  },
  {
    title: 'Products',
    route: 'Products',
    icon: faCreditCard,
    iconStyle: {
      color: Color.primary
    }
  },
  {
    title: 'Wallet',
    route: 'Ledger',
    icon: faCreditCard,
    iconStyle: {
      color: Color.primary
    }
  }
  ],
  DrawerMenuLogout: [],
  DrawerMenuBottom: [{
    title: 'Settings',
    route: 'Settings'
  }
  // {
  //   title: 'Terms and Conditions',
  //   route: 'TermsAndConditions'
  // }, {
  //   title: 'Privacy Policy',
  //   route: 'PrivacyPolicy'
  // }
  ],
  pagerMenu: [{
    title: 'FEATURED',
    value: 'featured'
  }, {
    title: 'CATEGORIES',
    value: 'categories'
  }, {
    title: 'SHOPS',
    value: 'shops'
  }, {
    title: 'OTHERS',
    value: 'others'
  }],
  pusher: {
    broadcast_type: 'pusher',
    channel: 'runway',
    notifications: 'App\\Events\\Notifications',
    rider: 'App\\Events\\Rider',
    typing: 'typing',
    messages: 'App\\Events\\Message',
    messageGroup: 'App\\Events\\MessageGroup',
  },
  tutorials: [
    {
      key: 1,
      title: 'Welcome to RunwayExpress!',
      text: 'Delivering food and more to your doorstep!',
      icon: null,
      image: require('assets/logo.png'),
      colors: [Color.primary, Color.lightGray]
    }
  ],
  referral: {
    message:
      `Share the benefits of <<popular products>> with your friends and family. ` +
      `Give them ₱100 towards their first purchase when they confirm your invite. ` +
      `You’ll get ₱100 when they do!`,
    emailMessage: 'I\'d like to invite you on RunwayExpress!'
  },
  categories:[
    {
      type:'Asian',
    },
    {
      type:'American',
    },
    {
      type:'Beverages',
    }
  ],
  paymentCenters: [{
    title: 'BDO',
    value: 'bdo',
    account_name: 'RunwayExpress Mobile Application',
    account_number: '123-123-123-123'
  }],
  currency: [{
    title: 'PHP',
    value: 'php'
  }],
  retrieveDataFlag: 1,
  validateEmail(email){
    let reg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+.[a-zA-Z0-9]*$/
    if(reg.test(email) === false){
      return false
    }else{
      return true
    }
  }
}