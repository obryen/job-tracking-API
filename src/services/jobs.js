const { Op } = require("sequelize");
const { Contract, Job, Profile, sequelize } = require("../model");
const HttpError = require("../errors/httpError");
const { ErrorMsgs } = require("../enums/error-messages.enum");
const { ContractStatus } = require("../enums/contract-status.enum");

async function fetchUnpaidJobs(userId) {
  return Job.findAll({
    where: {
      paid: false,
    },
    include: [
      {
        model: Contract,
        required: true,
        attributes: [],
        where: {
          [Op.or]: [
            {
              ClientId: userId,
            },
            {
              ContractorId: userId,
            },
          ],
          status: ContractStatus.IN_PROGRESS,
        },
      },
    ],
  });
}

async function payJob(jobId, clientId) {
  const result = await sequelize.transaction(async (t) => {
    const job = await Job.findOne(
      {
        where: {
          id: jobId,
        },
        include: [
          {
            model: Contract,
            required: true,
            attributes: ["ContractorId"],
            where: {
              ClientId: clientId,
            },
          },
        ],
      },
      { transaction: t }
    );

    if (!job) throw new HttpError(404, ErrorMsgs.JOB_NOT_FOUND);
    if (job.paid) throw new HttpError(409, ErrorMsgs.JOB_PAID);

    const [client, contractor] = await Promise.all([
      Profile.findByPk(clientId, { transaction: t }),
      Profile.findByPk(job.Contract.ContractorId, {
        transaction: t,
      }),
    ]);

    if (client.balance < job.price)
      throw new HttpError(400, ErrorMsgs.INSUFFICIENT_FUNDS);

    client.balance = client.balance - job.price;
    contractor.balance = contractor.balance + job.price;
    job.paid = true;
    job.paymentDate = new Date().toISOString();

    await Promise.all([
      client.save({ transaction: t }),
      contractor.save({ transaction: t }),
      job.save({ transaction: t }),
    ]);

    return job;
  });

  return result;
}

module.exports = {
  fetchUnpaidJobs,
  payJob,
};
