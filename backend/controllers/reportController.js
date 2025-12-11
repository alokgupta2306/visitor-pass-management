import Visitor from '../models/visitorModel.js';
import Appointment from '../models/appointmentModel.js';
import Pass from '../models/passModel.js';
import CheckLog from '../models/checkLogModel.js';

export const getSummary = async (_req, res, next) => {
  try {
    const [visitorCount, appointmentCount, passCount, lastLogs] = await Promise.all([
      Visitor.countDocuments(),
      Appointment.countDocuments(),
      Pass.countDocuments(),
      CheckLog.find().sort({ timestamp: -1 }).limit(5),
    ]);

    res.json({
      visitors: visitorCount,
      appointments: appointmentCount,
      passes: passCount,
      recentLogs: lastLogs,
    });
  } catch (err) {
    next(err);
  }
};


