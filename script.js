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
         function showHowItWorks() {
           const section = document.getElementById("how-it-works");
           section.style.display = "block";
           section.scrollIntoView({ behavior: "smooth" });
         }
    const imagePreview = document.getElementById("imagePreview");
    const fileInput = document.getElementById("fileInput");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const viewResultsBtn = document.getElementById("viewResultsBtn");

    // Google API configuration (replace with your own credentials)
    const GOOGLE_API_CONFIG = {
      apiKey: "AIzaSyAexampleapikey12345",
      clientId: "12345-example.apps.googleusercontent.com",
      appId: "12345",
      scope: "https://www.googleapis.com/auth/drive.readonly",
    };

    // Initialize the page
    document.addEventListener("DOMContentLoaded", function () {
      // Load Google API
      gapi.load("client:auth2:picker", {
        callback: initGoogleApi,
        onerror: function () {
          console.error("Failed to load Google API");
        },
        timeout: 5000,
        ontimeout: function () {
          console.error("Timeout loading Google API");
        },
      });
    });

    function initGoogleApi() {
      gapi.client
        .init({
          apiKey: GOOGLE_API_CONFIG.apiKey,
          clientId: GOOGLE_API_CONFIG.clientId,
          scope: GOOGLE_API_CONFIG.scope,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
        })
        .then(
          function () {
            console.log("Google API initialized");
          },
          function (error) {
            console.error("Error initializing Google API:", error);
          }
        );
    }

    function handleScanOption(option) {
      // Close dropdown after selection
      const dropdown = new bootstrap.Dropdown(
        document.getElementById("scanDropdown")
      );
      dropdown.hide();

      switch (option) {
        case "photo":
          openCamera();
          break;
        case "upload":
          openGallery();
          break;
        case "drive":
          openGoogleDrive();
          break;
      }
    }

    function showLoading(show) {
      loadingSpinner.style.display = show ? "flex" : "none";
    }

    function openCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera access is not supported by your browser or device.");
        return;
      }

      // Create camera dialog
      const dialog = document.createElement("div");
      dialog.className = "camera-dialog";

      // Create video element
      const video = document.createElement("video");
      video.className = "camera-preview";
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");

      // Create buttons
      const captureBtn = document.createElement("button");
      captureBtn.className = "btn btn-success mt-3";
      captureBtn.innerHTML = '<i class="bi bi-camera-fill me-2"></i> Capture';

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn btn-outline-light mt-2";
      cancelBtn.innerHTML = "Cancel";

      // Add elements to dialog
      dialog.appendChild(video);
      dialog.appendChild(captureBtn);
      dialog.appendChild(cancelBtn);

      // Add dialog to body
      document.body.appendChild(dialog);

      // Access camera
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "environment", // Prefer rear camera
          },
          audio: false,
        })
        .then(function (stream) {
          video.srcObject = stream;

          // Capture photo
          captureBtn.onclick = function () {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Stop stream and remove dialog
            stream.getTracks().forEach((track) => track.stop());
            document.body.removeChild(dialog);

            // Display and process image
            imagePreview.src = canvas.toDataURL("image/jpeg");
            imagePreview.style.display = "block";
            processImage(imagePreview.src);
          };

          // Cancel
          cancelBtn.onclick = function () {
            stream.getTracks().forEach((track) => track.stop());
            document.body.removeChild(dialog);
          };
        })
        .catch(function (err) {
          console.error("Camera error:", err);
          document.body.removeChild(dialog);

          if (err.name === "NotAllowedError") {
            alert(
              "Camera access was denied. Please enable camera permissions in your browser settings."
            );
          } else {
            alert("Could not access the camera: " + err.message);
          }
        });
    }

    function openGallery() {
      fileInput.click();

      fileInput.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match("image.*")) {
          alert("Please select an image file (JPEG, PNG, etc.)");
          return;
        }

        showLoading(true);

        const reader = new FileReader();
        reader.onload = function (event) {
          imagePreview.src = event.target.result;
          imagePreview.style.display = "block";
          processImage(imagePreview.src);
          showLoading(false);
        };
        reader.readAsDataURL(file);
      };
    }

    function openGoogleDrive() {
      if (!gapi.auth2) {
        alert("Google services are not loaded. Please try again.");
        return;
      }

      const auth = gapi.auth2.getAuthInstance();

      if (auth.isSignedIn.get()) {
        createPicker(auth.currentUser.get().getAuthResponse().access_token);
      } else {
        auth
          .signIn()
          .then(function () {
            createPicker(auth.currentUser.get().getAuthResponse().access_token);
          })
          .catch(function (error) {
            console.error("Sign in error:", error);
            alert("Failed to sign in to Google. Please try again.");
          });
      }
    }

    function createPicker(accessToken) {
      showLoading(true);

      const view = new google.picker.View(google.picker.ViewId.DOCS_IMAGES);
      view.setMimeTypes("image/jpeg,image/png,image/gif");

      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(GOOGLE_API_CONFIG.apiKey)
        .setCallback(pickerCallback)
        .setAppId(GOOGLE_API_CONFIG.appId)
        .setTitle("Select an Image from Google Drive")
        .build();

      picker.setVisible(true);
      showLoading(false);
    }

    function pickerCallback(data) {
      if (data.action === google.picker.Action.PICKED) {
        const fileId = data.docs[0].id;
        showLoading(true);

        // In a real app, you would need to send this to your backend
        // to properly download the file using the Drive API
        // This is just a simulation
        setTimeout(() => {
          imagePreview.src =
            "https://via.placeholder.com/600x400?text=Google+Drive+Image+Selected";
          imagePreview.style.display = "block";
          processImage(imagePreview.src);
          showLoading(false);
        }, 1500);
      } else if (data.action === google.picker.Action.CANCEL) {
        console.log("User canceled Google Picker");
      }
    }

    function processImage(imageData) {
      console.log("Processing image:", imageData);

      // Simulate processing delay
      showLoading(true);
      setTimeout(() => {
        alert("Image processing complete!");
        showLoading(false);
        // Show the View Results button after processing
        viewResultsBtn.style.display = "block";
      }, 2000);
    }
    