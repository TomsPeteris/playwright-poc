export const testUsers = {
  validUser: {
    username: process.env.TEST_USERNAME || 'uvr0713@gmail.com',
    password: process.env.TEST_PASSWORD || '1234',
  },
  invalidUser: {
    username: 'wronguser@mailinator.com',
    password: 'wrongpass',
  },
  // Dedicated users for parallel testing - each test suite uses its own user to avoid cart conflicts
  cartAddRemoveUser: {
    username: process.env.CART_USER || 'udumulav@outlook.com',
    password: process.env.CART_PASSWORD || '1234',
  },
  luxuryGoodsUser: {
    username: process.env.LUXURY_USER || 'ITC1_10102512@gmail.com',
    password: process.env.LUXURY_PASSWORD || '1234',
  },
  savedCartUser: {
    username: process.env.SAVED_CART_USER || 'uvr0713@gmail.com',
    password: process.env.SAVED_CART_PASSWORD || '1234',
  },
  finishedGoodsPartsUser: {
    username: process.env.PARTS_USER || 'ITC1_10103867@gmail.com',
    password: process.env.PARTS_PASSWORD || '1234',
  },
  globalSearchUser: {
    username: process.env.GLOBAL_SEARCH_USER || 'ITC1_10103866@gmail.com',
    password: process.env.GLOBAL_SEARCH_PASSWORD || '1234',
  },
  quickOrderUser: {
    username: process.env.QUICK_ORDER_USER || 'ITC1_10103826@gmail.com',
    password: process.env.QUICK_ORDER_PASSWORD || '1234',
  },
};

export const testProducts = {
  americanClipper: {
    id: '96M146',
    name: 'American Clipper',
  },
  citizenTsuyosa: {
    code: 'EW2440-53A',
    brand: 'CITIZEN',
    collection: 'undefined TSUYOSA',
  },
  bulovaAllClocks: {
    code: '36A103',
    brand: 'BULOVA CLOCKS',
    collection: 'All Clocks',
  },
  luxuryProduct: {
    code: 'FC-980MT3HPT',
    name: 'Classic Tourbillon',
    brand: 'Frederique Constant', 
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

export const testParts = {
  part1: {
    modelNumber: '98R266',
    partNumber: '8601410-4983',
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
  poNumber: 'TestOrder',
};

export const urls = {
  homepage: '/cwa/en/USD',
  login: '/login',
  cart: '/cart',
  checkout: '/checkout',
};
