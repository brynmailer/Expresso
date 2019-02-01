const timesheetsRouter = require('express').Router({ mergeParams: true });
const timesheetRouter = require('./timesheet');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get(
    `SELECT *
    FROM Timesheet
    WHERE id = $timesheetId`,
    {
      $timesheetId: timesheetId
    },
    (err, timesheet) => {
      if (err) {
        return next(err);
      }
      if (!timesheet) {
        return res.sendStatus(404);
      }
      req.timesheet = timesheet;
      next();
    }
  );
});

timesheetsRouter.use('/:timesheetId', timesheetRouter);

timesheetsRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT *
    FROM Timesheet
    WHERE employee_id = $employeeId`,
    {
      $employeeId: req.params.employeeId
    },
    (err, timesheets) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ timesheets: timesheets });
    }
  );
});

timesheetsRouter.post('/', (req, res, next) => {
  const newTimesheet = {
    ...req.body.timesheet
  };
  if (
    !newTimesheet.hours
    || !newTimesheet.rate
    || !newTimesheet.date
  ) {
    return res.sendStatus(400);
  }
  db.run(
    `INSERT INTO Timesheet (
      hours,
      rate,
      date,
      employee_id
    ) VALUES (
      $hours,
      $rate,
      $date,
      $employeeId
    )`,
    {
      $hours: newTimesheet.hours,
      $rate: newTimesheet.rate,
      $date: newTimesheet.date,
      $employeeId: req.params.employeeId
    },
    function(err) {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Timesheet
        WHERE id = $timesheetId`,
        {
          $timesheetId: this.lastID
        },
        (err, timesheet) => {
          if (err) {
            return next(err);
          }
          res.status(201).json({ timesheet: timesheet });
        }
      );
    }
  );
});

module.exports = timesheetsRouter;