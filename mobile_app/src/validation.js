// Functions to create validators

const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
);

export const required = message => value => value ? '' : message;
export const email = message => value => {
  if (!value) {
    return message;
  }
  if (!emailRegex.test(value)) {
    return 'Email is invalid.';
  }
  return '';
};
