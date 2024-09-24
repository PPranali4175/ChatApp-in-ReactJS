const AdminSchema = require("../models/UserSchema.js");
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const createUser = async (req, res) => {
    try {
        const formData = req.body;

        // Check if a user with the same email or name already exists
        const existingUser = await AdminSchema.findOne({ 
            $or: [
                { email: formData.email }, 
                { name: formData.name }
            ]
        });

        if (existingUser) {
            return res.status(202).json({
                success: false,
                message: "A user with the same email or name already exists",
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(formData.password, salt);

        // Create a new User object
        const newUser = new AdminSchema({
            name: formData.name,
            email: formData.email,
            password: encryptedPassword,
            age: formData.age
        });

        // Save the user to the database
        await newUser.save();

        return res.status(200).json({
            success: true,
            data: newUser,
            message: "User added successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: `Error Adding User: ${error.message}`
        });
    }
};
const loginUser = async (req, res) =>{
    try {
        // take a value from user end
  const { email, password } = req.body;

  // Validate user input
  if (!(email && password)) {
    res.status(400).send("All input is required");
    return;
  }

  const userExist = await AdminSchema.findOne({ email: email });

  if (userExist && (await bcrypt.compare(password, userExist.password))) {
    // generate jwt token
    const token = jwt.sign(
      {
        user_id: userExist._id,
        email,
      },
      process.env.TOKEN_KEY
    );
    
    // save user token
    userExist.token = token;

    // save user token in data base but there is no need to save it
    await userExist.save();

    return res.status(200).json({
      user: userExist,
      success: true,
      message: "login Successfull",
    });
  } else {
    return res.status(202).json({
      success: false,
      message: "Login failed",
    });
  }
    } catch (error) {
        return res
        .status(500)
        .json({ success: false, error: `Error in logging ${error}` });
    
    }
};
const generateToken = async (req,res) => {
  if (req.user.user_id === req.params.id) {

  try {
    const _id  = req.user.user_id;
    const user = await AdminSchema.findOne({ _id:_id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
    // console.log(user)
    res.status(200).json({ success: true, token: resetToken });

  } catch (error) {
    res.status(500).json({ error: `Failed to Generate Token ${error}` });
  }
}
else{
  return res.status(401).json({
    success: false,
    error: `The token doesn't match.`
});
}
};
const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const password = req.body.pass;
    const user = await AdminSchema.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();
    res.json({ success: true ,msg:"Reset Successfully"});
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
const getUser = async (req, res) => {
    if (req.user.user_id === req.params.id) {
        try {
            // Find and delete the user by ID
            const getUser = await UserSchema.findById(req.params.id);
            if (!getUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            return res.status(200).json({
                success: true,
                data: getUser,
                message: "User Profile successfully Fetched",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: `Error fetching user profile: ${error.message}`
            });
        }
    }
    else {
        return res.status(401).json({
            success: false,
            error: `The token doesn't match.`
        });
    }
}
const getAllUser = async(req,res) =>{
  try {
    const Users = await AdminSchema.find().select('name _id');
    return res.status(200).json({data:Users})
  } catch (error) {
    return res.status(500).json({error:`Error ${error}`})
  }
}
module.exports = { createUser,loginUser, resetPassword, generateToken,getUser ,getAllUser};
