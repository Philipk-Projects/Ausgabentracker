const form = document.querySelector('#expense-form');
const list = document.querySelector('#expense-list');
const total = document.querySelector('#total');
const incomeTotal = document.querySelector('#income-total');
const availableTotal = document.querySelector('#available-total');
const emptyState = document.querySelector('#empty-state');
const clearAll = document.querySelector('#clear-all');
const planForm = document.querySelector('#plan-form');
const incomeInput = document.querySelector('#income');
const savingsGoalInput = document.querySelector('#savings-goal');
const planResult = document.querySelector('#plan-result');
const shoppingBudgetForm = document.querySelector('#shopping-budget-form');
const shoppingBudgetInput = document.querySelector('#shopping-budget');
const shoppingForm = document.querySelector('#shopping-form');
const shoppingDescription = document.querySelector('#shopping-description');
const shoppingAmount = document.querySelector('#shopping-amount');
const shoppingTotal = document.querySelector('#shopping-total');
const shoppingRemaining = document.querySelector('#shopping-remaining');
const shoppingList = document.querySelector('#shopping-list');
const shoppingEmptyState = document.querySelector('#shopping-empty-state');
const resetShopping = document.querySelector('#reset-shopping');
const trackerSwitch = document.querySelector('#tracker-switch');
const startDialog = document.querySelector('#start-dialog');
const views = document.querySelectorAll('[data-view]');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let plan = JSON.parse(localStorage.getItem('monthlyPlan')) || { income: 0, savingsGoal: 0 };
let shopping = JSON.parse(localStorage.getItem('shoppingPlan')) || { budget: 0, items: [] };
let activeTracker = localStorage.getItem('activeTracker') || 'expenses';
const formatCurrency = (amount) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

function setActiveTracker(tracker) {
  activeTracker = tracker;
  views.forEach((view) => {
    view.hidden = view.dataset.view !== tracker;
  });
  trackerSwitch.value = tracker;
  localStorage.setItem('activeTracker', tracker);
}

function renderPlan(expenseSum) {
  const budget = Math.max(plan.income - plan.savingsGoal, 0);
  const available = budget - expenseSum;
  incomeInput.value = plan.income || '';
  savingsGoalInput.value = plan.savingsGoal || '';
  incomeTotal.textContent = formatCurrency(plan.income);
  availableTotal.textContent = formatCurrency(available);

  if (!plan.income) {
    planResult.textContent = 'Trage deinen monatlichen Lohn ein, um dein verfügbares Budget zu sehen.';
  } else if (available < 0) {
    planResult.textContent = `Du bist ${formatCurrency(Math.abs(available))} über deinem geplanten Budget.`;
  } else {
    planResult.textContent = `Für Ausgaben eingeplant: ${formatCurrency(budget)} · Davon noch frei: ${formatCurrency(available)}`;
  }
}

function saveAndRender() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  list.innerHTML = '';
  let sum = 0;

  expenses.forEach((expense) => {
    sum += expense.amount;
    const item = document.createElement('li');
    item.innerHTML = `<div><span class="item-description"></span><span class="item-category"></span></div><span class="item-amount"></span><button class="delete" type="button" aria-label="Ausgabe löschen">Löschen</button>`;
    item.querySelector('.item-description').textContent = expense.description;
    item.querySelector('.item-category').textContent = expense.category;
    item.querySelector('.item-amount').textContent = formatCurrency(expense.amount);
    item.querySelector('.delete').addEventListener('click', () => {
      expenses = expenses.filter((entry) => entry.id !== expense.id);
      saveAndRender();
    });
    list.append(item);
  });

  total.textContent = formatCurrency(sum);
  emptyState.hidden = expenses.length > 0;
  clearAll.hidden = expenses.length === 0;
  renderPlan(sum);
}

function saveAndRenderShopping() {
  localStorage.setItem('shoppingPlan', JSON.stringify(shopping));
  shoppingList.innerHTML = '';
  const sum = shopping.items.reduce((totalAmount, item) => totalAmount + item.amount, 0);
  const hasBudget = shopping.budget > 0;
  const remaining = shopping.budget - sum;

  shoppingBudgetInput.value = shopping.budget || '';
  shoppingTotal.textContent = formatCurrency(sum);
  shoppingRemaining.textContent = hasBudget ? formatCurrency(remaining) : 'Kein Ziel gesetzt';
  shoppingRemaining.classList.toggle('over-budget', hasBudget && remaining < 0);

  shopping.items.forEach((item) => {
    const entry = document.createElement('li');
    entry.innerHTML = `<div><span class="item-description"></span></div><span class="item-amount"></span><button class="delete" type="button" aria-label="Artikel löschen">Löschen</button>`;
    entry.querySelector('.item-description').textContent = item.description;
    entry.querySelector('.item-amount').textContent = formatCurrency(item.amount);
    entry.querySelector('.delete').addEventListener('click', () => {
      shopping.items = shopping.items.filter((savedItem) => savedItem.id !== item.id);
      saveAndRenderShopping();
    });
    shoppingList.append(entry);
  });

  shoppingEmptyState.hidden = shopping.items.length > 0;
  resetShopping.hidden = shopping.items.length === 0 && !shopping.budget;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const description = document.querySelector('#description');
  const amount = document.querySelector('#amount');
  expenses.unshift({
    id: crypto.randomUUID(),
    description: description.value.trim(),
    amount: Number(amount.value),
    category: document.querySelector('#category').value,
  });
  form.reset();
  description.focus();
  saveAndRender();
});

clearAll.addEventListener('click', () => {
  if (confirm('Möchtest du wirklich alle Ausgaben löschen?')) {
    expenses = [];
    saveAndRender();
  }
});

planForm.addEventListener('submit', (event) => {
  event.preventDefault();
  plan = {
    income: Number(incomeInput.value) || 0,
    savingsGoal: Number(savingsGoalInput.value) || 0,
  };
  localStorage.setItem('monthlyPlan', JSON.stringify(plan));
  saveAndRender();
});

shoppingBudgetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  shopping.budget = Number(shoppingBudgetInput.value) || 0;
  saveAndRenderShopping();
});

shoppingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  shopping.items.unshift({
    id: crypto.randomUUID(),
    description: shoppingDescription.value.trim() || '...',
    amount: Number(shoppingAmount.value) || 0,
  });
  shoppingForm.reset();
  shoppingDescription.focus();
  saveAndRenderShopping();
});

resetShopping.addEventListener('click', () => {
  if (confirm('Möchtest du diesen Einkauf wirklich zurücksetzen?')) {
    shopping = { budget: 0, items: [] };
    saveAndRenderShopping();
  }
});

trackerSwitch.addEventListener('change', () => setActiveTracker(trackerSwitch.value));

document.querySelectorAll('[data-tracker-choice]').forEach((choice) => {
  choice.addEventListener('click', () => {
    setActiveTracker(choice.dataset.trackerChoice);
    startDialog.close();
  });
});

saveAndRender();
saveAndRenderShopping();
setActiveTracker(activeTracker);

if (typeof startDialog.showModal === 'function') {
  startDialog.showModal();
}
