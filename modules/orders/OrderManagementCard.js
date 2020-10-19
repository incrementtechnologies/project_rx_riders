import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle, faTimesCircle, faMinusCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Style from './Style';
import { Color } from 'common';
import Currency from 'src/services/Currency.js';

class OrderManagementCard extends Component {

  getStatusColor(status){
    switch (status) {
      case 'completed':
        return Color.success
      case 'accepted':
        return Color.success
      case 'pending':
        return Color.danger
      case 'cancelled':
        return Color.danger
      default:
        return Color.warning
    }
  }

  render() {
    const { data, length, key } = this.props
    
    return (
      <TouchableOpacity onPress={() => this.props.onClick(data)}>
        <View style={[Style.orderManagementCard, {
          marginBottom: length == key ? 100 : 20
        }]}>
          <View style={{
            flexDirection: 'row',
            width: '100%'
          }}>
              <View style={{
                width: '50%'
              }}>
                <Text style={{ fontWeight: '700' }} numberOfLines={2}>
                  Order #: {data.order_number}
                </Text>
              </View>
              <View style={{
                width: '50%'
              }}>
                <Text style={{
                  fontWeight: 'bold',
                  color: Color.primary,
                  textAlign: 'right',
                  fontSize: 11
                }}>
                  {Currency.display(data.total, data.currency)}
                </Text>
              </View>
          </View>
          <View style={{
              paddingTop: 10,
              width: '100%'
            }}>
            <Text numberOfLines={2}>
              <Text style={{
                fontSize: 13, 
                marginBottom: 10
              }}>
                Delivery To: {' '}
              </Text>
              <Text style={{
                fontSize: 13
              }}>
                {data.location}
              </Text>
            </Text>
            <View style={{
              flexDirection: 'row',
              paddingTop: 10,
              paddingBottom: 10
            }}>
            <Text style={{
              width: '50%',
              color: Color.gray,
              fontSize: 11
            }}>
              {
                data.date
              }
            </Text>

            <Text style={{
              color: this.getStatusColor(data.status),
              fontWeight: 'bold',
              textAlign: 'right',
              width: '50%',
              fontSize: 11
            }}>
              {
                data.status.toUpperCase()
              }
            </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

export default OrderManagementCard
