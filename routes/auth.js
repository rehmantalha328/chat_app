const router = require("express").Router();
const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;
const trimRequest = require("trim-request");
const fs = require("fs");
const {
  signUpValidation,
  simpleLoginValidation,
  checkEmailValidation,
  referalIdValidation,
} = require("../joiValidation/validate");
const {
  getError,
  getSuccessData,
  createToken,
  deleteUploadedImage,
} = require("../helper_functions/helpers");
const { getUserFromEmail } = require("../database_queries/auth");
const uploadImage = require("../middlewares/imageMulter");
const { uploadFile, deleteFile } = require("../s3_bucket/s3_bucket");
const { AdminApproval, AccountTypes } = require("@prisma/client");

// SIMPLE SIGNUP USER
router.post("/signUpUser", [uploadImage, trimRequest.all], async (req, res) => {
  // console.log("iam body:::", req.body);
  // return res.status(200).send(getSuccessData("done"));
  // console.log("iam profile:::", req.files?.["profile"]);
  // console.log("iam gallery images:::", req.files ?.["gallery"][0].path);
  try {
    var referal_id = Math.random().toString(36).substr(2, 7);
    let files = [];
    let u_p = [];
    const { error, value } = signUpValidation(req.body);
    if (error) {
      deleteUploadedImage(req);
      return res.status(404).send(getError(error.details[0].message));
    }
    // Adding user passions
    if (!req.body.user_passions) {
      deleteUploadedImage(req);
      return res.status(404).send(getError("Please Select Passions."));
    }

    if (req.body.user_passions.length < 4) {
      deleteUploadedImage(req);
      console.log("Please Select Atleast 4 Passions");
      return res
        .status(404)
        .send(getError("Please Select Atleast 4 Passions."));
    }
    if (req.body.user_passions.length > 5) {
      deleteUploadedImage(req);
      console.log("You Cannot Select More Than 5 Passions.");
      return res
        .status(404)
        .send(getError("You Cannot Select More Than 5 Passions."));
    }
    // checking File Error
    if (req.file_error) {
      console.log("Please Select Your Profile.");
      deleteUploadedImage(req);
      return res.status(404).send(getError(req.file_error));
    }
    if (!req.files?.["profile"]) {
      deleteUploadedImage(req);
      console.log("Please Select Your Profile..");
      return res.status(404).send(getError("Please Select Your Profile."));
    }
    // Variables
    const {
      fname: _fname,
      lname: _lname,
      email: _email,
      password,
      birthday,
      gender: _gender,
      height,
      religion: _religion,
      interested_in: _interested_in,
      country: _country,
      nationality: _nationality,
      longitude,
      latitude,
      refrer_id,
      fcm_token,
      bio,
    } = value;
    // Converting Value to lower case
    const email = _email.toLowerCase();
    const fname = _fname.toLowerCase();
    const lname = _lname.toLowerCase();
    const gender = _gender.toLowerCase();
    const religion = _religion.toLowerCase();
    const interested_in = _interested_in.toLowerCase();
    const country = _country.toLowerCase();
    const nationality = _nationality.toLowerCase();
    const age = parseInt(birthday);

    const chkEmail = await getUserFromEmail(email);
    if (!chkEmail) {
      deleteUploadedImage(req);
      return res.status(404).send(getError("Email doest not Exist."));
    }
    if (
      chkEmail.is_registered == true ||
      chkEmail.logged_in_service == "SOCIAL"
    ) {
      deleteUploadedImage(req);
      return res.status(404).send(getError("Email already taken."));
    }
    // user Gallery
    //   if (req.files?.["gallery"]) {
    //     req.files?.["gallery"]?.forEach((file) => {
    //       const fileName = file ? file.filename : null;
    //       if (fileName) {
    //         files.push({
    //           picture_url: fileName,
    //         });
    //       }
    //     });
    // }

    if (req.body.user_passions) {
      req.body.user_passions.forEach((p) => {
        u_p.push({
          passions: p,
        });
      });
    }

    // Referal System
    if (req.body?.refrer_id) {
      const chkRefrer = await prisma.users.findFirst({
        where: {
          referal_id: refrer_id,
        },
      });
      if (chkRefrer) {
        const count = chkRefrer.accounts_created_on_ref;
        let update = await prisma.users.update({
          where: {
            user_id: chkRefrer.user_id,
          },
          data: {
            accounts_created_on_ref: count + 1,
          },
        });
        if (update.accounts_created_on_ref == 5) {
          const getPlans = await prisma.membershipPlans.findMany({
            orderBy: {
              plan_price: "asc",
            },
          });
          const updateToPremium = await prisma.users.update({
            where: {
              user_id: chkRefrer.user_id,
            },
            data: {
              account_types: getPlans ? getPlans[0]?.plan_name : null,
              membership_created_at: new Date(),
              membership_valid_for: getPlans ? getPlans[0].plan_duration : null,
            },
          });
          return res
            .status(200)
            .send(
              getSuccessData(
                "Congratulations! You got Silver Account For a Month."
              )
            );
        }
      }
    }
    // END
    // s3 bucket for gallery
    if (req.files?.["gallery"]) {
      for (const file of req.files["gallery"]) {
        if (file) {
          let { Location } = await uploadFile(file);
          var gallery_url = Location;
          files.push({
            picture_url: Location,
          });
        }
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    // END
    // s3 bucket for profile
    if (req.files?.["profile"]) {
      for (const file of req.files["profile"]) {
        if (file) {
          let { Location } = await uploadFile(file);
          var profile_picture = Location;
          var profile_url = Location;
        }
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    // END
    const createUser = await prisma.users.update({
      where: {
        user_id: chkEmail.user_id,
      },
      data: {
        fname,
        lname,
        user_password: password,
        birthday: age,
        gender,
        height,
        religion,
        interested_in,
        country,
        nationality,
        longitude,
        latitude,
        fcm_token,
        is_registered: true,
        profile_picture,
        referal_id,
        bio,
        user_pictures: {
          createMany: {
            data: files,
          },
        },
        user_passions: {
          createMany: {
            data: u_p,
          },
        },
      },
    });
    if (createUser) {
      console.log("user created:::", createUser);
      return res
        .status(200)
        .send(getSuccessData(await createToken(createUser)));
    } else {
      console.log("There is some issue from server please try again later.");
      deleteFile(gallery_url);
      deleteFile(profile_url);
      deleteUploadedImage(req);
      return res
        .status(404)
        .send(
          getError("There is some issue from server please try again later.")
        );
    }
  } catch (catchError) {
    if (catchError && catchError.message) {
      deleteFile(gallery_url);
      deleteFile(profile_url);
      deleteUploadedImage(req);
      return res.status(404).send(getError(catchError.message));
    }
    deleteFile(gallery_url);
    deleteFile(profile_url);
    deleteUploadedImage(req);
    return res.status(404).send(getError(catchError));
  }
});

router.post("/chkReferalId", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = referalIdValidation(req.body);
    if (error) {
      return res.status(404).send(getError(error.details[0].message));
    }
    const { refrer_id } = value;

    const chkRefrer = await prisma.users.findFirst({
      where: {
        referal_id: refrer_id,
      },
    });
    if (!chkRefrer) {
      return res.status(404).send(getError("Invalid referal ID"));
    }
    return res.status(200).send(getSuccessData("Successfully applied"));
  } catch (error) {
    if (error && error.message) {
      return res.status(404).send(getError(error.message));
    }
    return res.status(404).send(getError(error.message));
  }
});

// SIMPLE LOGIN
router.post("/simpleLogin", trimRequest.all, async (req, res) => {
  try {
    const { error, value } = simpleLoginValidation(req.body);
    if (error) return res.status(404).send(getError(error.details[0].message));
    const { email: _email, password, fcm_token } = value;
    const email = _email.toLowerCase();
    const chkEmail = await getUserFromEmail(email);
    if (chkEmail?.admin_approval === AdminApproval.PENDING) {
      return res.status(404).send(getError("Please wait to approved!"));
    }
    if (chkEmail?.admin_approval === AdminApproval.BLOCKED) {
      return res
        .status(404)
        .send(getError("Sorry.. you are blocked by admin!"));
    }
    if (chkEmail?.logged_in_service == "SOCIAL")
      return res.status(404).send(getError("Email already taken."));
    if (chkEmail?.is_registered != true || chkEmail?.user_email != email) {
      return res.status(404).send(getError("Email does not exist"));
    }
    if (chkEmail.user_password != password) {
      return res.status(404).send(getError("Invalid Password"));
    }
    const updateFcmToken = await prisma.users.update({
      where: {
        user_id: chkEmail.user_id,
      },
      data: {
        fcm_token,
      },
    });
    const user = chkEmail;
    return res.status(200).send(getSuccessData(await createToken(user)));
  } catch (catchError) {
    if (catchError && catchError.message) {
      return res.status(404).send(getError(catchError.message));
    }
    return res.status(404).send(getError(catchError));
  }
});

module.exports = router;
