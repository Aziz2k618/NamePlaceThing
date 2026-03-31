import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Game Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: FONTS.large,
  },
});