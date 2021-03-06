import bcrypt from "bcryptjs";
import UserModel from '../model/userModel';
import jwt from 'jsonwebtoken';

//user signup
exports.userSignup = (req, res) => {

  const { firstname, lastname, email, 
    college, branch, year_of_passing, phonenumber,
    batch, city, password } = req.body;

    const params = {
      firstname,
      lastname,
      email,
      college,
      branch,
      year_of_passing,
      phonenumber,
      batch,
      city,
      password
    }
    UserModel.find({email: req.body.email})
    .then(data => {
      if (data != null && data != ''){
        res.send('User already exists');
      }
      else
      {
        const userData = new UserModel(params);
        bcrypt.genSalt(10, function(err, salt){
          bcrypt.hash(userData.password, salt, function(err, hash) {
            userData.password = hash;
            userData.save()
            .then(data => {
              return res.status(200).json({
                message: "new user", data
              });
            })
            .catch(err => {
              res.status(400).send(err.message);
            })    
          })
        })
      }
    })
  };

  //user login
  exports.userLogin = (req,res) => {
   
    UserModel.findOne({ phonenumber : req.body.phonenumber })
    .exec()
    .then(user => {
      bcrypt.compare(req.body.password, user.password, function(err, result){
       if(err) {
        return res.status(401).json({
         failed: 'Unauthorized Access'
       });
      }
      if(result) {
        const JWTToken = jwt.sign({
         phonenumber: user.phonenumber,
         _id: user._id
       },
       'secret',
       {
        expiresIn: '2h'
      });
        return res.status(200).json({
         token: JWTToken
       });
      }
      return res.status(401).json({
        failed: 'Unauthorized Access'
      });
    });
    })
    .catch(error => {
      res.status(500).json({
       error: error
     });
    });
  };

//getAll users
exports.getAllUsers = (req, res) => {
  UserModel.find({})
  .then(data => {
    res.json(data);
  }).catch(err => {
    res.status(400).send('User not exists');
  });
};

