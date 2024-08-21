const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

/**
 * Send a booking confirmation email using SendGrid.
 * 
 * @param {string} recipientEmail - The email address of the recipient.
 * @param {string} subject - The subject of the email.
 * @param {Object} bookingDetails - The details of the booking to include in the email.
 */

async function resetPasswordEmail(recipientEmail, link) {
    console.log('req received')
    // Construct the HTML body using booking details
    const htmlBody = `
        <h1>Password reset</h1>
        <p>Your password reset link will expire in 1 hour ${link}</p>
    `;
  
    // Setup the message object
    const msg = {
        to: recipientEmail,
        from: 'jack@hanningtondigital.com',  // This should be a verified sender email in your SendGrid account
        subject: "Password reset request",
        text: `Your password reset link will expire in 1 hour ${link}`,
        html: htmlBody,
    };
  
    // Send the email
    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Failed to send email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
  }


async function bookingConfirmation(recipientEmail, subject, bookingDetails) {
  // Construct the HTML body using booking details
  const htmlBody = `
      <h1>Booking Confirmation</h1>
      <p>Thank you for your booking. Here are your booking details:</p>
      <ul>
          <li>Date: ${bookingDetails.date}</li>
          <li>Time: ${bookingDetails.time}</li>
          <li>Service: ${bookingDetails.serviceName}</li>
          <li>Total Price: £${bookingDetails.totalPrice}</li>
      </ul>
  `;

  // Setup the message object
  const msg = {
      to: recipientEmail,
      from: 'jack@hanningtondigital.com',  // This should be a verified sender email in your SendGrid account
      subject: subject,
      text: `Thank you for your booking on ${bookingDetails.date} at ${bookingDetails.time}.`,
      html: htmlBody,
  };

  // Send the email
  try {
      await sgMail.send(msg);
      console.log('Email sent successfully');
  } catch (error) {
      console.error('Failed to send email:', error);
      if (error.response) {
          console.error(error.response.body);
      }
  }
}

  module.exports = {bookingConfirmation, resetPasswordEmail}


