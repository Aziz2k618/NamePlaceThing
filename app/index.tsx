import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Name Place Thing 🎮</Text>
      <Text style={styles.counter}>You tapped {count} times</Text>
      <TouchableOpacity style={styles.button} onPress={() => setCount(count + 1)}>
        <Text style={styles.buttonText}>Click Me!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  counter: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});