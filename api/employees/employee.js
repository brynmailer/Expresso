const employeeRouter = require('express').Router({ mergeParams: true });
const timesheetsRouter = require('../timesheets/timesheets');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.use('/timesheets', timesheetsRouter);

employeeRouter.get('/', (req, res, next) => {
  res.status(200).json({ employee: req.employee });
});

employeeRouter.put('/', (req, res, next) => {
  const updatedEmployee = {
    ...req.body.employee,
    isCurrentEmployee: req.body.employee.isCurrentEmployee === 0 ? 0 : 1
  };
  if (
    !updatedEmployee.name
    || !updatedEmployee.position
    || !updatedEmployee.wage
  ) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE Employee SET
      name = $name,
      position = $position,
      wage = $wage,
      is_current_employee = $isCurrentEmployee
    WHERE id = $employeeId`,
    {
      $name: updatedEmployee.name,
      $position: updatedEmployee.position,
      $wage: updatedEmployee.wage,
      $isCurrentEmployee: updatedEmployee.isCurrentEmployee,
      $employeeId: req.params.employeeId
    },
    (err) => {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Employee
        WHERE id = $employeeId`,
        {
          $employeeId: req.params.employeeId
        },
        (err, employee) => {
          if (err) {
            return next(err);
          }
          res.status(200).json({ employee: employee });
        }
      );
    });
});

employeeRouter.delete('/', (req, res, next) => {
  db.run(
    `UPDATE Employee SET
      is_current_employee = 0
    WHERE id = $employeeId`,
    {
      $employeeId: req.params.employeeId
    },
    (err) => {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Employee
        WHERE id = $employeeId`,
        {
          $employeeId: req.params.employeeId
        },
        (err, employee) => {
          if (err) {
            return next(err);
          }
          res.status(200).json({ employee: employee });
        }
      );
    }
  );
});

module.exports = employeeRouter;