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
      // sign token code goes here
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
      // sign token code goes here
      
    },
    getEnv("ADMIN_JWT_SECRET"),
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
  //  del image from local destination code goes here
  } catch (error) {
    console.log(error);
  }
};



module.exports = {
  getError,
  getSuccessData,
  clean,
  createToken,
  deleteUploadedImage,
  timeExpired,
  createAdminToken,
};
