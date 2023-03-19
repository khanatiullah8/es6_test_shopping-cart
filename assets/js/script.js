const cartForm = document.form;
const inputSearch = cartForm.search;
const inputQuantity = cartForm.quantity;
const saveButton = document.querySelector(".save-button");
const modifyButton = document.querySelector(".modify-button");
const inputError = document.querySelectorAll(".input-error");
const numberRegEx = /^[0-9]+$/;

const selectProducts = document.querySelector(".select-products");
const cartProductAll = document.querySelector(".cart-products-all");
const clearAllButton = document.querySelector(".clear-shopping-button");
const api = "https://fakestoreapi.com/products";
let fetchedData = [];

let getLocalCart = JSON.parse(localStorage.getItem("cartList"));
let filteredCart = getLocalCart ? getLocalCart : [];

// removeClearAllCommonJS()
const removeClearAllCommonJS = (first, last) => {
  filteredCart.splice(first, last);
  localStorage.setItem("cartList", JSON.stringify(filteredCart));
  selectedCartProduct();
  saveButton.classList.remove("display-none");
  modifyButton.classList.remove("active");
  inputSearch.value = "";
  inputQuantity.value = "";
};

// editCart()
const editCart = (cartIndex, title, quantity, price, image) => {
  const basePrice = price.dataset.basePrice;
  inputSearch.value = title.innerText;
  inputQuantity.value = quantity.innerText;
  inputQuantity.focus();
  saveButton.classList.add("display-none");
  modifyButton.classList.add("active");
  modifyButton.setAttribute("data-index", cartIndex);
  inputSearch.setAttribute("data-api-price", basePrice);
  inputSearch.setAttribute("data-api-image", image.src);
};

// selectedCartProduct()
const selectedCartProduct = () => {
  const getLocalcartList = JSON.parse(localStorage.getItem("cartList"));

  if (getLocalcartList != null) {
    let lists = "";
    getLocalcartList.forEach((cart, index) => {
      const { pImage, pName, pPrice, pQuantity } = cart;
      lists += `
          <ul class="cart-products">
            <li class="product-title">
              <span>${pName}</span>
            </li>
            <li class="product-img">
              <img src="${pImage}" alt="${pName}">
            </li>
            <li class="product-quantity">
              <span>${pQuantity}</span> 
            </li>
            <li class="product-value">
              <span data-base-price="${pPrice}">$ ${pQuantity * pPrice}</span>
            </li>
            <li class="product-modify">
              <span data-modify=${index}>modify</span>
            </li>
            <li class="product-remove">
              <span data-remove=${index}>remove</span>
            </li>
          </ul>
      `;
    });
    cartProductAll.innerHTML = lists;
    clearAllButton.classList.remove("active");

    if (cartProductAll.children.length != 0) {
      const removeButton = document.querySelectorAll(".product-remove span");
      const editButton = document.querySelectorAll(".product-modify span");
      const productTitle = document.querySelectorAll(".product-title span");
      const productImage = document.querySelectorAll(".product-img img");
      const productPrice = document.querySelectorAll(".product-value span");
      const productQuantity = document.querySelectorAll(
        ".product-quantity span"
      );

      removeButton.forEach((rButton) => {
        rButton.addEventListener("click", () => {
          const cartIndex = rButton.dataset.remove;
          removeClearAllCommonJS(cartIndex, 1);
        });
      });

      editButton.forEach((mButton, i) => {
        mButton.addEventListener("click", () => {
          const cartIndex = mButton.dataset.modify;
          editCart(
            cartIndex,
            productTitle[i],
            productQuantity[i],
            productPrice[i],
            productImage[i]
          );
        });
      });

      clearAllButton.classList.add("active");
      clearAllButton.addEventListener("click", () => {
        removeClearAllCommonJS(0, filteredCart.length);
      });
    }
  }
};

// selectedCartProduct() -- initial call
selectedCartProduct();

// updateDropDown()
const updateDropDown = (results) => {
  const dataStr = results
    .map((result) => {
      const { image, price, title } = result;
      return `
      <li class="select-products-item" data-api-image="${image}" data-api-price="${price}">${title}</li>
    `;
    })
    .join("");

  selectProducts.innerHTML = dataStr;
};

