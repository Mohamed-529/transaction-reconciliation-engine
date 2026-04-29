const router = require("express").Router();

const reconciliation = require("../controllers/reconciliation.controller");
const report = require("../controllers/report.controller");

// run
router.post("/reconcile", reconciliation.reconcile);

// reports
router.get("/report/:runId", report.getReport);
router.get("/report/:runId/summary", report.getSummary);
router.get("/report/:runId/unmatched", report.getUnmatched);

module.exports = router;