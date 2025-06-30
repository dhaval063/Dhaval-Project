// Leadsy Admin Panel - Complete Working Implementation
console.log("🚀 Admin Panel Script Loading...");

// Supabase Configuration
const SUPABASE_URL = "https://lmrnhoianwabbapehona.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtcm5ob2lhbndhYmJhcGVob25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDY5NjcsImV4cCI6MjA2NjQyMjk2N30.krTAyqOqmJkQbUalsKiUsg_5_tqxtgZo3X0oluABiQA";

// Initialize Supabase
let supabase;

// Global data variables
let topCategoriesData = [];
let allCategoriesData = [];
let sampleDataArray = [];

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  console.log("📋 DOM Loaded, initializing admin panel...");

  // Initialize Supabase client
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase client initialized");
    updateConnectionStatus("Connected", true);
  } catch (error) {
    console.error("❌ Failed to initialize Supabase:", error);
    showError("Failed to connect to database. Please refresh the page.");
    updateConnectionStatus("Connection Failed", false);
    return;
  }

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
    console.log("🎨 Lucide icons initialized");
  }

  // Auto-initialize database and load data
  setTimeout(() => {
    initializeDatabase();
  }, 1000);
});

// Update connection status
function updateConnectionStatus(status, isOnline) {
  const statusElement = document.getElementById("connection-status");
  if (statusElement) {
    statusElement.textContent = status;
    statusElement.className = isOnline
      ? "status-online font-semibold"
      : "status-offline font-semibold";
  }
}

// Show success message
function showSuccess(message) {
  const alert = document.getElementById("success-alert");
  const messageEl = document.getElementById("success-message");
  if (alert && messageEl) {
    messageEl.textContent = message;
    alert.classList.add("show");
    setTimeout(() => alert.classList.remove("show"), 4000);
  }
  console.log("✅ Success:", message);
}

// Show error message
function showError(message) {
  const alert = document.getElementById("error-alert");
  const messageEl = document.getElementById("error-message");
  if (alert && messageEl) {
    messageEl.textContent = message;
    alert.classList.add("show");
    setTimeout(() => alert.classList.remove("show"), 6000);
  }
  console.error("❌ Error:", message);
}

// Initialize Database
async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database...");

    // Create table if not exists
    const { error: createError } = await supabase.rpc(
      "create_leadsy_settings_table",
    );

    // If RPC doesn't exist, try direct table creation (this will fail gracefully if table exists)
    try {
      await supabase.from("leadsy_settings").select("*").limit(1);
      console.log("✅ Table exists or accessible");
    } catch (tableError) {
      console.log("⚠️ Table might not exist, but continuing...");
    }

    // Initialize default settings
    const defaultSettings = {
      pricing_original: "9999",
      pricing_discounted: "999",
      timer_hours: "4",
      timer_minutes: "0",
      timer_seconds: "0",
      upi_id: "pateldhaval063-5@okhdfcbank",
      qr_code_url:
        "https://cdn.builder.io/api/v1/image/assets%2F4cecf0df6d394919986974ce20e63c52%2F34122e2662f04fe5bb43548562aa8e7f",
      google_analytics: "",
      meta_pixel: "",
      admin_username: "admin",
      admin_password: "admin123",
    };

    // Set default settings
    for (const [key, value] of Object.entries(defaultSettings)) {
      await setSetting(key, value, false); // Don't show success for each one
    }

    // Initialize default categories and sample data
    await initializeDefaultData();

    // Load all data
    await loadAllData();

    showSuccess("🎉 Database initialized and data loaded successfully!");
    console.log("✅ Database initialization complete");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    showError(
      "Database initialization failed. Continuing with manual setup...",
    );

    // Try to load existing data anyway
    await loadAllData();
  }
}

