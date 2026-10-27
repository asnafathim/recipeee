
import express from 'express';
import mongoose from 'mongoose';
import Recipe from '../models/Recipe.js';

const router = express.Router();

const allowedCategories = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert'
];

function validateRecipe(body) {
  const { recipeName, category, ingredients, preparationSteps, cookingTime } = body;

  if (
    typeof recipeName !== 'string' || !recipeName.trim() ||
    typeof category !== 'string' || !allowedCategories.includes(category) ||
    typeof ingredients !== 'string' || !ingredients.trim() ||
    typeof preparationSteps !== 'string' || !preparationSteps.trim() ||
    cookingTime === '' || cookingTime === null ||
    cookingTime === undefined ||
    !Number.isFinite(Number(cookingTime)) ||
    Number(cookingTime) <= 0
  ) {
    return 'Please provide valid values for all recipe fields.';
  }

  return null;
}

// GET all recipes
router.get('/', async (_req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recipes.' });
  }
});

// GET one recipe by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid recipe ID.' });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recipe.' });
  }
});

// POST a new recipe
router.post('/', async (req, res) => {
  const validationError = validateRecipe(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const recipe = await Recipe.create({
      recipeName: req.body.recipeName.trim(),
      category: req.body.category,
      ingredients: req.body.ingredients.trim(),
      preparationSteps: req.body.preparationSteps.trim(),
      cookingTime: Number(req.body.cookingTime)
    });

    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create recipe.' });
  }
});

// PUT to update a recipe
router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid recipe ID.' });
  }

  const validationError = validateRecipe(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        recipeName: req.body.recipeName.trim(),
        category: req.body.category,
        ingredients: req.body.ingredients.trim(),
        preparationSteps: req.body.preparationSteps.trim(),
        cookingTime: Number(req.body.cookingTime)
      },
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update recipe.' });
  }
});

// DELETE a recipe
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid recipe ID.' });
  }

  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    res.status(200).json({ message: 'Recipe deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete recipe.' });
  }
});

export default router;
