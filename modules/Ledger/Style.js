import { Color } from 'common';
import { Dimensions } from 'react-native';
const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);
export default {
  modal: {
    backgroundColor: Color.gray
  },
  MainContainer: {
    flex: 1,
  },
  sliderContainer: {
    flex: 1,
    minHeight: height,
    width: '100%',
    paddingHorizontal: 20
  },
  ScrollView: {
    flex: 1
  },
    modal: {
    backgroundColor: Color.gray
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    height: height - 100,
    width: width - 40,
    borderRadius: 10,
    backgroundColor: Color.white
  },
  header: {
    width: '100%',
    borderBottomColor: Color.gray,
    borderBottomWidth: 1,
    flexDirection: 'row'
  },
  text: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 10,
  },
  close: {
    paddingRight: 10
  },
  content: {
    width: '100%',
    height: height - (200),
  },
  action: {
    width: '100%',
    borderTopColor: Color.gray,
    borderTopWidth: 1,
   
    
  },
  buttonPicked: {
    justifyContent: 'center',
    height: 35,
    width: '30%',
    backgroundColor: 'white',
    borderRadius:50,
    borderColor:'#FF5B04',
    borderWidth:1,
  },
  notPicked:{
    justifyContent: 'center',
    height: 35,
    width: '30%',
    backgroundColor: 'white',
    borderRadius:50,
    borderWidth:1,
    borderColor:'#CCCCCC'
  }
}