// Initialize default data
async function initializeDefaultData() {
  try {
    // Default top categories
    const defaultTopCategories = [
      {
        id: 1,
        name: "E-commerce & Online Retail",
        count: "12.5 Cr+",
        icon: "shopping-cart",
      },
      {
        id: 2,
        name: "Import-Export Business",
        count: "8.3 Cr+",
        icon: "globe",
      },
      {
        id: 3,
        name: "Professional Services",
        count: "9.7 Cr+",
        icon: "briefcase",
      },
      {
        id: 4,
        name: "Consumer Data & Leads",
        count: "15.2 Cr+",
        icon: "users",
      },
      { id: 5, name: "Healthcare & Wellness", count: "6.8 Cr+", icon: "heart" },
      {
        id: 6,
        name: "Technology & Digital",
        count: "11.4 Cr+",
        icon: "sparkles",
      },
      {
        id: 7,
        name: "Manufacturing & Industry",
        count: "7.9 Cr+",
        icon: "factory",
      },
      { id: 8, name: "Retail & Wholesale", count: "13.6 Cr+", icon: "store" },
    ];

    // Default all categories
    const defaultAllCategories = [
      { id: 1, name: "Pincode-wise Business Data", count: "5.2 Cr+" },
      { id: 2, name: "Statewise Business Data", count: "4.3 Cr+" },
      { id: 3, name: "Online Shoppers", count: "4.1 Cr+" },
      { id: 4, name: "B2C Consumer Leads", count: "3.9 Cr+" },
      { id: 5, name: "Import-Export Businesses", count: "3.2 Cr+" },
      {
        id: 6,
        name: "Indiamart, Yellow Pages & Sulekha Leads",
        count: "3.1 Cr+",
      },
      { id: 7, name: "Retailers & Wholesalers", count: "2.8 Cr+" },
      { id: 8, name: "Ecommerce Sellers (Amazon, Flipkart)", count: "2.7 Cr+" },
      { id: 9, name: "Distributors & Dealers", count: "2.6 Cr+" },
      { id: 10, name: "Fashion & Beauty Enthusiasts", count: "2.5 Cr+" },
    ];

    // Default sample data
    const defaultSampleData = [
      {
        id: 1,
        category: "E-commerce Database",
        records: "5,000+ Records",
        image:
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      },
      {
        id: 2,
        category: "Healthcare Providers",
        records: "3,200+ Records",
        image:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop",
      },
      {
        id: 3,
        category: "Manufacturing Units",
        records: "4,800+ Records",
        image:
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      },
      {
        id: 4,
        category: "Professional Services",
        records: "2,600+ Records",
        image:
          "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop",
      },
    ];

    await setSetting(
      "top_categories",
      JSON.stringify(defaultTopCategories),
      false,
    );
    await setSetting(
      "all_categories",
      JSON.stringify(defaultAllCategories),
      false,
    );
    await setSetting("sample_data", JSON.stringify(defaultSampleData), false);

    console.log("📊 Default data initialized");
  } catch (error) {
    console.error("❌ Error initializing default data:", error);
  }
}

// Database functions
async function setSetting(key, value, showMessage = true) {
  try {
    console.log(
      `💾 Saving ${key}:`,
      value?.toString().substring(0, 50) + "...",
    );

    const { data, error } = await supabase
      .from("leadsy_settings")
      .upsert(
        {
          key: key,
          value: value,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "key",
        },
      )
      .select();

    if (error) {
      console.error("❌ Supabase upsert error:", error);
      throw error;
    }

    if (showMessage) {
      showSuccess(`✅ ${key.replace("_", " ")} saved successfully!`);
    }
    console.log(`✅ Successfully saved ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${key}:`, error);
    if (showMessage) {
      showError(
        `Failed to save ${key.replace("_", " ")}. Error: ${error.message}`,
      );
    }
    return false;
  }
}

async function getSetting(key) {
  try {
    const { data, error } = await supabase
      .from("leadsy_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(`❌ Error fetching ${key}:`, error);
      return null;
    }

    return data ? data.value : null;
  } catch (error) {
    console.error(`❌ Error getting ${key}:`, error);
    return null;
  }
}

