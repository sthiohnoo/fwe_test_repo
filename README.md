# FWE WS24/25 Homework-Project: ShoppingList Web Application

![ShoppingListPage](./docs/img/frontend/pages/shoppingListPageLightAndDark.png)

## Table of Contents

1. [Installation / Getting started](#installation--getting-started)
2. [Application Functionalities](#application-functionalities)
3. [Routes](#routes)
4. [Tests](#tests)

---

---

## Installation / Getting started

### Prerequisites

Ensure the following software components are installed on your PC:

- [ ] Node.js (JavaScript runtime environment)
- [ ] npm (Node Package Manager)
- [ ] Git
- [ ] Docker and Docker Compose

1. Install __Node.js__ and __npm__

   Visit the [Node.js website](https://nodejs.org/).
   Download the recommended version for your platform (LTS version is recommended).
   Follow the installation instructions for your operating system.
   Verify the installation:

    ```bash
    node -v
    npm -v
    ```

2. Install __Git__

   Visit the [Git website](https://git-scm.com/).
   Download the recommended version for your platform.
   Follow the installation instructions for your operating system.
   Verify the installation:

    ```bash
    git --version
    ```

3. Install __Docker__ and __Docker Compose__

   Visit the [Docker website](https://www.docker.com/).
   Download the recommended version for your platform.
   Follow the installation instructions for your operating system.
   Verify the installation:

    ```bash
    docker --version
    docker-compose --version
    ```

### Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://code.fbi.h-da.de/sthiohnoo/fwe-ws-24-25-1120617.git
```

### Backend Setup

### Step 1: Navigate to the Backend Directory

```bash
cd fwe-ws-24-25-1120617/backend
```

### Step 2: Install Dependencies

Install the necessary dependencies using npm:

```bash
npm install
```

### Step 3: Set Up Environment Variables

To configure the application to use the database in Docker, follow these steps:

1. Create a `.env` file in the src directory and copy the `.env.example` file content into it.
2. Edit the `.env` file and replace the placeholders(user, password, database) with the actual values from
   `docker-compose.yml`

### Step 4: Set Up the Database

Set up the database using Docker Compose:

```bash
docker-compose up -d
```

### Step 5: Migrate the Database

Run the database migrations to create the necessary tables:

```bash
npm run db:migrate
```

### Step 6: Start the Backend

```bash
npm start
```

## Frontend Setup

### Step 1: Navigate to the frontend directory:

```bash
cd frontend
```

### Step 2: Install Dependencies

Install the necessary dependencies using npm:

```bash
npm install
```

### Step 3: Start the Frontend

```bash
npm run preview
```

### Step 4: Access the Application

Open a browser and navigate to `http://localhost:5173/` or click the link in the terminal.

---
___

## Application Functionalities

### Main Functionalities [➡️](#main-shoppinglist-page--item-page)

- [ ] __Manage Shopping Lists:__ Create, read, update, and delete shopping lists.
- [ ] __Manage Items:__ Create, read, update, and delete items.

### Additional Functionalities [➡️](#additional-functionalities)

- [ ] __Database Connection:__ Connects to a PostgreSQL database to store and retrieve data.
- [ ] __Health Check:__ Checks the status of the application.
- [ ] __Freestyle Task #1 / #2__

### A brief explanation about the codes in backend [➡️](#brief-explanation-backend-code)

---

### Main: ShoppingList Page & Item Page

This web application has two different pages, each responsible for managing the shopping lists and items, but also
offering other functionalities. Switching between these two pages is done by clicking on the button in the top right
corner of the navigation bar. Additionally, there is another button next to it with a moon (or sun) symbol to switch
between light and dark mode. When opening/reloading the pages, all existing shopping lists and items are displayed by
default.
![ShoppingListPage](./docs/img/frontend/pages/shoppingListPage.png)

Let us first take a look at the selection bar above the shopping list table. Starting from the left, we have a button
for creating new shopping lists. Next, there are two input fields for searching specific shopping lists. The three icons
on the right edge are used for executing freestyle tasks and will be described in more detail in the corresponding
[section](#freestyle-task-1).
![Toolbar](./docs/img/frontend/pages/shoppingListPageToolbar.png)

<div style="display: flex; align-items: center;">
    <img src="./docs/img/frontend/modals/createShoppingListModal.png" alt="createShoppingListModal" width="350" height="300" style="margin-right: 10px;">
    <span>When creating a shopping list, a modal opens to allow detailed information about the shopping list to be entered. This
includes the name, description, and the items to be added. Only the name is required for creation. Existing items can be
selected using the select box. Items that do not yet exist can also be added. These will automatically be created as new
items once the shopping list is saved. The status and quantity of all items added in this way are set to false and 1 by default.

The first search field allows us to search for shopping lists based on their name or description. The linked select box
to the left of the input field enables switching between searching by name and description. The input field next to it
is used to search for shopping lists containing specific items. All shopping lists that include the searched item will
be displayed.

> `note` Ideally, I would have designed the search functionality for the shopping list by item name in such a way that
> it
> allows
> searching with only part of the name. Currently, however, the full name must be entered; otherwise, an empty list is
> returned. _(Example: __ItemName:__ `Item 1`, __Input:__ `Item` &#8594; __Result:__ `Empty list`, __Input:__ `Item 1`
&#8594; __Result__: `Shopping lists with
Item 1`)_. This could be implemented by establishing the database query with "LIKE." However, this change to the
> existing
> code caused errors in other parts of the application, so I decided not to implement it. Implementing a completely new
> function for the search was not feasible due to time constraints and a lack of motivation. 😊</span>
</div>

Next, let's take a closer look at an entry in the ShoppingList table. Each entry contains the columns Name, Description,
Items, Created At, and Actions. In the Items column, all items contained in the ShoppingList are displayed. The item
name, item description, status (whether purchased or not), and the desired quantity are shown. The status and quantity
are displayed through a button, which provides a convenient way to change the status or edit the quantity.
![exampleShoppingList](./docs/img/frontend/pages/exampleShoppingList.png)

Here is a more detailed explanation of the individual icon buttons:
> `note` The icons used here in the README do not exactly match the ones in the application.

| IconButtons | Function                                                                                                                                                                                                                                                                                                                                                                                                                       |
|:------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ✔️ / ❌      | ✔️(true) and ❌(false) symbolize whether the item has already been purchased or not. By simply clicking, you can toggle the states.                                                                                                                                                                                                                                                                                             |
| 1️⃣         | The number inside the button represents the desired quantity of the item. By clicking, a modal opens where you can easily change the quantity.                                                                                                                                                                                                                                                                                 |
| 🗑️         | The trash can is used in two areas. Once next to each item in a shopping list and once in the actions of each individual shopping list. The functionality is very similar. On the one hand, it should delete the desired item from the shopping list, and on the other hand, you can delete an entire shopping list.                                                                                                           |
| ⭐           | The star is used to mark or unmark a shopping list as a favorite. As a feature of the freestyle task, it is explained in more detail in the corresponding [section](#freestyle-task-1).                                                                                                                                                                                                                                        |
| 📝          | The update symbol opens a modal where the name and description of the shopping list can be changed. <br/>  `note` Initially, the idea was to change not only the name and description but also the status and quantity of an item. This behavior was also implemented in the backend, but due to the complexity of the implementation in the frontend, the editing of item properties was separated into individual functions. |
| ➕           | The plus symbol is used to add new items to a shopping list. A modal opens, listing all existing items. An item can be selected, and the quantity and whether it has already been purchased can be specified. For quickly searching for a specific item, a search field is also available. The found item is automatically selected.                                                                                           |

![allModalsShoppingList](./docs/img/frontend/modals/allModalsForShoppingList.png)

---

Next, let's take a look at the item page. Since the basic structure is almost the same as the shopping list page, we
will only briefly go over individual elements. Just like on the shopping list page, there is a button at the top left to
open a modal to create new items. Within the modal, the user has the option to create one or more items simultaneously.
Next to the create button is a search field for searching for specific items by name. An item has a name and a
description. In the
actions column, there are the same icons for editing and deleting an item as on the shopping list page. One difference
from the shopping list is that an item cannot have the same name. This must be considered when creating and editing an
item. When deleting, it must also be ensured that the item is not contained in a shopping list. If the mentioned actions
are attempted, the user will be informed with an error message.
![ItemPage](./docs/img/frontend/pages/itemPage.png)

---

### Additional Functionalities

### Freestyle Task #1

You might have a list of purchases that you make regularly over a certain period. Perhaps you want to save ingredients
from recipes so you don't have to research them every time. This feature was developed exactly for that purpose. You can
now save shopping lists as favorites, so you can easily access important shopping lists at a later time without any
problems. There is a star icon ⭐ next to each shopping list in the actions-column. By clicking on it, you can mark a
shopping list as a favorite. The star icon changes its color to yellow to indicate that the shopping list is a favorite.
If you click on the star icon again, the shopping list is no longer marked as a favorite. The color turns back to black.
To display all shopping lists marked as favorites, there is another icon in the selection bar next to the search field.
If you want to display all existing shopping lists again, you can either click on the home icon or reload the page.

![FavoriteShoppingList](./docs/img/frontend/pages/showFavoriteShowAll.png)

### Freestyle Task #2

If you want to buy certain items, you might wonder if there are alternatives with better quality. For this purpose, a
feature has been developed to search for specific items (in this case, groceries) paired with the Nutri-Score. The user
is
provided with a list of similar groceries with the desired Nutri-Score through the search. The API from Open Food Facts
is
used to obtain external data.

In the top right corner of the selection bar of the shopping list page, there is a search icon 🔍 that you can click on

![Search Modal](./docs/img/frontend/searchOpenFood/searchModal.png)

When clicked, a modal opens where you can search for groceries by category tags and desired Nutri-Score. The search
returns a list of food items that match the criteria. Here in the example, `Orange Juice` with Nutri-Score `c`.

![Search Modal Result](./docs/img/frontend/searchOpenFood/searchModalwithResult.png)

> __Important Note__
>
>The website that provides this external API requires limiting the rate of API requests per minute to
> protect their infrastructure. To ensure this protection, a delay of 6 seconds between requests has been implemented
> using `Bottleneck`. However, this is not the best solution, as every request, regardless of whether previous requests
> have been made or not, must wait 6 seconds for a response. For the purposes of this project, however, this is
> sufficient
> for now.
[Documentation Open Api Facts](https://openfoodfacts.github.io/openfoodfacts-server/api/).

---

### Brief Explanation Backend Code

### Functionalities shoppingList.controller

- __getShoppingLists :__
  Method retrieves all shopping lists with its relations and returns them. If no shopping list is found, an empty array
  is returned.
- __getShoppingListsById :__
  Method retrieves a shopping list by its ID with its relation and returns it. If no shopping list is found, a 404 error
  is returned. If
  the ID is not in the correct format, a 400 error is returned.
- __getShoppingListsWithSearchingItemById :__
  Method retrieves shopping lists containing a specific item by its ID and returns them. If no shopping list is found, a
  404 error is returned. If the ID is not in the correct format, a 400 error is returned.
- __searchShoppingListsWithNameOrDescription :__
  Method retrieves shopping lists with a specific name or description and returns them. If no shopping list is found, a
  404 error is returned. If both name and description are empty, all shopping lists are returned.
- __createShoppingList :__
  Method creates a new shopping list and returns it. We need to specify a name, while the description is optional.
  Additionally, items can be added by ID or name. If the item does not already exist, it will be automatically created.
  If an item is added during the creation of the shopping list, its properties "quantity" and "isPurchased" will be set
  to default values.
- __updateShoppingListById :__
  Method updates a shopping list by its ID and returns it. The method can optionally change the name, description, and
  also the properties of the items. If the quantity of an item is to be changed, it is checked to ensure it is not less
  than 1. Errors such as "invalid ID format for both ShoppingList and Item", "non-existent Item/ShoppingList", "attempt
  to update ShoppingList without items", or "attempt to update ShoppingList that does not contain the item" are caught
  and the update process is aborted.
- __addItemsToShoppingListById :__
  Method adds item to a shopping list by its ID and returns it. When adding, the quantity of the item (>1) can be
  specified and optionally the status "isPurchased" can be set. Errors such as "invalid ID format for both ShoppingList
  and Item", "non-existent Item/ShoppingList", or "Item already exists in the ShoppingList" are caught and the process
  is aborted.
- __deleteItemInListById :__
  Method deletes an item from a shopping list by its ID and returns 204 with No Content.
  If the shopping list has no items, or if the shopping list does not contain the item to be deleted, this is caught and
  an error is returned. Errors such as invalid ID formats are also caught.
- __deleteShoppingListById :__
  This method deletes a shopping list by its ID and returns 204 with No Content. Errors such as "invalid ID format" or "
  non-existent shopping list" are caught and an error is returned. If the shopping list had items, the corresponding
  entry in the relation table is also deleted.
- __getFavoriteShoppingLists :__
  Method retrieves all favorite shopping lists and returns them. If no favorite shopping list is found, an empty array
  is
  returned.
- __updateFavoriteStatus :__
  The method updates the favorite status of a shopping list by its ID and returns it. Shopping lists can either be
  marked as favorites or unfavorited. Errors such as "invalid ID format," "non-existent shopping list," or "non-boolean
  inputs" are handled, and the process is aborted. The "isFavorite" status is initially set to "false" when creating a
  shopping list.

### Functionalities item.controller

- __getItems :__
  Method retrieves all items and returns them. If no item is found, an empty array is returned.
- __getItemsById :__
  Method retrieves an item by its ID and returns it. If no item is found, a 404 error is returned. If the ID is not in
  the correct format, a 400 error is returned.
- __getItemsByName :__
  Method retrieves items with a specific name and returns them. If no item is found, a 404 error is returned.
- __createItem :__
  Method creates a new item and returns it. We need to specify a name with a minimum length of one character, but the
  description is optional. If you try to create an item that already exists, you will receive a 409 error.
- __updateItemById :__
  Method updates an item by its ID and returns it. The method can optionally change the name and the description.
  Errors such as "invalid ID format", "non-existent Item" or "Item with same name exists" are caught and the update
  process is aborted.
- __deleteItemById :__
  Method deletes an item by its ID and returns 204 with No Content. If the item is not found, a 404 error is returned.
  If the ID is not in the correct format, a 400 error is returned. If the item to be deleted is used in a shopping list,
  you will receive a 409 error.

## Routes

## Tests