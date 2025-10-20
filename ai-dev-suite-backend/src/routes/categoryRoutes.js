const express = require('express');
const categoriesController = require('../controllers/categoriesController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { categorySchema, updateCategorySchema } = require('../validators/categoryValidator');

const router = express.Router();

router.get('/', categoriesController.listCategories);
router.get('/:id', categoriesController.getCategory);
router.post('/', validationMiddleware(categorySchema), categoriesController.createCategory);
router.put('/:id', validationMiddleware(updateCategorySchema), categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;