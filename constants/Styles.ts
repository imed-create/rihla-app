import Colors, { SAHEL } from '@/constants/Colors';
import { StyleSheet } from 'react-native';

export const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SAHEL.background,
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderColor: SAHEL.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: SAHEL.card,
  },
  btn: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  btnIcon: {
    position: 'absolute',
    left: 16,
  },
  footer: {
    position: 'absolute',
    height: 100,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SAHEL.card,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopColor: SAHEL.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
