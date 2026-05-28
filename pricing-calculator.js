const categorySubcategories = {
  "creator": {
    "longform": {
      "name": "Long Form Content",
      "basePrice": 7000
    },
    "shortform": {
      "name": "Short Form Content",
      "basePrice": 5000
    }
  },
  "celebration": {
    "beginnings": {
      "name": "Little Beginnings",
      "basePrice": 5000
    },
    "frames": {
      "name": "Forever Frames",
      "basePrice": 6000
    }
  },
  "transformation": {
    "growth": {
      "name": "Personal Growth",
      "basePrice": 5500
    },
    "lifestyle": {
      "name": "Lifestyle Transformation",
      "basePrice": 6000
    }
  },
  "journey": {
    "destination": {
      "name": "Destination Films",
      "basePrice": 6500
    },
    "adventure": {
      "name": "Adventure & Experiences",
      "basePrice": 5800
    }
  },
  "social": {
    "business": {
      "name": "Small Business",
      "basePrice": 7000
    },
    "brand": {
      "name": "Established Brand",
      "basePrice": 9000
    }
  }
};
const categoryLabels = {
  "creator": "Creator Package",
  "celebration": "Celebration Package",
  "transformation": "Transformation Package",
  "journey": "Journey Package",
  "social": "Social Spark Package"
};
const tierPrices = {
  spark: { multiplier: 0.8, name: "BASIC / BASIC" },
  momentum: { multiplier: 1.0, name: "STANDARD / PREMIUM" },
  ascend: { multiplier: 1.3, name: "PREMIUM / LUXURY" }
};

function money(value) {
  if (!Number.isFinite(value)) return "--";
  return "Rs. " + Math.round(value).toLocaleString("en-IN");
}

function option(value, label) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function updateSubcategories() {
  const category = document.getElementById("category").value;
  const subcategorySelect = document.getElementById("subcategory");
  subcategorySelect.innerHTML = "";
  subcategorySelect.appendChild(option("", "-- Select Sub-Category --"));
  if (categorySubcategories[category]) {
    Object.keys(categorySubcategories[category]).forEach((key) => {
      subcategorySelect.appendChild(option(key, categorySubcategories[category][key].name));
    });
  }
  updateTiers();
}

function updateTiers() {
  const tierSelect = document.getElementById("tier");
  tierSelect.innerHTML = "";
  tierSelect.appendChild(option("", "-- Select Tier --"));
  Object.keys(tierPrices).forEach((key) => tierSelect.appendChild(option(key, tierPrices[key].name)));
  tierSelect.appendChild(option("customizable", "CUSTOMIZABLE"));
  calculatePrice();
}

function calculatePrice() {
  const category = document.getElementById("category").value;
  const subcategory = document.getElementById("subcategory").value;
  const tier = document.getElementById("tier").value;
  const custom = document.getElementById("customizable-section");
  if (tier === "customizable") {
    custom.style.display = "block";
    updatePriceSummary("CUSTOMIZABLE", NaN, 0, NaN);
    return;
  }
  custom.style.display = "none";
  if (!category || !subcategory || !tier) {
    updatePriceSummary("--", NaN, 0, NaN);
    return;
  }
  const basePrice = categorySubcategories[category][subcategory].basePrice;
  const finalPrice = basePrice * tierPrices[tier].multiplier;
  const packageName = categorySubcategories[category][subcategory].name + " - " + tierPrices[tier].name;
  updatePriceSummary(packageName, finalPrice, 0, finalPrice);
}

function getVolumeDiscount(duration) {
  if (duration >= 60) return 22;
  if (duration >= 30) return 18;
  if (duration >= 20) return 14;
  if (duration >= 10) return 10;
  if (duration >= 5) return 5;
  return 0;
}

function calculateCustomPrice() {
  const duration = parseFloat(document.getElementById("duration").value);
  const pricingBase = parseFloat(document.getElementById("pricing-base").value);
  if (!duration || !pricingBase) {
    alert("Please enter duration and select a pricing base.");
    return;
  }
  const discount = getVolumeDiscount(duration);
  document.getElementById("discount").value = discount;
  const basePrice = duration * pricingBase;
  const discountAmount = (basePrice * discount) / 100;
  const finalPrice = basePrice - discountAmount;
  updatePriceSummary("CUSTOMIZABLE", basePrice, discountAmount, finalPrice);
}

function updatePriceSummary(packageName, basePrice, discountAmount, totalPrice) {
  document.getElementById("selected-package").textContent = packageName;
  document.getElementById("base-price").textContent = money(basePrice);
  document.getElementById("discount-applied").textContent = Number.isFinite(discountAmount) && Number.isFinite(basePrice) && basePrice > 0
    ? money(discountAmount) + " (" + ((discountAmount / basePrice) * 100).toFixed(1) + "%)"
    : "--";
  document.getElementById("total-price").textContent = money(totalPrice);
  document.getElementById("calculated-price").value = Number.isFinite(totalPrice) ? Math.round(totalPrice) : "";
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") || "";
  const subcategory = params.get("subcategory") || "";
  const tier = params.get("tier") || "";
  if (category && categorySubcategories[category]) {
    document.getElementById("category").value = category;
    updateSubcategories();
    if (subcategory && categorySubcategories[category][subcategory]) {
      document.getElementById("subcategory").value = subcategory;
      updateTiers();
    }
    if (tier) {
      document.getElementById("tier").value = tier;
      calculatePrice();
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const category = document.getElementById("category");
  category.innerHTML = "";
  category.appendChild(option("", "-- Select Category --"));
  Object.keys(categorySubcategories).forEach((key) => category.appendChild(option(key, categoryLabels[key])));
  document.getElementById("subcategory").appendChild(option("", "-- Select Sub-Category --"));
  document.getElementById("tier").appendChild(option("", "-- Select Tier --"));
  category.addEventListener("change", updateSubcategories);
  document.getElementById("subcategory").addEventListener("change", updateTiers);
  document.getElementById("tier").addEventListener("change", calculatePrice);
  document.getElementById("duration").addEventListener("input", calculateCustomPrice);
  document.getElementById("pricing-base").addEventListener("change", calculateCustomPrice);
  document.getElementById("custom-calculate").addEventListener("click", calculateCustomPrice);
  applyQueryParams();
  calculatePrice();
});