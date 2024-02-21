import React from 'react';
import {Input, Text} from '@ui-kitten/components';
import {View, StyleSheet, Dimensions} from 'react-native';

const FormInput = ({
  label,
  value,
  error,
  setFormValues,
  setFormErrors,
  formValues = {},
  validator = () => {},
  ...props
}) => {
  return (
    <View style={styles.formInput}>
      <Input
        label={evaProps => <Text {...evaProps}>{label}</Text>}
        value={value}
        status={error && 'danger'}
        caption={error ?? ''}
        onChangeText={nextValue => {
          setFormValues(prevFormValues => ({
            ...prevFormValues,
            [props.name]: nextValue,
          }));

          const err = validator(nextValue, formValues);
          if (!err) {
            setFormErrors(prevFormErrors => ({
              ...prevFormErrors,
              [props.name]: validator(nextValue, formValues),
            }));
          }
        }}
        onBlur={() => {
          setFormErrors(prevFormErrors => ({
            ...prevFormErrors,
            [props.name]: validator(value, formValues),
          }));
        }}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 24,
    height: Dimensions.get('window').height,
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
});

export default FormInput;
