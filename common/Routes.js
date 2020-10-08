import config from 'src/config';
const url = config.IS_DEV;
let apiUrl = url + '/';
export default {
  auth: apiUrl + 'authenticate',
  authUser: apiUrl + 'authenticate/user',
  authRefresh: apiUrl + 'authenticate/refresh',
  authInvalidate: apiUrl + 'authenticate/invalidate',
  accountRetrieve: apiUrl + 'accounts/retrieve',
  accountUpdate: apiUrl + 'accounts/update',
  accountCreate: apiUrl + 'accounts/create',
  notificationsRetrieve: apiUrl + 'notifications/retrieve',
  notificationUpdate: apiUrl + 'notifications/update',
  accountProfileCreate: apiUrl + 'account_profiles/create',
  accountProfileUpdate: apiUrl + 'account_profiles/update',
  accountInformationRetrieve: apiUrl + 'account_informations/retrieve',
  accountInformationUpdate: apiUrl + 'account_informations/update',
  emailAlert: apiUrl + 'emails/alert',
  locationCreate:apiUrl + 'locations/create',
  locationRetrieve:apiUrl + 'locations/retrieve',
  // referral
  invitationCreate: apiUrl + 'invitations/create',
  invitationRetrieve: apiUrl + 'invitations/retrieve',
  // images
  imageUpload: apiUrl + 'images/upload',
  imageRetrieve: apiUrl + 'images/retrieve',
  // checkout
  checkoutCreate: apiUrl + 'checkouts/create',
  checkoutRetrieve: apiUrl + 'checkouts/retrieve_by_rider',
  // Deliveries
  deliveryCreate: apiUrl + 'deliveries/create',
  deliveryRetrieve: apiUrl + 'deliveries/retrieve',
  //Notifs
  notificationSettingsRetrieve: apiUrl + 'notification_settings/retrieve',
  withdrawalCreate: apiUrl + 'withdrawals/create',
  myDeliveryRetrieve: apiUrl + 'deliveries/my_deliveries',
  deliveryUpdate: apiUrl + 'deliveries/update',
  // Merchants
  merchantsRetrieve: apiUrl + 'merchants/retrieve',
  //Checkout
  checkoutRetrieveByRider: apiUrl + 'checkouts/retrieve_by_rider',
  ledgerSummary: apiUrl+ 'ledger/summary',
  ledgerHistory: apiUrl + 'ledger/history',
  checkoutUpdate: apiUrl + 'checkouts/update',
  filters:apiUrl + 'dashboard/categories',
  locationSharing:apiUrl + 'broadcasts/location_sharing',
  //Deposits
  depositCreate: apiUrl + 'deposits/create',
  depositRetrieve: apiUrl + 'deposits/retrieve',
  // messenger
  messengerCreateForRider: apiUrl + 'custom_messenger_groups/custom_create',
  messengerGroupRetrieve: apiUrl + 'messenger_groups/retrieve',
  messengerGroupRetrieveByParams: apiUrl + 'messenger_groups/retrieve_by_params',
  messengerMessagesCreate: apiUrl + 'messenger_messages/create',
  messengerMessagesRetrieve: apiUrl + 'messenger_messages/retrieve',
  messengerMessagesUpdate: apiUrl + 'messenger_messages/update_by_status',
  // ratings
  ratingsCreate: apiUrl + 'ratings/create',
  ratingsRetrieve: apiUrl + 'ratings/retrieve'
}