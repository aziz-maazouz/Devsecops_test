const User = require("../db/User");
const Achievements = require("../db/Achievements");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const invalidPassword = { keyPattern: { password: 1 } };
const invalidEmail = { keyPattern: { email: 1 } };
const passwordChange = { success: "Successfully updated the password" };
const { sendEmail } = require("../middlewares/emailSender");

var SignUp = (req, res) => {
  // Endpoint: /as-api/sign-up
  const json = req.body;
  var hashedPassword = bcrypt.hashSync(
    json.password,
    parseInt(process.env.HASH_SALT)
  ); // Hash json.password
  var userData = {
    firstName: json.firstName[0].toUpperCase() + json.firstName.slice(1),
    lastName: json.lastName[0].toUpperCase() + json.lastName.slice(1),
    universityYear: json.universityYear,
    email: json.email,
    password: hashedPassword,
    role: "Member",
    isVerified: process.env.SHOULD_VERIFY === "YES" ? false : true,
  };
  const newUser = new User(userData);
  newUser
    .save()
    .then((newUser) => {
      const achievements = new Achievements({ user: newUser._id });
      achievements
        .save()
        .then(() => {
          if (process.env.SHOULD_VERIFY === "YES") {
            const email = {
              subject: "Verification Email ",
              text: "",
              html: `<div style='padding:5px; background-color: #10A5F5;'>
              <div style='text-align: center; background-color: rgb(32, 53, 73);' >
              <br/> <h1 style='color:white; margin-left:5%; margin-right:5%; '>Welcome to the family, ${newUser.firstName}!</h1> 
              <p style='text-align:left; margin-left:5%; margin-right:5%; color:white;'><span style='font-style: bold'></span><br/><br/>Thank you for joining Student Specialty advisor. <br/><br/>We hope that we will help you find the right specialty for you throughout your journey with us. <br/><br/>Please do not forget to verify your email  so that you can have access to your account.</p> <br/> <br/>           
              <a href='https://student-specialty-advisor.herokuapp.com/verify/${newUser._id}' target='_blank' rel='noreferrer noopener' style = "background-color : cyan ; padding : 10px 40px ; color : rgb(15, 25,33) ; text-decoration : none ; text-align :center ;">Verify Email Now!</a>
              <br/><br/><br/><p style='text-align:left; margin-left:5%; margin-right:5%; color:white;'><span style='font-style: bold'>If you have any concerns, please contact us at <strong>studentspecialtyadvisor@outlook.com</strong>
              <br/><br/><br/><i>By Students, For Students,<br/>The Student Specialty Advisor Team</i>
              </p><br/>
              <a href='https://student-specialty-advisor.herokuapp.com/' target='_blank' rel='noreferrer noopener'><div style='width:100%; background-color: rgb(15, 25,33); padding-top: 2%; padding-bottom: 2%;'><img style='width:25%;' src='cid:unique@logo.ssa-api' alt=''/></div></a>
              </div></div>`,
            };
            sendEmail(
              newUser.email,
              email.subject,
              email.text,
              email.html,
              true
            )
              .then((emailStatus) => {
                res.status(200).send({
                  success: 1,
                  message:
                    "User was created, and an achievements document was linked to it",
                  emailStatus: emailStatus,
                });
              })
              .catch((error) => {
                res.status(500).send({ error: 1, errorObject: error });
              });
          } else {
            res.status(200).send({
              success: 1,
              message:
                "User was created, and an achievements document was linked to it",
              emailStatus:
                "Dev mode is enabled, so no verification email was sent to the newly created user. If you want a verification email to be sent, change SHOULD_VERIFY to YES",
            });
          }
        })
        .catch((error) => {
          res.status(500).send({ error: 1, errorObject: error });
        });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};

var LogIn = (req, res) => {
  //Endpoint: /as-api/log-in
  const json = req.body;
  var emailObj = { email: json.email };
  User.findOne(emailObj).then((user) => {
    if (user === null) {
      res.status(500).send(invalidEmail);
    } else {
      if (bcrypt.compareSync(json.password, user.password)) {
        if (!user.isVerified) {
          res.status(401).send({
            notVerified: 1,
            message: "User did not verify the email address",
          });
        } else {
          var token = jwt.sign({ id: user._id }, process.env.TOKEN_KEY, {
            expiresIn: parseInt(process.env.TOKEN_DURATION),
          });
          var userData = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            universityYear: user.universityYear,
            email: user.email,
            role: user.role,
            accessToken: token,
            isVerified: user.isVerified,
          };
          res.status(200).send(userData);
        }
      } else {
        res.status(500).send(invalidPassword);
      }
    }
  });
};

var EditAccount = (req, res) => {
  // Endpoint: /as-api/:username/
  const user = req.body;
  const id = {
    _id: req.userId,
  };
  if (user.password) {
    User.findById(req.userId)
      .then((foundUser) => {
        if (bcrypt.compareSync(user.currentPassword, foundUser.password)) {
          var hashedPassword = bcrypt.hashSync(
            user.password,
            parseInt(process.env.HASH_SALT)
          );
          User.findOneAndUpdate(id, { password: hashedPassword })
            .then(() => {
              res.status(200).send(passwordChange);
            })
            .catch((error) => {
              res.status(500).send(error);
            });
        } else {
          res.status(403).send(invalidPassword);
        }
      })
      .catch((error) => res.status(500).send(error));
  } else {
    const userToSave = {
      firstName: user.firstName,
      lastName: user.lastName,
      universityYear: user.universityYear,
    };
    User.findOneAndUpdate(id, userToSave, { new: true })
      .then((userData) => {
        var token = jwt.sign({ id: userData._id }, process.env.TOKEN_KEY, {
          expiresIn: parseInt(process.env.TOKEN_DURATION),
        });
        const userToReturn = {
          id: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          universityYear: userData.universityYear,
          email: userData.email,
          role: userData.role,
          isVerified: userData.isVerified,
          accessToken: token,
        };
        res.status(200).send(userToReturn);
      })
      .catch((error) => {
        res.status(403).send(error);
      });
  }
};
var HandleVerification = (req, res) => {
  User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true })
    .then((verifiedUser) => {
      res.status(200).send({ success: 1, user: verifiedUser });
    })
    .catch((error) => {
      res.status(500).send({ error: 1, errorObject: error });
    });
};
// Exports
exports.SignUp = SignUp;
exports.LogIn = LogIn;
exports.EditAccount = EditAccount;
exports.HandleVerification = HandleVerification;