// getShoppingList()
const getShoppingList = async () => {
  try {
    const response = await fetch(api);
    fetchedData = await response.json();
    updateDropDown(fetchedData);
  } catch (err) {
    console.log(err);
  }
};

// getShoppingList() -- initial fetch
getShoppingList();

// validateInputQuantity()
const validateInputQuantity = (input, inputValue, regex, errorAlert) => {
  if (regex.test(inputValue)) {
    input.nextElementSibling.classList.remove("active");
    return true;
  } else {
    input.value = "";
    input.nextElementSibling.classList.add("active");
    input.nextElementSibling.innerText = errorAlert;
  }
  return false;
};

// validateInputProduct()
const validateInputProduct = (input, inputValue, dropdown, errorAlert) => {
  let valid = false;
  dropdown.forEach((li) => {
    const iText = li.innerText;
    if (iText.includes(inputValue) && input.value == iText) {
      valid = true;
    }
  });

  if (valid) {
    input.nextElementSibling.classList.remove("active");
  } else {
    input.value = "";
    input.nextElementSibling.classList.add("active");
    input.nextElementSibling.innerText = errorAlert;
  }

  return valid;
};

// input search event
inputSearch.addEventListener("keyup", (e) => {
  const inputValue = e.target.value.toLowerCase().trim();
  selectProducts.classList.remove("active");

  if (inputValue) {
    if (selectProducts.children.length != 0) {
      const dropDown = document.querySelectorAll(".select-products-item");
      selectProducts.classList.add("active");

      dropDown.forEach((list) => {
        const iText = list.innerText.toLowerCase();
        if (iText.includes(inputValue)) {
          list.style.display = "";
          list.addEventListener("click", () => {
            const apiImage = list.dataset.apiImage;
            const apiPrice = list.dataset.apiPrice;

            inputSearch.value = list.innerText;
            inputSearch.setAttribute("data-api-image", apiImage);
            inputSearch.setAttribute("data-api-price", apiPrice);
            selectProducts.classList.remove("active");
          });
        } else {
          list.style.display = "none";
        }
      });
    }
  }
});

// saveModifyCommonJS()
const saveModifyCommonJS = (editIndex) => {
  const productName = inputSearch.value.trim();
  const productQuantity = inputQuantity.value.trim();

  if (productName && productQuantity) {
    if (selectProducts.children.length != 0) {
      const dropDown = document.querySelectorAll(".select-products-item");

      const checkProduct = validateInputProduct(
        inputSearch,
        productName,
        dropDown,
        "please select from drop-down"
      );
      const checkQuantity = validateInputQuantity(
        inputQuantity,
        productQuantity,
        numberRegEx,
        "only positive number allowed"
      );

      selectProducts.classList.remove("active");

      if (checkProduct && checkQuantity) {
        const apiImage = inputSearch.getAttribute("data-api-image");
        const apiPrice = inputSearch.getAttribute("data-api-price");

        const cart = {
          pName: productName,
          pQuantity: +productQuantity,
          pImage: apiImage,
          pPrice: +apiPrice,
        };

        if (modifyButton.classList.contains("active")) {
          filteredCart.splice(editIndex, 1, cart);
          saveButton.classList.remove("display-none");
          modifyButton.classList.remove("active");
          modifyButton.setAttribute("data-index", "");
        } else if (!saveButton.classList.contains("display-none")) {
          filteredCart.push(cart);
        }
        localStorage.setItem("cartList", JSON.stringify(filteredCart));
        selectedCartProduct();

        inputSearch.setAttribute("data-api-image", "");
        inputSearch.setAttribute("data-api-price", "");

        inputSearch.value = "";
        inputQuantity.value = "";
      }
    }
  }
};

// save button event
saveButton.addEventListener("click", () => {
  saveModifyCommonJS();
});

// modifyCart()
const modifyCart = () => {
  const editIndex = modifyButton.dataset.index;
  saveModifyCommonJS(editIndex);
};

// modify button event
modifyButton.addEventListener("click", () => {
  modifyCart();
});

// form event -- to prevent default behaviour
cartForm.addEventListener("submit", (e) => {
  e.preventDefault();
});