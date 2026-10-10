const button = document.querySelector("#load-products");
const message = document.querySelector("#message");
const productContainer = document.querySelector("#products");

button.addEventListener("click", loadProducts);

async function loadProducts() {
  button.disabled = true;
  message.textContent = "Loading...";
  productContainer.replaceChildren();

  try {
    const response = await fetch("https://fakestoreapi.com/products");

    if (!response.ok) {
      throw new Error("Could not load the products.");
    }

    // response.json() parses the JSON response into a JavaScript array.
    const products = await response.json();

    const cards = products.map((product) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.title;

      const title = document.createElement("h2");
      title.textContent = product.title;

      const description = document.createElement("p");
      description.textContent = product.description;

      const price = document.createElement("p");
      price.className = "price";
      price.textContent = `$${product.price}`;

      card.append(image, title, description, price);
      return card;
    });

    productContainer.replaceChildren(...cards);
    message.textContent = `${products.length} products loaded.`;
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}
