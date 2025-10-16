export const testUsers = {
  validUser: {
    username: process.env.TEST_USERNAME || 'uvr0713@gmail.com',
    password: process.env.TEST_PASSWORD || '1234',
  },
  invalidUser: {
    username: 'wronguser@mailinator.com',
    password: 'wrongpass',
  },
};

export const testProducts = {
  americanClipper: {
    id: '96M146',
    name: 'American Clipper',
  },
  citizenTsuyosa: {
    code: 'AR3103-58E',
    brand: 'CITIZEN',
    collection: 'undefined TSUYOSA',
  },
  bulovaAllClocks: {
    code: '36A103',
    brand: 'BULOVA CLOCKS',
    collection: 'All Clocks',
  },
  corsoClocks: {
    code: 'EW2390-50D',
    brand: 'CITIZEN',
    collection: 'All Clocks',
    name: 'Corso',
  },
  chandlerClocks: {
    code: 'AT2372-50E',
    brand: 'CITIZEN',
    collection: 'All Clocks',
    name: 'Chandler',
  },
};

export const quickOrderProducts = [
  'BU2020-02A',
  'JY8035-04E',
  'EW2390-50D',
  'EG3100-09E',
  '43A144',
  'BH3002-62E',
  'AW0060-54H',
  'EU6070-51D',
  'BM6010-55A',
  'FC-303MN5B4',
];

export const checkoutData = {
  orderCancelDate: {
    year: '2026',
    dayLabel: 'Wednesday, April 1,',
    dayText: '1',
  },
  poNumber: 'TestOrder',
};

export const urls = {
  homepage: '/cwa/en/USD',
  login: '/login',
  cart: '/cart',
  checkout: '/checkout',
};
