const jwt = require("jsonwebtoken");
const fs = require("fs");
const { now } = require("mongoose");
const timediff = require("timediff");
const { getEnv } = require("../config");


const getError = (error) => {
  return {
    error,
    code: 404,
  };
};

const getSuccessData = (data) => {
  return {
    data,
    code: 200,
  };
};

const clean = (str) => {
  return str
    .replace(/[^\d.-]/g, "")
    .replace(/(?!\w|\s)./g, "")
    .replace(/\s+/g, "")
    .replace(/^(\s*)([\W\w]*)(\b\s*$)/g, "$2");
};

const createToken = async (user) => {
  return jwt.sign(
    {
      _id: user.user_id,
      username: user.username,
      phone: user.phone,
      profile_img: user.profile_img,
    },
    getEnv("JWT_SECRET"),
    {
      expiresIn: "7d",
    }
  );
};

const createAdminToken = (admin) => {
  return jwt.sign(
    {
      admin_id: admin.admin_id,
      admin_email: admin.admin_email,
      role: admin.role,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    },
    getEnv("ADMIN_JWT_SECERET"),
    {
      expiresIn: "7d",
    }
  );
};

const timeExpired = ({
  p_years = 0,
  p_months = 0,
  p_days = 0,
  p_hours = 0,
  p_minutes = 0,
  p_seconds = 60,
  time = now(),
}) => {
  const { years, months, days, hours, minutes, seconds } = timediff(
    time,
    now(),
    "YMDHmS"
  );

  return (
    years > p_years ||
    months > p_months ||
    days > p_days ||
    hours > p_hours ||
    minutes > p_minutes ||
    seconds > p_seconds
  );
};

const deleteUploadedImage = (req) => {
  try {
    // if (req.files?.["profile"]) {
    //   req?.files["profile"]?.forEach((file) => {
    //     fs.unlinkSync(file.path);
    //   });
    // }
    // if (req.files?.["gallery"]) {
    //   req?.files["gallery"]?.forEach((file) => {
    //     fs.unlinkSync(file.path);
    //   });
    // }
    if (req.files) {
      req?.files?.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteSingleImage = (req) => {
  try {
    const path = req?.file?.path;
    fs.unlinkSync(path);
  } catch (error) {
    console.log(error);
  }
};

const deleteExistigImg = (req) => {
  try {
    const path = req?.file?.path;
    fs.unlinkSync(path);
  } catch (error) {
    console.log(error);
  }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}



module.exports = {
  getError,
  getSuccessData,
  clean,
  createToken,
  deleteUploadedImage,
  deleteSingleImage,
  deleteExistigImg,
  timeExpired,
  getDistanceFromLatLonInKm,
  createAdminToken,
};
