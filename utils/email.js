const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Crete an email
  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "038cd96cfa3b8c",
      pass: "03e0f7302018ea",
    },
  });

  //Define the email options
  const sendEmail = {
    from: "Vivek maurya<vivekmaurya3m9@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Actually send the options
  await transport.sendMail(sendEmail);
};

module.exports = sendEmail;
