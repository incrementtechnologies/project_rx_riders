import { Color } from 'common';
import { Dimensions } from 'react-native';
const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);
export default {
  ScrollView: {
    paddingTop: 20
  },
  MainContainer: {
    width: '100%'
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
  },
  floatingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    position: 'absolute',                                          
    bottom: 10,                                                    
    right: 10,
    height: 70,
    borderRadius: 100,
    zIndex: 100
  },
  textFloatingBtn: {
    color: Color.white
  },
}