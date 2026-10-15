const axios = require('axios');


const TEXTBEE_API_KEY = 'txb_3cWN3bRcx9dpNqyJkFQOE5VzujrLsn5K';
const TEXTBEE_DEVICE_ID = '6a8d9b11b30f973be0c7da74';

/**
 * 
 * @param {string} phoneNumber 
 * @param {string} message 
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    
    let formattedNumber = phoneNumber.trim();
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '+94' + formattedNumber.substring(1);
    } else if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+94' + formattedNumber;
    }

    const response = await axios.post(
      `https://api.textbee.dev/api/v1/gateway/devices/${TEXTBEE_DEVICE_ID}/sendSMS`,
      {
        recipients: [formattedNumber],
        message: message,
      },
      {
        headers: {
          'x-api-key': TEXTBEE_API_KEY,
        },
      }
    );

    console.log(`[SMS Sent] To: ${formattedNumber}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('SMS Gateway Error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };