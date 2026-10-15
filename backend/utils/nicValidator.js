
const validateNIC = (nic) => {
  if (!nic || typeof nic !== 'string') {
    return { isValid: false, message: 'Entering the NIC number is mandatory.' };
  }

  const cleanNIC = nic.trim().toUpperCase();
  let birthYear = 0;
  let dayOfYear = 0;
  let gender = '';

  
  if (/^[0-9]{9}[VX]$/.test(cleanNIC)) {
    birthYear = parseInt('19' + cleanNIC.substring(0, 2), 10);
    dayOfYear = parseInt(cleanNIC.substring(2, 5), 10);
  }

  else if (/^[0-9]{12}$/.test(cleanNIC)) {
    birthYear = parseInt(cleanNIC.substring(0, 4), 10);
    dayOfYear = parseInt(cleanNIC.substring(4, 7), 10);
  } 
 
  else {
    return {
      isValid: false,
      message: 'Invalid NIC format (should be 9 digits + V or 12 digits)',
    };
  }

  if (dayOfYear >= 1 && dayOfYear <= 366) {
    gender = 'Male';
  } else if (dayOfYear >= 501 && dayOfYear <= 866) {
    gender = 'Female';
    dayOfYear -= 500; 
  } else {
    return { isValid: false, message: 'Invalid NIC format' };
  }

  const currentYear = new Date().getFullYear();
  if (birthYear < 1900 || birthYear > currentYear) {
    return { isValid: false, message: 'Invalid NIC format' };
  }

  return {
    isValid: true,
    message: 'Valid NIC number',
    data: {
      nic: cleanNIC,
      gender: gender,
      birthYear: birthYear,
      dayOfYear: dayOfYear,
    },
  };
};

module.exports = { validateNIC };