// Tab management
function showTab(tabName) {
  // Hide all tabs
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach((tab) => tab.classList.add("hidden"));

  // Show selected tab
  const selectedTab = document.getElementById(tabName + "-tab");
  if (selectedTab) {
    selectedTab.classList.remove("hidden");
  }

  // Update tab buttons
  const tabButtons = document.querySelectorAll("[id^='tab-']");
  tabButtons.forEach((button) => {
    button.className = button.className.replace("tab-active", "tab-inactive");
  });

  const activeButton = document.getElementById("tab-" + tabName);
  if (activeButton) {
    activeButton.className = activeButton.className.replace(
      "tab-inactive",
      "tab-active",
    );
  }

  console.log(`📑 Switched to ${tabName} tab`);
}

// Load all data from database
async function loadAllData() {
  try {
    console.log("📥 Loading all data from database...");

    // Load pricing
    const originalPrice = await getSetting("pricing_original");
    const discountedPrice = await getSetting("pricing_discounted");
    if (originalPrice)
      document.getElementById("original-price").value = originalPrice;
    if (discountedPrice)
      document.getElementById("discounted-price").value = discountedPrice;
    calculateDiscount();

    // Load timer
    const timerHours = await getSetting("timer_hours");
    const timerMinutes = await getSetting("timer_minutes");
    const timerSeconds = await getSetting("timer_seconds");
    if (timerHours) document.getElementById("timer-hours").value = timerHours;
    if (timerMinutes)
      document.getElementById("timer-minutes").value = timerMinutes;
    if (timerSeconds)
      document.getElementById("timer-seconds").value = timerSeconds;
    updateTimerPreview();

    // Load UPI and QR
    const upiId = await getSetting("upi_id");
    const qrCodeUrl = await getSetting("qr_code_url");
    if (upiId) document.getElementById("upi-id").value = upiId;
    if (qrCodeUrl) {
      document.getElementById("qr-code-url").value = qrCodeUrl;
      const preview = document.getElementById("qr-preview");
      preview.src = qrCodeUrl;
      preview.style.display = "block";
    }

    // Load tracking pixels
    const googleAnalytics = await getSetting("google_analytics");
    const metaPixel = await getSetting("meta_pixel");
    if (googleAnalytics)
      document.getElementById("google-analytics-id").value = googleAnalytics;
    if (metaPixel) document.getElementById("meta-pixel-id").value = metaPixel;

    // Load admin credentials
    const adminUsername = await getSetting("admin_username");
    if (adminUsername) {
      document.getElementById("admin-username").value = adminUsername;
      document.getElementById("current-username").textContent = adminUsername;
    }

    // Load categories and sample data
    await loadTopCategories();
    await loadAllCategories();
    await loadSampleData();

    // Update last login
    document.getElementById("last-login").textContent =
      new Date().toLocaleString();

    console.log("✅ All data loaded successfully");
  } catch (error) {
    console.error("❌ Error loading data:", error);
    showError("Failed to load some data from database");
  }
}

// PRICING & TIMER FUNCTIONS

function calculateDiscount() {
  const original =
    parseInt(document.getElementById("original-price").value) || 0;
  const discounted =
    parseInt(document.getElementById("discounted-price").value) || 0;

  if (original > 0 && discounted >= 0) {
    const discount = Math.round(((original - discounted) / original) * 100);
    const savings = original - discounted;

    document.getElementById("discount-percent").textContent = discount + "%";
    document.getElementById("savings-amount").textContent =
      "₹" + savings.toLocaleString();
  }
}

async function savePricing() {
  const original = document.getElementById("original-price").value;
  const discounted = document.getElementById("discounted-price").value;

  if (!original || !discounted) {
    showError("Please enter both original and discounted prices");
    return;
  }

  const success1 = await setSetting("pricing_original", original, false);
  const success2 = await setSetting("pricing_discounted", discounted, false);

  if (success1 && success2) {
    calculateDiscount();
    showSuccess("💰 Pricing saved successfully!");
  } else {
    showError("Failed to save pricing");
  }
}

