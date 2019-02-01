const timesheetRouter = require('express').Router({ mergeParams: true });
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.put('/', (req, res, next) => {
  const updatedTimesheet = {
    ...req.body.timesheet
  };
  if (
    !updatedTimesheet.hours
    || !updatedTimesheet.rate
    || !updatedTimesheet.date
  ) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE Timesheet SET
      hours = $hours,
      rate = $rate,
      date = $date,
      employee_id = $employeeId
    WHERE id = $timesheetId`,
    {
      $hours: updatedTimesheet.hours,
      $rate: updatedTimesheet.rate,
      $date: updatedTimesheet.date,
      $employeeId: req.params.employeeId,
      $timesheetId: req.params.timesheetId
    },
    (err) => {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Timesheet
        WHERE id = $timesheetId`,
        {
          $timesheetId: req.params.timesheetId
        },
        (err, timesheet) => {
          if (err) {
            return next(err);
          }
          res.status(200).json({ timesheet: timesheet });
        }
      );
    });
});

timesheetRouter.delete('/', (req, res, next) => {
  db.run(
    `DELETE
    FROM Timesheet
    WHERE id = $timesheetId`,
    {
      $timesheetId: req.params.timesheetId
    },
    (err) => {
      if (err) {
        return next(err);
      }
      res.sendStatus(204);
    }
  );
});

module.exports = timesheetRouter;