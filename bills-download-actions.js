// ============================================
// 📥 BILLS HISTORY MULTI-FORMAT DOWNLOAD ACTIONS
// ============================================

/**
 * 1. مین فنکشن: ڈاؤن لوڈ آپشنز والا پاپ اپ کھولنا
 */
function downloadHistoryPDF() {
    openDownloadOptionsModal();
}

function openDownloadOptionsModal() {
    if (typeof savedBillsLog === 'undefined' || savedBillsLog.length === 0) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('خالی ہسٹری', 'ڈاؤن لوڈ کرنے کے لیے کوئی بل موجود نہیں ہے۔', 'info');
        } else {
            alert("ڈاؤن لوڈ کرنے کے لیے کوئی ہسٹری موجود نہیں ہے۔");
        }
        return;
    }

    const isUrdu = (typeof currentLang !== 'undefined' && currentLang === 'rtl');

    Swal.fire({
        title: isUrdu ? 'فائل فارمیٹ منتخب کریں' : 'Select Download Format',
        text: isUrdu ? 'آپ بلز ہسٹری کس فارمیٹ میں ڈاؤن لوڈ کرنا چاہتے ہیں؟' : 'Choose the file format to download bills history:',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: isUrdu ? 'منسوخ کریں' : 'Cancel',
        html: `
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                <button id="dl-pdf-btn" class="swal2-confirm swal2-styled" style="background-color: #e74c3c; margin: 0; width: 100%; cursor: pointer;">
                    📄 PDF File (.pdf)
                </button>
                <button id="dl-csv-btn" class="swal2-confirm swal2-styled" style="background-color: #27ae60; margin: 0; width: 100%; cursor: pointer;">
                    📊 Excel / CSV File (.csv)
                </button>
                <button id="dl-txt-btn" class="swal2-confirm swal2-styled" style="background-color: #2980b9; margin: 0; width: 100%; cursor: pointer;">
                    📝 Text Document (.txt)
                </button>
            </div>
        `,
        didOpen: () => {
            document.getElementById('dl-pdf-btn').addEventListener('click', () => {
                Swal.close();
                generateHistoryPDFCanvas();
            });

            document.getElementById('dl-csv-btn').addEventListener('click', () => {
                Swal.close();
                generateHistoryCSV();
            });

            document.getElementById('dl-txt-btn').addEventListener('click', () => {
                Swal.close();
                generateHistoryTXT();
            });
        }
    });
}

/**
 * 📄 Option 1: PDF Generator (اردو کے بہترین رینڈر کے لیے html2canvas کا استعمال)
 */
const targetEl = document.querySelector('.record-panel');

    if (!targetEl) {
        // اگر ہسٹری والا کنٹینر الگ سے نہ ملے تو پرنٹ فنکشن چلائے
        window.print();
        return;
    }

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'پی ڈی ایف بن رہی ہے...',
            text: 'برائے مہربانی انتظار کریں',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
    }

    html2canvas(targetEl, { scale: 2, useCORS: true }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; 
        const pageHeight = 295;  
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const today = new Date().toISOString().slice(0, 10);
        pdf.save(`Bills_History_${today}.pdf`);

        if (typeof Swal !== 'undefined') Swal.close();
    }).catch(err => {
        if (typeof Swal !== 'undefined') Swal.close();
        alert("PDF جنریٹ کرنے میں مسئلہ آیا ہے، کمپیوٹر سے پرنٹ آپشن استعمال کریں۔");
    });
}

/**
 * 📊 Option 2: Excel / CSV Generator (UTF-8 Urdu Supported)
 */
function generateHistoryCSV() {
    let csvContent = "\uFEFFBill No,Customer,Date,Products Details,Grand Total,Received,Balance\n";

    savedBillsLog.forEach(b => {
        const prodList = (b.products && Array.isArray(b.products)) ? `"${b.products.join(' | ').replace(/"/g, '""')}"` : '""';
        const custName = `"${(b.customer || 'Counter Sale').replace(/"/g, '""')}"`;
        const total = `"${(b.totalAmount || '0.00').replace(/"/g, '""')}"`;
        const paid = `"${(b.paidAmount || '0.00').replace(/"/g, '""')}"`;
        const bal = `"${(b.balanceAmount || '0.00').replace(/"/g, '""')}"`;

        csvContent += `${b.billNo},${custName},${b.dateVal || ''},${prodList},${total},${paid},${bal}\n`;
    });

    triggerFileDownload(csvContent, 'text/csv;charset=utf-8;', 'csv');
}

/**
 * 📝 Option 3: Text (.txt) Generator (UTF-8 BOM Supported for Urdu)
 */
function generateHistoryTXT() {
    // \uFEFF اردو الفاظ کو درست ڈسپلے کرنے کے لیے ضروری ہے
    let txtContent = "\uFEFF=========================================================\n";
    txtContent += "                 SAVED BILLS HISTORY / LEDGER            \n";
    txtContent += "=========================================================\n\n";

    savedBillsLog.forEach((b, index) => {
        const prodList = (b.products && Array.isArray(b.products)) ? b.products.join('\n    - ') : 'N/A';
        txtContent += `[${index + 1}] Bill No: ${b.billNo}\n`;
        txtContent += `    Customer : ${b.customer || 'Counter Sale'}\n`;
        txtContent += `    Date     : ${b.dateVal || 'N/A'} ${b.timeVal || ''}\n`;
        txtContent += `    Items    :\n    - ${prodList}\n`;
        txtContent += `    Total    : ${b.totalAmount || '0.00'}\n`;
        txtContent += `    Received : ${b.paidAmount || '0.00'}\n`;
        txtContent += `    Balance  : ${b.balanceAmount || '0.00'}\n`;
        txtContent += "---------------------------------------------------------\n";
    });

    triggerFileDownload(txtContent, 'text/plain;charset=utf-8;', 'txt');
}

/**
 * 💾 Helper: File Download Trigger
 */
function triggerFileDownload(content, mimeType, extension) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.setAttribute("href", url);
    link.setAttribute("download", `Bills_History_${today}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
