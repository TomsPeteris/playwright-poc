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
    code: 'B1872',
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
