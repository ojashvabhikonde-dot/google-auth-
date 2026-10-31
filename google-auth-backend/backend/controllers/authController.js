
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// GOOGLE LOGIN
const googleLogin = async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
  throw new Error("Google Client ID or JWT_SECRET is missing");
}
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required"
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const { sub, email, name, picture, email_verified } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google email is not verified"
      });
    }

    let user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      user = await User.create({
        googleId: sub,
        name,
        email: email.toLowerCase(),
        profilePicture: picture,
        authProvider: "google"
      });
    } else {
      if (user.googleId && user.googleId !== sub) {
        return res.status(409).json({
          success: false,
          message: "Google account does not match"
        });
      }

      if (!user.googleId) {
        user.googleId = sub;
        user.authProvider = "google";
        await user.save();
      }
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.status(200).json({
      success: true,
      message: "Google Authentication Successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error("Google Auth Error:", error);

    return res.status(401).json({
      success: false,
      message: "Google Authentication Failed"
    });
  }
};

// GET USER PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-__v"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile"
    });
  }
};

// LOGOUT
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

module.exports = {
  googleLogin,
  getProfile,
  logout
};