function updateTimerPreview() {
  const hours = document
    .getElementById("timer-hours")
    .value.toString()
    .padStart(2, "0");
  const minutes = document
    .getElementById("timer-minutes")
    .value.toString()
    .padStart(2, "0");
  const seconds = document
    .getElementById("timer-seconds")
    .value.toString()
    .padStart(2, "0");

  document.getElementById("preview-hours").textContent = hours;
  document.getElementById("preview-minutes").textContent = minutes;
  document.getElementById("preview-seconds").textContent = seconds;
}

async function saveTimer() {
  const hours = document.getElementById("timer-hours").value;
  const minutes = document.getElementById("timer-minutes").value;
  const seconds = document.getElementById("timer-seconds").value;

  const success1 = await setSetting("timer_hours", hours, false);
  const success2 = await setSetting("timer_minutes", minutes, false);
  const success3 = await setSetting("timer_seconds", seconds, false);

  if (success1 && success2 && success3) {
    updateTimerPreview();
    showSuccess("⏰ Timer saved successfully!");
  } else {
    showError("Failed to save timer");
  }
}

function resetTimer() {
  document.getElementById("timer-hours").value = "4";
  document.getElementById("timer-minutes").value = "0";
  document.getElementById("timer-seconds").value = "0";
  updateTimerPreview();
}

// PAYMENT FUNCTIONS

async function saveUpiId() {
  const upiId = document.getElementById("upi-id").value.trim();
  if (!upiId) {
    showError("Please enter a UPI ID");
    return;
  }

  const success = await setSetting("upi_id", upiId);
  if (!success) {
    showError("Failed to save UPI ID");
  }
}

function clearUpiId() {
  document.getElementById("upi-id").value = "";
  setSetting("upi_id", "");
}

function handleQrUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const qrUrl = e.target.result;
      document.getElementById("qr-code-url").value = qrUrl;
      const preview = document.getElementById("qr-preview");
      preview.src = qrUrl;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

async function saveQrCode() {
  const qrUrl = document.getElementById("qr-code-url").value.trim();
  if (!qrUrl) {
    showError("Please enter a QR code URL or upload an image");
    return;
  }

  const success = await setSetting("qr_code_url", qrUrl);
  if (success) {
    const preview = document.getElementById("qr-preview");
    preview.src = qrUrl;
    preview.style.display = "block";
  }
}

function deleteQrCode() {
  document.getElementById("qr-code-url").value = "";
  document.getElementById("qr-upload").value = "";
  document.getElementById("qr-preview").style.display = "none";
  setSetting("qr_code_url", "");
}

// TOP CATEGORIES FUNCTIONS

async function loadTopCategories() {
  try {
    const data = await getSetting("top_categories");
    topCategoriesData = data ? JSON.parse(data) : [];
    renderTopCategories();
  } catch (error) {
    console.error("❌ Error loading top categories:", error);
    topCategoriesData = [];
    renderTopCategories();
  }
}

