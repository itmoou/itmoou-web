// ITmoou Website JavaScript

// Image Slider
class Slider {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.slide');
    this.dots = document.querySelectorAll('.slider-dot');
    this.autoPlayInterval = null;
    
    if (this.slides.length > 0) {
      this.init();
    }
  }

  init() {
    this.showSlide(0);
    this.startAutoPlay();
    
    // Dot click handlers
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.showSlide(index);
        this.resetAutoPlay();
      });
    });
  }

  showSlide(index) {
    // Remove active class from all slides and dots
    this.slides.forEach(slide => slide.classList.remove('active'));
    this.dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    this.currentSlide = index;
    this.slides[index].classList.add('active');
    this.dots[index].classList.add('active');
  }

  nextSlide() {
    let next = (this.currentSlide + 1) % this.slides.length;
    this.showSlide(next);
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  resetAutoPlay() {
    clearInterval(this.autoPlayInterval);
    this.startAutoPlay();
  }
}

// Smooth scroll for navigation links
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#!' && document.querySelector(href)) {
        e.preventDefault();
        const target = document.querySelector(href);
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Mobile menu toggle
function setupMobileMenu() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        const dropdown = this.querySelector('.dropdown');
        if (dropdown) {
          dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
      }
    });
  });
}

// Header scroll effect - change background opacity
function setupHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  window.addEventListener('scroll', () => {
    const scrollPosition = window.pageYOffset;
    
    // Calculate opacity based on scroll position (0 to 300px)
    const maxScroll = 300;
    const opacity = Math.min(scrollPosition / maxScroll, 1);
    
    // Apply white background color with opacity
    if (scrollPosition > 10) {
      header.style.background = `rgba(255, 255, 255, ${opacity * 0.95})`;
      header.style.backdropFilter = 'blur(10px)';
      header.style.boxShadow = `0 2px 10px rgba(0, 0, 0, ${opacity * 0.1})`;
    } else {
      header.style.background = 'transparent';
      header.style.backdropFilter = 'none';
      header.style.boxShadow = 'none';
    }
  });
}

// API call example
async function fetchData(endpoint) {
  try {
    const response = await fetch(`/api/${endpoint}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize slider
  new Slider();
  
  // Setup smooth scrolling
  setupSmoothScroll();
  
  // Setup mobile menu
  setupMobileMenu();
  
  // Setup header scroll effect
  setupHeaderScroll();
});

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Slider, fetchData };
}
