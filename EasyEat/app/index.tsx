import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/Designer.png')}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.title}>Welcome to EasyEat</Text>
        <Text style={styles.subtitle}>Your personal food companion</Text>
        
        <View style={styles.buttonContainer}>
          <Link href="/signup" asChild>
            <TouchableOpacity style={[styles.button, styles.signupButton]}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/login" asChild>
            <TouchableOpacity style={[styles.button, styles.loginButton]}>
              <Text style={[styles.buttonText, styles.loginButtonText]}>Get Started</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#FF6B6B',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButtonText: {
    color: '#FF6B6B',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
}); 