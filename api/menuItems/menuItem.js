const menuItemRouter = require('express').Router({ mergeParams: true });
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.put('/', (req, res, next) => {
  const updatedMenuItem = {
    ...req.body.menuItem
  };
  if (
    !updatedMenuItem.name
    || !updatedMenuItem.inventory
    || !updatedMenuItem.price
  ) {
    return res.sendStatus(400);
  }
  db.run(
    `UPDATE MenuItem SET
      name = $name,
      description = $description,
      inventory = $inventory,
      price = $price,
      menu_id = $menuId
    WHERE id = $menuItemId`,
    {
      $name: updatedMenuItem.name,
      $description: updatedMenuItem.description,
      $inventory: updatedMenuItem.inventory,
      $price: updatedMenuItem.price,
      $menuId: req.params.menuId,
      $menuItemId: req.params.menuItemId
    },
    (err) => {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM MenuItem
        WHERE id = $menuItemId`,
        {
          $menuItemId: req.params.menuItemId
        },
        (err, menuItem) => {
          if (err) {
            return next(err);
          }
          res.status(200).json({ menuItem: menuItem });
        }
      );
    });
});

menuItemRouter.delete('/', (req, res, next) => {
  db.run(
    `DELETE
    FROM MenuItem
    WHERE id = $menuItemId`,
    {
      $menuItemId: req.params.menuItemId
    },
    (err) => {
      if (err) {
        return next(err);
      }
      res.sendStatus(204);
    }
  );
});

module.exports = menuItemRouter;