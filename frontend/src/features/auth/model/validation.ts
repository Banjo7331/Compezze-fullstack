import * as yup from 'yup';

export const loginSchema = yup.object({
  usernameOrEmail: yup.string().required('Nazwa użytkownika lub email jest wymagana.'),
  password: yup.string().required('Hasło jest wymagane.'),
}).required();

export const registerSchema = yup.object({
  username: yup.string()
    .required('Nazwa użytkownika jest wymagana.')
    .min(3, 'Minimum 3 znaki.'),
  email: yup.string()
    .email('Niepoprawny format email.')
    .required('Email jest wymagany.'),
  password: yup.string()
    .required('Hasło jest wymagane.')
    .min(6, 'Minimum 6 znaków.'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Hasła muszą być identyczne.')
    .required('Potwierdzenie hasła jest wymagane.'),
}).required();