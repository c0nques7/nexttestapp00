const express = require('express');
const bcrypt = require('bcrypt');

const app = express();

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Get the user from the database
  const user = await User.findOne({ email });

  // Check if the user exists
  if (!user) {
    return res.status(404).json({ errors: ['User not found.'] });
  }

  // Compare the hashed password to the one stored in the database
  const isMatch = await bcrypt.compare(password, user.password);

  // If the passwords match, log the user in
  if (isMatch) {
    req.session.userId = user._id;
    return res.json({ success: true });
  } else {
    return res.status(401).json({ errors: ['Incorrect password.'] });
  }
});
