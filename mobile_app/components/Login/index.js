import React, {useState, useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '@ui-kitten/components';
import {CognitoUser, AuthenticationDetails} from 'amazon-cognito-identity-js';
import {UserContext} from '../../src/context';

import FormInput from '../FormInput';
import Page from '../Page';
import Form from '../Form';

import {email, required} from '../../src/validation';
import {cognitoPool} from '../../src/util';

const validators = {
  email: email('Email is required.'),
  password: required('Password is required.'),
};

const Login = ({navigation}) => {
  const [user, setUser] = useContext(UserContext);

  const onSubmit = () => {
    const authDetails = new AuthenticationDetails({
      Username: formValues.email,
      Password: formValues.password,
    });
    const userData = {
      Username: formValues.email,
      Pool: cognitoPool,
    };
    const cognitoUser = new CognitoUser(userData);
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: function (result) {
        const accessToken = result.getAccessToken();
        console.log(accessToken);
        const jwtToken = accessToken.getJwtToken();
        const expires = accessToken.getExpiration();
        const username = accessToken.payload.username;
        const userEmail = result.idToken.payload.email;
        const sub = result.idToken.payload.sub;

        setUser({
          token: jwtToken,
          expires,
          username,
          userEmail,
          sub,
        });
        // navigation.navigate('Dashboard');
        navigation.navigate('Home');
      },

      onFailure: function (err) {
        console.log(err);
      },
    });
  };
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});

  return (
    <Page>
      <View style={styles.form}>
        <Form
          onSubmit={onSubmit}
          validators={validators}
          buttonLabel="Login"
          formValues={formValues}
          setFormErrors={setFormErrors}>
          <FormInput
            label="Email"
            name="email"
            placeholder="Email"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={formValues.email}
            error={formErrors.email}
            setFormValues={setFormValues}
            setFormErrors={setFormErrors}
            validator={validators.email}
          />
          <FormInput
            label="Password"
            name="password"
            placeholder="Password"
            secureTextEntry
            textContentType="password"
            value={formValues.password}
            error={formErrors.password}
            setFormValues={setFormValues}
            setFormErrors={setFormErrors}
            validator={validators.password}
          />
        </Form>
      </View>
      <View style={styles.flex}>
        <Text category="s1">Need an account?</Text>
        <Text
          category="s1"
          style={styles.link}
          onPress={() => navigation.navigate('Register')}>
          Register
        </Text>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: 32,
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginLeft: 5,
  },
});

export default Login;
