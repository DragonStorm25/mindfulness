import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {Datepicker, Text} from '@ui-kitten/components';
import {cognitoPool} from '../../src/util';

import {CognitoUserAttribute} from 'amazon-cognito-identity-js';

import FormInput from '../FormInput';
import Page from '../Page';
import Form from '../Form';

import {required, email} from '../../src/validation';
const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
);

const validators = {
  firstName: required('First name is required.'),
  lastName: required('Last name is required.'),
  username: required('Username is required.'),
  email: email('Email is required.'),
  password: required('Password is required.'),
  confirmPassword: (value, formValues) => {
    if (!value) {
      return 'Confirm password is required.';
    }
    if (value !== formValues.password) {
      return 'Passwords do not match.';
    }
    return '';
  },
  dateOfBirth: required('Date of birth is required.'),
};

const Register = ({navigation}) => {
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const onSubmit = () => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: formValues.email,
      }),
      new CognitoUserAttribute({
        Name: 'given_name',
        Value: formValues.firstName,
      }),
      new CognitoUserAttribute({
        Name: 'family_name',
        Value: formValues.lastName,
      }),
      new CognitoUserAttribute({
        Name: 'birthdate',
        Value: formValues.dateOfBirth.toISOString().split('T')[0],
      }),
    ];
    cognitoPool.signUp(
      formValues.username,
      formValues.password,
      attributeList,
      [],
      (err, data) => {
        if (err) {
          console.log(err.message || JSON.stringify(err));
          return;
        }
        navigation.navigate('ConfirmAccount', {
          email: formValues.email,
          username: formValues.username,
        });
      },
    );
  };

  return (
    <Page>
      <View style={styles.inputFields}>
        <Form
          onSubmit={onSubmit}
          validators={validators}
          buttonLabel="Register"
          formValues={formValues}
          setFormErrors={setFormErrors}>
          <FormInput
            label="First name"
            value={formValues.firstName}
            error={formErrors.firstName}
            setFormValues={setFormValues}
            setFormErrors={setFormErrors}
            name="firstName"
            textContentType="givenName"
            placeholder="First name"
            validator={validators.firstName}
          />
          <FormInput
            label="Last name"
            value={formValues.lastName}
            error={formErrors.lastName}
            setFormValues={setFormValues}
            setFormErrors={setFormErrors}
            name="lastName"
            textContentType="familyName"
            placeholder="Last name"
            validator={validators.lastName}
          />
          <FormInput
            label="Username"
            value={formValues.username}
            error={formErrors.username}
            setFormValues={setFormValues}
            setFormErrors={setFormErrors}
            name="username"
            textContentType="username"
            placeholder="Choose a username"
            validator={validators.username}
          />
          <FormInput
            label="Email"
            value={formValues.email}
            error={formErrors.email}
            setFormValues={setFormValues}
            setFormErrors={setFormErrors}
            name="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            placeholder="Email"
            validator={validators.email}
          />
          <Datepicker
            style={styles.formInput}
            label="Date of birth"
            date={formValues.dateOfBirth}
            onSelect={nextDate => {
              setFormValues({...formValues, dateOfBirth: nextDate});
            }}
            placeholder="Date of birth"
          />
          <FormInput
            label="Password"
            value={formValues.password}
            error={formErrors.password}
            setFormValues={setFormValues}
            setFormErrors={setFormErrors}
            name="password"
            textContentType="newPassword"
            secureTextEntry
            placeholder="Password"
            validator={validators.password}
          />
          <FormInput
            label="Confirm password"
            value={formValues.confirmPassword}
            error={formErrors.confirmPassword}
            setFormValues={setFormValues}
            setFormErrors={setFormErrors}
            name="confirmPassword"
            textContentType="newPassword"
            secureTextEntry
            placeholder="Confirm password"
            formValues={formValues}
            validator={validators.confirmPassword}
          />
        </Form>
        <View style={styles.flex}>
          <Text category="s1">Already have an account?</Text>
          <Text
            category="s1"
            style={styles.link}
            onPress={() => navigation.navigate('Login')}>
            Log In
          </Text>
        </View>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 24,
    height: Dimensions.get('window').height,
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
  inputFields: {
    marginTop: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
  },
  formInput: {
    marginBottom: 10,
  },
  registerButton: {
    marginTop: 20,
  },
});

export default Register;
