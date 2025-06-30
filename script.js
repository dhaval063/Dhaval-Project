// JavaScript for Leadsy Website with Supabase Integration
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase configuration
const SUPABASE_URL = "https://lmrnhoianwabbapehona.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtcm5ob2lhbndhYmJhcGVob25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDY5NjcsImV4cCI6MjA2NjQyMjk2N30.krTAyqOqmJkQbUalsKiUsg_5_tqxtgZo3X0oluABiQA";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Initialize the page
  initializeWebsite();

  // Initialize new sections
  initializeHighlightedCategories();
  initializeTestimonialsCarousel();
  initializeCustomDataForm();

  // Supabase Database Helper Functions
  const db = {
    // Get setting by key
    async getSetting(key) {
      try {
        const { data, error } = await supabase
          .from("leadsy_settings")
          .select("value")
          .eq("key", key)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned"
          console.error("Error fetching setting:", error);
          return null;
        }

        return data ? data.value : null;
      } catch (error) {
        console.error("Error in getSetting:", error);
        return null;
      }
    },

    // Get all settings
    async getAllSettings() {
      try {
        const { data, error } = await supabase
          .from("leadsy_settings")
          .select("*");

        if (error) {
          console.error("Error fetching all settings:", error);
          return {};
        }

        const settings = {};
        data.forEach((item) => {
          settings[item.key] = item.value;
        });

        return settings;
      } catch (error) {
        console.error("Error in getAllSettings:", error);
        return {};
      }
    },
  };

  let timerInterval;
  let currentTimer = { hours: 4, minutes: 0, seconds: 0 };

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Countdown timer functionality
  function updateTimer() {
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");

    if (!hoursElement || !minutesElement || !secondsElement) {
      return;
    }

    let h = currentTimer.hours;
    let m = currentTimer.minutes;
    let s = currentTimer.seconds;

    if (s > 0) {
      s--;
    } else if (m > 0) {
      m--;
      s = 59;
    } else if (h > 0) {
      h--;
      m = 59;
      s = 59;
    } else {
      // Timer finished
      hoursElement.textContent = "00";
      minutesElement.textContent = "00";
      secondsElement.textContent = "00";
      return;
    }

    currentTimer = { hours: h, minutes: m, seconds: s };

    hoursElement.textContent = h.toString().padStart(2, "0");
    minutesElement.textContent = m.toString().padStart(2, "0");
    secondsElement.textContent = s.toString().padStart(2, "0");
  }

  // Load timer from database
  async function loadTimer() {
    try {
      const timerData = await db.getSetting("timer");
      if (timerData) {
        const timer = JSON.parse(timerData);
        currentTimer = timer;

        const hoursElement = document.getElementById("hours");
        const minutesElement = document.getElementById("minutes");
        const secondsElement = document.getElementById("seconds");

        if (hoursElement)
          hoursElement.textContent = timer.hours.toString().padStart(2, "0");
        if (minutesElement)
          minutesElement.textContent = timer.minutes
            .toString()
            .padStart(2, "0");
        if (secondsElement)
          secondsElement.textContent = timer.seconds
            .toString()
            .padStart(2, "0");
      }
    } catch (error) {
      console.error("Error loading timer:", error);
    }
  }

  // Load pricing from database
  async function loadPricing() {
    try {
      const originalPrice = await db.getSetting("original-price");
      const discountedPrice = await db.getSetting("discounted-price");

      if (originalPrice && discountedPrice) {
        const original = parseInt(originalPrice);
        const discounted = parseInt(discountedPrice);
        const savings = original - discounted;
        const percentage = Math.round((savings / original) * 100);

        // Update all pricing elements on the page
        const originalPriceElements = document.querySelectorAll(
          "[data-original-price]",
        );
        const discountedPriceElements = document.querySelectorAll(
          "[data-discounted-price]",
        );
        const percentageElements = document.querySelectorAll(
          "[data-discount-percentage]",
        );
        const savingsElements = document.querySelectorAll("[data-savings]");

        originalPriceElements.forEach((el) => {
          el.textContent = `₹${original.toLocaleString()}`;
        });

        discountedPriceElements.forEach((el) => {
          el.textContent = `₹${discounted.toLocaleString()}`;
        });

        percentageElements.forEach((el) => {
          el.textContent = `${percentage}% OFF`;
        });

        savingsElements.forEach((el) => {
          el.textContent = `You save ₹${savings.toLocaleString()}`;
        });

        // Update Buy Now buttons
        const buyNowButtons = document.querySelectorAll("[data-buy-now]");
        buyNowButtons.forEach((btn) => {
          btn.textContent = `Buy Now @ ₹${discounted.toLocaleString()}`;
        });
      }
    } catch (error) {
      console.error("Error loading pricing:", error);
    }
  }

  // Load categories from database
  async function loadCategories() {
    try {
      const categoriesData = await db.getSetting("categories");
      if (categoriesData) {
        const categories = JSON.parse(categoriesData);
        updateCategoriesDisplay(categories);
        updateHighlightedCategories(categories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  // Update categories display
  function updateCategoriesDisplay(categories) {
    // Update the categories list in the main section
    const categoriesContainer = document.querySelector(
      "#categories-list, .categories-list",
    );
    if (categoriesContainer && categories) {
      categoriesContainer.innerHTML = "";

      categories.forEach((category) => {
        const categoryElement = document.createElement("div");
        categoryElement.className =
          "flex justify-between items-center p-4 bg-white rounded-xl hover:bg-blue-50 transition-colors shadow-sm border border-gray-100";
        categoryElement.innerHTML = `
          <div class="flex items-center gap-4">
            <span class="text-sm text-white bg-purple-600 px-3 py-1 rounded-lg font-bold min-w-[40px] text-center">${category.id}</span>
            <span class="text-base text-gray-800 font-medium">${category.name}</span>
          </div>
          <span class="border-2 border-purple-200 text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-full text-sm">${category.count}</span>
        `;
        categoriesContainer.appendChild(categoryElement);
      });
    }
  }

  // Load sample data from database
  async function loadSampleData() {
    try {
      const sampleDataString = await db.getSetting("sample-data");
      if (sampleDataString) {
        const sampleData = JSON.parse(sampleDataString);
        updateSampleDataDisplay(sampleData);
      }
    } catch (error) {
      console.error("Error loading sample data:", error);
    }
  }

  // Update sample data display
  function updateSampleDataDisplay(sampleData) {
    const sampleDataContainer = document.querySelector(
      "#sample-data-grid, .sample-data-grid",
    );
    if (sampleDataContainer && sampleData) {
      sampleDataContainer.innerHTML = "";

      sampleData.forEach((sample) => {
        const sampleElement = document.createElement("div");
        sampleElement.className =
          "bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200 transform hover:scale-105 rounded-lg";
        sampleElement.innerHTML = `
          <div class="p-6">
            <div class="text-center mb-4">
              <div class="bg-gray-100 rounded-2xl p-4 mb-4 min-h-[200px] flex items-center justify-center overflow-hidden">
                <img src="${sample.image}" alt="${sample.category}" class="w-full h-full object-cover rounded-xl" />
              </div>
              <h4 class="font-bold text-lg text-gray-800 mb-2" style="font-family: 'Poppins'">${sample.category}</h4>
              <span class="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-bold border border-blue-200 px-3 py-1 rounded-full text-sm">${sample.records}</span>
            </div>
          </div>
        `;
        sampleDataContainer.appendChild(sampleElement);
      });
    }
  }

  // Initialize highlighted categories
  function initializeHighlightedCategories() {
    const highlightedContainer = document.getElementById(
      "highlighted-categories",
    );
    if (highlightedContainer) {
      // Show default highlighted categories initially
      const defaultCategories = [
        { id: 1, name: "Pincode-wise Business Data", count: "5.2 Cr+" },
        { id: 2, name: "Online Shoppers", count: "4.1 Cr+" },
        { id: 3, name: "Business Owners", count: "3.8 Cr+" },
        { id: 4, name: "HNI (High Net Worth)", count: "2.5 Cr+" },
        { id: 5, name: "Real Estate Brokers", count: "1.9 Cr+" },
        { id: 6, name: "Healthcare Professionals", count: "1.2 Cr+" },
      ];
      updateHighlightedCategories(defaultCategories);
    }
  }

  // Update highlighted categories display
  function updateHighlightedCategories(categories) {
    const highlightedContainer = document.getElementById(
      "highlighted-categories",
    );
    if (highlightedContainer && categories && categories.length > 0) {
      // Get top 6 categories (or first 6 if no specific highlighting)
      const topCategories = categories.slice(0, 6);
      const icons = [
        "users",
        "building",
        "shopping-cart",
        "phone",
        "mail",
        "globe",
      ];
      const colors = [
        {
          bg: "from-teal-100 to-cyan-100",
          border: "border-teal-200",
          text: "text-teal-600",
          badge: "from-teal-100 to-cyan-100 text-teal-700 border-teal-200",
        },
        {
          bg: "from-blue-100 to-indigo-100",
          border: "border-blue-200",
          text: "text-blue-600",
          badge: "from-blue-100 to-indigo-100 text-blue-700 border-blue-200",
        },
        {
          bg: "from-purple-100 to-pink-100",
          border: "border-purple-200",
          text: "text-purple-600",
          badge:
            "from-purple-100 to-pink-100 text-purple-700 border-purple-200",
        },
        {
          bg: "from-green-100 to-emerald-100",
          border: "border-green-200",
          text: "text-green-600",
          badge:
            "from-green-100 to-emerald-100 text-green-700 border-green-200",
        },
        {
          bg: "from-orange-100 to-red-100",
          border: "border-orange-200",
          text: "text-orange-600",
          badge: "from-orange-100 to-red-100 text-orange-700 border-orange-200",
        },
        {
          bg: "from-yellow-100 to-orange-100",
          border: "border-yellow-200",
          text: "text-yellow-600",
          badge:
            "from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200",
        },
      ];

      highlightedContainer.innerHTML = "";

      topCategories.forEach((category, index) => {
        const icon = icons[index % icons.length];
        const colorScheme = colors[index % colors.length];

        const categoryElement = document.createElement("div");
        categoryElement.className = `highlighted-category bg-white rounded-3xl p-8 shadow-xl border-2 ${colorScheme.border} hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover-lift`;
        categoryElement.innerHTML = `
          <div class="text-center">
            <div class="bg-gradient-to-r ${colorScheme.bg} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 ${colorScheme.border}">
              <i data-lucide="${icon}" class="w-10 h-10 ${colorScheme.text}"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-800 mb-4" style="font-family: 'Poppins'">${category.name}</h4>
            <div class="bg-gradient-to-r ${colorScheme.badge} font-bold border px-4 py-2 rounded-full text-sm mb-4">${category.count}</div>
            <p class="text-gray-600 leading-relaxed text-sm">High-quality verified contacts in ${category.name.toLowerCase()} sector</p>
          </div>
        `;
        highlightedContainer.appendChild(categoryElement);
      });

      // Refresh icons for the new content
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }
  }

  // Initialize testimonials carousel
  function initializeTestimonialsCarousel() {
    let currentTestimonial = 0;
    const track = document.getElementById("testimonials-track");
    const prevBtn = document.getElementById("testimonials-prev");
    const nextBtn = document.getElementById("testimonials-next");

    if (!track || !prevBtn || !nextBtn) return;

    const slides = track.querySelectorAll(".testimonial-slide");
    const totalSlides = slides.length;

    // Determine slides to show based on screen size
    function getSlidesToShow() {
      if (window.innerWidth >= 1024) return 3; // Desktop
      if (window.innerWidth >= 768) return 2; // Tablet
      return 1; // Mobile
    }

    function updateCarousel() {
      const slidesToShow = getSlidesToShow();
      const maxSlide = totalSlides - slidesToShow;
      const translateX = -(currentTestimonial * (100 / slidesToShow));
      track.style.transform = `translateX(${translateX}%)`;

      // Update button states
      prevBtn.disabled = currentTestimonial === 0;
      nextBtn.disabled = currentTestimonial >= maxSlide;

      prevBtn.classList.toggle("opacity-50", currentTestimonial === 0);
      nextBtn.classList.toggle("opacity-50", currentTestimonial >= maxSlide);
    }

    prevBtn.addEventListener("click", () => {
      if (currentTestimonial > 0) {
        currentTestimonial--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener("click", () => {
      const slidesToShow = getSlidesToShow();
      const maxSlide = totalSlides - slidesToShow;
      if (currentTestimonial < maxSlide) {
        currentTestimonial++;
        updateCarousel();
      }
    });

    // Auto-play carousel
    setInterval(() => {
      const slidesToShow = getSlidesToShow();
      const maxSlide = totalSlides - slidesToShow;
      if (currentTestimonial >= maxSlide) {
        currentTestimonial = 0;
      } else {
        currentTestimonial++;
      }
      updateCarousel();
    }, 5000);

    // Handle window resize
    window.addEventListener("resize", debounce(updateCarousel, 250));

    // Initial setup
    updateCarousel();
  }

  // Initialize custom data form
  function initializeCustomDataForm() {
    const customDataForm = document.getElementById("custom-data-form");
    if (customDataForm) {
      customDataForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const businessCategory =
          document.getElementById("business-category")?.value || "";
        const targetLocation =
          document.getElementById("target-location")?.value || "";
        const companySize =
          document.getElementById("company-size")?.value || "";
        const customName = document.getElementById("custom-name")?.value || "";
        const customMobile =
          document.getElementById("custom-mobile")?.value || "";
        const customRequirements =
          document.getElementById("custom-requirements")?.value || "";

        if (!businessCategory || !customName || !customMobile) {
          alert("Please fill in all required fields (marked with *)");
          return;
        }

        const whatsappMessage =
          `🎯 CUSTOM DATA REQUEST\n\n` +
          `👤 Name: ${customName}\n` +
          `📱 Mobile: ${customMobile}\n` +
          `🏢 Business Category: ${businessCategory}\n` +
          `📍 Target Location: ${targetLocation || "Not specified"}\n` +
          `🏗️ Company Size: ${companySize || "Not specified"}\n` +
          `📝 Additional Requirements: ${customRequirements || "None"}\n\n` +
          `💡 Please provide a custom quote for this data requirement.`;

        const encodedMessage = encodeURIComponent(whatsappMessage);

        window.open(
          `https://wa.me/919574137602?text=${encodedMessage}`,
          "_blank",
        );

        // Reset form
        customDataForm.reset();
        alert(
          "Thank you! Your custom data request has been sent via WhatsApp. We'll get back to you with a quote within 24 hours.",
        );

        // Track the event
        trackEvent("CustomDataRequest", {
          category: businessCategory,
          location: targetLocation,
          companySize: companySize,
        });
      });
    }
  }

  // Load Meta Pixel
  async function loadMetaPixel() {
    try {
      const pixelId = await db.getSetting("meta-pixel");
      if (pixelId) {
        // Add Meta Pixel code to head
        const script = document.createElement("script");
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);

        // Add noscript fallback
        const noscript = document.createElement("noscript");
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
        document.head.appendChild(noscript);
      }
    } catch (error) {
      console.error("Error loading Meta Pixel:", error);
    }
  }

  // Contact form submission
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("contact-name")?.value || "";
      const email = document.getElementById("contact-email")?.value || "";
      const message = document.getElementById("contact-message")?.value || "";

      if (!name || !email || !message) {
        alert("Please fill in all fields");
        return;
      }

      const whatsappMessage = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
      const encodedMessage = encodeURIComponent(whatsappMessage);

      window.open(
        `https://wa.me/919574137602?text=${encodedMessage}`,
        "_blank",
      );

      // Reset form
      contactForm.reset();
      alert("Thank you! Your message has been sent via WhatsApp.");
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Navbar scroll effect
  const navbar = document.querySelector("nav");
  if (navbar) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 100) {
        navbar.classList.add("shadow-xl");
      } else {
        navbar.classList.remove("shadow-xl");
      }
    });
  }

  // Initialize website with data from database
  async function initializeWebsite() {
    try {
      console.log("Initializing website with Supabase data...");

      // Load all data from database
      await Promise.all([
        loadTimer(),
        loadPricing(),
        loadCategories(),
        loadSampleData(),
        loadMetaPixel(),
      ]);

      // Start the countdown timer
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      timerInterval = setInterval(updateTimer, 1000);

      console.log("Website initialized successfully with live data");
    } catch (error) {
      console.error("Error initializing website:", error);
    }
  }

  // Set up real-time listeners for database changes
  const setupRealtimeListeners = () => {
    supabase
      .channel("leadsy_website_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leadsy_settings" },
        (payload) => {
          console.log("Real-time change detected:", payload);
          // Handle the change based on the key
          if (payload.new && payload.new.key) {
            handleRealTimeChange(payload.new.key, payload.new.value);
          }
        },
      )
      .subscribe();
  };

  // Handle real-time database changes
  async function handleRealTimeChange(key, value) {
    console.log(`Handling real-time change: ${key} = ${value}`);

    switch (key) {
      case "timer":
        try {
          const timer = JSON.parse(value);
          currentTimer = timer;

          const hoursElement = document.getElementById("hours");
          const minutesElement = document.getElementById("minutes");
          const secondsElement = document.getElementById("seconds");

          if (hoursElement)
            hoursElement.textContent = timer.hours.toString().padStart(2, "0");
          if (minutesElement)
            minutesElement.textContent = timer.minutes
              .toString()
              .padStart(2, "0");
          if (secondsElement)
            secondsElement.textContent = timer.seconds
              .toString()
              .padStart(2, "0");
        } catch (error) {
          console.error("Error updating timer from real-time change:", error);
        }
        break;

      case "original-price":
      case "discounted-price":
        // Reload pricing when either price changes
        await loadPricing();
        break;

      case "categories":
        try {
          const categories = JSON.parse(value);
          updateCategoriesDisplay(categories);
          updateHighlightedCategories(categories);
        } catch (error) {
          console.error(
            "Error updating categories from real-time change:",
            error,
          );
        }
        break;

      case "sample-data":
        try {
          const sampleData = JSON.parse(value);
          updateSampleDataDisplay(sampleData);
        } catch (error) {
          console.error(
            "Error updating sample data from real-time change:",
            error,
          );
        }
        break;

      case "meta-pixel":
        // Reload the page to apply new Meta Pixel
        setTimeout(() => {
          location.reload();
        }, 1000);
        break;

      default:
        console.log(`Unhandled real-time change: ${key}`);
    }
  }

  // Set up real-time listeners
  setupRealtimeListeners();

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fade-in-up");
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document
    .querySelectorAll(".hover\\:shadow-2xl, .hover\\:shadow-lg")
    .forEach((el) => {
      observer.observe(el);
    });

  // Add loading state to buttons
  document.querySelectorAll(".btn-primary").forEach((button) => {
    button.addEventListener("click", function () {
      if (this.onclick || this.getAttribute("onclick")) {
        this.classList.add("opacity-75", "cursor-wait");
        const originalContent = this.innerHTML;
        this.innerHTML =
          '<i data-lucide="loader-2" class="w-5 h-5 animate-spin mr-2"></i>Loading...';

        setTimeout(() => {
          this.classList.remove("opacity-75", "cursor-wait");
          this.innerHTML = originalContent;
          if (typeof lucide !== "undefined") {
            lucide.createIcons();
          }
        }, 1000);
      }
    });
  });

  // Back to top button
  const backToTopButton = document.createElement("button");
  backToTopButton.innerHTML = '<i data-lucide="arrow-up" class="w-5 h-5"></i>';
  backToTopButton.className =
    "fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 opacity-0 pointer-events-none z-50";
  backToTopButton.id = "back-to-top";

  document.body.appendChild(backToTopButton);

  backToTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", function () {
    if (window.scrollY > 500) {
      backToTopButton.classList.remove("opacity-0", "pointer-events-none");
      backToTopButton.classList.add("opacity-100");
    } else {
      backToTopButton.classList.add("opacity-0", "pointer-events-none");
      backToTopButton.classList.remove("opacity-100");
    }
  });

  // Refresh Lucide icons after any dynamic content changes
  function refreshIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  // Call refreshIcons after dynamic content updates
  refreshIcons();

  // Performance optimization: Debounce scroll events
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Apply debouncing to scroll events
  const debouncedScrollHandler = debounce(function () {
    // Scroll-based animations can go here
  }, 100);

  window.addEventListener("scroll", debouncedScrollHandler);

  // Error handling for external resources
  window.addEventListener("error", function (e) {
    if (e.target.tagName === "IMG") {
      e.target.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";
    }
  });

  // Analytics event tracking (if analytics is implemented)
  function trackEvent(eventName, properties = {}) {
    // Track with Meta Pixel if available
    if (typeof fbq !== "undefined") {
      fbq("track", eventName, properties);
    }
    console.log("Event tracked:", eventName, properties);
  }

  // Track important user interactions
  document.querySelectorAll(".btn-primary").forEach((button) => {
    button.addEventListener("click", function () {
      trackEvent("button_click", {
        button_text: this.textContent.trim(),
        button_location: this.closest("section")?.id || "unknown",
      });
    });
  });

  // Cleanup function for when page unloads
  window.addEventListener("beforeunload", function () {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  });

  console.log("Leadsy website with Supabase integration loaded successfully!");
});

// Utility functions that can be called globally
window.LeadsyUtils = {
  showToast: function (message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 bg-${type === "success" ? "green" : "red"}-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-x-full");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  },

  formatCurrency: function (amount, currency = "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  formatNumber: function (number) {
    return new Intl.NumberFormat("en-IN").format(number);
  },
};
