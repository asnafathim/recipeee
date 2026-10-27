
import React, { useEffect, useState } from 'react';
import './style.css';

const API = 'http://localhost:5000/api/recipes';

const emptyForm = {
  recipeName: '',
  category: 'Breakfast',
  ingredients: '',
  preparationSteps: '',
  cookingTime: ''
};

function App() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadRecipes() {
    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error('Could not load recipes.');
      }

      const data = await response.json();
      setRecipes(data);
      setError('');
    } catch {
      setError('Cannot connect to the backend. Check that it is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (
      !form.recipeName.trim() ||
      !form.category ||
      !form.ingredients.trim() ||
      !form.preparationSteps.trim() ||
      form.cookingTime === '' ||
      !Number.isFinite(Number(form.cookingTime)) ||
      Number(form.cookingTime) <= 0
    ) {
      setError('Please fill in every field. Cooking time must be greater than zero.');
      return;
    }

    setSaving(true);

    try {
      const url = editingId ? `${API}/${editingId}` : API;
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          recipeName: form.recipeName.trim(),
          ingredients: form.ingredients.trim(),
          preparationSteps: form.preparationSteps.trim(),
          cookingTime: Number(form.cookingTime)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save recipe.');
      }

      setMessage(editingId ? 'Recipe updated successfully!' : 'Recipe added successfully!');
      resetForm();
      await loadRecipes();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  function startEditing(recipe) {
    setEditingId(recipe._id);
    setForm({
      recipeName: recipe.recipeName,
      category: recipe.category,
      ingredients: recipe.ingredients,
      preparationSteps: recipe.preparationSteps,
      cookingTime: String(recipe.cookingTime)
    });
    setSelectedRecipe(null);
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteRecipe(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this recipe?'
    );

    if (!confirmed) return;

    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete recipe.');
      }

      setSelectedRecipe(null);
      setMessage('Recipe deleted successfully!');
      await loadRecipes();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <p className="eyebrow">YOUR PERSONAL COLLECTION</p>
          <h1>My Recipe Book</h1>
          <p className="hero-description">
            Keep your favourite recipes in one place.
          </p>
        </div>
      </header>

      <main className="container">
        <section className="form-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">RECIPE MANAGER</p>
              <h2>{editingId ? 'Edit Recipe' : 'Add a Recipe'}</h2>
            </div>
            {editingId && (
              <button
                type="button"
                className="button button-light"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          {message && <div className="notice success">{message}</div>}
          {error && <div className="notice error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field full-width">
                Recipe Name
                <input
                  name="recipeName"
                  value={form.recipeName}
                  onChange={handleChange}
                  placeholder="Enter recipe name"
                  required
                />
              </label>

              <label className="field">
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                  <option>Dessert</option>
                </select>
              </label>

              <label className="field">
                Cooking Time (minutes)
                <input
                  type="number"
                  name="cookingTime"
                  value={form.cookingTime}
                  onChange={handleChange}
                  placeholder="e.g. 30"
                  min="1"
                  step="1"
                  required
                />
              </label>

              <label className="field full-width">
                Ingredients
                <textarea
                  name="ingredients"
                  value={form.ingredients}
                  onChange={handleChange}
                  placeholder="Enter ingredients"
                  rows="3"
                  required
                />
              </label>

              <label className="field full-width">
                Preparation Steps
                <textarea
                  name="preparationSteps"
                  value={form.preparationSteps}
                  onChange={handleChange}
                  placeholder="Enter preparation steps"
                  rows="4"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              className="button button-primary submit-button"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Recipe'
                  : 'Add Recipe'}
            </button>
          </form>
        </section>

        <section className="recipes-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR COLLECTION</p>
              <h2>Saved Recipes</h2>
            </div>
            <span className="recipe-count">{recipes.length} recipes</span>
          </div>

          {loading ? (
            <p className="empty-state">Loading recipes...</p>
          ) : recipes.length === 0 ? (
            <p className="empty-state">
              No recipes yet. Add your first recipe using the form above.
            </p>
          ) : (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <article className="recipe-card" key={recipe._id}>
                  <div className="card-top">
                    <span className="category-tag">{recipe.category}</span>
                    <span className="cooking-time">
                      {recipe.cookingTime} min
                    </span>
                  </div>

                  <h3>{recipe.recipeName}</h3>

                  <button
                    type="button"
                    className="details-link"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    View Details →
                  </button>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="button button-light"
                      onClick={() => startEditing(recipe)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => deleteRecipe(recipe._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedRecipe && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedRecipe(null)}
        >
          <section
            className="details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="close-button"
              aria-label="Close recipe details"
              onClick={() => setSelectedRecipe(null)}
            >
              ×
            </button>

            <span className="category-tag">{selectedRecipe.category}</span>
            <h2 id="details-title">{selectedRecipe.recipeName}</h2>
            <p className="modal-time">
              Cooking time: {selectedRecipe.cookingTime} minutes
            </p>

            <h3>Ingredients</h3>
            <p className="detail-text">{selectedRecipe.ingredients}</p>

            <h3>Preparation Steps</h3>
            <p className="detail-text">{selectedRecipe.preparationSteps}</p>

            <div className="card-actions modal-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => startEditing(selectedRecipe)}
              >
                Edit Recipe
              </button>
              <button
                type="button"
                className="button button-light"
                onClick={() => setSelectedRecipe(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="footer">
        <p>My Recipe Book</p>
      </footer>
    </div>
  );
}

export default App;
