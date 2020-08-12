import { Color } from 'common';
import { Dimensions } from 'react-native';
const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);
export default {
  ScrollView: {
    padding: 20
  },
  MainContainer: {
    width: '100%',
    paddingBottom: 50
  },
  TextContainer: {
    flex: 1,
    width: '100%'
  },
  map:{
    position:'relative',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width,
    height
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: Color.lightGray,
    paddingTop: 10,
    paddingBottom: 10
  }
}