function renderTopCategories() {
  const container = document.getElementById("top-categories-list");
  if (!container) return;

  container.innerHTML = "";
  topCategoriesData.forEach((category, index) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.innerHTML = `
      <div class="space-y-3">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i data-lucide="${category.icon || "star"}" class="w-6 h-6 text-yellow-600"></i>
          </div>
        </div>
        <input type="text" value="${category.name}" 
               class="w-full p-2 border border-gray-300 rounded-lg text-sm font-medium text-center" 
               onchange="updateTopCategory(${index}, 'name', this.value)">
        <input type="text" value="${category.count}" 
               class="w-full p-2 border border-gray-300 rounded-lg text-sm text-center text-yellow-600 font-bold" 
               onchange="updateTopCategory(${index}, 'count', this.value)">
        <button onclick="removeTopCategory(${index})" 
                class="w-full btn-danger text-sm py-2">
          <i data-lucide="trash-2" class="w-4 h-4 inline mr-1"></i>
          Remove
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Re-initialize icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateTopCategory(index, field, value) {
  if (topCategoriesData[index]) {
    topCategoriesData[index][field] = value;
  }
}

function addTopCategory() {
  const newCategory = {
    id: Date.now(),
    name: "New Category",
    count: "1.0 Cr+",
    icon: "star",
  };
  topCategoriesData.push(newCategory);
  renderTopCategories();
}

function removeTopCategory(index) {
  if (confirm("Are you sure you want to remove this category?")) {
    topCategoriesData.splice(index, 1);
    renderTopCategories();
  }
}

async function saveTopCategories() {
  const success = await setSetting(
    "top_categories",
    JSON.stringify(topCategoriesData),
  );
  if (!success) {
    showError("Failed to save top categories");
  }
}

// ALL CATEGORIES FUNCTIONS

async function loadAllCategories() {
  try {
    const data = await getSetting("all_categories");
    allCategoriesData = data ? JSON.parse(data) : [];
    renderAllCategories();
  } catch (error) {
    console.error("❌ Error loading all categories:", error);
    allCategoriesData = [];
    renderAllCategories();
  }
}

function renderAllCategories() {
  const container = document.getElementById("all-categories-list");
  if (!container) return;

  container.innerHTML = "";
  allCategoriesData.forEach((category, index) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="bg-indigo-600 text-white px-3 py-1 rounded-lg font-bold text-sm">${category.id}</span>
          <input type="text" value="${category.name}" 
                 class="flex-1 p-2 border border-gray-300 rounded-lg text-sm font-medium" 
                 onchange="updateAllCategory(${index}, 'name', this.value)">
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Records:</span>
          <input type="text" value="${category.count}" 
                 class="p-2 border border-gray-300 rounded-lg text-sm text-indigo-600 font-bold text-right" 
                 onchange="updateAllCategory(${index}, 'count', this.value)">
        </div>
        <button onclick="removeAllCategory(${index})" 
                class="w-full btn-danger text-sm py-2">
          <i data-lucide="trash-2" class="w-4 h-4 inline mr-1"></i>
          Remove Category
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Re-initialize icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateAllCategory(index, field, value) {
  if (allCategoriesData[index]) {
    allCategoriesData[index][field] = value;
  }
}

function addAllCategory() {
  const newId = Math.max(...allCategoriesData.map((c) => c.id), 0) + 1;
  const newCategory = {
    id: newId,
    name: "New Business Category",
    count: "1.0 L+",
  };
  allCategoriesData.push(newCategory);
  renderAllCategories();
}

function removeAllCategory(index) {
  if (confirm("Are you sure you want to remove this category?")) {
    allCategoriesData.splice(index, 1);
    renderAllCategories();
  }
}

async function saveAllCategories() {
  const success = await setSetting(
    "all_categories",
    JSON.stringify(allCategoriesData),
  );
  if (!success) {
    showError("Failed to save all categories");
  }
}

// SAMPLE DATA FUNCTIONS

async function loadSampleData() {
  try {
    const data = await getSetting("sample_data");
    sampleDataArray = data ? JSON.parse(data) : [];
    renderSampleData();
  } catch (error) {
    console.error("❌ Error loading sample data:", error);
    sampleDataArray = [];
    renderSampleData();
  }
}

function renderSampleData() {
  const container = document.getElementById("sample-data-list");
  if (!container) return;

  container.innerHTML = "";
  sampleDataArray.forEach((sample, index) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.innerHTML = `
      <div class="space-y-3">
        <img src="${sample.image}" alt="${sample.category}" 
             class="w-full h-32 object-cover rounded-lg border">
        <input type="text" value="${sample.category}" 
               class="w-full p-2 border border-gray-300 rounded-lg text-sm font-medium text-center" 
               onchange="updateSampleData(${index}, 'category', this.value)">
        <input type="text" value="${sample.records}" 
               class="w-full p-2 border border-gray-300 rounded-lg text-sm text-center text-pink-600 font-bold" 
               onchange="updateSampleData(${index}, 'records', this.value)">
        <input type="text" value="${sample.image}" 
               class="w-full p-2 border border-gray-300 rounded-lg text-xs text-gray-600" 
               placeholder="Image URL"
               onchange="updateSampleData(${index}, 'image', this.value)">
        <input type="file" accept="image/*" 
               class="w-full text-xs border border-gray-300 rounded-lg p-2" 
               onchange="handleSampleImageUpload(${index}, event)">
        <button onclick="removeSampleData(${index})" 
                class="w-full btn-danger text-sm py-2">
          <i data-lucide="trash-2" class="w-4 h-4 inline mr-1"></i>
          Remove Sample
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Re-initialize icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateSampleData(index, field, value) {
  if (sampleDataArray[index]) {
    sampleDataArray[index][field] = value;
    if (field === "image") {
      renderSampleData(); // Re-render to update image
    }
  }
}

function handleSampleImageUpload(index, event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      updateSampleData(index, "image", e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

function addSampleData() {
  const newSample = {
    id: Date.now(),
    category: "New Category",
    records: "1,000+ Records",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
  };
  sampleDataArray.push(newSample);
  renderSampleData();
}

function removeSampleData(index) {
  if (confirm("Are you sure you want to remove this sample data?")) {
    sampleDataArray.splice(index, 1);
    renderSampleData();
  }
}

async function saveSampleData() {
  const success = await setSetting(
    "sample_data",
    JSON.stringify(sampleDataArray),
  );
  if (!success) {
    showError("Failed to save sample data");
  }
}

// TRACKING PIXELS FUNCTIONS

async function saveGoogleAnalytics() {
  const gaId = document.getElementById("google-analytics-id").value.trim();
  if (!gaId) {
    showError("Please enter a Google Analytics ID");
    return;
  }

  const success = await setSetting("google_analytics", gaId);
  if (!success) {
    showError("Failed to save Google Analytics ID");
  }
}

function deleteGoogleAnalytics() {
  document.getElementById("google-analytics-id").value = "";
  setSetting("google_analytics", "");
}

async function saveMetaPixel() {
  const pixelId = document.getElementById("meta-pixel-id").value.trim();
  if (!pixelId) {
    showError("Please enter a Meta Pixel ID");
    return;
  }

  const success = await setSetting("meta_pixel", pixelId);
  if (!success) {
    showError("Failed to save Meta Pixel ID");
  }
}

function deleteMetaPixel() {
  document.getElementById("meta-pixel-id").value = "";
  setSetting("meta_pixel", "");
}

// ADMIN CREDENTIALS FUNCTIONS

async function updateAdminCredentials() {
  const username = document.getElementById("admin-username").value.trim();
  const password = document.getElementById("admin-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (!username || !password) {
    showError("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match");
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters long");
    return;
  }

  const success1 = await setSetting("admin_username", username, false);
  const success2 = await setSetting("admin_password", password, false);

  if (success1 && success2) {
    document.getElementById("current-username").textContent = username;
    showSuccess(
      "🔐 Admin credentials updated successfully! You'll need to log in again.",
    );
    setTimeout(() => {
      logout();
    }, 2000);
  } else {
    showError("Failed to update admin credentials");
  }
}

// UTILITY FUNCTIONS

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    showSuccess("👋 Logged out successfully!");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  }
}

// Add event listeners for real-time calculations
document.addEventListener("DOMContentLoaded", function () {
  // Pricing calculation listeners
  const originalPrice = document.getElementById("original-price");
  const discountedPrice = document.getElementById("discounted-price");

  if (originalPrice) originalPrice.addEventListener("input", calculateDiscount);
  if (discountedPrice)
    discountedPrice.addEventListener("input", calculateDiscount);

  // Timer preview listeners
  const timerInputs = ["timer-hours", "timer-minutes", "timer-seconds"];
  timerInputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.addEventListener("input", updateTimerPreview);
  });
});

console.log("🎉 Leadsy Admin Panel loaded successfully!");
console.log(
  "📝 Available functions: All CRUD operations for categories, sample data, pricing, timer, payment settings, tracking pixels, and admin credentials",
);
