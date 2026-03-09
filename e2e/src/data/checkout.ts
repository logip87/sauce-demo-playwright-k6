export interface CheckoutDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const checkoutDetails: CheckoutDetails = {
  firstName: 'Taylor',
  lastName: 'Engineer',
  postalCode: '10001',
};

export const checkoutValidationMessages = {
  firstNameRequired: 'First Name is required',
  lastNameRequired: 'Last Name is required',
  postalCodeRequired: 'Postal Code is required',
} as const;
