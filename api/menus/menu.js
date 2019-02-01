const menuRouter = require('express').Router({ mergeParams: true });
const menuItemsRouter = require('../menuItems/menuItems');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.use('/menu-items', menuItemsRouter);

menuRouter.get('/', (req, res, next) => {
  res.status(200).json({ menu: req.menu });
});

menuRouter.put('/', (req, res, next) => {
  const updatedMenu = {
    ...req.body.menu
  };
  if (
    !updatedMenu.title
  ) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE Menu SET
      title = $title
    WHERE id = $menuId`,
    {
      $title: updatedMenu.title,
      $menuId: req.params.menuId
    },
    (err) => {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Menu
        WHERE id = $menuId`,
        {
          $menuId: req.params.menuId
        },
        (err, menu) => {
          if (err) {
            return next(err);
          }
          res.status(200).json({ menu: menu });
        }
      );
    });
});

menuRouter.delete('/', (req, res, next) => {
  db.all(
    `SELECT *
    FROM MenuItem
    WHERE menu_id = $menuId`,
    {
      $menuId: req.params.menuId
    },
    (err, menuItems) => {
      if (err) {
        return next(err);
      }
      if (menuItems.length > 0) {
        return res.sendStatus(400);
      }
      db.run(
        `DELETE
        FROM Menu
        WHERE id = $menuId`,
        {
          $menuId: req.params.menuId
        },
        (err) => {
          if (err) {
            return next(err);
          }
          res.sendStatus(204);
        }
      );
    }
  );
});

module.exports = menuRouter;