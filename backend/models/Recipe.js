
import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  recipeName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']
  },
  ingredients: {
    type: String,
    required: true,
    trim: true
  },
  preparationSteps: {
    type: String,
    required: true,
    trim: true
  },
  cookingTime: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
