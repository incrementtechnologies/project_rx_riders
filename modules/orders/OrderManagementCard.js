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
    const { data } = this.props
    
    return (
      <TouchableOpacity onPress={() => this.props.onClick(data)}>
        <View style={Style.orderManagementCard}>
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
                  textAlign: 'right'
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
              <Text style={{ fontWeight: '600' }}>
                Delivery To: {' '}
              </Text>
              <Text>
                {data.location}
              </Text>
            </Text>
            <Text style={{
              color: this.getStatusColor(data.status),
              fontWeight: 'bold'
            }}>
              {
                data.status.toUpperCase()
              }
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

export default OrderManagementCard
