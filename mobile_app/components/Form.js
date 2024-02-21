import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from '@ui-kitten/components';

/**
 * React component for a form
 *
 * Requires onSubmit function to be called on submit
 *  - On submit, also calls all validators
 *  - Validator should be a function (value, formValues) => string
 *
 */
const Form = ({
  children,
  onSubmit,
  validators,
  buttonLabel,
  formValues,
  setFormErrors,
}) => {
  const submitForm = () => {
    const errors = {};
    Object.keys(validators).forEach(key => {
      errors[key] = validators[key](formValues[key], formValues);
    });
    setFormErrors(errors);
    if (Object.values(errors).every(err => !err)) {
      onSubmit();
    }
  };

  return (
    <View>
      {children}
      <Button onPress={submitForm} style={styles.button}>
        {buttonLabel}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
  },
});

export default Form;
