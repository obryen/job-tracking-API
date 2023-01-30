const { JOBS_TO_PAY_PERCENTAGE } = require("../utilities/constants");

const ErrorMsgs = {
  JOB_PAID: "Job is already paid",
  JOB_NOT_FOUND: "This job does not exist",
  INSUFFICIENT_FUNDS: "Insufficient funds",
  CLIENT_DOES_NOT_EXIST: "This client does not exist",
  DEPOSIT_EXCEEDS_LIMIT: `You can only deposit up to ${
    JOBS_TO_PAY_PERCENTAGE * 100
  }% of your unpaid jobs total`,
};

module.exports = {
  ErrorMsgs,
};
