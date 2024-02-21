import React, {useState, useEffect, useContext} from 'react';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {
  StyleSheet,
  useColorScheme,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import {Text, Input, Button} from '@ui-kitten/components';
import Page from '../Page';
import {UserContext} from '../../src/context';
import {API_URL} from '../../env-vars';

const {UrlModule} = NativeModules;

const Settings = ({route, navigation}) => {
  const [urls, setUrls] = useState('');
  const [user, setUser] = useContext(UserContext);

  useEffect(() => {
    const visitUrl = async (url, eventTime) => {
      console.log('Post url');
      const requestOptions = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        method: 'POST',
        body: JSON.stringify({
          url,
          eventTime,
          device: 'android',
        }),
      };
      console.log(requestOptions);
      const response = await fetch(`${API_URL}/visit`, requestOptions);
      const data = await response.json();
      console.log(data);
    };

    const eventEmitter = new NativeEventEmitter();
    const eventListener = eventEmitter.addListener('urlDetected', event => {
      console.log('urlDetected');
      console.log(event);
      visitUrl(event.url, event.eventTime);
    });
    return () => {
      eventListener.remove();
    };
  });

  const getUrls = () => {
    UrlModule.setUrls(setUrls);
  };

  return (
    <Page>
      <Text>{urls}</Text>
      <Button onPress={getUrls}>Get URLs</Button>
    </Page>
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

export default Settings;
