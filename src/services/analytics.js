const { Op } = require("sequelize");
const { Contract, Job, Profile, sequelize } = require("../model");

async function fetchBestPaidProfession(startDate, endDate) {
  const jobs = await Job.findAll({
    attributes: [[sequelize.fn("sum", sequelize.col("price")), "totalPaid"]],
    order: [[sequelize.fn("sum", sequelize.col("price")), "DESC"]],
    group: ["Contract.Contractor.profession"],
    limit: 1,
    where: {
      paid: true,
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [
      {
        model: Contract,
        attributes: ["createdAt"],
        include: [
          {
            model: Profile,
            as: "Contractor",
            where: { type: "contractor" },
            attributes: ["profession"],
          },
        ],
      },
    ],
  });

  if (!jobs || !jobs.length) return null;

  const result = jobs[0].get({ plain: true });

  return {
    profession: result.Contract.Contractor.profession,
    totalPaid: result.totalPaid,
  };
}

async function fetchBestPayingClients(startDate, endDate, limit = 2) {
  const jobs = await Job.findAll({
    attributes: [[sequelize.fn("sum", sequelize.col("price")), "paid"]],
    order: [[sequelize.fn("sum", sequelize.col("price")), "DESC"]],
    group: ["Contract.Client.id"],
    limit,
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [
      {
        model: Contract,
        attributes: ["id"],
        include: [
          {
            model: Profile,
            as: "Client",
            where: { type: "client" },
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      },
    ],
  });

  const bestPayingClients = jobs.map((job) => ({
    id: job.Contract.Client.id,
    name: `${job.Contract.Client.firstName} ${job.Contract.Client.lastName}`,
    totalPaid: job.paid,
  }));

  return bestPayingClients;
}

module.exports = {
  fetchBestPaidProfession,
  fetchBestPayingClients,
};
