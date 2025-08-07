function toggleTreatment(type) {
        const detailsElement = document.getElementById(`${type}-details`);
        const isVisible = detailsElement.style.display === 'block';
        
        // Hide all treatment details first
        document.querySelectorAll('.treatment-details').forEach(el => {
          el.style.display = 'none';
        });
        
        // If the clicked one wasn't visible, show it
        if (!isVisible) {
          detailsElement.style.display = 'block';
        }
      }
      
      // Added interactive functions for buttons
      function saveRecommendation() {
        alert('Recommendation saved successfully!');
        // Here you would typically add code to actually save the data
      }
      
      function deleteRecommendation() {
        if (confirm('Are you sure you want to delete this recommendation?')) {
          alert('Recommendation deleted!');
          // Here you would typically add code to actually delete the data
        }
      }
      
      // Make the treatment options interactive with keyboard
      document.addEventListener('DOMContentLoaded', function() {
        const treatmentOptions = document.querySelectorAll('.treatment-option');
        
        treatmentOptions.forEach(option => {
          option.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
              const onclick = this.getAttribute('onclick');
              if (onclick) eval(onclick);
            }
          });
          
          // Add tabindex for keyboard accessibility
          option.setAttribute('tabindex', '0');
        });
      });
     
        document.addEventListener('DOMContentLoaded', function() {
            // Animation for feature cards on scroll
            const featureCards = document.querySelectorAll('.feature-card');
            const statsCards = document.querySelectorAll('.stats-card');
            const testimonialCards = document.querySelectorAll('.testimonial-card');
            
            const animateOnScroll = function(entries, observer) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                        observer.unobserve(entry.target);
                    }
                });
            };
            
            const observer = new IntersectionObserver(animateOnScroll, {
                threshold: 0.1
            });
            
            featureCards.forEach(card => observer.observe(card));
            statsCards.forEach(card => observer.observe(card));
            testimonialCards.forEach(card => observer.observe(card));
            
            // Navbar scroll effect
            const navbar = document.querySelector('.navbar');
            window.addEventListener('scroll', function() {
                if (window.scrollY > 50) {
                    navbar.classList.add('shadow-sm');
                } else {
                    navbar.classList.remove('shadow-sm');
                }
            });
            
            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
            
            // Mobile menu close on click
            const navLinks = document.querySelectorAll('.nav-link');
            const navbarCollapse = document.querySelector('.navbar-collapse');
            const bsCollapse = new bootstrap.Collapse(navbarCollapse, {toggle: false});
            
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 992) {
                        bsCollapse.hide();
                    }
                });
            });
        });
    