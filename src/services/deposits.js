const { Contract, Job, Profile, sequelize } = require("../model");
const HttpError = require("../errors/httpError");
const { ErrorMsgs } = require("../enums/error-messages.enum");
const { JOBS_TO_PAY_PERCENTAGE } = require("../utilities/constants");
const { ContractStatus } = require("../enums/contract-status.enum");

async function fetchTotalAmountForUnpaidJobs(clientId) {
  return Job.sum("price", {
    where: {
      paid: false,
    },
    include: [
      {
        model: Contract,
        attributes: [],
        where: {
          status: ContractStatus.IN_PROGRESS,
          ClientId: clientId,
        },
        required: true,
      },
    ],
  });
}

async function deposit(clientId, amount) {
  const result = await sequelize.transaction(async (t) => {
    const client = await Profile.findByPk(clientId, { transaction: t });

    if (!client || client.type !== "client") {
      throw new HttpError(404, ErrorMsgs.CLIENT_DOES_NOT_EXIST);
    }

    const unpaidTotal = await fetchTotalAmountForUnpaidJobs(clientId);
    const depositLimit = unpaidTotal * JOBS_TO_PAY_PERCENTAGE;

    if (amount >= depositLimit) {
      throw new HttpError(400, ErrorMsgs.DEPOSIT_EXCEEDS_LIMIT);
    }

    client.balance = Math.floor((client.balance + amount).toFixed(2));

    await client.save({ transaction: t });

    return client;
  });

  return result;
}

module.exports = {
  deposit,
};
