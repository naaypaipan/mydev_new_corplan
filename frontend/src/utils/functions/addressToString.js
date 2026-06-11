/* eslint-disable camelcase */
const addressToString = (address) => {
  if (!address) {
    return '';
  }

  const {
    country = '',
    district = '',
    house_number = ' ',
    province = '',
    postcode = '',
    road = '',
    subdistrict = '',
    village_number = '',
  } = address;
  return `${house_number} ${village_number ? `ม.${village_number}` : ''} ${
    road ? `ถ.${road}` : ''
  } ${subdistrict ? `ต.${subdistrict}` : ''} ${
    district ? `อ.${district}` : ''
  } ${province ? `จ.${province}` : ''} ${postcode} ${country}`;
};

export default addressToString;
