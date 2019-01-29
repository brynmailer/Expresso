const employeeRouter = require('express').Router({ mergeParams: true });
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.get('/', (req, res, next) => {
  res.status(200).json({ employee: req.employee });
});

employeeRouter.put('/', (req, res, next) => {
  db.run(
    `UPDATE Employee SET
      name = $name,
      position = $position,
      wage = $wage,
      is_current_employee = $isCurrentEmployee
    WHERE id = $employeeId`,
    {
      $name: req.newEmployee.name,
      $position: req.newEmployee.position,
      $wage: req.newEmployee.wage,
      $isCurrentEmployee: req.newEmployee.isCurrentEmployee,
      $employeeId: req.newEmployee.id
    },
    (err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ employee: req.employee });
    });
});

module.exports = employeeRouter;