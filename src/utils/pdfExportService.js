// src/utils/pdfExportService.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exports a DOM element as PDF with better page management
 * @param {string} elementId - ID of the DOM element to export
 * @param {Object} options - Configuration options
 * @param {string} options.filename - Filename (without extension)
 * @param {string} options.orientation - PDF orientation ('portrait' or 'landscape')
 * @param {number} options.scale - Scale for html2canvas (recommended 2-4 for better quality)
 * @param {boolean} options.showNotification - Show notifications during the process
 * @returns {Promise<void>}
 */
export const exportToPDF = async (elementId, options = {}) => {
  const {
    filename = 'report',
    orientation = 'portrait',
    scale = 2,
    showNotification = true
  } = options;

  // Element to be exported
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    return;
  }

  // Show start notification if enabled
  let notificationElement = null;
  if (showNotification) {
    notificationElement = createNotification('Generating PDF, please wait...');
  }

  try {
    // Create PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // 10mm margin
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Look for page sections
    const pagesSections = element.querySelectorAll('.pdf-page-section');
    
    if (pagesSections.length === 0) {
      // Fallback: export everything as before if no sections are defined
      return await exportSinglePage(element, pdf, options);
    }

    let isFirstPage = true;

    for (let i = 0; i < pagesSections.length; i++) {
      const section = pagesSections[i];
      
      // Add new page if not the first
      if (!isFirstPage) {
        pdf.addPage();
      }
      
      try {
        // Capture the specific section
        const canvas = await html2canvas(section, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          x: 0,
          y: 0,
          width: section.scrollWidth,
          height: section.scrollHeight
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgProps = pdf.getImageProperties(imgData);
        
        // Calculate dimensions maintaining aspect ratio
        let imgWidth = contentWidth;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        // If image is too tall, adjust to available height
        if (imgHeight > contentHeight) {
          imgHeight = contentHeight;
          imgWidth = (imgProps.width * imgHeight) / imgProps.height;
        }
        
        // Center the image on the page
        const x = margin + (contentWidth - imgWidth) / 2;
        const y = margin + (contentHeight - imgHeight) / 2;
        
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
        
        isFirstPage = false;
        
        // Update progress notification
        if (showNotification) {
          updateNotification(
            notificationElement, 
            `Processing page ${i + 1} of ${pagesSections.length}...`,
            'info'
          );
        }
        
      } catch (error) {
        console.error(`Error processing page section ${i}:`, error);
      }
    }

    // Save PDF
    pdf.save(`${filename}.pdf`);

    if (showNotification) {
      // Update notification to success
      updateNotification(notificationElement, 'PDF generated successfully', 'success');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    if (showNotification) {
      // Update notification to error
      updateNotification(notificationElement, 'Error generating PDF. Please try again.', 'error');
    }
  }
};

/**
 * Function to export a single page (fallback)
 * @param {HTMLElement} element - DOM element to export
 * @param {jsPDF} pdf - PDF instance
 * @param {Object} options - Configuration options
 */
const exportSinglePage = async (element, pdf, options) => {
  const { scale = 2 } = options;
  
  // Capture the element as an image with html2canvas
  const canvas = await html2canvas(element, {
    scale: scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  // Create PDF
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  // Get dimensions
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // If height is greater than one page, handle multiple pages
  if (pdfHeight > pageHeight) {
    // Divide the image into multiple pages
    let heightLeft = pdfHeight;
    let position = 0;
    let page = 1;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
    
    // Additional pages if needed
    while (heightLeft > 0) {
      position = -pageHeight * page;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      page++;
    }
  } else {
    // Fits on a single page
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  }
};

/**
 * Sets up printing of an element with custom styles
 * @param {Object} options - Configuration options
 * @param {boolean} options.showNotification - Show notifications during the process
 */
export const printReport = (options = {}) => {
  const { showNotification = true } = options;
  
  try {
    if (showNotification) {
      const notification = createNotification('Preparing to print...');
      
      // Allow time for the notification to display before opening the print dialog
      setTimeout(() => {
        window.print();
        updateNotification(notification, 'Print dialog opened', 'success');
        
        // Remove the notification after a few seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 3000);
      }, 500);
    } else {
      window.print();
    }
  } catch (error) {
    console.error('Error printing:', error);
    if (showNotification) {
      const notification = createNotification('Error opening print dialog', 'error');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  }
};

/**
 * Creates a temporary notification on screen
 * @param {string} message - Message to display
 * @param {string} type - Notification type ('info', 'success', 'error')
 * @returns {HTMLElement} - Created notification element
 */
function createNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  
  // Base style
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 9999;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Configure color based on type
  if (type === 'success') {
    notification.style.backgroundColor = 'rgba(39, 174, 96, 0.9)';
    notification.style.color = 'white';
  } else if (type === 'error') {
    notification.style.backgroundColor = 'rgba(235, 87, 87, 0.9)';
    notification.style.color = 'white';
  } else {
    notification.style.backgroundColor = 'rgba(47, 128, 237, 0.9)';
    notification.style.color = 'white';
  }
  
  // Add message
  notification.innerText = message;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  return notification;
}

/**
 * Updates an existing notification
 * @param {HTMLElement} notification - Notification element to update
 * @param {string} message - New message
 * @param {string} type - New type ('info', 'success', 'error')
 */
function updateNotification(notification, message, type = 'info') {
  if (!notification) return;
  
  // Update message
  notification.innerText = message;
  
  // Update style based on type
  if (type === 'success') {
    notification.style.backgroundColor = 'rgba(39, 174, 96, 0.9)';
  } else if (type === 'error') {
    notification.style.backgroundColor = 'rgba(235, 87, 87, 0.9)';
  } else {
    notification.style.backgroundColor = 'rgba(47, 128, 237, 0.9)';
  }
  
  // Remove after 3 seconds if success or error
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      if (notification.parentNode) {
        // Fade out animation
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }
}

/**
 * Generates a filename based on report data
 * @param {Object} reportData - Report data
 * @returns {string} - Generated filename
 */
export const generateFilename = (reportData) => {
  const componentInfo = reportData.componentName || reportData.componentCode || 'Component';
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const statusText = reportData.inspectionStatus === 'pass' ? 'ACCEPTED' : 
                    (reportData.inspectionStatus === 'reject' ? 'REJECTED' : 'PROGRESS');
  
  return `Report_${componentInfo}_${statusText}_${dateStr}`;
};

/**
 * Generates an email to share the report
 * @param {string} email - Recipient email address
 * @param {Object} reportData - Report data
 */
export const sendReportByEmail = (email, reportData) => {
  if (!email) {
    console.error('No email address provided');
    return;
  }
  
  try {
    // Prepare data for email subject
    const componentInfo = reportData.componentName || reportData.componentCode || 'Component';
    const dateStr = new Date().toLocaleDateString();
    const statusText = reportData.inspectionStatus === 'pass' ? 'ACCEPTED' : 
                      (reportData.inspectionStatus === 'reject' ? 'REJECTED' : 'IN PROGRESS');
    
    // Build email body with report summary
    const emailBody = `
      Inspection Report: ${componentInfo}
      Date: ${dateStr}
      Status: ${statusText}
      
      This email contains a summary of the inspection report generated by the Valmont Solar Quality Control system.
      
      * Component Information:
      - Project: ${reportData.projectName || "NEPI"}
      - Family: ${reportData.componentFamily || "TORQUE TUBES"}
      - Code: ${reportData.componentCode || "ttg45720"}
      - Name: ${reportData.componentName || "Torque tube 140x100x3.5mm"}
      
      * Inspection Information:
      - Inspector: ${reportData.inspector || "John Smith"}
      - Date: ${reportData.inspectionDate || dateStr}
      - Location: ${reportData.inspectionCity && reportData.inspectionCountry ? 
                  `${reportData.inspectionCity}, ${reportData.inspectionCountry}` : "Madrid, Spain"}
      
      * Result:
      - Final status: ${statusText}
      - Non-conformities: ${calculateTotalNonConformities(reportData)}
      
      Note: This is an automated email generated by the system. For the complete PDF report, please contact the quality department.
    `;
    
    // Encode subject and body for mailto
    const encodedSubject = encodeURIComponent(`Inspection Report: ${componentInfo} - ${statusText}`);
    const encodedBody = encodeURIComponent(emailBody);
    
    // Open user's email client
    window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
    
    return true;
  } catch (error) {
    console.error('Error preparing email:', error);
    return false;
  }
};

/**
 * Calculates total non-conformities in a report
 * @param {Object} reportData - Report data
 * @returns {number} - Total non-conformities
 */
function calculateTotalNonConformities(reportData) {
  if (!reportData.dimensionNonConformities) return 0;
  return Object.values(reportData.dimensionNonConformities).reduce((sum, count) => sum + count, 0);
}
