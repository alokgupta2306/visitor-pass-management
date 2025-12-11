import CheckLog from '../models/checkLogModel.js';
import Visitor from '../models/visitorModel.js';
import Pass from '../models/passModel.js';

export const logCheck = async (req, res, next) => {
  try {
    const { visitorId, passId, action, location } = req.body;
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });

    const pass = passId ? await Pass.findById(passId) : null;
    if (passId && !pass) return res.status(404).json({ message: 'Pass not found' });

    const entry = await CheckLog.create({
      visitor: visitorId,
      pass: passId,
      action,
      location,
      timestamp: new Date(),
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

export const listLogs = async (_req, res, next) => {
  try {
    const logs = await CheckLog.find().populate('visitor').sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};


