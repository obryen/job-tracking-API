const {
  fetchUserContractsNotTerminated,
  fetchUserContractById,
} = require("../services/contracts");
const { getProfile } = require("../middleware/getProfile");
const { fetchUnpaidJobs, payJob } = require("../services/jobs");
const { deposit } = require("../services/deposits");
const { fetchBestPaidProfession, fetchBestPayingClients } = require("../services/analytics");

router.get(
  "/contracts/:id",
  getProfile,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.profile.id;

    const contract = await fetchUserContractById(id, userId);

    if (!contract) {
      return res.status(404).end();
    }

    res.json(contract);
  })
);

router.get(
  "/contracts",
  getProfile,
  asyncHandler(async (req, res) => {
    const userId = req.profile.id;
    const contracts = await fetchUserContractsNotTerminated(userId);

    res.json(contracts);
  })
);

router.get(
  "/jobs/unpaid",
  getProfile,
  asyncHandler(async (req, res) => {
    const userId = req.profile.id;
    const jobs = await fetchUnpaidJobs(userId);

    res.json(jobs);
  })
);

router.post(
  "/jobs/:id/pay",
  getProfile,
  asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    const clientId = req.profile.id;
    const paidJob = await payJob(jobId, clientId);

    res.json(paidJob);
  })
);

router.post(
  "/balances/deposit/:userId",
  asyncHandler(async (req, res) => {
    const clientId = req.params.userId;
    const { amount } = req.body;
    const updatedClienstProfile = await deposit(clientId, amount);

    res.json(updatedClienstProfile);
  })
);

router.get(
  "/admin/best-profession",
  asyncHandler(async (req, res) => {
    const { start, end } = req.query;
    const bestPaidProfession = await fetchBestPaidProfession(start, end);

    res.json(bestPaidProfession);
  })
);

router.get(
  "/admin/best-clients",
  asyncHandler(async (req, res) => {
    const { start, end, limit } = req.query;
    const bestPayingClients = await fetchBestPayingClients(start, end, limit);

    res.json(bestPayingClients);
  })
);

module.exports = router;
