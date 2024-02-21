import React, {useState} from 'react';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import {Text, Input, Button} from '@ui-kitten/components';
import {cognitoPool} from '../../src/util';

const ConfirmAccount = ({route, navigation}) => {
  const [code, setCode] = useState('');
  const isDarkMode = useColorScheme() === 'dark';
  console.log(route);

  const userData = {
    Pool: cognitoPool,
    Username: route.params.username,
  };

  const cognitoUser = new CognitoUser(userData);

  const confirmAccount = () => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('call result: ' + result);
      navigation.navigate('Login');
    });
  };

  const resendVerification = () => {
    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('call result: ' + result);
    });
  };

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.content}>
          <Text category="p1" style={styles.blurb}>
            A one-time code has been sent to {route.params.email}. Please enter
            the code below to confirm your account.
          </Text>
          <Input
            placeholder="Enter code"
            label="Code"
            style={styles.input}
            textContentType="oneTimeCode"
            value={code}
            onChangeText={nextValue => setCode(nextValue)}
          />
          <Button onPress={confirmAccount} style={styles.confirmButton}>
            Confirm
          </Button>
          <Button size="tiny" appearance="outline" onPress={resendVerification}>
            Resend verification code
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  blurb: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 32,
  },
  confirmButton: {
    marginBottom: 16,
  },
});

export default ConfirmAccount;
