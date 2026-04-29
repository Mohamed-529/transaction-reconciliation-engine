const Run = require("../models/reconciliationRun.model");

// 🔥 FULL REPORT
exports.getReport = async (req, res) => {
  try {
    const { runId } = req.params;

    const run = await Run.findOne({ runId });

    if (!run) {
      return res.status(404).json({
        error: "Run not found"
      });
    }

    return res.json({
      runId,
      summary: run.summary,
      results: run.results
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};

// 🔥 SUMMARY ONLY
exports.getSummary = async (req, res) => {
  try {
    const { runId } = req.params;

    const run = await Run.findOne({ runId });

    if (!run) {
      return res.status(404).json({
        error: "Run not found"
      });
    }

    return res.json(run.summary);

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};

// 🔥 UNMATCHED ONLY
exports.getUnmatched = async (req, res) => {
  try {
    const { runId } = req.params;

    const run = await Run.findOne({ runId });

    if (!run) {
      return res.status(404).json({
        error: "Run not found"
      });
    }

    const unmatched = run.results.filter(r =>
      r.status.includes("unmatched")
    );

    return res.json({
      runId,
      count: unmatched.length,
      data: unmatched
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};